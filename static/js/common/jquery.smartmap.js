/*!
 * jQuery map Plugin
 * version: 1.0.0-2017.05.02
 * Requires jQuery v1.8 or later
 * Copyright (c) 2017 luo.x.y@qq.com
 */

// AMD support
(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // using AMD; register as anon module
        define(['jQuery'], factory);
    } else {
        // no AMD; invoke directly
        factory( (typeof(jQuery) != 'undefined') ? jQuery : window.Zepto );
    }
}

(function($) {
    //求斜边长度
    function getBeveling(x, y){
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }

    function drawDashLine(context, x1, y1, x2, y2, dashLen){
        dashLen = dashLen === undefined ? 5 : dashLen;
        //得到斜边的总长度
        var beveling = getBeveling(x2 - x1, y2 - y1);
        //计算有多少个线段
        var num = Math.floor(beveling/dashLen);
        context.beginPath();
        for(var i = 0 ; i < num; i++){
            context[i%2 === 0 ? 'moveTo' : 'lineTo'](x1+(x2-x1)/num*i,y1+(y2-y1)/num*i);
        }
        context.stroke();
        context.closePath();
    }

    function smartMap(el, opt){
		this.default = $.extend({
			width: 1265,
			height: 1284,
			point: [-5, -920],
			level: 0,
            ltbl:.375,
			lvar: [1, .9, .8, .7, .6, .5, .4, .3],
			src: 'static/images/map.png',
			bgcolor: '#00275a', //00336c
			events: {
				'view': {icon: 'ic-mark-ck', ttype: '事件'},
				'diversion': {icon: 'ic-mark-dl', ttype: '事件'},
				'yunwei': {icon: 'ic-mark-yw', ttype: '事件'},
				'customize': {icon: 'ic-mark-zdy', ttype: '事件'},
				'person': {icon: 'ic-mark-person', ttype: '人员'},
				'path': {icon: 'ic-mark-path', ttype: '路径'},
				'cameran': {icon: 'ic-mark-cameran', ttype: '摄像头'},
				'cameraa': {icon: 'ic-mark-cameraa', ttype: '摄像头'},
				'camerab': {icon: 'ic-mark-camerab', ttype: '摄像头'}
			},
			category: {
				events: [],
				person: [],
				camera: [],
				path: []
			},
            pathmks: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		}, opt || {});
		this.panel = el;
		this.init.call(this);
	}

	smartMap.prototype = {
		init: function(){
			var self = this, panel = self.panel, wt = panel.width(), ht = panel.height(),
				ctx = panel[0].getContext('2d'),
				opts = self.default;
			self.ctx = ctx;
			self.width = wt;
			self.height = ht;
			wt = opts.width;
			ht = opts.height;
			panel.attr('width', wt).attr('height', ht);

			self.marks = panel.next('.index-map-marks');
			self.marks.css({width: wt + 'px', height: ht + 'px'});

			var img = new Image();
			img.src = opts.src;
			img.onload = function(){
				self.loadmap(img);
				self.setMapLevel(self.default.level);
                var $img = self.panel.parent().parent().find('.index-map-lt').children('img');
                if($img.length > 0){
                    $img.css({width: opts.width * opts.ltbl + 'px', height: opts.height * opts.ltbl + 'px'});
                    self.ltimg = $img;
                }
				self.panelMove(opts.point[0], opts.point[1]);
			};

			self.dragg();
			self.wheel();
			self.tools = panel.parent().next('.index-map-tools').children('a');
			self.toolfun();
		},
		loadmap: function(img){
			var self = this, ctx = self.ctx, opts = self.default;
			ctx.fillStyle = opts.bgcolor;
			ctx.fillRect(0, 0, opts.width, opts.height);
			ctx.drawImage(img, 0, 0, opts.width, opts.height);
		},
		setMapLevel: function(lv){
			var self = this, panel = self.panel, lvar = self.default.lvar, mw = self.default.width, mh = self.default.height;
			self.level = lv;
			lv = lvar[-lv];
			self.marksfmt();
			self.marks.css({width: mw * lv + 'px', height: mh * lv + 'px'});
			panel.css({'transform': 'scale(' + lv + ', ' + lv + ')', '-webkit-transform': 'scale(' + lv + ', ' + lv + ')'});
		},
		marksfmt: function(){
			var self = this, lv = self.level, lvar = self.default.lvar, mks = self.marks.children();
			lv = lvar[-lv];
			mks.css('visibility', 'hidden');
			mks.each(function(){
				var $t = $(this);
				$t.css({left: $t.data('mkx') * lv + 'px', top: $t.data('mky') * lv + 'px'});
			});
			mks.css('visibility', 'visible');
		},
		wheel: function(){
			var self = this, panel = self.panel;
			panel.parent().on('mousewheel', function(e){
				e.preventDefault();
			});
		},
		toolfun: function(){
			var self = this;
			var $p = self.panel.parent(), $bm = $p.siblings('.index-map-bm').children('a'),
				$bl = $p.siblings('.index-map-bl');//.children('a');

			self.tools.filter('.ic-add').on('click', function(){
				var lv = self.level + 1;
				if(lv > 0) return;
				self.setMapLevel(lv);
			});
			self.tools.filter('.ic-less').on('click', function(){
				var lv = self.level - 1;
				if(lv < -self.default.lvar.length + 1) return;
				self.setMapLevel(lv);
			});
			self.tools.filter('.index-map-tools-ic').on('click', function(){
				//main.dialog($('#dl-dl'));
				var $t = $(this);
				$t.toggleClass('index-map-tools-icsel');
				if($('.index-map-tools-icsel').length > 1){
					$t.siblings('.index-map-tools-icsel').removeClass('index-map-tools-icsel');
				}
				self.marks.attr('class', 'index-map-marks index-map-marks-events');
				$bm.removeClass('cur');
				/*var $bt = $('.index-map-tools-icsel');
				if($bt.length === 0) return*/
			});

			$bm.on('click', function(){
				var $t = $(this), ct = $t.is('.ic-sxt')?'camera':'person';
				self.marks.attr('class', 'index-map-marks index-map-marks-' + ct);
				$t.addClass('cur').siblings().removeClass('cur');
				$('.index-map-tools-icsel').removeClass('index-map-tools-icsel');
			});

			$bl.on('click', function(){
				alert('楼层切换');
			});
		},
		addMark: function(category, type, x, y, data, cbk){
			var self = this, opts = self.default, mks = opts.events, mk = mks[type], $nd = self.marks;
			var $mk = $('<i class="ic-mark ' + mk.icon + '"></i>'), bl = self.default.lvar[-self.level];
			if(data.info){
				var ttype = mk.ttype;
				var ifh = '<div class="index-map-info"><div class="index-map-info-t clearfix"><span class="pull-left">'
					+ ttype + ':' + data.info.name + '</span><span class="pull-right">' + data.info.status + '</span></div>'
					+ '<div class="index-map-info-ct">' + data.info.content + '</div><div class="index-map-info-bm">'
					+ '<a href="javascript:;" class="btn-a evtmodify">编辑</a><a href="javascript:;" class="btn-a ml-15 evtcfm">确定</a></div></div>';
				var $if = $(ifh).appendTo($mk);
				$mk.hover(function(){
					$mk.children('.index-map-info').show();
				}, function(){
					$mk.children('.index-map-info').hide();
				});
			}

			$mk.attr('data-category', category).addClass('ic-mks-' + category);
			$mk.data('mkx', x);
			$mk.data('mky', y);
			$mk.data('mkdt', data);
            if(category === 'path'){
                $mk.text(data.pathmk);
            }

			$mk.on('click', function(e){
                if($(e.target).hasClass('evtmodify')){
                    if(category === 'events'){
                        main.evdialog(type, $mk);
                        $(this).children('.index-map-info').hide();
                    }
                    return false;
                }
                if($(e.target).hasClass('evtcfm')){
                    $(this).children('.index-map-info').hide();
                    return false;
                }
				$.type(cbk) === 'function' && cbk.call(this);
				return false;
			});
			$mk.css({left: x * bl + 'px', top: y * bl + 'px'}).appendTo($nd);
		},
		clearMark: function(){
			this.marks.empty();
		},
        addPath: function(){
            var self = this, evdt = self.evdata, le = self.pathar.length;
            self.addMark('path', evdt.ty, evdt.x, evdt.y, {pathmk: self.default.pathmks.charAt(le - 1)});
            if(le > 1){
                var pdt = self.pathar[le-2];
                drawDashLine(self.ctx, pdt.x, pdt.y, evdt.x, evdt.y, 5);
            }
        },
		panelMove: function(mx, my){
			var self = this, $p = self.panel.parent(), mbl = self.default.lvar[-self.level],
				maxLeft = self.marks.width() - $p.width() + 10,
				maxTop = self.marks.height() - $p.height() + 10;

			//mx = mx * mbl;
			//my = my * mbl;
			/*if(mx > 60) mx = 60;
			 if(my > 30) my = 30;
			 if(mx < -maxLeft) mx = -maxLeft;
			 if(my < -maxTop) my = -maxTop;*/

			self.marks.css({'left': mx + 'px', 'top': my + 'px'});
			self.panel.css({'left': mx + 'px', 'top': my + 'px'});
            if(self.ltimg){
                self.ltimg.css({'left': mx * self.default.ltbl + 'px', 'top': my * self.default.ltbl + 'px'});
            }
			self.marksfmt();
		},
		dragg: function(){
			var self = this,
				moveFlag = false, //区别moueseup与click的标志
				clickFlag  = false;

			self.marks.on({
				mousedown: function(e){
					e.preventDefault();
					moveFlag = true;
					clickFlag = true;
					var $t = $(this), pos = $t.position();
					$t.data('mx', e.clientX);
					$t.data('my', e.clientY);
					$t.data('pos', pos);
				},
				mousemove: function(e){
					if(!moveFlag) return;
					var $t = $(this), mx = $t.data('mx'), my = $t.data('my'), pos = $t.data('pos');
					mx = e.clientX - mx;
					my = e.clientY - my;
					if(Math.abs(mx) > 0 || Math.abs(my) > 0){
						clickFlag = false;
					}

					mx = pos.left + mx;
					my = pos.top + my;

					self.panelMove(mx, my);
				},
				mouseup: function(e){
					moveFlag = false;
				},
				mouseout: function(){
					moveFlag = false;
				},
				click: function(e){
					moveFlag = false;
					if(!clickFlag) return;
					var $bt = $(this).parent().parent().find('.index-map-tools-icsel');
					if($bt.length === 0) return;
					var ty = $bt.attr('data-type'), bl = self.default.lvar[-self.level];
					self.evdata = {ty: ty, x: e.offsetX/bl, y: e.offsetY/bl};
                    if(ty === 'path'){
                        self.ctx.lineWidth = '2';
                        self.ctx.strokeStyle = '#009ad8';
                        if(self.pathar){
                            self.pathar.push(self.evdata);
                        }else{
                            self.pathar = [self.evdata];
                        }
                        self.addPath();
                        return;
                    }
                    if(ty === 'person'){
                        self.addMark('person', ty, self.evdata.x, self.evdata.y, {});
                        return;
                    }
					main.evdialog(ty);
				}
			});
		}
	};

	$.fn.smartmap = function(opt){
		return this.each(function(){
			$(this).data('smartmap', new smartMap($(this), opt));
		});
	};

}));
