/*!
 * bootstrap-star-rating v4.0.4
 * http://plugins.krajee.com/star-rating
 *
 * Author: Kartik Visweswaran
 * Copyright: 2013 - 2018, Kartik Visweswaran, Krajee.com
 *
 * Licensed under the BSD 3-Clause
 * https://github.com/kartik-v/bootstrap-star-rating/blob/master/LICENSE.md
 */
!function(t){"use strict";"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof module&&module.exports?module.exports=t(require("jquery")):t(window.jQuery)}(function(t){"use strict";var e,i;t.fn.ratingLocales={},t.fn.ratingThemes={},e={NAMESPACE:".rating",DEFAULT_MIN:0,DEFAULT_MAX:5,DEFAULT_STEP:.5,isEmpty:function(e,i){return null==e||0===e.length||i&&""===t.trim(e)},getCss:function(t,e){return t?" "+e:""},addCss:function(t,e){t.removeClass(e).addClass(e)},getDecimalPlaces:function(t){var e=(""+t).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);return e?Math.max(0,(e[1]?e[1].length:0)-(e[2]?+e[2]:0)):0},applyPrecision:function(t,e){return parseFloat(t.toFixed(e))},handler:function(t,i,a,n,s){var r=s?i:i.split(" ").join(e.NAMESPACE+" ")+e.NAMESPACE;n||t.off(r),t.on(r,a)}},(i=function(e,i){this.$element=t(e),this._init(i)}).prototype={constructor:i,_parseAttr:function(t,i){var a,n,s,r,l=this.$element,o=l.attr("type");if("range"===o||"number"===o){switch(n=i[t]||l.data(t)||l.attr(t),t){case"min":s=e.DEFAULT_MIN;break;case"max":s=e.DEFAULT_MAX;break;default:s=e.DEFAULT_STEP}a=e.isEmpty(n)?s:n,r=parseFloat(a)}else r=parseFloat(i[t]);return isNaN(r)?s:r},_parseValue:function(t){var e=parseFloat(t);return isNaN(e)&&(e=this.clearValue),!this.zeroAsNull||0!==e&&"0"!==e?e:null},_setDefault:function(t,i){e.isEmpty(this[t])&&(this[t]=i)},_initSlider:function(t){var i=this.$element.val();this.initialValue=e.isEmpty(i)?0:i,this._setDefault("min",this._parseAttr("min",t)),this._setDefault("max",this._parseAttr("max",t)),this._setDefault("step",this._parseAttr("step",t)),(isNaN(this.min)||e.isEmpty(this.min))&&(this.min=e.DEFAULT_MIN),(isNaN(this.max)||e.isEmpty(this.max))&&(this.max=e.DEFAULT_MAX),(isNaN(this.step)||e.isEmpty(this.step)||0===this.step)&&(this.step=e.DEFAULT_STEP),this.diff=this.max-this.min},_initHighlight:function(t){var e,i=this._getCaption();t||(t=this.$element.val()),e=this.getWidthFromValue(t)+"%",this.$filledStars.width(e),this.cache={caption:i,width:e,val:t}},_getContainerCss:function(){return"rating-container"+e.getCss(this.theme,"theme-"+this.theme)+e.getCss(this.rtl,"rating-rtl")+e.getCss(this.size,"rating-"+this.size)+e.getCss(this.animate,"rating-animate")+e.getCss(this.disabled||this.readonly,"rating-disabled")+e.getCss(this.containerClass,this.containerClass)+(this.displayOnly?" is-display-only":"")},_checkDisabled:function(){var t=this.$element,e=this.options;this.disabled=void 0===e.disabled?t.attr("disabled")||!1:e.disabled,this.readonly=void 0===e.readonly?t.attr("readonly")||!1:e.readonly,this.inactive=this.disabled||this.readonly,t.attr({disabled:this.disabled,readonly:this.readonly})},_addContent:function(t,e){var i=this.$container,a="clear"===t;return this.rtl?a?i.append(e):i.prepend(e):a?i.prepend(e):i.append(e)},_generateRating:function(){var i,a,n,s=this.$element;a=this.$container=t(document.createElement("div")).insertBefore(s),e.addCss(a,this._getContainerCss()),this.$rating=i=t(document.createElement("div")).attr("class","rating-stars").appendTo(a).append(this._getStars("empty")).append(this._getStars("filled")),this.$emptyStars=i.find(".empty-stars"),this.$filledStars=i.find(".filled-stars"),this._renderCaption(),this._renderClear(),this._initHighlight(),this._initCaptionTitle(),a.append(s),this.rtl&&(n=Math.max(this.$emptyStars.outerWidth(),this.$filledStars.outerWidth()),this.$emptyStars.width(n)),s.appendTo(i)},_getCaption:function(){return this.$caption&&this.$caption.length?this.$caption.html():this.defaultCaption},_setCaption:function(t){this.$caption&&this.$caption.length&&this.$caption.html(t)},_renderCaption:function(){var i,a=this.$element.val(),n=this.captionElement?t(this.captionElement):"";if(this.showCaption){if(i=this.fetchCaption(a),n&&n.length)return e.addCss(n,"caption"),n.html(i),void(this.$caption=n);this._addContent("caption",'<div class="caption">'+i+"</div>"),this.$caption=this.$container.find(".caption")}},_renderClear:function(){var i,a=this.clearElement?t(this.clearElement):"";if(this.showClear){if(i=this._getClearClass(),a.length)return e.addCss(a,i),a.attr({title:this.clearButtonTitle}).html(this.clearButton),void(this.$clear=a);this._addContent("clear",'<div class="'+i+'" title="'+this.clearButtonTitle+'">'+this.clearButton+"</div>"),this.$clear=this.$container.find("."+this.clearButtonBaseClass)}},_getClearClass:function(){return this.clearButtonBaseClass+" "+(this.inactive?"":this.clearButtonActiveClass)},_toggleHover:function(t){var e,i,a;t&&(this.hoverChangeStars&&(e=this.getWidthFromValue(this.clearValue),i=t.val<=this.clearValue?e+"%":t.width,this.$filledStars.css("width",i)),this.hoverChangeCaption&&(a=t.val<=this.clearValue?this.fetchCaption(this.clearValue):t.caption)&&this._setCaption(a+""))},_init:function(e){var i,a=this,n=a.$element.addClass("rating-input");return a.options=e,t.each(e,function(t,e){a[t]=e}),(a.rtl||"rtl"===n.attr("dir"))&&(a.rtl=!0,n.attr("dir","rtl")),a.starClicked=!1,a.clearClicked=!1,a._initSlider(e),a._checkDisabled(),a.displayOnly&&(a.inactive=!0,a.showClear=!1,a.showCaption=!1),a._generateRating(),a._initEvents(),a._listen(),i=a._parseValue(n.val()),n.val(i),n.removeClass("rating-loading")},_initCaptionTitle:function(){var e;this.showCaptionAsTitle&&(e=this.fetchCaption(this.$element.val()),this.$rating.attr("title",t(e).text()))},_trigChange:function(t){this._initCaptionTitle(),this.$element.trigger("change").trigger("rating:change",t)},_initEvents:function(){var t=this;t.events={_getTouchPosition:function(i){return(e.isEmpty(i.pageX)?i.originalEvent.touches[0].pageX:i.pageX)-t.$rating.offset().left},_listenClick:function(t,e){if(t.stopPropagation(),t.preventDefault(),!0===t.handled)return!1;e(t),t.handled=!0},_noMouseAction:function(e){return!t.hoverEnabled||t.inactive||e&&e.isDefaultPrevented()},initTouch:function(i){var a,n,s,r,l,o,h,c,u=t.clearValue||0;("ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch)&&!t.inactive&&(a=i.originalEvent,n=e.isEmpty(a.touches)?a.changedTouches:a.touches,s=t.events._getTouchPosition(n[0]),"touchend"===i.type?(t._setStars(s),c=[t.$element.val(),t._getCaption()],t._trigChange(c),t.starClicked=!0):(l=(r=t.calculate(s)).val<=u?t.fetchCaption(u):r.caption,o=t.getWidthFromValue(u),h=r.val<=u?o+"%":r.width,t._setCaption(l),t.$filledStars.css("width",h)))},starClick:function(e){var i,a;t.events._listenClick(e,function(e){if(t.inactive)return!1;i=t.events._getTouchPosition(e),t._setStars(i),a=[t.$element.val(),t._getCaption()],t._trigChange(a),t.starClicked=!0})},clearClick:function(e){t.events._listenClick(e,function(){t.inactive||(t.clear(),t.clearClicked=!0)})},starMouseMove:function(e){var i,a;t.events._noMouseAction(e)||(t.starClicked=!1,i=t.events._getTouchPosition(e),a=t.calculate(i),t._toggleHover(a),t.$element.trigger("rating:hover",[a.val,a.caption,"stars"]))},starMouseLeave:function(e){var i;t.events._noMouseAction(e)||t.starClicked||(i=t.cache,t._toggleHover(i),t.$element.trigger("rating:hoverleave",["stars"]))},clearMouseMove:function(e){var i,a,n;!t.events._noMouseAction(e)&&t.hoverOnClear&&(t.clearClicked=!1,i='<span class="'+t.clearCaptionClass+'">'+t.clearCaption+"</span>",a=t.clearValue,n={caption:i,width:t.getWidthFromValue(a)||0,val:a},t._toggleHover(n),t.$element.trigger("rating:hover",[a,i,"clear"]))},clearMouseLeave:function(e){var i;t.events._noMouseAction(e)||t.clearClicked||!t.hoverOnClear||(i=t.cache,t._toggleHover(i),t.$element.trigger("rating:hoverleave",["clear"]))},resetForm:function(e){e&&e.isDefaultPrevented()||t.inactive||t.reset()}}},_listen:function(){var i=this.$element,a=i.closest("form"),n=this.$rating,s=this.$clear,r=this.events;return e.handler(n,"touchstart touchmove touchend",t.proxy(r.initTouch,this)),e.handler(n,"click touchstart",t.proxy(r.starClick,this)),e.handler(n,"mousemove",t.proxy(r.starMouseMove,this)),e.handler(n,"mouseleave",t.proxy(r.starMouseLeave,this)),this.showClear&&s.length&&(e.handler(s,"click touchstart",t.proxy(r.clearClick,this)),e.handler(s,"mousemove",t.proxy(r.clearMouseMove,this)),e.handler(s,"mouseleave",t.proxy(r.clearMouseLeave,this))),a.length&&e.handler(a,"reset",t.proxy(r.resetForm,this),!0),i},_getStars:function(t){var e,i='<span class="'+t+'-stars">';for(e=1;e<=this.stars;e++)i+='<span class="star">'+this[t+"Star"]+"</span>";return i+"</span>"},_setStars:function(t){var e=arguments.length?this.calculate(t):this.calculate(),i=this.$element,a=this._parseValue(e.val);return i.val(a),this.$filledStars.css("width",e.width),this._setCaption(e.caption),this.cache=e,i},showStars:function(t){var e=this._parseValue(t);return this.$element.val(e),this._initCaptionTitle(),this._setStars()},calculate:function(t){var i=e.isEmpty(this.$element.val())?0:this.$element.val(),a=arguments.length?this.getValueFromPosition(t):i,n=this.fetchCaption(a),s=this.getWidthFromValue(a);return{caption:n,width:s+="%",val:a}},getValueFromPosition:function(t){var i,a,n=e.getDecimalPlaces(this.step),s=this.$rating.width();return a=this.diff*t/(s*this.step),a=this.rtl?Math.floor(a):Math.ceil(a),i=e.applyPrecision(parseFloat(this.min+a*this.step),n),i=Math.max(Math.min(i,this.max),this.min),this.rtl?this.max-i:i},getWidthFromValue:function(t){var e,i,a=this.min,n=this.max,s=this.$emptyStars;return!t||t<=a||a===n?0:(e=(i=s.outerWidth())?s.width()/i:1,t>=n?100:(t-a)*e*100/(n-a))},fetchCaption:function(t){var i,a,n,s=parseFloat(t)||this.clearValue,r=this.starCaptions,l=this.starCaptionClasses;return s&&s!==this.clearValue&&(s=e.applyPrecision(s,e.getDecimalPlaces(this.step))),n="function"==typeof l?l(s):l[s],a="function"==typeof r?r(s):r[s],i=e.isEmpty(a)?this.defaultCaption.replace(/\{rating}/g,s):a,'<span class="'+(e.isEmpty(n)?this.clearCaptionClass:n)+'">'+(s===this.clearValue?this.clearCaption:i)+"</span>"},destroy:function(){var i=this.$element;return e.isEmpty(this.$container)||this.$container.before(i).remove(),t.removeData(i.get(0)),i.off("rating").removeClass("rating rating-input")},create:function(t){var e=t||this.options||{};return this.destroy().rating(e)},clear:function(){var t='<span class="'+this.clearCaptionClass+'">'+this.clearCaption+"</span>";return this.inactive||this._setCaption(t),this.showStars(this.clearValue).trigger("change").trigger("rating:clear")},reset:function(){return this.showStars(this.initialValue).trigger("rating:reset")},update:function(t){return arguments.length?this.showStars(t):this.$element},refresh:function(e){var i=this.$element;return e?this.destroy().rating(t.extend(!0,this.options,e)).trigger("rating:refresh"):i}},t.fn.rating=function(a){var n=Array.apply(null,arguments),s=[];switch(n.shift(),this.each(function(){var r,l=t(this),o=l.data("rating"),h="object"==typeof a&&a,c=h.theme||l.data("theme"),u=h.language||l.data("language")||"en",d={},p={};o||(c&&(d=t.fn.ratingThemes[c]||{}),"en"===u||e.isEmpty(t.fn.ratingLocales[u])||(p=t.fn.ratingLocales[u]),r=t.extend(!0,{},t.fn.rating.defaults,d,t.fn.ratingLocales.en,p,h,l.data()),o=new i(this,r),l.data("rating",o)),"string"==typeof a&&s.push(o[a].apply(o,n))}),s.length){case 0:return this;case 1:return void 0===s[0]?this:s[0];default:return s}},t.fn.rating.defaults={theme:"",language:"en",stars:5,filledStar:'<i class="glyphicon glyphicon-star"></i>',emptyStar:'<i class="glyphicon glyphicon-star-empty"></i>',containerClass:"",size:"md",animate:!0,displayOnly:!1,rtl:!1,showClear:!0,showCaption:!0,starCaptionClasses:{.5:"label label-danger badge-danger",1:"label label-danger badge-danger",1.5:"label label-warning badge-warning",2:"label label-warning badge-warning",2.5:"label label-info badge-info",3:"label label-info badge-info",3.5:"label label-primary badge-primary",4:"label label-primary badge-primary",4.5:"label label-success badge-success",5:"label label-success badge-success"},clearButton:'<i class="glyphicon glyphicon-minus-sign"></i>',clearButtonBaseClass:"clear-rating",clearButtonActiveClass:"clear-rating-active",clearCaptionClass:"label label-default badge-secondary",clearValue:null,captionElement:null,clearElement:null,showCaptionAsTitle:!0,hoverEnabled:!0,hoverChangeCaption:!0,hoverChangeStars:!0,hoverOnClear:!0,zeroAsNull:!0},t.fn.ratingLocales.en={defaultCaption:"{rating} Stars",starCaptions:{.5:"Half Star",1:"One Star",1.5:"One & Half Star",2:"Two Stars",2.5:"Two & Half Stars",3:"Three Stars",3.5:"Three & Half Stars",4:"Four Stars",4.5:"Four & Half Stars",5:"Five Stars"},clearButtonTitle:"Clear",clearCaption:"Not Rated"},t.fn.rating.Constructor=i,t(document).ready(function(){var e=t("input.rating");e.length&&e.removeClass("rating-loading").addClass("rating-loading").rating()})});
/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.Context.refreshAll();for(var e in i)i[e].enabled=!0;return this},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,n.windowContext||(n.windowContext=!0,n.windowContext=new e(window)),this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical),i=this.element==this.element.window;t&&e&&!i&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s];if(null!==a.triggerPoint){var l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=e?void 0:this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var r in t){var s=t[r];for(var a in this.waypoints[r]){var l,h,p,u,c,d=this.waypoints[r][a],f=d.options.offset,w=d.triggerPoint,y=0,g=null==w;d.element!==d.element.window&&(y=d.adapter.offset()[s.offsetProp]),"function"==typeof f?f=f.apply(d):"string"==typeof f&&(f=parseFloat(f),d.options.offset.indexOf("%")>-1&&(f=Math.ceil(s.contextDimension*f/100))),l=s.contextScroll-s.contextOffset,d.triggerPoint=Math.floor(y+l-f),h=w<s.oldScroll,p=d.triggerPoint>=s.oldScroll,u=h&&p,c=!h&&!p,!g&&u?(d.queueTrigger(s.backward),o[d.group.id]=d.group):!g&&c?(d.queueTrigger(s.forward),o[d.group.id]=d.group):g&&s.oldScroll>=d.triggerPoint&&(d.queueTrigger(s.forward),o[d.group.id]=d.group)}}return n.requestAnimationFrame(function(){for(var t in o)o[t].flushTriggers()}),this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();
/*!
Waypoints Infinite Scroll Shortcut - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
!function(){"use strict";function t(n){this.options=i.extend({},t.defaults,n),this.container=this.options.element,"auto"!==this.options.container&&(this.container=this.options.container),this.$container=i(this.container),this.$more=i(this.options.more),this.$more.length&&(this.setupHandler(),this.waypoint=new o(this.options))}var i=window.jQuery,o=window.Waypoint;t.prototype.setupHandler=function(){this.options.handler=i.proxy(function(){this.options.onBeforePageLoad(),this.destroy(),this.$container.addClass(this.options.loadingClass),i.get(i(this.options.more).attr("href"),i.proxy(function(t){var n=i(i.parseHTML(t)),e=n.find(this.options.more),s=n.find(this.options.items);s.length||(s=n.filter(this.options.items)),this.$container.append(s),this.$container.removeClass(this.options.loadingClass),e.length||(e=n.filter(this.options.more)),e.length?(this.$more.replaceWith(e),this.$more=e,this.waypoint=new o(this.options)):this.$more.remove(),this.options.onAfterPageLoad(s)},this))},this)},t.prototype.destroy=function(){this.waypoint&&this.waypoint.destroy()},t.defaults={container:"auto",items:".infinite-item",more:".infinite-more-link",offset:"bottom-in-view",loadingClass:"infinite-loading",onBeforePageLoad:i.noop,onAfterPageLoad:i.noop},o.Infinite=t}();
/*!
Waypoints Sticky Element Shortcut - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
!function(){"use strict";function t(s){this.options=e.extend({},i.defaults,t.defaults,s),this.element=this.options.element,this.$element=e(this.element),this.createWrapper(),this.createWaypoint()}var e=window.jQuery,i=window.Waypoint;t.prototype.createWaypoint=function(){var t=this.options.handler;this.waypoint=new i(e.extend({},this.options,{element:this.wrapper,handler:e.proxy(function(e){var i=this.options.direction.indexOf(e)>-1,s=i?this.$element.outerHeight(!0):"";this.$wrapper.height(s),this.$element.toggleClass(this.options.stuckClass,i),t&&t.call(this,e)},this)}))},t.prototype.createWrapper=function(){this.options.wrapper&&this.$element.wrap(this.options.wrapper),this.$wrapper=this.$element.parent(),this.wrapper=this.$wrapper[0]},t.prototype.destroy=function(){this.$element.parent()[0]===this.wrapper&&(this.waypoint.destroy(),this.$element.removeClass(this.options.stuckClass),this.options.wrapper&&this.$element.unwrap())},t.defaults={wrapper:'<div class="sticky-wrapper" />',stuckClass:"stuck",direction:"down right"},i.Sticky=t}();
/**
 * Copyright (c) 2007-2015 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Licensed under MIT
 * @author Ariel Flesler
 * @version 2.1.1
 */
;(function(f){"use strict";"function"===typeof define&&define.amd?define(["jquery"],f):"undefined"!==typeof module&&module.exports?module.exports=f(require("jquery")):f(jQuery)})(function($){"use strict";function n(a){return!a.nodeName||-1!==$.inArray(a.nodeName.toLowerCase(),["iframe","#document","html","body"])}function h(a){return $.isFunction(a)||$.isPlainObject(a)?a:{top:a,left:a}}var p=$.scrollTo=function(a,d,b){return $(window).scrollTo(a,d,b)};p.defaults={axis:"xy",duration:0,limit:!0};$.fn.scrollTo=function(a,d,b){"object"=== typeof d&&(b=d,d=0);"function"===typeof b&&(b={onAfter:b});"max"===a&&(a=9E9);b=$.extend({},p.defaults,b);d=d||b.duration;var u=b.queue&&1<b.axis.length;u&&(d/=2);b.offset=h(b.offset);b.over=h(b.over);return this.each(function(){function k(a){var k=$.extend({},b,{queue:!0,duration:d,complete:a&&function(){a.call(q,e,b)}});r.animate(f,k)}if(null!==a){var l=n(this),q=l?this.contentWindow||window:this,r=$(q),e=a,f={},t;switch(typeof e){case "number":case "string":if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(e)){e= h(e);break}e=l?$(e):$(e,q);if(!e.length)return;case "object":if(e.is||e.style)t=(e=$(e)).offset()}var v=$.isFunction(b.offset)&&b.offset(q,e)||b.offset;$.each(b.axis.split(""),function(a,c){var d="x"===c?"Left":"Top",m=d.toLowerCase(),g="scroll"+d,h=r[g](),n=p.max(q,c);t?(f[g]=t[m]+(l?0:h-r.offset()[m]),b.margin&&(f[g]-=parseInt(e.css("margin"+d),10)||0,f[g]-=parseInt(e.css("border"+d+"Width"),10)||0),f[g]+=v[m]||0,b.over[m]&&(f[g]+=e["x"===c?"width":"height"]()*b.over[m])):(d=e[m],f[g]=d.slice&& "%"===d.slice(-1)?parseFloat(d)/100*n:d);b.limit&&/^\d+$/.test(f[g])&&(f[g]=0>=f[g]?0:Math.min(f[g],n));!a&&1<b.axis.length&&(h===f[g]?f={}:u&&(k(b.onAfterFirst),f={}))});k(b.onAfter)}})};p.max=function(a,d){var b="x"===d?"Width":"Height",h="scroll"+b;if(!n(a))return a[h]-$(a)[b.toLowerCase()]();var b="client"+b,k=a.ownerDocument||a.document,l=k.documentElement,k=k.body;return Math.max(l[h],k[h])-Math.min(l[b],k[b])};$.Tween.propHooks.scrollLeft=$.Tween.propHooks.scrollTop={get:function(a){return $(a.elem)[a.prop]()}, set:function(a){var d=this.get(a);if(a.options.interrupt&&a._last&&a._last!==d)return $(a.elem).stop();var b=Math.round(a.now);d!==b&&($(a.elem)[a.prop](b),a._last=this.get(a))}};return p});
/**!
 * easy-pie-chart
 * Lightweight plugin to render simple, animated and retina optimized pie charts
 *
 * @license
 * @author Robert Fleischmann <rendro87@gmail.com> (http://robert-fleischmann.de)
 * @version 2.1.7
 **/
!function(a,b){"function"==typeof define&&define.amd?define(["jquery"],function(a){return b(a)}):"object"==typeof exports?module.exports=b(require("jquery")):b(jQuery)}(this,function(a){var b=function(a,b){var c,d=document.createElement("canvas");a.appendChild(d),"object"==typeof G_vmlCanvasManager&&G_vmlCanvasManager.initElement(d);var e=d.getContext("2d");d.width=d.height=b.size;var f=1;window.devicePixelRatio>1&&(f=window.devicePixelRatio,d.style.width=d.style.height=[b.size,"px"].join(""),d.width=d.height=b.size*f,e.scale(f,f)),e.translate(b.size/2,b.size/2),e.rotate((-0.5+b.rotate/180)*Math.PI);var g=(b.size-b.lineWidth)/2;b.scaleColor&&b.scaleLength&&(g-=b.scaleLength+2),Date.now=Date.now||function(){return+new Date};var h=function(a,b,c){c=Math.min(Math.max(-1,c||0),1);var d=0>=c?!0:!1;e.beginPath(),e.arc(0,0,g,0,2*Math.PI*c,d),e.strokeStyle=a,e.lineWidth=b,e.stroke()},i=function(){var a,c;e.lineWidth=1,e.fillStyle=b.scaleColor,e.save();for(var d=24;d>0;--d)d%6===0?(c=b.scaleLength,a=0):(c=.6*b.scaleLength,a=b.scaleLength-c),e.fillRect(-b.size/2+a,0,c,1),e.rotate(Math.PI/12);e.restore()},j=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(a){window.setTimeout(a,1e3/60)}}(),k=function(){b.scaleColor&&i(),b.trackColor&&h(b.trackColor,b.trackWidth||b.lineWidth,1)};this.getCanvas=function(){return d},this.getCtx=function(){return e},this.clear=function(){e.clearRect(b.size/-2,b.size/-2,b.size,b.size)},this.draw=function(a){b.scaleColor||b.trackColor?e.getImageData&&e.putImageData?c?e.putImageData(c,0,0):(k(),c=e.getImageData(0,0,b.size*f,b.size*f)):(this.clear(),k()):this.clear(),e.lineCap=b.lineCap;var d;d="function"==typeof b.barColor?b.barColor(a):b.barColor,h(d,b.lineWidth,a/100)}.bind(this),this.animate=function(a,c){var d=Date.now();b.onStart(a,c);var e=function(){var f=Math.min(Date.now()-d,b.animate.duration),g=b.easing(this,f,a,c-a,b.animate.duration);this.draw(g),b.onStep(a,c,g),f>=b.animate.duration?b.onStop(a,c):j(e)}.bind(this);j(e)}.bind(this)},c=function(a,c){var d={barColor:"#ef1e25",trackColor:"#f9f9f9",scaleColor:"#dfe0e0",scaleLength:5,lineCap:"round",lineWidth:3,trackWidth:void 0,size:110,rotate:0,animate:{duration:1e3,enabled:!0},easing:function(a,b,c,d,e){return b/=e/2,1>b?d/2*b*b+c:-d/2*(--b*(b-2)-1)+c},onStart:function(a,b){},onStep:function(a,b,c){},onStop:function(a,b){}};if("undefined"!=typeof b)d.renderer=b;else{if("undefined"==typeof SVGRenderer)throw new Error("Please load either the SVG- or the CanvasRenderer");d.renderer=SVGRenderer}var e={},f=0,g=function(){this.el=a,this.options=e;for(var b in d)d.hasOwnProperty(b)&&(e[b]=c&&"undefined"!=typeof c[b]?c[b]:d[b],"function"==typeof e[b]&&(e[b]=e[b].bind(this)));"string"==typeof e.easing&&"undefined"!=typeof jQuery&&jQuery.isFunction(jQuery.easing[e.easing])?e.easing=jQuery.easing[e.easing]:e.easing=d.easing,"number"==typeof e.animate&&(e.animate={duration:e.animate,enabled:!0}),"boolean"!=typeof e.animate||e.animate||(e.animate={duration:1e3,enabled:e.animate}),this.renderer=new e.renderer(a,e),this.renderer.draw(f),a.dataset&&a.dataset.percent?this.update(parseFloat(a.dataset.percent)):a.getAttribute&&a.getAttribute("data-percent")&&this.update(parseFloat(a.getAttribute("data-percent")))}.bind(this);this.update=function(a){return a=parseFloat(a),e.animate.enabled?this.renderer.animate(f,a):this.renderer.draw(a),f=a,this}.bind(this),this.disableAnimation=function(){return e.animate.enabled=!1,this},this.enableAnimation=function(){return e.animate.enabled=!0,this},g()};a.fn.easyPieChart=function(b){return this.each(function(){var d;a.data(this,"easyPieChart")||(d=a.extend({},b,a(this).data()),a.data(this,"easyPieChart",new c(this,d)))})}});
/**
 * jQuery serializeObject
 * @copyright 2014, macek <paulmacek@gmail.com>
 * @link https://github.com/macek/jquery-serialize-object
 * @license BSD
 * @version 2.5.0
 */
!function(e,i){if("function"==typeof define&&define.amd)define(["exports","jquery"],function(e,r){return i(e,r)});else if("undefined"!=typeof exports){var r=require("jquery");i(exports,r)}else i(e,e.jQuery||e.Zepto||e.ender||e.$)}(this,function(e,i){function r(e,r){function n(e,i,r){return e[i]=r,e}function a(e,i){for(var r,a=e.match(t.key);void 0!==(r=a.pop());)if(t.push.test(r)){var u=s(e.replace(/\[\]$/,""));i=n([],u,i)}else t.fixed.test(r)?i=n([],r,i):t.named.test(r)&&(i=n({},r,i));return i}function s(e){return void 0===h[e]&&(h[e]=0),h[e]++}function u(e){switch(i('[name="'+e.name+'"]',r).attr("type")){case"checkbox":return"on"===e.value?!0:e.value;default:return e.value}}function f(i){if(!t.validate.test(i.name))return this;var r=a(i.name,u(i));return l=e.extend(!0,l,r),this}function d(i){if(!e.isArray(i))throw new Error("formSerializer.addPairs expects an Array");for(var r=0,t=i.length;t>r;r++)this.addPair(i[r]);return this}function o(){return l}function c(){return JSON.stringify(o())}var l={},h={};this.addPair=f,this.addPairs=d,this.serialize=o,this.serializeJSON=c}var t={validate:/^[a-z_][a-z0-9_]*(?:\[(?:\d*|[a-z0-9_]+)\])*$/i,key:/[a-z0-9_]+|(?=\[\])/gi,push:/^$/,fixed:/^\d+$/,named:/^[a-z0-9_]+$/i};return r.patterns=t,r.serializeObject=function(){return new r(i,this).addPairs(this.serializeArray()).serialize()},r.serializeJSON=function(){return new r(i,this).addPairs(this.serializeArray()).serializeJSON()},"undefined"!=typeof i.fn&&(i.fn.serializeObject=r.serializeObject,i.fn.serializeJSON=r.serializeJSON),e.FormSerializer=r,r});
/*!
  SerializeJSON jQuery plugin.
  https://github.com/marioizquierdo/jquery.serializeJSON
  version 3.2.1 (Feb, 2021)

  Copyright (c) 2012-2021 Mario Izquierdo
  Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
  and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*/
!function(e){if("function"==typeof define&&define.amd)define(["jquery"],e);else if("object"==typeof exports){var n=require("jquery");module.exports=e(n)}else e(window.jQuery||window.Zepto||window.$)}(function(e){"use strict";var n=/\r?\n/g,r=/^(?:submit|button|image|reset|file)$/i,t=/^(?:input|select|textarea|keygen)/i,i=/^(?:checkbox|radio)$/i;e.fn.serializeJSON=function(n){var r=e.serializeJSON,t=r.setupOpts(n),i=e.extend({},t.defaultTypes,t.customTypes),a=r.serializeArray(this,t),u={};return e.each(a,function(n,a){var s=a.name,l=e(a.el).attr("data-value-type");if(!l&&!t.disableColonTypes){var o=r.splitType(a.name);s=o[0],l=o[1]}if("skip"!==l){l||(l=t.defaultType);var p=r.applyTypeFunc(a.name,a.value,l,a.el,i);if(p||!r.shouldSkipFalsy(a.name,s,l,a.el,t)){var f=r.splitInputNameIntoKeysArray(s);r.deepSet(u,f,p,t)}}}),u},e.serializeJSON={defaultOptions:{},defaultBaseOptions:{checkboxUncheckedValue:void 0,useIntKeysAsArrayIndex:!1,skipFalsyValuesForTypes:[],skipFalsyValuesForFields:[],disableColonTypes:!1,customTypes:{},defaultTypes:{string:function(e){return String(e)},number:function(e){return Number(e)},boolean:function(e){return-1===["false","null","undefined","","0"].indexOf(e)},null:function(e){return-1===["false","null","undefined","","0"].indexOf(e)?e:null},array:function(e){return JSON.parse(e)},object:function(e){return JSON.parse(e)},skip:null},defaultType:"string"},setupOpts:function(n){null==n&&(n={});var r=e.serializeJSON,t=["checkboxUncheckedValue","useIntKeysAsArrayIndex","skipFalsyValuesForTypes","skipFalsyValuesForFields","disableColonTypes","customTypes","defaultTypes","defaultType"];for(var i in n)if(-1===t.indexOf(i))throw new Error("serializeJSON ERROR: invalid option '"+i+"'. Please use one of "+t.join(", "));return e.extend({},r.defaultBaseOptions,r.defaultOptions,n)},serializeArray:function(a,u){null==u&&(u={});var s=e.serializeJSON;return a.map(function(){var n=e.prop(this,"elements");return n?e.makeArray(n):this}).filter(function(){var n=e(this),a=this.type;return this.name&&!n.is(":disabled")&&t.test(this.nodeName)&&!r.test(a)&&(this.checked||!i.test(a)||null!=s.getCheckboxUncheckedValue(n,u))}).map(function(r,t){var a=e(this),l=a.val(),p=this.type;return null==l?null:(i.test(p)&&!this.checked&&(l=s.getCheckboxUncheckedValue(a,u)),o(l)?e.map(l,function(e){return{name:t.name,value:e.replace(n,"\r\n"),el:t}}):{name:t.name,value:l.replace(n,"\r\n"),el:t})}).get()},getCheckboxUncheckedValue:function(e,n){var r=e.attr("data-unchecked-value");return null==r&&(r=n.checkboxUncheckedValue),r},applyTypeFunc:function(e,n,r,t,i){var u=i[r];if(!u)throw new Error("serializeJSON ERROR: Invalid type "+r+" found in input name '"+e+"', please use one of "+a(i).join(", "));return u(n,t)},splitType:function(e){var n=e.split(":");if(n.length>1){var r=n.pop();return[n.join(":"),r]}return[e,""]},shouldSkipFalsy:function(n,r,t,i,a){var u=e(i).attr("data-skip-falsy");if(null!=u)return"false"!==u;var s=a.skipFalsyValuesForFields;if(s&&(-1!==s.indexOf(r)||-1!==s.indexOf(n)))return!0;var l=a.skipFalsyValuesForTypes;return!(!l||-1===l.indexOf(t))},splitInputNameIntoKeysArray:function(n){var r=n.split("[");return""===(r=e.map(r,function(e){return e.replace(/\]/g,"")}))[0]&&r.shift(),r},deepSet:function(n,r,t,i){null==i&&(i={});var a=e.serializeJSON;if(s(n))throw new Error("ArgumentError: param 'o' expected to be an object or array, found undefined");if(!r||0===r.length)throw new Error("ArgumentError: param 'keys' expected to be an array with least one element");var p=r[0];if(1!==r.length){var f=r[1],c=r.slice(1);if(""===p){var d=n.length-1,y=n[d];p=u(y)&&s(a.deepGet(y,c))?d:d+1}""===f?!s(n[p])&&o(n[p])||(n[p]=[]):i.useIntKeysAsArrayIndex&&l(f)?!s(n[p])&&o(n[p])||(n[p]=[]):!s(n[p])&&u(n[p])||(n[p]={}),a.deepSet(n[p],c,t,i)}else""===p?n.push(t):n[p]=t},deepGet:function(n,r){var t=e.serializeJSON;if(s(n)||s(r)||0===r.length||!u(n)&&!o(n))return n;var i=r[0];if(""!==i){if(1===r.length)return n[i];var a=r.slice(1);return t.deepGet(n[i],a)}}};var a=function(e){if(Object.keys)return Object.keys(e);var n,r=[];for(n in e)r.push(n);return r},u=function(e){return e===Object(e)},s=function(e){return void 0===e},l=function(e){return/^[0-9]+$/.test(String(e))},o=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)}});
!function(t){function e(e){if("string"==typeof e.data&&(e.data={keys:e.data}),e.data&&e.data.keys&&"string"==typeof e.data.keys){var a=e.handler,s=e.data.keys.toLowerCase().split(" ");e.handler=function(e){if(this===e.target||!(t.hotkeys.options.filterInputAcceptingElements&&t.hotkeys.textInputTypes.test(e.target.nodeName)||t.hotkeys.options.filterContentEditable&&t(e.target).attr("contenteditable")||t.hotkeys.options.filterTextInputs&&t.inArray(e.target.type,t.hotkeys.textAcceptingInputTypes)>-1)){var n="keypress"!==e.type&&t.hotkeys.specialKeys[e.which],i=String.fromCharCode(e.which).toLowerCase(),r="",o={};t.each(["alt","ctrl","shift"],function(t,a){e[a+"Key"]&&n!==a&&(r+=a+"+")}),e.metaKey&&!e.ctrlKey&&"meta"!==n&&(r+="meta+"),e.metaKey&&"meta"!==n&&r.indexOf("alt+ctrl+shift+")>-1&&(r=r.replace("alt+ctrl+shift+","hyper+")),n?o[r+n]=!0:(o[r+i]=!0,o[r+t.hotkeys.shiftNums[i]]=!0,"shift+"===r&&(o[t.hotkeys.shiftNums[i]]=!0));for(var p=0,l=s.length;p<l;p++)if(o[s[p]])return a.apply(this,arguments)}}}}t.hotkeys={version:"0.2.0",specialKeys:{8:"backspace",9:"tab",10:"return",13:"return",16:"shift",17:"ctrl",18:"alt",19:"pause",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"insert",46:"del",59:";",61:"=",91:"left_command",93:"right_command",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",144:"numlock",145:"scroll",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",224:"command"},shiftNums:{"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":": ","'":'"',",":"<",".":">","/":"?","\\":"|"},textAcceptingInputTypes:["text","password","number","email","url","range","date","month","week","time","datetime","datetime-local","search","color","tel"],textInputTypes:/textarea|input|select/i,options:{filterInputAcceptingElements:!0,filterTextInputs:!0,filterContentEditable:!0}},t.each(["keydown","keyup","keypress"],function(){t.event.special[this]={add:e}})}(jQuery||this.jQuery||window.jQuery);
!function(t){"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof module&&"object"==typeof module.exports?t(require("jquery")):t(jQuery)}(function(h){h.timeago=function(t){return t instanceof Date?r(t):r("string"==typeof t?h.timeago.parse(t):"number"==typeof t?new Date(t):h.timeago.datetime(t))};var a=h.timeago;h.extend(h.timeago,{settings:{refreshMillis:6e4,allowPast:!0,allowFuture:!1,localeTitle:!1,cutoff:0,autoDispose:!0,strings:{prefixAgo:null,prefixFromNow:null,suffixAgo:"ago",suffixFromNow:"from now",inPast:"any moment now",seconds:"less than a minute",minute:"about a minute",minutes:"%d minutes",hour:"about an hour",hours:"about %d hours",day:"a day",days:"%d days",month:"about a month",months:"%d months",year:"about a year",years:"%d years",wordSeparator:" ",numbers:[]}},inWords:function(n){if(!this.settings.allowPast&&!this.settings.allowFuture)throw"timeago allowPast and allowFuture settings can not both be set to false.";var r=this.settings.strings,t=r.prefixAgo,e=r.suffixAgo;if(this.settings.allowFuture&&n<0&&(t=r.prefixFromNow,e=r.suffixFromNow),!this.settings.allowPast&&0<=n)return this.settings.strings.inPast;var a=Math.abs(n)/1e3,i=a/60,o=i/60,s=o/24,u=s/365;function l(t,e){var a=h.isFunction(t)?t(e,n):t,i=r.numbers&&r.numbers[e]||e;return a.replace(/%d/i,i)}var m=a<45&&l(r.seconds,Math.round(a))||a<90&&l(r.minute,1)||i<45&&l(r.minutes,Math.round(i))||i<90&&l(r.hour,1)||o<24&&l(r.hours,Math.round(o))||o<42&&l(r.day,1)||s<30&&l(r.days,Math.round(s))||s<45&&l(r.month,1)||s<365&&l(r.months,Math.round(s/30))||u<1.5&&l(r.year,1)||l(r.years,Math.round(u)),d=r.wordSeparator||"";return void 0===r.wordSeparator&&(d=" "),h.trim([t,m,e].join(d))},parse:function(t){var e=h.trim(t);return e=(e=(e=(e=(e=e.replace(/\.\d+/,"")).replace(/-/,"/").replace(/-/,"/")).replace(/T/," ").replace(/Z/," UTC")).replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2")).replace(/([\+\-]\d\d)$/," $100"),new Date(e)},datetime:function(t){var e=a.isTime(t)?h(t).attr("datetime"):h(t).attr("title");return a.parse(e)},isTime:function(t){return"time"===h(t).get(0).tagName.toLowerCase()}});var i={init:function(){i.dispose.call(this);var t=h.proxy(n,this);t();var e=a.settings;0<e.refreshMillis&&(this._timeagoInterval=setInterval(t,e.refreshMillis))},update:function(t){var e=t instanceof Date?t:a.parse(t);h(this).data("timeago",{datetime:e}),a.settings.localeTitle&&h(this).attr("title",e.toLocaleString()),n.apply(this)},updateFromDOM:function(){h(this).data("timeago",{datetime:a.parse(a.isTime(this)?h(this).attr("datetime"):h(this).attr("title"))}),n.apply(this)},dispose:function(){this._timeagoInterval&&(window.clearInterval(this._timeagoInterval),this._timeagoInterval=null)}};function n(){var t=a.settings;if(t.autoDispose&&!h.contains(document.documentElement,this))return h(this).timeago("dispose"),this;var e=function(t){if(!(t=h(t)).data("timeago")){t.data("timeago",{datetime:a.datetime(t)});var e=h.trim(t.text());a.settings.localeTitle?t.attr("title",t.data("timeago").datetime.toLocaleString()):!(0<e.length)||a.isTime(t)&&t.attr("title")||t.attr("title",e)}return t.removeClass("initial").addClass("loaded").data("timeago")}(this);return isNaN(e.datetime)||(0===t.cutoff||Math.abs(o(e.datetime))<t.cutoff?h(this).text(r(e.datetime)):0<h(this).attr("title").length&&h(this).text(h(this).attr("title"))),this}function r(t){return a.inWords(o(t))}function o(t){return(new Date).getTime()-t.getTime()}h.fn.timeago=function(t,e){var a=t?i[t]:i.init;if(!a)throw new Error("Unknown function name '"+t+"' for timeago");return this.each(function(){a.call(this,e)}),this},document.createElement("abbr"),document.createElement("time")});
$(function() {
  $("input[type=email]").kendoTextBox();
  $("input[type=password]").kendoTextBox();
  $("input[type=tel]").kendoTextBox();
  $("input[type=text]").kendoTextBox();
  $("input[type=url]").kendoTextBox();
  $("input[type=submit]").kendoButton();
  $("button.kendo").kendoButton();
  $("select.kendo").kendoDropDownList();
  $("textarea.kendo").kendoTextArea();
});

jQuery.cachedScript = function(url, options) {
  options = $.extend(options || {}, {
    dataType: "script",
    cache: true,
    url: url
  });
  return jQuery.ajax(options);
};

jQuery.timeago.settings.allowFuture = true;

function pageLoaded() {
  return new Promise(function(resolve, reject) {
    if (document.readyState === 'complete') { return resolve(); }
    window.addEventListener('load', resolve);
  })
}

function decrementBadge() {
  var unread_count = parseInt($('li.notifications div.badge div.count').text());
  var new_count = (unread_count -= 1);
  setBadgeCount(new_count);
}

function setBadgeCount(number) {
  $('li.notifications div.badge div.count').html(number);
  $('section.content div.tooltip_popup.notifications h2 span').html(number);
}

function clearNotifications() {
  $('div.actions.mark_all').hide(0);
  $('li.notifications a span').removeClass('on');
  $('li.notifications div.badge').addClass('hide');
  setBadgeCount(0);

  $('p.caught_up').removeClass('hide');
}

function checkIfNotificationsEmpty(count) {
  if (count == 0) {
    clearNotifications();
  } else {
    setBadgeCount(count);
  }
}

function checkHash(hash) {
  var sliced_hash = window.location.hash.slice(1);
  var key = sliced_hash.split('=');
  if (key[0] == hash) {
    return key
  } else {
    return false
  }
}

function checkVideoHash(w, h, video_title) {
  var check_hash = checkHash('play');
  if (check_hash) {
    openVideoPlayer(w, h, check_hash[1], video_title);
  }
}

function openVideoPlayer(w, h, video_key, video_title) {
  var video_width = Math.round((w * 0.90));
  var video_height = Math.round(video_width / 1.78);

  if ((video_height * 1.15) > h) {
    var video_height = Math.round(h * 0.85);
    var video_width = Math.round(video_height * 1.78);
  }

  var video_url = "/video/play?key={0}&width={1}&height={2}";
  var video_popup = $('#video_popup').kendoWindow({
    actions: [ "Close" ],
    content: kendo.format(video_url, video_key, video_width, video_height),
    modal: true,
    draggable: false,
    resizable: false,
    width: video_width,
    height: (video_height + 63),
    visible: false,
    pinned: true,
    animation: {
      open: {
        effects: "fade:in"
      },
      close: {
        effects: "fade:out"
      }
    },
    open: function() {
      $('body').addClass('monochrome');
    },
    close: function() {
      $('body').removeClass('monochrome');
      history.pushState(null, document.title, window.location.pathname + window.location.search);
    },
    deactivate: function() {
      $('#video_popup').html('');
    }
  }).data("kendoWindow");

  $('#video_popup').parent().parent().find('.k-window').css({ 'background-color':'#000', 'border-color':'#000' });
  $('#video_popup').parent().find('.k-window-content').css({ 'padding':'0', 'margin':'0', 'background-color':'#000', 'overflow':'hidden' });
  $('#video_popup').parent().find('.k-window-titlebar').css({ 'background-color':'#000', 'border-color':'#000', 'color':'#fff' });

  video_popup.title(video_title);
  video_popup.center().open();
}

function attachVideoPlayer(w, h) {
  $('body').on('click', 'a.play_trailer', function(e) {
    e.preventDefault();

    var video_key = $(this).attr('data-id');
    var video_title = $(this).attr('data-title');
    history.pushState(null, null, "#play=" + video_key);

    openVideoPlayer(w, h, video_key, video_title);
  });
};

function decodeEntities(encodedString) {
  var textArea = document.createElement('textarea');
  textArea.innerHTML = encodedString;
  return textArea.value;
}

var accent_map = {
  'ẚ':'a','Á':'a','á':'a','À':'a','à':'a','Ă':'a','ă':'a','Ắ':'a','ắ':'a','Ằ':'a','ằ':'a','Ẵ':'a','ẵ':'a','Ẳ':'a','ẳ':'a','Â':'a','â':'a','Ấ':'a','ấ':'a','Ầ':'a','ầ':'a','Ẫ':'a','ẫ':'a','Ẩ':'a','ẩ':'a','Ǎ':'a','ǎ':'a','Å':'a','å':'a','Ǻ':'a','ǻ':'a','Ä':'a','ä':'a','Ǟ':'a','ǟ':'a','Ã':'a','ã':'a','Ȧ':'a','ȧ':'a','Ǡ':'a','ǡ':'a','Ą':'a','ą':'a','Ā':'a','ā':'a','Ả':'a','ả':'a','Ȁ':'a','ȁ':'a','Ȃ':'a','ȃ':'a','Ạ':'a','ạ':'a','Ặ':'a','ặ':'a','Ậ':'a','ậ':'a','Ḁ':'a','ḁ':'a','Ⱥ':'a','ⱥ':'a','Ǽ':'a','ǽ':'a','Ǣ':'a','ǣ':'a',
  'Ḃ':'b','ḃ':'b','Ḅ':'b','ḅ':'b','Ḇ':'b','ḇ':'b','Ƀ':'b','ƀ':'b','ᵬ':'b','Ɓ':'b','ɓ':'b','Ƃ':'b','ƃ':'b',
  'Ć':'c','ć':'c','Ĉ':'c','ĉ':'c','Č':'c','č':'c','Ċ':'c','ċ':'c','Ç':'c','ç':'c','Ḉ':'c','ḉ':'c','Ȼ':'c','ȼ':'c','Ƈ':'c','ƈ':'c','ɕ':'c',
  'Ď':'d','ď':'d','Ḋ':'d','ḋ':'d','Ḑ':'d','ḑ':'d','Ḍ':'d','ḍ':'d','Ḓ':'d','ḓ':'d','Ḏ':'d','ḏ':'d','Đ':'d','đ':'d','ᵭ':'d','Ɖ':'d','ɖ':'d','Ɗ':'d','ɗ':'d','Ƌ':'d','ƌ':'d','ȡ':'d','ð':'d',
  'É':'e','Ə':'e','Ǝ':'e','ǝ':'e','é':'e','È':'e','è':'e','Ĕ':'e','ĕ':'e','Ê':'e','ê':'e','Ế':'e','ế':'e','Ề':'e','ề':'e','Ễ':'e','ễ':'e','Ể':'e','ể':'e','Ě':'e','ě':'e','Ë':'e','ë':'e','Ẽ':'e','ẽ':'e','Ė':'e','ė':'e','Ȩ':'e','ȩ':'e','Ḝ':'e','ḝ':'e','Ę':'e','ę':'e','Ē':'e','ē':'e','Ḗ':'e','ḗ':'e','Ḕ':'e','ḕ':'e','Ẻ':'e','ẻ':'e','Ȅ':'e','ȅ':'e','Ȇ':'e','ȇ':'e','Ẹ':'e','ẹ':'e','Ệ':'e','ệ':'e','Ḙ':'e','ḙ':'e','Ḛ':'e','ḛ':'e','Ɇ':'e','ɇ':'e','ɚ':'e','ɝ':'e',
  'Ḟ':'f','ḟ':'f','ᵮ':'f','Ƒ':'f','ƒ':'f',
  'Ǵ':'g','ǵ':'g','Ğ':'g','ğ':'g','Ĝ':'g','ĝ':'g','Ǧ':'g','ǧ':'g','Ġ':'g','ġ':'g','Ģ':'g','ģ':'g','Ḡ':'g','ḡ':'g','Ǥ':'g','ǥ':'g','Ɠ':'g','ɠ':'g',
  'Ĥ':'h','ĥ':'h','Ȟ':'h','ȟ':'h','Ḧ':'h','ḧ':'h','Ḣ':'h','ḣ':'h','Ḩ':'h','ḩ':'h','Ḥ':'h','ḥ':'h','Ḫ':'h','ḫ':'h','H':'h','̱':'h','ẖ':'h','Ħ':'h','ħ':'h','Ⱨ':'h','ⱨ':'h',
  'Í':'i','í':'i','Ì':'i','ì':'i','Ĭ':'i','ĭ':'i','Î':'i','î':'i','Ǐ':'i','ǐ':'i','Ï':'i','ï':'i','Ḯ':'i','ḯ':'i','Ĩ':'i','ĩ':'i','İ':'i','i':'i','Į':'i','į':'i','Ī':'i','ī':'i','Ỉ':'i','ỉ':'i','Ȉ':'i','ȉ':'i','Ȋ':'i','ȋ':'i','Ị':'i','ị':'i','Ḭ':'i','ḭ':'i','I':'i','ı':'i','Ɨ':'i','ɨ':'i',
  'Ĵ':'j','ĵ':'j','J':'j','̌':'j','ǰ':'j','ȷ':'j','Ɉ':'j','ɉ':'j','ʝ':'j','ɟ':'j','ʄ':'j',
  'Ḱ':'k','ḱ':'k','Ǩ':'k','ǩ':'k','Ķ':'k','ķ':'k','Ḳ':'k','ḳ':'k','Ḵ':'k','ḵ':'k','Ƙ':'k','ƙ':'k','Ⱪ':'k','ⱪ':'k',
  'Ĺ':'l','ĺ':'l','Ľ':'l','ľ':'l','Ļ':'l','ļ':'l','Ḷ':'l','ḷ':'l','Ḹ':'l','ḹ':'l','Ḽ':'l','ḽ':'l','Ḻ':'l','ḻ':'l','Ł':'l','ł':'l','Ł':'l','̣':'l','ł':'l','̣':'l','Ŀ':'l','ŀ':'l','Ƚ':'l','ƚ':'l','Ⱡ':'l','ⱡ':'l','Ɫ':'l','ɫ':'l','ɬ':'l','ɭ':'l','ȴ':'l',
  'Ḿ':'m','ḿ':'m','Ṁ':'m','ṁ':'m','Ṃ':'m','ṃ':'m','ɱ':'m',
  'Ń':'n','ń':'n','Ǹ':'n','ǹ':'n','Ň':'n','ň':'n','Ñ':'n','ñ':'n','Ṅ':'n','ṅ':'n','Ņ':'n','ņ':'n','Ṇ':'n','ṇ':'n','Ṋ':'n','ṋ':'n','Ṉ':'n','ṉ':'n','Ɲ':'n','ɲ':'n','Ƞ':'n','ƞ':'n','ɳ':'n','ȵ':'n','N':'n','̈':'n','n':'n','̈':'n',
  'Ó':'o','ó':'o','Ò':'o','ò':'o','Ŏ':'o','ŏ':'o','Ô':'o','ô':'o','Ố':'o','ố':'o','Ồ':'o','ồ':'o','Ỗ':'o','ỗ':'o','Ổ':'o','ổ':'o','Ǒ':'o','ǒ':'o','Ö':'o','ö':'o','Ȫ':'o','ȫ':'o','Ő':'o','ő':'o','Õ':'o','õ':'o','Ṍ':'o','ṍ':'o','Ṏ':'o','ṏ':'o','Ȭ':'o','ȭ':'o','Ȯ':'o','ȯ':'o','Ȱ':'o','ȱ':'o','Ø':'o','ø':'o','Ǿ':'o','ǿ':'o','Ǫ':'o','ǫ':'o','Ǭ':'o','ǭ':'o','Ō':'o','ō':'o','Ṓ':'o','ṓ':'o','Ṑ':'o','ṑ':'o','Ỏ':'o','ỏ':'o','Ȍ':'o','ȍ':'o','Ȏ':'o','ȏ':'o','Ơ':'o','ơ':'o','Ớ':'o','ớ':'o','Ờ':'o','ờ':'o','Ỡ':'o','ỡ':'o','Ở':'o','ở':'o','Ợ':'o','ợ':'o','Ọ':'o','ọ':'o','Ộ':'o','ộ':'o','Ɵ':'o','ɵ':'o',
  'Ṕ':'p','ṕ':'p','Ṗ':'p','ṗ':'p','Ᵽ':'p','Ƥ':'p','ƥ':'p','P':'p','̃':'p','p':'p','̃':'p',
  'ʠ':'q','Ɋ':'q','ɋ':'q',
  'Ŕ':'r','ŕ':'r','Ř':'r','ř':'r','Ṙ':'r','ṙ':'r','Ŗ':'r','ŗ':'r','Ȑ':'r','ȑ':'r','Ȓ':'r','ȓ':'r','Ṛ':'r','ṛ':'r','Ṝ':'r','ṝ':'r','Ṟ':'r','ṟ':'r','Ɍ':'r','ɍ':'r','ᵲ':'r','ɼ':'r','Ɽ':'r','ɽ':'r','ɾ':'r','ᵳ':'r',
  'ß':'s','Ś':'s','ś':'s','Ṥ':'s','ṥ':'s','Ŝ':'s','ŝ':'s','Š':'s','š':'s','Ṧ':'s','ṧ':'s','Ṡ':'s','ṡ':'s','ẛ':'s','Ş':'s','ş':'s','Ṣ':'s','ṣ':'s','Ṩ':'s','ṩ':'s','Ș':'s','ș':'s','ʂ':'s','S':'s','̩':'s','s':'s','̩':'s',
  'Þ':'t','þ':'t','Ť':'t','ť':'t','T':'t','̈':'t','ẗ':'t','Ṫ':'t','ṫ':'t','Ţ':'t','ţ':'t','Ṭ':'t','ṭ':'t','Ț':'t','ț':'t','Ṱ':'t','ṱ':'t','Ṯ':'t','ṯ':'t','Ŧ':'t','ŧ':'t','Ⱦ':'t','ⱦ':'t','ᵵ':'t','ƫ':'t','Ƭ':'t','ƭ':'t','Ʈ':'t','ʈ':'t','ȶ':'t',
  'Ú':'u','ú':'u','Ù':'u','ù':'u','Ŭ':'u','ŭ':'u','Û':'u','û':'u','Ǔ':'u','ǔ':'u','Ů':'u','ů':'u','Ü':'u','ü':'u','Ǘ':'u','ǘ':'u','Ǜ':'u','ǜ':'u','Ǚ':'u','ǚ':'u','Ǖ':'u','ǖ':'u','Ű':'u','ű':'u','Ũ':'u','ũ':'u','Ṹ':'u','ṹ':'u','Ų':'u','ų':'u','Ū':'u','ū':'u','Ṻ':'u','ṻ':'u','Ủ':'u','ủ':'u','Ȕ':'u','ȕ':'u','Ȗ':'u','ȗ':'u','Ư':'u','ư':'u','Ứ':'u','ứ':'u','Ừ':'u','ừ':'u','Ữ':'u','ữ':'u','Ử':'u','ử':'u','Ự':'u','ự':'u','Ụ':'u','ụ':'u','Ṳ':'u','ṳ':'u','Ṷ':'u','ṷ':'u','Ṵ':'u','ṵ':'u','Ʉ':'u','ʉ':'u',
  'Ṽ':'v','ṽ':'v','Ṿ':'v','ṿ':'v','Ʋ':'v','ʋ':'v',
  'Ẃ':'w','ẃ':'w','Ẁ':'w','ẁ':'w','Ŵ':'w','ŵ':'w','W':'w','̊':'w','ẘ':'w','Ẅ':'w','ẅ':'w','Ẇ':'w','ẇ':'w','Ẉ':'w','ẉ':'w',
  'Ẍ':'x','ẍ':'x','Ẋ':'x','ẋ':'x',
  'Ý':'y','ý':'y','Ỳ':'y','ỳ':'y','Ŷ':'y','ŷ':'y','Y':'y','̊':'y','ẙ':'y','Ÿ':'y','ÿ':'y','Ỹ':'y','ỹ':'y','Ẏ':'y','ẏ':'y','Ȳ':'y','ȳ':'y','Ỷ':'y','ỷ':'y','Ỵ':'y','ỵ':'y','ʏ':'y','Ɏ':'y','ɏ':'y','Ƴ':'y','ƴ':'y',
  'Ź':'z','ź':'z','Ẑ':'z','ẑ':'z','Ž':'z','ž':'z','Ż':'z','ż':'z','Ẓ':'z','ẓ':'z','Ẕ':'z','ẕ':'z','Ƶ':'z','ƶ':'z','Ȥ':'z','ȥ':'z','ʐ':'z','ʑ':'z','Ⱬ':'z','ⱬ':'z','Ǯ':'z','ǯ':'z','ƺ':'z',
  "Ґ":"G","Ё":"YO","Є":"E","Ї":"YI","І":"I",
  "А":"A","Б":"B","В":"V","Г":"G",
  "Д":"D","Е":"E","Ж":"ZH","З":"Z","И":"I",
  "Й":"Y","К":"K","Л":"L","М":"M","Н":"N",
  "О":"O","П":"P","Р":"R","С":"S","Т":"T",
  "У":"U","Ф":"F","Х":"H","Ц":"TS","Ч":"CH",
  "Ш":"SH","Щ":"SCH","Ъ":"'","Ы":"Y","Ь":" ",
  "Э":"E","Ю":"YU","Я":"YA",
  "і":"i","ґ":"g","ё":"yo","№":"#","є":"e",
  "ї":"yi","а":"a","б":"b",
  "в":"v","г":"g","д":"d","е":"e","ж":"zh",
  "з":"z","и":"i","й":"y","к":"k","л":"l",
  "м":"m","н":"n","о":"o","п":"p","р":"r",
  "с":"s","т":"t","у":"u","ф":"f","х":"h",
  "ц":"ts","ч":"ch","ш":"sh","щ":"sch","ъ":"'",
  "ы":"y","ь":" ","э":"e","ю":"yu","я":"ya",
  "ЬЕ":"IE","ЬЁ":"IE","ье":"ie","ьё":"ie",
  'α':'a','ά':'a','Α':'a','Ά':'a','β':'v','Β':'v','γ':'g','Γ':'g','δ':'d','Δ':'d','ε':'e','έ':'e','Ε':'e','Έ':'e','ζ':'z','Ζ':'z','η':'h','ή':'h','Η':'h','Ή':'h','θ':'th','Θ':'th','ι':'I','ί':'I','Ι':'I','Ί':'I','κ':'k','Κ':'k','λ':'l','Λ':'l','μ':'m','Μ':'m','ν':'n','Ν':'n','ξ':'x','Ξ':'x','ο':'o','Ο':'o','ό':'o','Ό':'o','π':'p','Π':'p','ρ':'r','Ρ':'r','σ':'s','Σ':'s','ς':'s','τ':'t','Τ':'t','υ':'y','ύ':'y','Υ':'y','Ύ':'y','φ':'f','Φ':'f','χ':'ch','Χ':'ch','ψ':'ps','Ψ':'ps','ω':'w','ώ':'w','Ώ':'w','Ω':'w','αι':'ai','αί':'ai','άι':'ai','ΑΙ':'ai','ΑΊ':'ai','ΆΙ':'ai','οι':'oi','οί':'oi','όι':'oi','ΟΙ':'oi','ΟΊ':'oi','ΌΙ':'oi','ει':'ei','έι':'ei','ΕΙ':'ei','ΕΊ':'ei','ΈΙ':'ei','ου':'u','όυ':'u','ού':'u','ΟΥ':'u','ΌΥ':'u','ΟΎ':'u','αυ':'av','αύ':'av','άυ':'av','ΆΥ':'av','ΑΎ':'av','ΑΥ':'av','ευ':'ev','εύ':'ev','έυ':'ev','ΕΥ':'ev','ΕΎ':'ev','ΈΥ':'ev','ϊ':'i','ϋ':'i'
};

function accent_fold(s) {
  if (!s) { return ''; }
  var ret = '';
  for (var i=0; i<s.length; i++) {
    ret += accent_map[s.charAt(i)] || s.charAt(i);
  }
  return ret;
}

Date.prototype.stdTimezoneOffset = function() {
  var jan = new Date(this.getFullYear(), 0, 1);
  var jul = new Date(this.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
  return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

function attachLoggedInAccountTooltips(query_ids, account_username_url, account_id, add_fav_msg, add_watch_msg, remove_fav_msg, remove_watch_msg) {
  var favourite_ids = [];
  var watchlist_ids = [];
  var rated_ids = [];

  $.ajax({
    url: '/u/' + account_username_url + '/remote/account-list-check',
    method: 'POST',
    dataType: 'json',
    data: {
      list_type: { account_list_item: ['favourite', 'watchlist'], user_rating: true },
      ids: query_ids
    }
  }).done(function(response) {
    for (var i = 0; i < response.favourite_ids.length; i++) {
      $('#favourite_' + response.favourite_ids[i]).toggleClass('selected');
      $('#favourite_' + response.favourite_ids[i] + '_value').html(remove_fav_msg)
    }
    for (var i = 0; i < response.watchlist_ids.length; i++) {
      $('#watchlist_' + response.watchlist_ids[i]).toggleClass('selected');
      $('#watchlist_' + response.watchlist_ids[i] + '_value').html(remove_watch_msg)
    }
    for (var i = 0; i < response.rated_ids.length; i++) {
      $('#rating_' + response.rated_ids[i]).toggleClass('selected');
    }
  });
}

var attachLoggedInAccountFavouriteIds = {};
var attachLoggedInAccountWatchlistIds = {};
var attachLoggedInAccountRatedIds = {};
var pendingAccountListRequests = {};
var pendingAccountRatingRequests = {};

function getLoggedInAccountRatingData(query_ids, account_username_url, toggle_selected, rate_it_text, rated_text) {
  var requestKey = query_ids.slice().sort().join(',');
  if (!pendingAccountRatingRequests[requestKey]) {
    pendingAccountRatingRequests[requestKey] = $.ajax({
      url: '/u/' + account_username_url + '/remote/account-list-check',
      method: 'POST',
      dataType: 'json',
      data: {
        list_type: {
          user_rating: true
        },
        ids: query_ids
      }
    });
  }

  pendingAccountRatingRequests[requestKey].done(function(response) {
    for (var i = 0; i < response.rated_ids.length; i++) {
      attachLoggedInAccountRatedIds[response.rated_ids[i]] = true;
    }

    if (toggle_selected) {
      for (var item = 0; item < response.ratings.length; item++) {
        $(`#rating_${response.ratings[item].media_id}`).removeClass("default");
        $(`#rating_${response.ratings[item].media_id}`).addClass("selected");
        $(`#rating_${response.ratings[item].media_id} span.glyphicons_v2`).remove();
        $(`#rating_${response.ratings[item].media_id} span.value`).html(`${response.ratings[item].value}`);
        $(`#rating_${response.ratings[item].media_id} span.text`).html(rated_text);
      }

      attachRatingTooltip();
    }
  });
}

function getLoggedInAccountListData(query_ids, account_username_url, toggle_selected, rate_it_text, rated_text) {
  var requestKey = query_ids.slice().sort().join(',');
  if (!pendingAccountListRequests[requestKey]) {
    pendingAccountListRequests[requestKey] = $.ajax({
      url: '/u/' + account_username_url + '/remote/account-list-check',
      method: 'POST',
      dataType: 'json',
      data: {
        list_type: {
          account_list_item: ['favourite', 'watchlist'],
          user_rating: true
        },
        ids: query_ids
      }
    });
  }

  pendingAccountListRequests[requestKey].done(function(response) {
    for (var i = 0; i < response.favourite_ids.length; i++) {
      attachLoggedInAccountFavouriteIds[response.favourite_ids[i]] = true;
    }

    for (var i = 0; i < response.watchlist_ids.length; i++) {
      attachLoggedInAccountWatchlistIds[response.watchlist_ids[i]] = true;
    }

    for (var i = 0; i < response.rated_ids.length; i++) {
      attachLoggedInAccountRatedIds[response.rated_ids[i]] = true;
    }

    if (toggle_selected) {
      for (var item = 0; item < response.ratings.length; item++) {
        $(`#rating_${response.ratings[item].media_id}`).removeClass("default");
        $(`#rating_${response.ratings[item].media_id}`).addClass("selected");
        $(`#rating_${response.ratings[item].media_id} span.glyphicons_v2`).remove();
        $(`#rating_${response.ratings[item].media_id} span.value`).html(`${response.ratings[item].value}`);
        $(`#rating_${response.ratings[item].media_id} span.text`).html(rated_text);
      }

      for (const [id, value] of Object.entries(attachLoggedInAccountFavouriteIds)) {
        $(`#favourite_${id}`).addClass("selected");
      }

      attachRatingTooltip();
    }
  });
}

function attachFavouriteActions(query_ids, account_username_url, add_fav_msg, remove_fav_msg) {
  var favourite_ids = [];
  $.ajax({
    url: '/u/' + account_username_url + '/remote/account-list-check',
    method: 'POST',
    dataType: 'json',
    data: {
      list_type: { account_list_item: ['favourite'] },
      ids: query_ids
    }
  }).done(function(response) {
    for (var i = 0; i < response.favourite_ids.length; i++) {
      $('#favourite_' + response.favourite_ids[i]).toggleClass('selected');
      $('#favourite_' + response.favourite_ids[i] + '_value').html(remove_fav_msg)
    }
  });
}

var loggedInRatingTooltipLoaded = false;

function attachRatingTooltip() {
  if (loggedInRatingTooltipLoaded == false) {
    loggedInRatingTooltipLoaded = true;

    $("main").kendoTooltip({
      filter: 'a.list_item_rating',
      animation: false,
      iframe: false,
      position: 'right',
      callout: false,
      showOn: 'click',
      autoHide: false,
      content: {
        url: '/'
      },
      requestStart: function(e) {
        e.options.url = kendo.format('{0}', e.target.data("rating-url"));
        this.popup.element.css("min-height", "80px");
        this.popup.element.css("min-width", "80px");
      },
      show: function() {
        $("div.k-tooltip-button").addClass('hide');
        this.popup.element.addClass("tmdb_theme flex");
      },
      contentLoad: function() {
        this.popup.element.css("min-height", "auto");
        this.popup.element.css("min-width", "auto");
      }
    }).data("kendoTooltip");
  }
}

var loggedInListTooltipLoaded = false;

function attachListTooltip(mobile) {
  if (loggedInListTooltipLoaded == false) {
    loggedInListTooltipLoaded = true;

    $("main").kendoTooltip({
      filter: 'a.add_media_to_list',
      showOn: 'click',
      callout: false,
      autoHide: false,
      content: {
        url: '/'
      },
      requestStart: function(e) {
        e.options.url = kendo.format('{0}', e.target.attr("href"));
        this.popup.element.css({
          "min-height": "80px",
          "min-width": "80px",
          "width": "80px",
          "position": "absolute",
          "left": 0
        });
      },
      show: function(e) {
        $("div.k-tooltip-button").addClass('hide');
        this.popup.element.addClass("tmdb_theme_light");
        this.popup.element.css({
          "position": "static"
        });
      },
      contentLoad: function() {
        var initialPosition = this.popup.element.offset();
        var offset = (initialPosition.left - 10);

        this.popup.element.css({
          "min-height": "auto",
          "min-width": "auto",
          "width": (mobile ? "95vw" : "300px")
        });

        var outOfviewport = isOutOfViewport(this.popup.element[0]);
        if (outOfviewport["right"] == true) {
          this.popup.element.css({"position": "absolute", "left": -offset});
        }
      }
    });
  }
}

function toggleAccountListItem(account_username_url, element, list_type, media_id, media_type) {
  var request_template = '/u/{0}/remote/toggle-list-item';

  $.ajax({
    url: kendo.format(request_template, account_username_url),
    type: 'PUT',
    data: {
      list_type: list_type,
      media_id: media_id,
      media_type: media_type
    },
    beforeSend: function() {
      activatePageLoader();
    }
  }).fail(function() {
    deactivatePageLoader();
    showError('There was a problem marking this item.')
  }).done(function(response) {
    deactivatePageLoader();

    if (response.failure) {
      showError('There was a problem marking this item.')
    }

    if (response.success) {
      switch (response.action) {
        case "destroyed":
          showSuccess(response.message);
          element.closest('li').removeClass("selected");

          if (element.data("remove")) {
            $(`#${media_id}`).fadeOut(500, function() {
              $(this).remove();
            });
          }
          break;
        case "created":
          showSuccess(response.message);
          element.closest('li').addClass("selected");
          break;
        default:
      }
    }
  });
}

function removeRating(account_username_url, media_id, media_type) {
  var request_template = '/u/{0}/rating';

  $.ajax({
    url: kendo.format(request_template, account_username_url),
    type: 'DELETE',
    data: {
      media_id: media_id,
      media_type: media_type
    },
    beforeSend: function() {
      activatePageLoader();
    }
  }).fail(function() {
    deactivatePageLoader();
    showError('There was a problem marking this item.')
  }).done(function(response) {
    deactivatePageLoader();

    if (response.failure) {
      showError('There was a problem marking this item.')
    }

    if (response.success) {
      showSuccess(response.message);

      $(`#${media_id}`).fadeOut(500, function() {
        $(this).remove();
      });
    }
  });
}

var loggedInTooltipActionsLoaded = false;

function enableLoggedInAccountTooltipActions(account_username_url) {
  if (loggedInTooltipActionsLoaded == false) {
    loggedInTooltipActionsLoaded = true;

    $("body").on('click', 'a.account_list_action, span.list_action', function(e) {
      e.preventDefault();

      var list_type = $(this).data('list-type');
      var media_id = $(this).data('media-id');
      var media_type = $(this).data('media-type');

      switch (list_type) {
        case "rating":
          removeRating(account_username_url, media_id, media_type);
          break;
        default:
          toggleAccountListItem(account_username_url, $(this), list_type, media_id, media_type)
      }
    });
  }
}

function changeSearchTabs(media_type) {
  $('div.search_results').addClass('hide');
  $('div.' + media_type).removeClass('hide');
  $('section.search_results ul li a').removeClass('active');
  $('#' + media_type).addClass('active');
}

function getImageWindowDimensions(inner_height, aspect_ratio) {
  var poster_height = Math.round(inner_height * 0.80);
  var poster_width = Math.round(poster_height * aspect_ratio);
  var window_width = (poster_width + 360);

  return [window_width, poster_width, poster_height]
}

function attachScroller(distance, scroller, hasScrolled, scrollLeft) {
  if ($(scroller).hasClass('should_fade')) {
    if ((scrollLeft < distance)) {
      $(scroller).removeClass('is_hidden').addClass('is_fading');
    }

    if ((scrollLeft > distance) && ($(scroller).hasClass('is_fading'))) {
      $(scroller).removeClass('is_fading').addClass('is_hidden');
    }
  }
}

function initializeScroller(mobile, scroller) {
  var hasScrolled = false;
  var scrollLeft = 0;
  var itemWidth = 0;
  var parentWidth = $(scroller).parent().outerWidth();
  var childScroller = $(scroller).find('.scroller');

  childScroller.children().each(function() {
    itemWidth += $(this).outerWidth();
  });

  var distance;
  if (mobile) {
    distance = 30;
  } else {
    distance = 50;
  }

  if (itemWidth < (parentWidth + distance)) {
    $(scroller).removeClass('should_fade');
  }

  var targetScroll;
  childScroller.scroll(function(e) {
    hasScrolled = true;
    if (targetScroll == null) {
      targetScroll = $(e.target);
    }
    scrollLeft = targetScroll.scrollLeft();
  });

  setInterval(function() {
    if (hasScrolled) {
      attachScroller(distance, scroller, hasScrolled, scrollLeft);
      hasScrolled = false;
    }
  }, 250);
}

function attachVerticalScroller(offset, scroller, hasScrolled, scrollUp, parentHeight, lastChildHeight) {
  if (scroller.hasClass('should_fade')) {
    if ((scrollUp < offset) && scroller.hasClass('is_fading_before')) {
      scroller.removeClass('is_fading_before').addClass('hide_before');
    }
    if ((scrollUp > offset)) {
      scroller.removeClass('hide_before').addClass('is_fading_before');
    }
    if ((scrollUp < (parentHeight + lastChildHeight))) {
      scroller.removeClass('hide_after').addClass('is_fading_after');
    }
    if ((scrollUp >= (parentHeight - lastChildHeight)) && scroller.hasClass('is_fading_after')) {
      scroller.removeClass('is_fading_after').addClass('hide_after');
    }
  }
}

function initializeVerticalScroller(mobile, scroller) {
  var hasScrolled = false;
  var scrollUp = 0;
  var itemHeight = 0;
  var scroller = $(scroller);
  var parentHeight = scroller.parent().outerHeight();
  var childScroller = scroller.find('.vertical_scroller');
  var lastChildHeight = scroller.find('.vertical_scroller').children().slice(-1).outerHeight(true) / 2;

  childScroller.children().each(function() {
    itemHeight += $(this).outerHeight();
  });

  var offset;
  if (mobile) {
    offset = 20;
  } else {
    offset = 40;
  }

  if (itemHeight < (parentHeight + offset)) {
    scroller.removeClass('vertical_scroller_wrap');
  }

  var targetScroll;
  childScroller.scroll(function(e) {
    hasScrolled = true;
    if (targetScroll == null) {
      targetScroll = $(e.target);
    }
    scrollUp = targetScroll.scrollTop();
  });

  var intervalID = setInterval(function() {
    if (hasScrolled) {
      attachVerticalScroller(offset, scroller, hasScrolled, scrollUp, parentHeight, lastChildHeight);
      hasScrolled = false;
    }
  }, 250);

  return intervalID;
}

function activatePageLoader() {
  pageLoaded().then(function() {
    NProgress.start();
  });
}

function deactivatePageLoader() {
  pageLoaded().then(function() {
    NProgress.done();
  });
}

var selectedOptionsTooltip;
function emptyOptionsTooltip() {
  selectedOptionsTooltip = { object_id: null, media_id: null, media_type: null, action: null };
}
emptyOptionsTooltip();

function attachOptionsTooltips(logged_in, div_id) {
  $(div_id + ' div.options').kendoTooltip({
    autoHide: false,
    filter: 'a',
    showOn: 'click',
    callout: false,
    content: function(e) {
      return $("#options_tooltip").html();
    },
    show: function(e) {
      this.popup.element.addClass("tmdb_theme_white no_pad");

      var media_id = e.sender.element.data('id');
      var object_id = e.sender.element.data('object-id');
      var media_type = e.sender.element.data('media-type');

      selectedOptionsTooltip.media_id = media_id;
      selectedOptionsTooltip.media_type = media_type;
      selectedOptionsTooltip.object_id = object_id;

      $('div.hover.' + media_id).addClass('on');

      if (logged_in) {
        if (attachLoggedInAccountFavouriteIds[object_id]) {
          $(this.popup.element).find('a[data-list-type=favourite]').addClass('selected');
        } else {
          $(this.popup.element).find('a[data-list-type=favourite]').removeClass('selected');
        }

        if (attachLoggedInAccountWatchlistIds[object_id]) {
          $(this.popup.element).find('a[data-list-type=watchlist]').addClass('selected');
        } else {
          $(this.popup.element).find('a[data-list-type=watchlist]').removeClass('selected');
        }

        if (attachLoggedInAccountRatedIds[object_id]) {
          $(this.popup.element).find('a[data-list-type=rate]').addClass('selected');
        } else {
          $(this.popup.element).find('a[data-list-type=rate]').removeClass('selected');
        }
      }
    },
    hide: function(e) {
      var media_id = e.sender.element.data('id');
      $('div.hover.' + media_id).removeClass('on');
      emptyOptionsTooltip();
    }
  }).data("kendoTooltip");
}

function queryPageAccountRatingStatus(username, div_selector, rate_it_text, rated_text) {
  var divs = $(div_selector);
  var object_ids = $.map(divs, function(val, i) {
    return $(val).data('object-id')
  });

  getLoggedInAccountRatingData(object_ids, username, true, rate_it_text, rated_text);
}

function getPageAccountStatus(username, div_id) {
  var divs = $(div_id + ' div.options');
  var object_ids = $.map(divs, function(val, i) {
    return $(val).data('object-id')
  });

  getLoggedInAccountListData(object_ids, username);
}

function togglePageAccountStatus(username, div_id, rate_it_text, rated_text) {
  var divs = $(div_id + ' > div');
  var object_ids = $.map(divs, function(val, i) {
    return $(val).data('object-id')
  });

  getLoggedInAccountListData(object_ids, username, true, rate_it_text, rated_text);
}

function isOutOfViewport(elem) {
	// Get element's bounding
	var bounding = elem.getBoundingClientRect();

	// Check if it's out of the viewport on each side
	var out = {};
	out.top = bounding.top < 0;
	out.left = bounding.left < 0;
	out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
	out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
	out.any = out.top || out.left || out.bottom || out.right;
	out.all = out.top && out.left && out.bottom && out.right;

	return out;
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function serializeAndEscapeForm(form) {
  var data = {};
  $.each(form.serializeArray(), function() {
    data[this.name] = escapeHtml(this.value)
  });
  return data;
}

var _notification;
function notify() {
  if (_notification === undefined) {
    _notification = $("#notification").kendoNotification({
      position: {
        top: 0,
        right: 10
      },
      animation: false,
      autoHideAfter: 5000,
      templates: [{
        type: "error",
        template: $("#notifyErrorTemplate").html()
      },{
        type: "success",
        template: $("#notifySuccessTemplate").html()
      }]
    }).data("kendoNotification");
  }

  return _notification;
}

function notifySuccess(message, title) {
  return notify().show({
    title: title,
    message: message
  }, "success");
}

function notifyError(message, title) {
  return notify().show({
    title: title,
    message: message
  }, "error");
}

function waitForElement(selector, callback, maxTimes = false) {
  if (jQuery(selector).length) {
    callback();
  } else {
    if (maxTimes === false || maxTimes > 0) {
      (maxTimes != false) && maxTimes-- ;
      setTimeout(function () {
        waitForElement(selector, callback, maxTimes);
      }, 100);
    }
  }
};











