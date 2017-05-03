/*!
 * jQuery dropselect Plugin
 * version: 1.0.0-2016.10.13
 * Requires jQuery v1.8 or later
 * Copyright (c) 2016 luo.x.y@qq.com
 * @param opt {object} 包含以下key：
 * dfval: '---请选择---', // 默认值
 * readonly: true,        // 输入框是否可输入
 * width: 160,            // 输入框宽度
 * panelwidth: 220,       // 下拉面板宽度
 * panelheight: 207,      // 下拉面板高度
 * toggle: function(){},    // 下拉面板展开或者关闭回调函数
 * open: function(){},    // 下拉面板展开回调函数
 * close: function(){},   // 下拉面板关闭回调函数
 * selected: function(){}, // 选中回调函数
 * methods 使用jqueryelement.data('dropselect')获取实例对象，包含以下方法：
 * @methods open          // 打开下拉面板
 * @methods close         // 关闭下拉面板
 * @methods selected      // 选中选项
 * @methods load          // 重载数据
 * @methods setopts       // 设置参数opt
 * @methods getselected   // 获取选中项 return object 包含ind(索引)、val(选中value)、txt(选中文本)
 * @methods getval        // 获取选中值 return string
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
	function dropsel(el, opt){
		this.opt = $.extend({
			dfval: '---请选择---',
			readonly: true,
			data: []
		}, opt || {});
		this.el = el;
		this.init.call(this);
	}

	dropsel.prototype = {
		init: function(){
			var _t = this;
			_t.create();
		},
		create: function(){
			var _t = this;
			_t.inp = $('<input type="text" class="ui-dropselect-input"/>');
			_t.btn = $('<span class="ui-dropselect-btn"></span>');
			_t.opt.readonly && _t.inp.prop('readonly', 'readonly');
			_t.inp.val(_t.opt.dfval);
			_t.panel = $('<ul class="ui-dropselect-content"></ul>');
			if(_t.opt.width){
				_t.inp.css('width', _t.opt.width + 'px');
			}
			if(_t.opt.panelwidth){
				_t.panel.css('width', _t.opt.panelwidth + 'px');
			}
			if(_t.el.is('select')){
				var cls = ' ' + _t.el.attr('class');
				_t.el.wrap('<span></span>');
				if(_t.opt.data.length === 0){
					_t.el.children('option').each(function(i, item){
						var obj = {val: $(item).val(), txt: $(item).text()};
						if($(item).is(':selected')){
							obj.selected = 'true';
						}
						_t.opt.data.push(obj);
					});
				}
				_t.sel = _t.el;
				_t.el = _t.sel.parent().addClass(cls);
			}
			_t.load(_t.opt.data);
			_t.el.addClass('ui-dropselect').append(_t.inp).append(_t.btn).append(_t.panel);
			_t.el.off().on('click', function(e){
				 e.stopPropagation();
				$('.ui-dropselect').not(this).children('.ui-dropselect-content').hide();
				_t.toggle();							
				return false;
			});
		},
		toggle: function(){
			var _t = this;
			_t.panel.slideToggle('fast');
			_t.changeinpcolor();
			$.type(_t.opt.toggle) === 'function' && _t.opt.toggle.call(_t);
		},
		open: function(){
			var _t = this;
			_t.panel.slideDown('fast');
			_t.changeinpcolor();
			$.type(_t.opt.open) === 'function' && _t.opt.open.call(_t);
		},
		close: function(){
			var _t = this;
			_t.panel.hide();
			_t.changeinpcolor();
			$.type(_t.opt.close) === 'function' && _t.opt.close.call(_t);
		},
		selected: function(i, isRefresh){
			var _t = this, item = _t.opt.data[i];
			_t.panel.children('li').removeAttr('data-selected').eq(i).attr('data-selected', 'true');
			_t.inp.val(item.txt).attr('data-val', item.val);
			_t.sel.children('option').eq(i).prop('selected', 'selected');
			!isRefresh && _t.sel.change().blur();
			$.type(_t.opt.selected) === 'function' && _t.opt.selected.call(_t);
		},
		load: function(data){
			var _t = this, dh = [], sdh = [], seli = 0;
			_t.opt.data = data;
			if(!_t.sel){
				_t.sel = $('<select></select>');
			}
			$.each(_t.opt.data, function(i, item){
				var sel = '', osel = '';
				if(item.selected){
					seli = i;
				}
				dh.push('<li data-val="' + item.val + '">' + item.txt + '</li>');
				sdh.push('<option value="' + item.val + '">' + item.txt + '</option>');
			});
			_t.panel.html(dh.join(''));
			_t.sel.html(sdh.join(''));
			_t.opt.data.length > 0 && _t.selected(seli, true);
			setTimeout(function(){
				if(_t.opt.panelheight && _t.opt.panelheight < _t.panel.height()){
					_t.panel.css({'height': _t.opt.panelheight + 'px'});
				}
				_t.panel.css({'display': 'none', 'visibility': 'visible'});
			}, 0);
			_t.panel.children('li').on('click', function(){
				var i = $(this).index();
				_t.selected(i);
				_t.close();
				return false;
			});
			_t.changeinpcolor(true);
		},
		changeinpcolor : function(isRefresh){
			var _t = this;
			if(_t.inp.val()!==_t.opt.dfval){
				_t.inp.addClass("fc-darkgray");
			}else{ !isRefresh && _t.sel.change().blur();
				_t.inp.removeClass("fc-darkgray");
			}			
		},
		setopts: function(obj){
			$.extend(this.opt, obj || {});
		},
		getselected: function(){
			var _t = this, i = _t.panel.children('li').index(_t.panel.children('li[data-selected]'));
			return $.extend({ind: i}, _t.opt.data[i]);
		},
		getval: function(){
			var _t = this, scd = _t.getselected(), val = scd.val?scd.val:'';
			return val;
		}
	};

	$.fn.dropselect = function(opt){
		$(document).off('click.dropselect').on('click.dropselect', function(){
			$('.ui-dropselect-content').hide();
			$('.ui-dropselect-input').removeClass("ui-validate-active");
		});

		return this.each(function(){
			$(this).data('dropselect', new dropsel($(this), opt));
		});
	};

}));
