(function(factory){
    'use strict'
    if(typeof define === "function" && define.amd){
        define(['jQuery'],factory);
    }else{
        factory(jQuery)
    }
})(function($,undefined){
	$.fn.scrolltxt = function(o){
		o = $.extend({
			pause: 5000,
			step: 28,
			dir: "up",
			speed: 500
		}, o);
		
		return this.each(function(){
			var self = this, $ul = $("ul", this), $li = $ul.children("li"),
			ulh = ($li.length-1) * $li.outerHeight(true), interval = null;
			if(ulh < $(this).height()){
				return;
			}
			$ul.append($li.clone(true));
			$ul.hover(function(){
				clearInterval(interval);
			},function(){
				interval = setInterval(roll, o.pause);
			});
			interval = setInterval(roll, o.pause);
			function roll(){
				if($(self).is(':visible')){
					if(o.dir == "up"){
						if(parseInt($ul.css("marginTop")) < -ulh){
							$ul.css("marginTop", 0)
						}
						$ul.animate({"marginTop": "-="+o.step}, o.speed);
					}else if(o.dir == "down"){
						if(parseInt($ul.css("marginTop")) >= 0){
							$ul.css("marginTop", -ulh)
						}
						$ul.animate({"marginTop": "+="+o.step}, o.speed);
					}
				}

			}
		});
	}
});