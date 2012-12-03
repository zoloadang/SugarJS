(function(){
	var global = this,
		breaker = {},
		reClassNameCache = {},
		noop = function(){},
		Sugar,
		trim,
		byId,
		byClass;
		
	/*export interface*/
	Sugar = function(obj) { return new wrapper(obj)};
	
	global['Sugar'] = Sugar;
	
	/*vesion*/
	Sugar.Version = '1.0.0';
	
	var slice 			= Array.prototype.slice,
	  	unshift 		= Array.prototype.unshift,
		nativeForEach 	= Array.prototype.forEach,
		hasOwnProperty 	= Object.prototype.hasOwnProperty;	
	
	/*base method*/
	var __each = Sugar.each = function(obj, iterator, context) {
		if (obj == null) return;
		if (nativeForEach && obj.forEach === nativeForEach) { //supports for ES5
		  obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {	//array...
		  for (var i = 0, l = obj.length; i < l; i++) {
		    if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
		  }
		} else {
		  for (var key in obj) { //plain obj
		    if (hasOwnProperty.call(obj, key)) {
		      if (iterator.call(context, obj[key], key, obj) === breaker) return;
		    }
		  }
		}
	};
  
	/*type boolean*/
	Sugar.isFunction = function(obj) {
		return Object.prototype.toString.call(obj) == '[object Function]';
	};
	
	Sugar.isUndef = Sugar.__UNDEFINED__;
	
	Sugar.isNum = function(n) {
    	return typeof n === 'number' && isFinite(n);
    };
	
	Sugar.isArray = function(a) {
	    if(a){
	      return Sugar.isNum(a.length) && Sugar.isFunction(a.splice);
	    };
	    return false;
    }
	
	/**
	 * @static
	 * @boolean
	 * allows us to check if native CSS transitions are possible
	 */
	Sugar.canTransition = function() {
		var el = document.createElement('sugar');
		el.style.cssText = '-webkit-transition: all .5s linear;';
		return !!el.style.webkitTransitionProperty;
	}();
  
	/**
	 * browser detection
	 */
	var browser = (function(){
		var ua = navigator.userAgent,
			isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]',
			isIE = !!window.attachEvent && !isOpera;
	
		return {
			  ie:             isIE,
			  ie6:			  isIE && ua.toLowerCase().indexOf("msie 6") > -1,
			  Opera:          isOpera,
			  WebKit:         ua.indexOf('AppleWebKit/') > -1,
			  Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
			  MobileSafari:   /Apple.*Mobile/.test(ua)
		}
	  })();
	
	//export  
	Sugar.browser = browser;
	
	/**
	 * get inline or external css of specific element
	 */
	Sugar.getStyle = (function(){
		if (document.defaultView && document.defaultView.getComputedStyle) { //web Standard Method
	        return function(el, property) {
	          var value = null;
	          var computed = document.defaultView.getComputedStyle(el, '');
	          if (computed) {
	            value = computed[property];
	          }
	          var ret = el.style[property] || value;
	          return ret;
	        };
	     } else if (document.documentElement.currentStyle && browser.ie) { // IE method
	        return function(el, property) {
	          var value = el.currentStyle ? el.currentStyle[property] : null;
	          return (el.style[property] || value);
	        };
	      }
	}());
	
	/**
	 * Insert css into the head element of document
	 */
	Sugar.inlineCss = (function() {
	
	  var isLoaded = false,
		  css = function(rules) {
				var styleElement = document.createElement('style');
				styleElement.type = 'text/css';
				
				if (browser.ie) {
				  styleElement.styleSheet.cssText = rules;
				} else {
				  var frag = document.createDocumentFragment();
				  frag.appendChild(document.createTextNode(rules));
				  styleElement.appendChild(frag);
				}
				
				function append() {
				  document.getElementsByTagName('head')[0].appendChild(styleElement);
				}
	
				// oh IE we love you.
				// this is needed because you can't modify document body when page is loading
				if (!browser.ie || isLoaded) {
				  append();
				} else {
				  window.attachEvent('onload', function() {
					isLoaded = true;
					append();
				  });
				}
		  };
	
		  return css;
	})();
	
	/**
	 * trim whitespace
	 * @param {String} str
	 */
	Sugar.trim = trim = function(str) {
	  return str.replace(/^\s+|\s+$/g, '');
	};
	
	/**
	 * Get height of the viewport 
	 */
	Sugar.getViewportHeight = function() {
      var height = self.innerHeight; // Safari, Opera
      var mode = document.compatMode;
      if ((mode || browser.ie)) { // IE, Gecko
        height = (mode == 'CSS1Compat') ?
          document.documentElement.clientHeight : // Standards
          document.body.clientHeight; // Quirks
      }
      return height;
    };
	
	/**
	 * Get the Hash value of URL 
	 */
	Sugar.getHash = function() {
		var url = location.href;
		return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
	};
	
	/**
	 * Returns true if the object is a DOM Node.
	 * @param {Object} obj object to check
	 * @returns {Boolean}
	 */
	Sugar.isDomNode = function(obj) {
	  return obj['nodeType'] > 0;
	};
	
	/**
	 * Returns true if the object is a Element Node.
	 * @param {Object} obj object to check
	 * @returns {Boolean}
	 */
	Sugar.isElement = function(object) {
	    return !!(object && object.nodeType == 1);
	}
	
	/**
	 * Get element by id
	 * @param {String} id
	 */
	Sugar.byId = byId = function(id) {
      if (typeof id == 'string') {
        return document.getElementById(id);
      }
      return id;
    };
	
	/**
	 * method insertAfter
	 * @param {HTMLElement} el
	 * @param {HTMLElement} reference
	 */
	Sugar.insertAfter = function(el, reference) {
      reference.parentNode.insertBefore(el, reference.nextSibling);
    };
	
	/**
	 * Get the first dom element
	 * @param {HTMLElement} el node
	 */
	Sugar.getFirstDom = function(el) {
      return el.firstChild;
    };
	
	/**
	 * Batch create DOM tree 
	 * @param {String} type element type
	 * @param {Object} attrs Property Object
	 * @param {Element | String} childrenVarArgs createdElement or TextElement...
	 * @return {Element} el
	 * @example
	 *  el = Sugar.createDom("div",{property},element(Sugar.createDom -> return) | text);
	 *  document.body.appendChild(el);
	 */
	Sugar.createDom = function(type, attrs, childrenVarArgs) {
	  var el = document.createElement(type);
	
	  for (var i = 2; i < arguments.length; i++) {
	    var child = arguments[i];
	
	    if (typeof child === 'string') {
	      el.appendChild(document.createTextNode(child));
	    } else {
	      if (child) { el.appendChild(child); }
	    }
	  }
	
	  for (var attr in attrs) {
	    if (attr == "className") {
	      el[attr] = attrs[attr];
	    } else {
	      el.setAttribute(attr, attrs[attr]);
	    }
	  }
	
	  return el;
	};
	
	/**
	 * Has className
	 * @param {HTMLElement} el
	 * @param {String} c
	 */
	Sugar.hasCls = hasCls = function(el, c) {
    	return new RegExp("(^|\\s)" + c + "(\\s|$)").test(byId(el).className);
    };

	/**
	 * Add className
	 * @param {HTMLElement} el
	 * @param {String} c
	 */
    Sugar.addCls = function(el, c) {
	    if (!hasCls(el, c)) {
	      byId(el).className = trim(byId(el).className) + ' ' + c;
	    }
    };

	/**
	 * Remove className
	 * @param {HTMLElement} el
	 * @param {String} c
	 */
    Sugar.removeCls = function(el, c) {
	    if (hasCls(el, c)) {
	      byId(el).className = byId(el).className.replace(new RegExp("(^|\\s)" + c + "(\\s|$)", "g"), "");
	    }
    };
	
	/**
	 * Get specified className RegExp Object
	 * @param {String} c className
	 */
	var getClassRegEx = function(c) {

      var re = reClassNameCache[c];

      if (!re) {
        re = new RegExp('(?:^|\\s+)' + c + '(?:\\s+|$)');
        reClassNameCache[c] = re;
      }

      return re;
    };
	
	/**
    * Find all NodeList for className
    * @param {String} c 样式名
    * @param {HTMLElement | String} tag 元素标签
    * @param {HTMLElement | String} root 根节点
    * @param {Function} apply 回调执行函数
    * @return {NodeList} nodes 节点数组
    */
    Sugar.getByClass = function(c, tag, root, apply) {
      var tag = tag || '*';
      var root = root || document;

      var nodes = [],
          elements = root.getElementsByTagName(tag),
          re = getClassRegEx(c);

      for (var i = 0, len = elements.length; i < len; ++i) {
        if (re.test(elements[i].className)) {
          nodes[nodes.length] = elements[i];

          if (apply) {
            apply.call(elements[i], elements[i]);
          }

        }
      }

      return nodes;
    };
	
	/**
	 * escape HTML
	 * @param {String} str
	 */
	Sugar.htmlEscape = function(str) {
	  if (!str) return str;
	  return str.replace(/&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;');
	};
	
	/**
	 * Adjust window.console state for all browers
	 */
	Sugar.debugConsole = function(){
	  var console = window.console;
	  if (console && console.log){
		if (console.log.apply) {
		  console.log.apply(console, arguments);
		} else {
		  console.log(arguments); // ie fix: console.log.apply doesn't exist on ie
		}
	  } else {
	  	window.console = {log:noop,info:noop}
	  }
	};
	
	/**
	 * Make the enum to real array
	 * @param {Object | String} enumerable
	 * @return Array
	 */
	Sugar.toArray = function(enumerable) {
	  var array = [], i = enumerable.length;
	  while (i--) array[i] = enumerable[i];
	  return array;
	};	
	
	/**
	 * filter the specific array list 
	 * @param {Array} arr
	 * @param {Function} fn
	 * @param {Object} thisObj context
	 * @example Sugar.toFilter([1,2,3],function(cur){if(cur > 2){return true}}) -> [3]
	 */
	Sugar.toFilter = function(arr,fn,thisObj){
	    var scope = thisObj || window,a = [];
	    for (var i = 0, j = arr.length; i < j; ++i) {
	      if (!fn.call(scope, arr[i], i, arr)) {
	        continue;
	      }
	      a.push(arr[i]);
	    }
	    return a;
	  };
	
	/**
	 * Check the index value of string or array
	 * @param {String | Array} list
	 * @param {Object} item
	 */
	Sugar.indexOf = function(list, item) {
	  if (list.indexOf) return list.indexOf(item);
	  var i = list.length;
	  while (i--) {
	    if (list[i] === item) return i;
	  }
	  return -1;
	};
	
	/**
	 * Binding context
	 * @param {Function} fn
	 * @param {Object} object context
	 */
	Sugar.bind = function(fn, object) {
	  return function() {
	    return fn.apply(object, arguments);
	  };
	};
	
	/**
	 * extend object properties(default overwrite)
	 * @param {Object} destination
	 * @param {Object} source
	 * @param {Boolean} overwrite
	 * @return destination
	 */
	Sugar.extend = function(destination, source, overwrite) {
	  if (!destination || !source) return destination;
	  for (var field in source) {
	    if (destination[field] === source[field]) continue;
	    if (overwrite === false && destination.hasOwnProperty(field)) continue;
	    destination[field] = source[field];
	  }
	  return destination;
	};
	
	/**
	 * Match regexp
	 * @param {Object | String} category
	 * @param {String | Object} object
	 */
	Sugar.match = function(category, object) {
	  if (object === undefined) return false;
	  return typeof category.test === 'function' ? category.test(object) : category.match(object);
	};
	
	/*Transform 16 Hexademical RGB*/
	Sugar.hexRgb = function() {
      function HexToR(h) {
        return parseInt((h).substring(0,2),16);
      };
      function HexToG(h) {
        return parseInt((h).substring(2,4),16);
      };
      function HexToB(h) {
        return parseInt((h).substring(4,6),16);
      };
      return function(hex) {
        return [HexToR(hex), HexToG(hex), HexToB(hex)];
      };
    }();
	
	/**
	 * basic x-browser event listener util
	 * @param {HTMLElement} el
	 * @param {String} type
	 * @param {Function} fn
	 * @example Sugar.addEvent(element, 'click', fn);
	 */
	Sugar.addEvent = function(el, type, fn) {
	    if (el.addEventListener) {
	      el.addEventListener(type, fn, false);
	    } else {
	      el.attachEvent('on' + type, function() {
	        fn.call(el, window.event);
	      });
	    }
	 };
	 
	 /**
	 * basic x-browser event listener util
	 * @param {HTMLElement} el
	 * @param {String} type
	 * @param {Function} fn
	 * @example Sugar.removeEvent(element, 'click', fn);
	 */
     Sugar.removeEvent = function(el, type, fn) {
        if (el.removeEventListener) {
          el.removeEventListener(type, fn, false);
        }
        else {
          el.detachEvent('on' + type, fn);
        }
     };
  
	var __functions = function(obj) {
		var names = [];
		for (var key in obj) {
		  if (Sugar.isFunction(obj[key])) names.push(key);
		}
		return names.sort();
	};
  
	//mix functions
	var __mixin = Sugar.mixin = function(obj) {
		__each(__functions(obj), function(name){
		  addToWrapper(name, Sugar[name] = obj[name]);	//将传入的obj中的相应方法赋值一份到Sugar中,所以可以直接通过Sugar.func进行调用
		});
	};
  
  	// The OOP Wrapper
  	// ---------------
  	var wrapper = function(obj){this._wrapped = obj;};
  
  	Sugar.prototype = wrapper.prototype;

  	var result = function(obj, chain) {
    	return chain ? Sugar(obj).chain() : obj;	//Sugar(obj).chain -> 将参数链式传下去,通过 this._wrapped
  	};

	var addToWrapper = function(name, func) {
		wrapper.prototype[name] = function() {
		  	var args = slice.call(arguments);	//复制参数
		  	unshift.call(args, this._wrapped);	//将Sugar()中的参数添加到args的首位
		  	return result(func.apply(Sugar, args), this._chain); //Sugar(arg).chain().method(),将前面方法返回值作为参数传给下个参数
		};
	};
  
  	__mixin(Sugar);

  	wrapper.prototype.chain = function() {
    	this._chain = true;
    	return this;
  	};

  	wrapper.prototype.value = function() {
    	return this._wrapped;
  	};
  
}).call(this);