angular.module("colorpicker.module",[]).factory("Helper",function(){"use strict";return{closestSlider:function(e){var o=e.matches||e.webkitMatchesSelector||e.mozMatchesSelector||e.msMatchesSelector;return o.bind(e)("I")?e.parentNode:e},getOffset:function(e,o){for(var t=0,r=0,n=0,i=0;e&&!isNaN(e.offsetLeft)&&!isNaN(e.offsetTop);)t+=e.offsetLeft,r+=e.offsetTop,o||"BODY"!==e.tagName?(n+=e.scrollLeft,i+=e.scrollTop):(n+=document.documentElement.scrollLeft||e.scrollLeft,i+=document.documentElement.scrollTop||e.scrollTop),e=e.offsetParent;return{top:r,left:t,scrollX:n,scrollY:i}},stringParsers:[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,parse:function(e){return[e[1],e[2],e[3],e[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,parse:function(e){return[2.55*e[1],2.55*e[2],2.55*e[3],e[4]]}},{re:/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,parse:function(e){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}},{re:/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,parse:function(e){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}}]}}).factory("Color",["Helper",function(e){"use strict";return{value:{h:1,s:1,b:1,a:1},rgb:function(){var e=this.toRGB();return"rgb("+e.r+","+e.g+","+e.b+")"},rgba:function(){var e=this.toRGB();return"rgba("+e.r+","+e.g+","+e.b+","+e.a+")"},hex:function(){return this.toHex()},RGBtoHSB:function(e,o,t,r){e/=255,o/=255,t/=255;var n,i,l,c;return l=Math.max(e,o,t),c=l-Math.min(e,o,t),n=0===c?null:l===e?(o-t)/c:l===o?(t-e)/c+2:(e-o)/c+4,n=(n+360)%6*60/360,i=0===c?0:c/l,{h:n||1,s:i,b:l,a:r||1}},setColor:function(o){o=o.toLowerCase();for(var t in e.stringParsers)if(e.stringParsers.hasOwnProperty(t)){var r=e.stringParsers[t],n=r.re.exec(o),i=n&&r.parse(n);if(i)return this.value=this.RGBtoHSB.apply(null,i),!1}},setHue:function(e){this.value.h=1-e},setSaturation:function(e){this.value.s=e},setLightness:function(e){this.value.b=1-e},setAlpha:function(e){this.value.a=parseInt(100*(1-e),10)/100},toRGB:function(e,o,t,r){e||(e=this.value.h,o=this.value.s,t=this.value.b),e*=360;var n,i,l,c,s;return e=e%360/60,s=t*o,c=s*(1-Math.abs(e%2-1)),n=i=l=t-s,e=~~e,n+=[s,c,0,0,c,s][e],i+=[c,s,s,c,0,0][e],l+=[0,0,c,s,s,c][e],{r:Math.round(255*n),g:Math.round(255*i),b:Math.round(255*l),a:r||this.value.a}},toHex:function(e,o,t,r){var n=this.toRGB(e,o,t,r);return"#"+(1<<24|parseInt(n.r,10)<<16|parseInt(n.g,10)<<8|parseInt(n.b,10)).toString(16).substr(1)}}}]).factory("Slider",["Helper",function(e){"use strict";var o={maxLeft:0,maxTop:0,callLeft:null,callTop:null,knob:{top:0,left:0}},t={};return{getSlider:function(){return o},getLeftPosition:function(e){return Math.max(0,Math.min(o.maxLeft,o.left+((e.pageX||t.left)-t.left)))},getTopPosition:function(e){return Math.max(0,Math.min(o.maxTop,o.top+((e.pageY||t.top)-t.top)))},setSlider:function(r,n){var i=e.closestSlider(r.target),l=e.getOffset(i,n),c=i.getBoundingClientRect(),s=r.clientX-c.left,a=r.clientY-c.top;o.knob=i.children[0].style,o.left=r.pageX-l.left-window.pageXOffset+l.scrollX,o.top=r.pageY-l.top-window.pageYOffset+l.scrollY,t={left:r.pageX-(s-o.left),top:r.pageY-(a-o.top)}},setSaturation:function(e,t){o={maxLeft:100,maxTop:100,callLeft:"setSaturation",callTop:"setLightness"},this.setSlider(e,t)},setHue:function(e,t){o={maxLeft:0,maxTop:100,callLeft:!1,callTop:"setHue"},this.setSlider(e,t)},setAlpha:function(e,t){o={maxLeft:0,maxTop:100,callLeft:!1,callTop:"setAlpha"},this.setSlider(e,t)},setKnob:function(e,t){o.knob.top=e+"px",o.knob.left=t+"px"}}}]).directive("colorpicker",["$document","$compile","Color","Slider","Helper",function(e,o,t,r,n){"use strict";return{require:"?ngModel",restrict:"A",link:function(i,l,c,s){var a,u=c.colorpicker?c.colorpicker:"hex",p=angular.isDefined(c.colorpickerPosition)?c.colorpickerPosition:"bottom",f=angular.isDefined(c.colorpickerInline)?c.colorpickerInline:!1,d=angular.isDefined(c.colorpickerFixedPosition)?c.colorpickerFixedPosition:!1,h=angular.isDefined(c.colorpickerParent)?l.parent():angular.element(document.body),k=angular.isDefined(c.colorpickerWithInput)?c.colorpickerWithInput:!1,g=k?'<input type="text" name="colorpicker-input">':"",v=f?"":'<button type="button" class="close close-colorpicker">&times;</button>',m='<div class="colorpicker dropdown"><div class="dropdown-menu"><colorpicker-saturation><i></i></colorpicker-saturation><colorpicker-hue><i></i></colorpicker-hue><colorpicker-alpha><i></i></colorpicker-alpha><colorpicker-preview></colorpicker-preview>'+g+v+"</div></div>",b=angular.element(m),x=t,w=b.find("colorpicker-hue"),S=b.find("colorpicker-saturation"),I=b.find("colorpicker-preview"),L=b.find("i");if(o(b)(i),k){var C=b.find("input");C.on("mousedown",function(e){e.stopPropagation()}).on("keyup",function(e){var o=this.value;l.val(o),s&&i.$apply(s.$setViewValue(o)),e.stopPropagation(),e.preventDefault()}),l.on("keyup",function(){C.val(l.val())})}var P=function(){e.on("mousemove",T),e.on("mouseup",H)};"rgba"===u&&(b.addClass("alpha"),a=b.find("colorpicker-alpha"),a.on("click",function(e){r.setAlpha(e,d),T(e)}).on("mousedown",function(e){r.setAlpha(e,d),P()}).on("mouseup",function(e){B("colorpicker-selected-alpha")})),w.on("click",function(e){r.setHue(e,d),T(e)}).on("mousedown",function(e){r.setHue(e,d),P()}).on("mouseup",function(e){B("colorpicker-selected-hue")}),S.on("click",function(e){r.setSaturation(e,d),T(e),angular.isDefined(c.colorpickerCloseOnSelect)&&D()}).on("mousedown",function(e){r.setSaturation(e,d),P()}).on("mouseup",function(e){B("colorpicker-selected-saturation")}),d&&b.addClass("colorpicker-fixed-position"),b.addClass("colorpicker-position-"+p),"true"===f&&b.addClass("colorpicker-inline"),h.append(b),s&&(s.$render=function(){l.val(s.$viewValue)},i.$watch(c.ngModel,function(e){M(),k&&C.val(e)})),l.on("$destroy",function(){b.remove()});var $=function(){try{I.css("backgroundColor",x[u]())}catch(e){I.css("backgroundColor",x.toHex())}S.css("backgroundColor",x.toHex(x.value.h,1,1,1)),"rgba"===u&&(a.css.backgroundColor=x.toHex())},T=function(e){var o=r.getLeftPosition(e),t=r.getTopPosition(e),n=r.getSlider();r.setKnob(t,o),n.callLeft&&x[n.callLeft].call(x,o/100),n.callTop&&x[n.callTop].call(x,t/100),$();var c=x[u]();return l.val(c),s&&i.$apply(s.$setViewValue(c)),k&&C.val(c),!1},H=function(){B("colorpicker-selected"),e.off("mousemove",T),e.off("mouseup",H)},M=function(){x.setColor(l.val()),L.eq(0).css({left:100*x.value.s+"px",top:100-100*x.value.b+"px"}),L.eq(1).css("top",100*(1-x.value.h)+"px"),L.eq(2).css("top",100*(1-x.value.a)+"px"),$()},y=function(){var e,o=n.getOffset(l[0]);return angular.isDefined(c.colorpickerParent)&&(o.left=0,o.top=0),"top"===p?e={top:o.top-147,left:o.left}:"right"===p?e={top:o.top,left:o.left+126}:"bottom"===p?e={top:o.top+l[0].offsetHeight+2,left:o.left}:"left"===p&&(e={top:o.top,left:o.left-150}),{top:e.top+"px",left:e.left+"px"}},O=function(){D()},A=function(){b.hasClass("colorpicker-visible")||(M(),b.addClass("colorpicker-visible").css(y()),B("colorpicker-shown"),f===!1&&e.on("mousedown",O),c.colorpickerIsOpen&&(i[c.colorpickerIsOpen]=!0,i.$$phase||i.$digest()))};f===!1?l.on("click",A):A(),b.on("mousedown",function(e){e.stopPropagation(),e.preventDefault()});var B=function(e){s&&i.$emit(e,{name:c.ngModel,value:s.$modelValue})},D=function(){b.hasClass("colorpicker-visible")&&(b.removeClass("colorpicker-visible"),B("colorpicker-closed"),e.off("mousedown",O),c.colorpickerIsOpen&&(i[c.colorpickerIsOpen]=!1,i.$$phase||i.$digest()))};b.find("button").on("click",function(){D()}),c.colorpickerIsOpen&&i.$watch(c.colorpickerIsOpen,function(e){e===!0?A():e===!1&&D()})}}}]);
