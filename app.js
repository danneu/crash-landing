/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(6);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(3);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(4)

__webpack_require__(7)

__webpack_require__(15)
__webpack_require__(17)
__webpack_require__(19)

// require('ace-css/css/ace.css');
// require('font-awesome/css/font-awesome.css');

// Require index.html so it gets copied to dist
__webpack_require__(21)

var Elm = __webpack_require__(22)
var mountNode = document.getElementById('main')

// .embed() can take an optional second argument. This would be an object describing the data we need to start a program, i.e. a userID or some token
var app = Elm.Main.embed(mountNode, {
    isDev: location.hash === '#dev'
})


document.addEventListener('mouseup', function () {
  app.ports.mouseUp.send(null)
})


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(5);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./general.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./general.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".text-green {\n  color: #2ecc71; }\n\n.text-red {\n  color: #e74c3c; }\n\nbody {\n  font-size: 14px;\n  padding-top: 25px;\n  padding-bottom: 100px; }\n\n.list-unstyled {\n  list-style-type: none; }\n", ""]);

// exports


/***/ }),
/* 6 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../css-loader/index.js!../../sass-loader/lib/loader.js!./font-awesome.css", function() {
			var newContent = require("!!../../css-loader/index.js!../../sass-loader/lib/loader.js!./font-awesome.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*!\n *  Font Awesome 4.7.0 by @davegandy - http://fontawesome.io - @fontawesome\n *  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n */\n/* FONT PATH\n * -------------------------- */\n@font-face {\n  font-family: 'FontAwesome';\n  src: url(" + __webpack_require__(9) + ");\n  src: url(" + __webpack_require__(10) + "?#iefix&v=4.7.0) format(\"embedded-opentype\"), url(" + __webpack_require__(11) + ") format(\"woff2\"), url(" + __webpack_require__(12) + ") format(\"woff\"), url(" + __webpack_require__(13) + ") format(\"truetype\"), url(" + __webpack_require__(14) + "#fontawesomeregular) format(\"svg\");\n  font-weight: normal;\n  font-style: normal; }\n\n.fa {\n  display: inline-block;\n  font: normal normal normal 14px/1 FontAwesome;\n  font-size: inherit;\n  text-rendering: auto;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale; }\n\n/* makes the font 33% larger relative to the icon container */\n.fa-lg {\n  font-size: 1.33333333em;\n  line-height: 0.75em;\n  vertical-align: -15%; }\n\n.fa-2x {\n  font-size: 2em; }\n\n.fa-3x {\n  font-size: 3em; }\n\n.fa-4x {\n  font-size: 4em; }\n\n.fa-5x {\n  font-size: 5em; }\n\n.fa-fw {\n  width: 1.28571429em;\n  text-align: center; }\n\n.fa-ul {\n  padding-left: 0;\n  margin-left: 2.14285714em;\n  list-style-type: none; }\n\n.fa-ul > li {\n  position: relative; }\n\n.fa-li {\n  position: absolute;\n  left: -2.14285714em;\n  width: 2.14285714em;\n  top: 0.14285714em;\n  text-align: center; }\n\n.fa-li.fa-lg {\n  left: -1.85714286em; }\n\n.fa-border {\n  padding: .2em .25em .15em;\n  border: solid 0.08em #eeeeee;\n  border-radius: .1em; }\n\n.fa-pull-left {\n  float: left; }\n\n.fa-pull-right {\n  float: right; }\n\n.fa.fa-pull-left {\n  margin-right: .3em; }\n\n.fa.fa-pull-right {\n  margin-left: .3em; }\n\n/* Deprecated as of 4.4.0 */\n.pull-right {\n  float: right; }\n\n.pull-left {\n  float: left; }\n\n.fa.pull-left {\n  margin-right: .3em; }\n\n.fa.pull-right {\n  margin-left: .3em; }\n\n.fa-spin {\n  -webkit-animation: fa-spin 2s infinite linear;\n  animation: fa-spin 2s infinite linear; }\n\n.fa-pulse {\n  -webkit-animation: fa-spin 1s infinite steps(8);\n  animation: fa-spin 1s infinite steps(8); }\n\n@-webkit-keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg); }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg); } }\n\n@keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg); }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg); } }\n\n.fa-rotate-90 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)\";\n  -webkit-transform: rotate(90deg);\n  -ms-transform: rotate(90deg);\n  transform: rotate(90deg); }\n\n.fa-rotate-180 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)\";\n  -webkit-transform: rotate(180deg);\n  -ms-transform: rotate(180deg);\n  transform: rotate(180deg); }\n\n.fa-rotate-270 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)\";\n  -webkit-transform: rotate(270deg);\n  -ms-transform: rotate(270deg);\n  transform: rotate(270deg); }\n\n.fa-flip-horizontal {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)\";\n  -webkit-transform: scale(-1, 1);\n  -ms-transform: scale(-1, 1);\n  transform: scale(-1, 1); }\n\n.fa-flip-vertical {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";\n  -webkit-transform: scale(1, -1);\n  -ms-transform: scale(1, -1);\n  transform: scale(1, -1); }\n\n:root .fa-rotate-90,\n:root .fa-rotate-180,\n:root .fa-rotate-270,\n:root .fa-flip-horizontal,\n:root .fa-flip-vertical {\n  filter: none; }\n\n.fa-stack {\n  position: relative;\n  display: inline-block;\n  width: 2em;\n  height: 2em;\n  line-height: 2em;\n  vertical-align: middle; }\n\n.fa-stack-1x,\n.fa-stack-2x {\n  position: absolute;\n  left: 0;\n  width: 100%;\n  text-align: center; }\n\n.fa-stack-1x {\n  line-height: inherit; }\n\n.fa-stack-2x {\n  font-size: 2em; }\n\n.fa-inverse {\n  color: #ffffff; }\n\n/* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen\n   readers do not read off random characters that represent icons */\n.fa-glass:before {\n  content: \"\\F000\"; }\n\n.fa-music:before {\n  content: \"\\F001\"; }\n\n.fa-search:before {\n  content: \"\\F002\"; }\n\n.fa-envelope-o:before {\n  content: \"\\F003\"; }\n\n.fa-heart:before {\n  content: \"\\F004\"; }\n\n.fa-star:before {\n  content: \"\\F005\"; }\n\n.fa-star-o:before {\n  content: \"\\F006\"; }\n\n.fa-user:before {\n  content: \"\\F007\"; }\n\n.fa-film:before {\n  content: \"\\F008\"; }\n\n.fa-th-large:before {\n  content: \"\\F009\"; }\n\n.fa-th:before {\n  content: \"\\F00A\"; }\n\n.fa-th-list:before {\n  content: \"\\F00B\"; }\n\n.fa-check:before {\n  content: \"\\F00C\"; }\n\n.fa-remove:before,\n.fa-close:before,\n.fa-times:before {\n  content: \"\\F00D\"; }\n\n.fa-search-plus:before {\n  content: \"\\F00E\"; }\n\n.fa-search-minus:before {\n  content: \"\\F010\"; }\n\n.fa-power-off:before {\n  content: \"\\F011\"; }\n\n.fa-signal:before {\n  content: \"\\F012\"; }\n\n.fa-gear:before,\n.fa-cog:before {\n  content: \"\\F013\"; }\n\n.fa-trash-o:before {\n  content: \"\\F014\"; }\n\n.fa-home:before {\n  content: \"\\F015\"; }\n\n.fa-file-o:before {\n  content: \"\\F016\"; }\n\n.fa-clock-o:before {\n  content: \"\\F017\"; }\n\n.fa-road:before {\n  content: \"\\F018\"; }\n\n.fa-download:before {\n  content: \"\\F019\"; }\n\n.fa-arrow-circle-o-down:before {\n  content: \"\\F01A\"; }\n\n.fa-arrow-circle-o-up:before {\n  content: \"\\F01B\"; }\n\n.fa-inbox:before {\n  content: \"\\F01C\"; }\n\n.fa-play-circle-o:before {\n  content: \"\\F01D\"; }\n\n.fa-rotate-right:before,\n.fa-repeat:before {\n  content: \"\\F01E\"; }\n\n.fa-refresh:before {\n  content: \"\\F021\"; }\n\n.fa-list-alt:before {\n  content: \"\\F022\"; }\n\n.fa-lock:before {\n  content: \"\\F023\"; }\n\n.fa-flag:before {\n  content: \"\\F024\"; }\n\n.fa-headphones:before {\n  content: \"\\F025\"; }\n\n.fa-volume-off:before {\n  content: \"\\F026\"; }\n\n.fa-volume-down:before {\n  content: \"\\F027\"; }\n\n.fa-volume-up:before {\n  content: \"\\F028\"; }\n\n.fa-qrcode:before {\n  content: \"\\F029\"; }\n\n.fa-barcode:before {\n  content: \"\\F02A\"; }\n\n.fa-tag:before {\n  content: \"\\F02B\"; }\n\n.fa-tags:before {\n  content: \"\\F02C\"; }\n\n.fa-book:before {\n  content: \"\\F02D\"; }\n\n.fa-bookmark:before {\n  content: \"\\F02E\"; }\n\n.fa-print:before {\n  content: \"\\F02F\"; }\n\n.fa-camera:before {\n  content: \"\\F030\"; }\n\n.fa-font:before {\n  content: \"\\F031\"; }\n\n.fa-bold:before {\n  content: \"\\F032\"; }\n\n.fa-italic:before {\n  content: \"\\F033\"; }\n\n.fa-text-height:before {\n  content: \"\\F034\"; }\n\n.fa-text-width:before {\n  content: \"\\F035\"; }\n\n.fa-align-left:before {\n  content: \"\\F036\"; }\n\n.fa-align-center:before {\n  content: \"\\F037\"; }\n\n.fa-align-right:before {\n  content: \"\\F038\"; }\n\n.fa-align-justify:before {\n  content: \"\\F039\"; }\n\n.fa-list:before {\n  content: \"\\F03A\"; }\n\n.fa-dedent:before,\n.fa-outdent:before {\n  content: \"\\F03B\"; }\n\n.fa-indent:before {\n  content: \"\\F03C\"; }\n\n.fa-video-camera:before {\n  content: \"\\F03D\"; }\n\n.fa-photo:before,\n.fa-image:before,\n.fa-picture-o:before {\n  content: \"\\F03E\"; }\n\n.fa-pencil:before {\n  content: \"\\F040\"; }\n\n.fa-map-marker:before {\n  content: \"\\F041\"; }\n\n.fa-adjust:before {\n  content: \"\\F042\"; }\n\n.fa-tint:before {\n  content: \"\\F043\"; }\n\n.fa-edit:before,\n.fa-pencil-square-o:before {\n  content: \"\\F044\"; }\n\n.fa-share-square-o:before {\n  content: \"\\F045\"; }\n\n.fa-check-square-o:before {\n  content: \"\\F046\"; }\n\n.fa-arrows:before {\n  content: \"\\F047\"; }\n\n.fa-step-backward:before {\n  content: \"\\F048\"; }\n\n.fa-fast-backward:before {\n  content: \"\\F049\"; }\n\n.fa-backward:before {\n  content: \"\\F04A\"; }\n\n.fa-play:before {\n  content: \"\\F04B\"; }\n\n.fa-pause:before {\n  content: \"\\F04C\"; }\n\n.fa-stop:before {\n  content: \"\\F04D\"; }\n\n.fa-forward:before {\n  content: \"\\F04E\"; }\n\n.fa-fast-forward:before {\n  content: \"\\F050\"; }\n\n.fa-step-forward:before {\n  content: \"\\F051\"; }\n\n.fa-eject:before {\n  content: \"\\F052\"; }\n\n.fa-chevron-left:before {\n  content: \"\\F053\"; }\n\n.fa-chevron-right:before {\n  content: \"\\F054\"; }\n\n.fa-plus-circle:before {\n  content: \"\\F055\"; }\n\n.fa-minus-circle:before {\n  content: \"\\F056\"; }\n\n.fa-times-circle:before {\n  content: \"\\F057\"; }\n\n.fa-check-circle:before {\n  content: \"\\F058\"; }\n\n.fa-question-circle:before {\n  content: \"\\F059\"; }\n\n.fa-info-circle:before {\n  content: \"\\F05A\"; }\n\n.fa-crosshairs:before {\n  content: \"\\F05B\"; }\n\n.fa-times-circle-o:before {\n  content: \"\\F05C\"; }\n\n.fa-check-circle-o:before {\n  content: \"\\F05D\"; }\n\n.fa-ban:before {\n  content: \"\\F05E\"; }\n\n.fa-arrow-left:before {\n  content: \"\\F060\"; }\n\n.fa-arrow-right:before {\n  content: \"\\F061\"; }\n\n.fa-arrow-up:before {\n  content: \"\\F062\"; }\n\n.fa-arrow-down:before {\n  content: \"\\F063\"; }\n\n.fa-mail-forward:before,\n.fa-share:before {\n  content: \"\\F064\"; }\n\n.fa-expand:before {\n  content: \"\\F065\"; }\n\n.fa-compress:before {\n  content: \"\\F066\"; }\n\n.fa-plus:before {\n  content: \"\\F067\"; }\n\n.fa-minus:before {\n  content: \"\\F068\"; }\n\n.fa-asterisk:before {\n  content: \"\\F069\"; }\n\n.fa-exclamation-circle:before {\n  content: \"\\F06A\"; }\n\n.fa-gift:before {\n  content: \"\\F06B\"; }\n\n.fa-leaf:before {\n  content: \"\\F06C\"; }\n\n.fa-fire:before {\n  content: \"\\F06D\"; }\n\n.fa-eye:before {\n  content: \"\\F06E\"; }\n\n.fa-eye-slash:before {\n  content: \"\\F070\"; }\n\n.fa-warning:before,\n.fa-exclamation-triangle:before {\n  content: \"\\F071\"; }\n\n.fa-plane:before {\n  content: \"\\F072\"; }\n\n.fa-calendar:before {\n  content: \"\\F073\"; }\n\n.fa-random:before {\n  content: \"\\F074\"; }\n\n.fa-comment:before {\n  content: \"\\F075\"; }\n\n.fa-magnet:before {\n  content: \"\\F076\"; }\n\n.fa-chevron-up:before {\n  content: \"\\F077\"; }\n\n.fa-chevron-down:before {\n  content: \"\\F078\"; }\n\n.fa-retweet:before {\n  content: \"\\F079\"; }\n\n.fa-shopping-cart:before {\n  content: \"\\F07A\"; }\n\n.fa-folder:before {\n  content: \"\\F07B\"; }\n\n.fa-folder-open:before {\n  content: \"\\F07C\"; }\n\n.fa-arrows-v:before {\n  content: \"\\F07D\"; }\n\n.fa-arrows-h:before {\n  content: \"\\F07E\"; }\n\n.fa-bar-chart-o:before,\n.fa-bar-chart:before {\n  content: \"\\F080\"; }\n\n.fa-twitter-square:before {\n  content: \"\\F081\"; }\n\n.fa-facebook-square:before {\n  content: \"\\F082\"; }\n\n.fa-camera-retro:before {\n  content: \"\\F083\"; }\n\n.fa-key:before {\n  content: \"\\F084\"; }\n\n.fa-gears:before,\n.fa-cogs:before {\n  content: \"\\F085\"; }\n\n.fa-comments:before {\n  content: \"\\F086\"; }\n\n.fa-thumbs-o-up:before {\n  content: \"\\F087\"; }\n\n.fa-thumbs-o-down:before {\n  content: \"\\F088\"; }\n\n.fa-star-half:before {\n  content: \"\\F089\"; }\n\n.fa-heart-o:before {\n  content: \"\\F08A\"; }\n\n.fa-sign-out:before {\n  content: \"\\F08B\"; }\n\n.fa-linkedin-square:before {\n  content: \"\\F08C\"; }\n\n.fa-thumb-tack:before {\n  content: \"\\F08D\"; }\n\n.fa-external-link:before {\n  content: \"\\F08E\"; }\n\n.fa-sign-in:before {\n  content: \"\\F090\"; }\n\n.fa-trophy:before {\n  content: \"\\F091\"; }\n\n.fa-github-square:before {\n  content: \"\\F092\"; }\n\n.fa-upload:before {\n  content: \"\\F093\"; }\n\n.fa-lemon-o:before {\n  content: \"\\F094\"; }\n\n.fa-phone:before {\n  content: \"\\F095\"; }\n\n.fa-square-o:before {\n  content: \"\\F096\"; }\n\n.fa-bookmark-o:before {\n  content: \"\\F097\"; }\n\n.fa-phone-square:before {\n  content: \"\\F098\"; }\n\n.fa-twitter:before {\n  content: \"\\F099\"; }\n\n.fa-facebook-f:before,\n.fa-facebook:before {\n  content: \"\\F09A\"; }\n\n.fa-github:before {\n  content: \"\\F09B\"; }\n\n.fa-unlock:before {\n  content: \"\\F09C\"; }\n\n.fa-credit-card:before {\n  content: \"\\F09D\"; }\n\n.fa-feed:before,\n.fa-rss:before {\n  content: \"\\F09E\"; }\n\n.fa-hdd-o:before {\n  content: \"\\F0A0\"; }\n\n.fa-bullhorn:before {\n  content: \"\\F0A1\"; }\n\n.fa-bell:before {\n  content: \"\\F0F3\"; }\n\n.fa-certificate:before {\n  content: \"\\F0A3\"; }\n\n.fa-hand-o-right:before {\n  content: \"\\F0A4\"; }\n\n.fa-hand-o-left:before {\n  content: \"\\F0A5\"; }\n\n.fa-hand-o-up:before {\n  content: \"\\F0A6\"; }\n\n.fa-hand-o-down:before {\n  content: \"\\F0A7\"; }\n\n.fa-arrow-circle-left:before {\n  content: \"\\F0A8\"; }\n\n.fa-arrow-circle-right:before {\n  content: \"\\F0A9\"; }\n\n.fa-arrow-circle-up:before {\n  content: \"\\F0AA\"; }\n\n.fa-arrow-circle-down:before {\n  content: \"\\F0AB\"; }\n\n.fa-globe:before {\n  content: \"\\F0AC\"; }\n\n.fa-wrench:before {\n  content: \"\\F0AD\"; }\n\n.fa-tasks:before {\n  content: \"\\F0AE\"; }\n\n.fa-filter:before {\n  content: \"\\F0B0\"; }\n\n.fa-briefcase:before {\n  content: \"\\F0B1\"; }\n\n.fa-arrows-alt:before {\n  content: \"\\F0B2\"; }\n\n.fa-group:before,\n.fa-users:before {\n  content: \"\\F0C0\"; }\n\n.fa-chain:before,\n.fa-link:before {\n  content: \"\\F0C1\"; }\n\n.fa-cloud:before {\n  content: \"\\F0C2\"; }\n\n.fa-flask:before {\n  content: \"\\F0C3\"; }\n\n.fa-cut:before,\n.fa-scissors:before {\n  content: \"\\F0C4\"; }\n\n.fa-copy:before,\n.fa-files-o:before {\n  content: \"\\F0C5\"; }\n\n.fa-paperclip:before {\n  content: \"\\F0C6\"; }\n\n.fa-save:before,\n.fa-floppy-o:before {\n  content: \"\\F0C7\"; }\n\n.fa-square:before {\n  content: \"\\F0C8\"; }\n\n.fa-navicon:before,\n.fa-reorder:before,\n.fa-bars:before {\n  content: \"\\F0C9\"; }\n\n.fa-list-ul:before {\n  content: \"\\F0CA\"; }\n\n.fa-list-ol:before {\n  content: \"\\F0CB\"; }\n\n.fa-strikethrough:before {\n  content: \"\\F0CC\"; }\n\n.fa-underline:before {\n  content: \"\\F0CD\"; }\n\n.fa-table:before {\n  content: \"\\F0CE\"; }\n\n.fa-magic:before {\n  content: \"\\F0D0\"; }\n\n.fa-truck:before {\n  content: \"\\F0D1\"; }\n\n.fa-pinterest:before {\n  content: \"\\F0D2\"; }\n\n.fa-pinterest-square:before {\n  content: \"\\F0D3\"; }\n\n.fa-google-plus-square:before {\n  content: \"\\F0D4\"; }\n\n.fa-google-plus:before {\n  content: \"\\F0D5\"; }\n\n.fa-money:before {\n  content: \"\\F0D6\"; }\n\n.fa-caret-down:before {\n  content: \"\\F0D7\"; }\n\n.fa-caret-up:before {\n  content: \"\\F0D8\"; }\n\n.fa-caret-left:before {\n  content: \"\\F0D9\"; }\n\n.fa-caret-right:before {\n  content: \"\\F0DA\"; }\n\n.fa-columns:before {\n  content: \"\\F0DB\"; }\n\n.fa-unsorted:before,\n.fa-sort:before {\n  content: \"\\F0DC\"; }\n\n.fa-sort-down:before,\n.fa-sort-desc:before {\n  content: \"\\F0DD\"; }\n\n.fa-sort-up:before,\n.fa-sort-asc:before {\n  content: \"\\F0DE\"; }\n\n.fa-envelope:before {\n  content: \"\\F0E0\"; }\n\n.fa-linkedin:before {\n  content: \"\\F0E1\"; }\n\n.fa-rotate-left:before,\n.fa-undo:before {\n  content: \"\\F0E2\"; }\n\n.fa-legal:before,\n.fa-gavel:before {\n  content: \"\\F0E3\"; }\n\n.fa-dashboard:before,\n.fa-tachometer:before {\n  content: \"\\F0E4\"; }\n\n.fa-comment-o:before {\n  content: \"\\F0E5\"; }\n\n.fa-comments-o:before {\n  content: \"\\F0E6\"; }\n\n.fa-flash:before,\n.fa-bolt:before {\n  content: \"\\F0E7\"; }\n\n.fa-sitemap:before {\n  content: \"\\F0E8\"; }\n\n.fa-umbrella:before {\n  content: \"\\F0E9\"; }\n\n.fa-paste:before,\n.fa-clipboard:before {\n  content: \"\\F0EA\"; }\n\n.fa-lightbulb-o:before {\n  content: \"\\F0EB\"; }\n\n.fa-exchange:before {\n  content: \"\\F0EC\"; }\n\n.fa-cloud-download:before {\n  content: \"\\F0ED\"; }\n\n.fa-cloud-upload:before {\n  content: \"\\F0EE\"; }\n\n.fa-user-md:before {\n  content: \"\\F0F0\"; }\n\n.fa-stethoscope:before {\n  content: \"\\F0F1\"; }\n\n.fa-suitcase:before {\n  content: \"\\F0F2\"; }\n\n.fa-bell-o:before {\n  content: \"\\F0A2\"; }\n\n.fa-coffee:before {\n  content: \"\\F0F4\"; }\n\n.fa-cutlery:before {\n  content: \"\\F0F5\"; }\n\n.fa-file-text-o:before {\n  content: \"\\F0F6\"; }\n\n.fa-building-o:before {\n  content: \"\\F0F7\"; }\n\n.fa-hospital-o:before {\n  content: \"\\F0F8\"; }\n\n.fa-ambulance:before {\n  content: \"\\F0F9\"; }\n\n.fa-medkit:before {\n  content: \"\\F0FA\"; }\n\n.fa-fighter-jet:before {\n  content: \"\\F0FB\"; }\n\n.fa-beer:before {\n  content: \"\\F0FC\"; }\n\n.fa-h-square:before {\n  content: \"\\F0FD\"; }\n\n.fa-plus-square:before {\n  content: \"\\F0FE\"; }\n\n.fa-angle-double-left:before {\n  content: \"\\F100\"; }\n\n.fa-angle-double-right:before {\n  content: \"\\F101\"; }\n\n.fa-angle-double-up:before {\n  content: \"\\F102\"; }\n\n.fa-angle-double-down:before {\n  content: \"\\F103\"; }\n\n.fa-angle-left:before {\n  content: \"\\F104\"; }\n\n.fa-angle-right:before {\n  content: \"\\F105\"; }\n\n.fa-angle-up:before {\n  content: \"\\F106\"; }\n\n.fa-angle-down:before {\n  content: \"\\F107\"; }\n\n.fa-desktop:before {\n  content: \"\\F108\"; }\n\n.fa-laptop:before {\n  content: \"\\F109\"; }\n\n.fa-tablet:before {\n  content: \"\\F10A\"; }\n\n.fa-mobile-phone:before,\n.fa-mobile:before {\n  content: \"\\F10B\"; }\n\n.fa-circle-o:before {\n  content: \"\\F10C\"; }\n\n.fa-quote-left:before {\n  content: \"\\F10D\"; }\n\n.fa-quote-right:before {\n  content: \"\\F10E\"; }\n\n.fa-spinner:before {\n  content: \"\\F110\"; }\n\n.fa-circle:before {\n  content: \"\\F111\"; }\n\n.fa-mail-reply:before,\n.fa-reply:before {\n  content: \"\\F112\"; }\n\n.fa-github-alt:before {\n  content: \"\\F113\"; }\n\n.fa-folder-o:before {\n  content: \"\\F114\"; }\n\n.fa-folder-open-o:before {\n  content: \"\\F115\"; }\n\n.fa-smile-o:before {\n  content: \"\\F118\"; }\n\n.fa-frown-o:before {\n  content: \"\\F119\"; }\n\n.fa-meh-o:before {\n  content: \"\\F11A\"; }\n\n.fa-gamepad:before {\n  content: \"\\F11B\"; }\n\n.fa-keyboard-o:before {\n  content: \"\\F11C\"; }\n\n.fa-flag-o:before {\n  content: \"\\F11D\"; }\n\n.fa-flag-checkered:before {\n  content: \"\\F11E\"; }\n\n.fa-terminal:before {\n  content: \"\\F120\"; }\n\n.fa-code:before {\n  content: \"\\F121\"; }\n\n.fa-mail-reply-all:before,\n.fa-reply-all:before {\n  content: \"\\F122\"; }\n\n.fa-star-half-empty:before,\n.fa-star-half-full:before,\n.fa-star-half-o:before {\n  content: \"\\F123\"; }\n\n.fa-location-arrow:before {\n  content: \"\\F124\"; }\n\n.fa-crop:before {\n  content: \"\\F125\"; }\n\n.fa-code-fork:before {\n  content: \"\\F126\"; }\n\n.fa-unlink:before,\n.fa-chain-broken:before {\n  content: \"\\F127\"; }\n\n.fa-question:before {\n  content: \"\\F128\"; }\n\n.fa-info:before {\n  content: \"\\F129\"; }\n\n.fa-exclamation:before {\n  content: \"\\F12A\"; }\n\n.fa-superscript:before {\n  content: \"\\F12B\"; }\n\n.fa-subscript:before {\n  content: \"\\F12C\"; }\n\n.fa-eraser:before {\n  content: \"\\F12D\"; }\n\n.fa-puzzle-piece:before {\n  content: \"\\F12E\"; }\n\n.fa-microphone:before {\n  content: \"\\F130\"; }\n\n.fa-microphone-slash:before {\n  content: \"\\F131\"; }\n\n.fa-shield:before {\n  content: \"\\F132\"; }\n\n.fa-calendar-o:before {\n  content: \"\\F133\"; }\n\n.fa-fire-extinguisher:before {\n  content: \"\\F134\"; }\n\n.fa-rocket:before {\n  content: \"\\F135\"; }\n\n.fa-maxcdn:before {\n  content: \"\\F136\"; }\n\n.fa-chevron-circle-left:before {\n  content: \"\\F137\"; }\n\n.fa-chevron-circle-right:before {\n  content: \"\\F138\"; }\n\n.fa-chevron-circle-up:before {\n  content: \"\\F139\"; }\n\n.fa-chevron-circle-down:before {\n  content: \"\\F13A\"; }\n\n.fa-html5:before {\n  content: \"\\F13B\"; }\n\n.fa-css3:before {\n  content: \"\\F13C\"; }\n\n.fa-anchor:before {\n  content: \"\\F13D\"; }\n\n.fa-unlock-alt:before {\n  content: \"\\F13E\"; }\n\n.fa-bullseye:before {\n  content: \"\\F140\"; }\n\n.fa-ellipsis-h:before {\n  content: \"\\F141\"; }\n\n.fa-ellipsis-v:before {\n  content: \"\\F142\"; }\n\n.fa-rss-square:before {\n  content: \"\\F143\"; }\n\n.fa-play-circle:before {\n  content: \"\\F144\"; }\n\n.fa-ticket:before {\n  content: \"\\F145\"; }\n\n.fa-minus-square:before {\n  content: \"\\F146\"; }\n\n.fa-minus-square-o:before {\n  content: \"\\F147\"; }\n\n.fa-level-up:before {\n  content: \"\\F148\"; }\n\n.fa-level-down:before {\n  content: \"\\F149\"; }\n\n.fa-check-square:before {\n  content: \"\\F14A\"; }\n\n.fa-pencil-square:before {\n  content: \"\\F14B\"; }\n\n.fa-external-link-square:before {\n  content: \"\\F14C\"; }\n\n.fa-share-square:before {\n  content: \"\\F14D\"; }\n\n.fa-compass:before {\n  content: \"\\F14E\"; }\n\n.fa-toggle-down:before,\n.fa-caret-square-o-down:before {\n  content: \"\\F150\"; }\n\n.fa-toggle-up:before,\n.fa-caret-square-o-up:before {\n  content: \"\\F151\"; }\n\n.fa-toggle-right:before,\n.fa-caret-square-o-right:before {\n  content: \"\\F152\"; }\n\n.fa-euro:before,\n.fa-eur:before {\n  content: \"\\F153\"; }\n\n.fa-gbp:before {\n  content: \"\\F154\"; }\n\n.fa-dollar:before,\n.fa-usd:before {\n  content: \"\\F155\"; }\n\n.fa-rupee:before,\n.fa-inr:before {\n  content: \"\\F156\"; }\n\n.fa-cny:before,\n.fa-rmb:before,\n.fa-yen:before,\n.fa-jpy:before {\n  content: \"\\F157\"; }\n\n.fa-ruble:before,\n.fa-rouble:before,\n.fa-rub:before {\n  content: \"\\F158\"; }\n\n.fa-won:before,\n.fa-krw:before {\n  content: \"\\F159\"; }\n\n.fa-bitcoin:before,\n.fa-btc:before {\n  content: \"\\F15A\"; }\n\n.fa-file:before {\n  content: \"\\F15B\"; }\n\n.fa-file-text:before {\n  content: \"\\F15C\"; }\n\n.fa-sort-alpha-asc:before {\n  content: \"\\F15D\"; }\n\n.fa-sort-alpha-desc:before {\n  content: \"\\F15E\"; }\n\n.fa-sort-amount-asc:before {\n  content: \"\\F160\"; }\n\n.fa-sort-amount-desc:before {\n  content: \"\\F161\"; }\n\n.fa-sort-numeric-asc:before {\n  content: \"\\F162\"; }\n\n.fa-sort-numeric-desc:before {\n  content: \"\\F163\"; }\n\n.fa-thumbs-up:before {\n  content: \"\\F164\"; }\n\n.fa-thumbs-down:before {\n  content: \"\\F165\"; }\n\n.fa-youtube-square:before {\n  content: \"\\F166\"; }\n\n.fa-youtube:before {\n  content: \"\\F167\"; }\n\n.fa-xing:before {\n  content: \"\\F168\"; }\n\n.fa-xing-square:before {\n  content: \"\\F169\"; }\n\n.fa-youtube-play:before {\n  content: \"\\F16A\"; }\n\n.fa-dropbox:before {\n  content: \"\\F16B\"; }\n\n.fa-stack-overflow:before {\n  content: \"\\F16C\"; }\n\n.fa-instagram:before {\n  content: \"\\F16D\"; }\n\n.fa-flickr:before {\n  content: \"\\F16E\"; }\n\n.fa-adn:before {\n  content: \"\\F170\"; }\n\n.fa-bitbucket:before {\n  content: \"\\F171\"; }\n\n.fa-bitbucket-square:before {\n  content: \"\\F172\"; }\n\n.fa-tumblr:before {\n  content: \"\\F173\"; }\n\n.fa-tumblr-square:before {\n  content: \"\\F174\"; }\n\n.fa-long-arrow-down:before {\n  content: \"\\F175\"; }\n\n.fa-long-arrow-up:before {\n  content: \"\\F176\"; }\n\n.fa-long-arrow-left:before {\n  content: \"\\F177\"; }\n\n.fa-long-arrow-right:before {\n  content: \"\\F178\"; }\n\n.fa-apple:before {\n  content: \"\\F179\"; }\n\n.fa-windows:before {\n  content: \"\\F17A\"; }\n\n.fa-android:before {\n  content: \"\\F17B\"; }\n\n.fa-linux:before {\n  content: \"\\F17C\"; }\n\n.fa-dribbble:before {\n  content: \"\\F17D\"; }\n\n.fa-skype:before {\n  content: \"\\F17E\"; }\n\n.fa-foursquare:before {\n  content: \"\\F180\"; }\n\n.fa-trello:before {\n  content: \"\\F181\"; }\n\n.fa-female:before {\n  content: \"\\F182\"; }\n\n.fa-male:before {\n  content: \"\\F183\"; }\n\n.fa-gittip:before,\n.fa-gratipay:before {\n  content: \"\\F184\"; }\n\n.fa-sun-o:before {\n  content: \"\\F185\"; }\n\n.fa-moon-o:before {\n  content: \"\\F186\"; }\n\n.fa-archive:before {\n  content: \"\\F187\"; }\n\n.fa-bug:before {\n  content: \"\\F188\"; }\n\n.fa-vk:before {\n  content: \"\\F189\"; }\n\n.fa-weibo:before {\n  content: \"\\F18A\"; }\n\n.fa-renren:before {\n  content: \"\\F18B\"; }\n\n.fa-pagelines:before {\n  content: \"\\F18C\"; }\n\n.fa-stack-exchange:before {\n  content: \"\\F18D\"; }\n\n.fa-arrow-circle-o-right:before {\n  content: \"\\F18E\"; }\n\n.fa-arrow-circle-o-left:before {\n  content: \"\\F190\"; }\n\n.fa-toggle-left:before,\n.fa-caret-square-o-left:before {\n  content: \"\\F191\"; }\n\n.fa-dot-circle-o:before {\n  content: \"\\F192\"; }\n\n.fa-wheelchair:before {\n  content: \"\\F193\"; }\n\n.fa-vimeo-square:before {\n  content: \"\\F194\"; }\n\n.fa-turkish-lira:before,\n.fa-try:before {\n  content: \"\\F195\"; }\n\n.fa-plus-square-o:before {\n  content: \"\\F196\"; }\n\n.fa-space-shuttle:before {\n  content: \"\\F197\"; }\n\n.fa-slack:before {\n  content: \"\\F198\"; }\n\n.fa-envelope-square:before {\n  content: \"\\F199\"; }\n\n.fa-wordpress:before {\n  content: \"\\F19A\"; }\n\n.fa-openid:before {\n  content: \"\\F19B\"; }\n\n.fa-institution:before,\n.fa-bank:before,\n.fa-university:before {\n  content: \"\\F19C\"; }\n\n.fa-mortar-board:before,\n.fa-graduation-cap:before {\n  content: \"\\F19D\"; }\n\n.fa-yahoo:before {\n  content: \"\\F19E\"; }\n\n.fa-google:before {\n  content: \"\\F1A0\"; }\n\n.fa-reddit:before {\n  content: \"\\F1A1\"; }\n\n.fa-reddit-square:before {\n  content: \"\\F1A2\"; }\n\n.fa-stumbleupon-circle:before {\n  content: \"\\F1A3\"; }\n\n.fa-stumbleupon:before {\n  content: \"\\F1A4\"; }\n\n.fa-delicious:before {\n  content: \"\\F1A5\"; }\n\n.fa-digg:before {\n  content: \"\\F1A6\"; }\n\n.fa-pied-piper-pp:before {\n  content: \"\\F1A7\"; }\n\n.fa-pied-piper-alt:before {\n  content: \"\\F1A8\"; }\n\n.fa-drupal:before {\n  content: \"\\F1A9\"; }\n\n.fa-joomla:before {\n  content: \"\\F1AA\"; }\n\n.fa-language:before {\n  content: \"\\F1AB\"; }\n\n.fa-fax:before {\n  content: \"\\F1AC\"; }\n\n.fa-building:before {\n  content: \"\\F1AD\"; }\n\n.fa-child:before {\n  content: \"\\F1AE\"; }\n\n.fa-paw:before {\n  content: \"\\F1B0\"; }\n\n.fa-spoon:before {\n  content: \"\\F1B1\"; }\n\n.fa-cube:before {\n  content: \"\\F1B2\"; }\n\n.fa-cubes:before {\n  content: \"\\F1B3\"; }\n\n.fa-behance:before {\n  content: \"\\F1B4\"; }\n\n.fa-behance-square:before {\n  content: \"\\F1B5\"; }\n\n.fa-steam:before {\n  content: \"\\F1B6\"; }\n\n.fa-steam-square:before {\n  content: \"\\F1B7\"; }\n\n.fa-recycle:before {\n  content: \"\\F1B8\"; }\n\n.fa-automobile:before,\n.fa-car:before {\n  content: \"\\F1B9\"; }\n\n.fa-cab:before,\n.fa-taxi:before {\n  content: \"\\F1BA\"; }\n\n.fa-tree:before {\n  content: \"\\F1BB\"; }\n\n.fa-spotify:before {\n  content: \"\\F1BC\"; }\n\n.fa-deviantart:before {\n  content: \"\\F1BD\"; }\n\n.fa-soundcloud:before {\n  content: \"\\F1BE\"; }\n\n.fa-database:before {\n  content: \"\\F1C0\"; }\n\n.fa-file-pdf-o:before {\n  content: \"\\F1C1\"; }\n\n.fa-file-word-o:before {\n  content: \"\\F1C2\"; }\n\n.fa-file-excel-o:before {\n  content: \"\\F1C3\"; }\n\n.fa-file-powerpoint-o:before {\n  content: \"\\F1C4\"; }\n\n.fa-file-photo-o:before,\n.fa-file-picture-o:before,\n.fa-file-image-o:before {\n  content: \"\\F1C5\"; }\n\n.fa-file-zip-o:before,\n.fa-file-archive-o:before {\n  content: \"\\F1C6\"; }\n\n.fa-file-sound-o:before,\n.fa-file-audio-o:before {\n  content: \"\\F1C7\"; }\n\n.fa-file-movie-o:before,\n.fa-file-video-o:before {\n  content: \"\\F1C8\"; }\n\n.fa-file-code-o:before {\n  content: \"\\F1C9\"; }\n\n.fa-vine:before {\n  content: \"\\F1CA\"; }\n\n.fa-codepen:before {\n  content: \"\\F1CB\"; }\n\n.fa-jsfiddle:before {\n  content: \"\\F1CC\"; }\n\n.fa-life-bouy:before,\n.fa-life-buoy:before,\n.fa-life-saver:before,\n.fa-support:before,\n.fa-life-ring:before {\n  content: \"\\F1CD\"; }\n\n.fa-circle-o-notch:before {\n  content: \"\\F1CE\"; }\n\n.fa-ra:before,\n.fa-resistance:before,\n.fa-rebel:before {\n  content: \"\\F1D0\"; }\n\n.fa-ge:before,\n.fa-empire:before {\n  content: \"\\F1D1\"; }\n\n.fa-git-square:before {\n  content: \"\\F1D2\"; }\n\n.fa-git:before {\n  content: \"\\F1D3\"; }\n\n.fa-y-combinator-square:before,\n.fa-yc-square:before,\n.fa-hacker-news:before {\n  content: \"\\F1D4\"; }\n\n.fa-tencent-weibo:before {\n  content: \"\\F1D5\"; }\n\n.fa-qq:before {\n  content: \"\\F1D6\"; }\n\n.fa-wechat:before,\n.fa-weixin:before {\n  content: \"\\F1D7\"; }\n\n.fa-send:before,\n.fa-paper-plane:before {\n  content: \"\\F1D8\"; }\n\n.fa-send-o:before,\n.fa-paper-plane-o:before {\n  content: \"\\F1D9\"; }\n\n.fa-history:before {\n  content: \"\\F1DA\"; }\n\n.fa-circle-thin:before {\n  content: \"\\F1DB\"; }\n\n.fa-header:before {\n  content: \"\\F1DC\"; }\n\n.fa-paragraph:before {\n  content: \"\\F1DD\"; }\n\n.fa-sliders:before {\n  content: \"\\F1DE\"; }\n\n.fa-share-alt:before {\n  content: \"\\F1E0\"; }\n\n.fa-share-alt-square:before {\n  content: \"\\F1E1\"; }\n\n.fa-bomb:before {\n  content: \"\\F1E2\"; }\n\n.fa-soccer-ball-o:before,\n.fa-futbol-o:before {\n  content: \"\\F1E3\"; }\n\n.fa-tty:before {\n  content: \"\\F1E4\"; }\n\n.fa-binoculars:before {\n  content: \"\\F1E5\"; }\n\n.fa-plug:before {\n  content: \"\\F1E6\"; }\n\n.fa-slideshare:before {\n  content: \"\\F1E7\"; }\n\n.fa-twitch:before {\n  content: \"\\F1E8\"; }\n\n.fa-yelp:before {\n  content: \"\\F1E9\"; }\n\n.fa-newspaper-o:before {\n  content: \"\\F1EA\"; }\n\n.fa-wifi:before {\n  content: \"\\F1EB\"; }\n\n.fa-calculator:before {\n  content: \"\\F1EC\"; }\n\n.fa-paypal:before {\n  content: \"\\F1ED\"; }\n\n.fa-google-wallet:before {\n  content: \"\\F1EE\"; }\n\n.fa-cc-visa:before {\n  content: \"\\F1F0\"; }\n\n.fa-cc-mastercard:before {\n  content: \"\\F1F1\"; }\n\n.fa-cc-discover:before {\n  content: \"\\F1F2\"; }\n\n.fa-cc-amex:before {\n  content: \"\\F1F3\"; }\n\n.fa-cc-paypal:before {\n  content: \"\\F1F4\"; }\n\n.fa-cc-stripe:before {\n  content: \"\\F1F5\"; }\n\n.fa-bell-slash:before {\n  content: \"\\F1F6\"; }\n\n.fa-bell-slash-o:before {\n  content: \"\\F1F7\"; }\n\n.fa-trash:before {\n  content: \"\\F1F8\"; }\n\n.fa-copyright:before {\n  content: \"\\F1F9\"; }\n\n.fa-at:before {\n  content: \"\\F1FA\"; }\n\n.fa-eyedropper:before {\n  content: \"\\F1FB\"; }\n\n.fa-paint-brush:before {\n  content: \"\\F1FC\"; }\n\n.fa-birthday-cake:before {\n  content: \"\\F1FD\"; }\n\n.fa-area-chart:before {\n  content: \"\\F1FE\"; }\n\n.fa-pie-chart:before {\n  content: \"\\F200\"; }\n\n.fa-line-chart:before {\n  content: \"\\F201\"; }\n\n.fa-lastfm:before {\n  content: \"\\F202\"; }\n\n.fa-lastfm-square:before {\n  content: \"\\F203\"; }\n\n.fa-toggle-off:before {\n  content: \"\\F204\"; }\n\n.fa-toggle-on:before {\n  content: \"\\F205\"; }\n\n.fa-bicycle:before {\n  content: \"\\F206\"; }\n\n.fa-bus:before {\n  content: \"\\F207\"; }\n\n.fa-ioxhost:before {\n  content: \"\\F208\"; }\n\n.fa-angellist:before {\n  content: \"\\F209\"; }\n\n.fa-cc:before {\n  content: \"\\F20A\"; }\n\n.fa-shekel:before,\n.fa-sheqel:before,\n.fa-ils:before {\n  content: \"\\F20B\"; }\n\n.fa-meanpath:before {\n  content: \"\\F20C\"; }\n\n.fa-buysellads:before {\n  content: \"\\F20D\"; }\n\n.fa-connectdevelop:before {\n  content: \"\\F20E\"; }\n\n.fa-dashcube:before {\n  content: \"\\F210\"; }\n\n.fa-forumbee:before {\n  content: \"\\F211\"; }\n\n.fa-leanpub:before {\n  content: \"\\F212\"; }\n\n.fa-sellsy:before {\n  content: \"\\F213\"; }\n\n.fa-shirtsinbulk:before {\n  content: \"\\F214\"; }\n\n.fa-simplybuilt:before {\n  content: \"\\F215\"; }\n\n.fa-skyatlas:before {\n  content: \"\\F216\"; }\n\n.fa-cart-plus:before {\n  content: \"\\F217\"; }\n\n.fa-cart-arrow-down:before {\n  content: \"\\F218\"; }\n\n.fa-diamond:before {\n  content: \"\\F219\"; }\n\n.fa-ship:before {\n  content: \"\\F21A\"; }\n\n.fa-user-secret:before {\n  content: \"\\F21B\"; }\n\n.fa-motorcycle:before {\n  content: \"\\F21C\"; }\n\n.fa-street-view:before {\n  content: \"\\F21D\"; }\n\n.fa-heartbeat:before {\n  content: \"\\F21E\"; }\n\n.fa-venus:before {\n  content: \"\\F221\"; }\n\n.fa-mars:before {\n  content: \"\\F222\"; }\n\n.fa-mercury:before {\n  content: \"\\F223\"; }\n\n.fa-intersex:before,\n.fa-transgender:before {\n  content: \"\\F224\"; }\n\n.fa-transgender-alt:before {\n  content: \"\\F225\"; }\n\n.fa-venus-double:before {\n  content: \"\\F226\"; }\n\n.fa-mars-double:before {\n  content: \"\\F227\"; }\n\n.fa-venus-mars:before {\n  content: \"\\F228\"; }\n\n.fa-mars-stroke:before {\n  content: \"\\F229\"; }\n\n.fa-mars-stroke-v:before {\n  content: \"\\F22A\"; }\n\n.fa-mars-stroke-h:before {\n  content: \"\\F22B\"; }\n\n.fa-neuter:before {\n  content: \"\\F22C\"; }\n\n.fa-genderless:before {\n  content: \"\\F22D\"; }\n\n.fa-facebook-official:before {\n  content: \"\\F230\"; }\n\n.fa-pinterest-p:before {\n  content: \"\\F231\"; }\n\n.fa-whatsapp:before {\n  content: \"\\F232\"; }\n\n.fa-server:before {\n  content: \"\\F233\"; }\n\n.fa-user-plus:before {\n  content: \"\\F234\"; }\n\n.fa-user-times:before {\n  content: \"\\F235\"; }\n\n.fa-hotel:before,\n.fa-bed:before {\n  content: \"\\F236\"; }\n\n.fa-viacoin:before {\n  content: \"\\F237\"; }\n\n.fa-train:before {\n  content: \"\\F238\"; }\n\n.fa-subway:before {\n  content: \"\\F239\"; }\n\n.fa-medium:before {\n  content: \"\\F23A\"; }\n\n.fa-yc:before,\n.fa-y-combinator:before {\n  content: \"\\F23B\"; }\n\n.fa-optin-monster:before {\n  content: \"\\F23C\"; }\n\n.fa-opencart:before {\n  content: \"\\F23D\"; }\n\n.fa-expeditedssl:before {\n  content: \"\\F23E\"; }\n\n.fa-battery-4:before,\n.fa-battery:before,\n.fa-battery-full:before {\n  content: \"\\F240\"; }\n\n.fa-battery-3:before,\n.fa-battery-three-quarters:before {\n  content: \"\\F241\"; }\n\n.fa-battery-2:before,\n.fa-battery-half:before {\n  content: \"\\F242\"; }\n\n.fa-battery-1:before,\n.fa-battery-quarter:before {\n  content: \"\\F243\"; }\n\n.fa-battery-0:before,\n.fa-battery-empty:before {\n  content: \"\\F244\"; }\n\n.fa-mouse-pointer:before {\n  content: \"\\F245\"; }\n\n.fa-i-cursor:before {\n  content: \"\\F246\"; }\n\n.fa-object-group:before {\n  content: \"\\F247\"; }\n\n.fa-object-ungroup:before {\n  content: \"\\F248\"; }\n\n.fa-sticky-note:before {\n  content: \"\\F249\"; }\n\n.fa-sticky-note-o:before {\n  content: \"\\F24A\"; }\n\n.fa-cc-jcb:before {\n  content: \"\\F24B\"; }\n\n.fa-cc-diners-club:before {\n  content: \"\\F24C\"; }\n\n.fa-clone:before {\n  content: \"\\F24D\"; }\n\n.fa-balance-scale:before {\n  content: \"\\F24E\"; }\n\n.fa-hourglass-o:before {\n  content: \"\\F250\"; }\n\n.fa-hourglass-1:before,\n.fa-hourglass-start:before {\n  content: \"\\F251\"; }\n\n.fa-hourglass-2:before,\n.fa-hourglass-half:before {\n  content: \"\\F252\"; }\n\n.fa-hourglass-3:before,\n.fa-hourglass-end:before {\n  content: \"\\F253\"; }\n\n.fa-hourglass:before {\n  content: \"\\F254\"; }\n\n.fa-hand-grab-o:before,\n.fa-hand-rock-o:before {\n  content: \"\\F255\"; }\n\n.fa-hand-stop-o:before,\n.fa-hand-paper-o:before {\n  content: \"\\F256\"; }\n\n.fa-hand-scissors-o:before {\n  content: \"\\F257\"; }\n\n.fa-hand-lizard-o:before {\n  content: \"\\F258\"; }\n\n.fa-hand-spock-o:before {\n  content: \"\\F259\"; }\n\n.fa-hand-pointer-o:before {\n  content: \"\\F25A\"; }\n\n.fa-hand-peace-o:before {\n  content: \"\\F25B\"; }\n\n.fa-trademark:before {\n  content: \"\\F25C\"; }\n\n.fa-registered:before {\n  content: \"\\F25D\"; }\n\n.fa-creative-commons:before {\n  content: \"\\F25E\"; }\n\n.fa-gg:before {\n  content: \"\\F260\"; }\n\n.fa-gg-circle:before {\n  content: \"\\F261\"; }\n\n.fa-tripadvisor:before {\n  content: \"\\F262\"; }\n\n.fa-odnoklassniki:before {\n  content: \"\\F263\"; }\n\n.fa-odnoklassniki-square:before {\n  content: \"\\F264\"; }\n\n.fa-get-pocket:before {\n  content: \"\\F265\"; }\n\n.fa-wikipedia-w:before {\n  content: \"\\F266\"; }\n\n.fa-safari:before {\n  content: \"\\F267\"; }\n\n.fa-chrome:before {\n  content: \"\\F268\"; }\n\n.fa-firefox:before {\n  content: \"\\F269\"; }\n\n.fa-opera:before {\n  content: \"\\F26A\"; }\n\n.fa-internet-explorer:before {\n  content: \"\\F26B\"; }\n\n.fa-tv:before,\n.fa-television:before {\n  content: \"\\F26C\"; }\n\n.fa-contao:before {\n  content: \"\\F26D\"; }\n\n.fa-500px:before {\n  content: \"\\F26E\"; }\n\n.fa-amazon:before {\n  content: \"\\F270\"; }\n\n.fa-calendar-plus-o:before {\n  content: \"\\F271\"; }\n\n.fa-calendar-minus-o:before {\n  content: \"\\F272\"; }\n\n.fa-calendar-times-o:before {\n  content: \"\\F273\"; }\n\n.fa-calendar-check-o:before {\n  content: \"\\F274\"; }\n\n.fa-industry:before {\n  content: \"\\F275\"; }\n\n.fa-map-pin:before {\n  content: \"\\F276\"; }\n\n.fa-map-signs:before {\n  content: \"\\F277\"; }\n\n.fa-map-o:before {\n  content: \"\\F278\"; }\n\n.fa-map:before {\n  content: \"\\F279\"; }\n\n.fa-commenting:before {\n  content: \"\\F27A\"; }\n\n.fa-commenting-o:before {\n  content: \"\\F27B\"; }\n\n.fa-houzz:before {\n  content: \"\\F27C\"; }\n\n.fa-vimeo:before {\n  content: \"\\F27D\"; }\n\n.fa-black-tie:before {\n  content: \"\\F27E\"; }\n\n.fa-fonticons:before {\n  content: \"\\F280\"; }\n\n.fa-reddit-alien:before {\n  content: \"\\F281\"; }\n\n.fa-edge:before {\n  content: \"\\F282\"; }\n\n.fa-credit-card-alt:before {\n  content: \"\\F283\"; }\n\n.fa-codiepie:before {\n  content: \"\\F284\"; }\n\n.fa-modx:before {\n  content: \"\\F285\"; }\n\n.fa-fort-awesome:before {\n  content: \"\\F286\"; }\n\n.fa-usb:before {\n  content: \"\\F287\"; }\n\n.fa-product-hunt:before {\n  content: \"\\F288\"; }\n\n.fa-mixcloud:before {\n  content: \"\\F289\"; }\n\n.fa-scribd:before {\n  content: \"\\F28A\"; }\n\n.fa-pause-circle:before {\n  content: \"\\F28B\"; }\n\n.fa-pause-circle-o:before {\n  content: \"\\F28C\"; }\n\n.fa-stop-circle:before {\n  content: \"\\F28D\"; }\n\n.fa-stop-circle-o:before {\n  content: \"\\F28E\"; }\n\n.fa-shopping-bag:before {\n  content: \"\\F290\"; }\n\n.fa-shopping-basket:before {\n  content: \"\\F291\"; }\n\n.fa-hashtag:before {\n  content: \"\\F292\"; }\n\n.fa-bluetooth:before {\n  content: \"\\F293\"; }\n\n.fa-bluetooth-b:before {\n  content: \"\\F294\"; }\n\n.fa-percent:before {\n  content: \"\\F295\"; }\n\n.fa-gitlab:before {\n  content: \"\\F296\"; }\n\n.fa-wpbeginner:before {\n  content: \"\\F297\"; }\n\n.fa-wpforms:before {\n  content: \"\\F298\"; }\n\n.fa-envira:before {\n  content: \"\\F299\"; }\n\n.fa-universal-access:before {\n  content: \"\\F29A\"; }\n\n.fa-wheelchair-alt:before {\n  content: \"\\F29B\"; }\n\n.fa-question-circle-o:before {\n  content: \"\\F29C\"; }\n\n.fa-blind:before {\n  content: \"\\F29D\"; }\n\n.fa-audio-description:before {\n  content: \"\\F29E\"; }\n\n.fa-volume-control-phone:before {\n  content: \"\\F2A0\"; }\n\n.fa-braille:before {\n  content: \"\\F2A1\"; }\n\n.fa-assistive-listening-systems:before {\n  content: \"\\F2A2\"; }\n\n.fa-asl-interpreting:before,\n.fa-american-sign-language-interpreting:before {\n  content: \"\\F2A3\"; }\n\n.fa-deafness:before,\n.fa-hard-of-hearing:before,\n.fa-deaf:before {\n  content: \"\\F2A4\"; }\n\n.fa-glide:before {\n  content: \"\\F2A5\"; }\n\n.fa-glide-g:before {\n  content: \"\\F2A6\"; }\n\n.fa-signing:before,\n.fa-sign-language:before {\n  content: \"\\F2A7\"; }\n\n.fa-low-vision:before {\n  content: \"\\F2A8\"; }\n\n.fa-viadeo:before {\n  content: \"\\F2A9\"; }\n\n.fa-viadeo-square:before {\n  content: \"\\F2AA\"; }\n\n.fa-snapchat:before {\n  content: \"\\F2AB\"; }\n\n.fa-snapchat-ghost:before {\n  content: \"\\F2AC\"; }\n\n.fa-snapchat-square:before {\n  content: \"\\F2AD\"; }\n\n.fa-pied-piper:before {\n  content: \"\\F2AE\"; }\n\n.fa-first-order:before {\n  content: \"\\F2B0\"; }\n\n.fa-yoast:before {\n  content: \"\\F2B1\"; }\n\n.fa-themeisle:before {\n  content: \"\\F2B2\"; }\n\n.fa-google-plus-circle:before,\n.fa-google-plus-official:before {\n  content: \"\\F2B3\"; }\n\n.fa-fa:before,\n.fa-font-awesome:before {\n  content: \"\\F2B4\"; }\n\n.fa-handshake-o:before {\n  content: \"\\F2B5\"; }\n\n.fa-envelope-open:before {\n  content: \"\\F2B6\"; }\n\n.fa-envelope-open-o:before {\n  content: \"\\F2B7\"; }\n\n.fa-linode:before {\n  content: \"\\F2B8\"; }\n\n.fa-address-book:before {\n  content: \"\\F2B9\"; }\n\n.fa-address-book-o:before {\n  content: \"\\F2BA\"; }\n\n.fa-vcard:before,\n.fa-address-card:before {\n  content: \"\\F2BB\"; }\n\n.fa-vcard-o:before,\n.fa-address-card-o:before {\n  content: \"\\F2BC\"; }\n\n.fa-user-circle:before {\n  content: \"\\F2BD\"; }\n\n.fa-user-circle-o:before {\n  content: \"\\F2BE\"; }\n\n.fa-user-o:before {\n  content: \"\\F2C0\"; }\n\n.fa-id-badge:before {\n  content: \"\\F2C1\"; }\n\n.fa-drivers-license:before,\n.fa-id-card:before {\n  content: \"\\F2C2\"; }\n\n.fa-drivers-license-o:before,\n.fa-id-card-o:before {\n  content: \"\\F2C3\"; }\n\n.fa-quora:before {\n  content: \"\\F2C4\"; }\n\n.fa-free-code-camp:before {\n  content: \"\\F2C5\"; }\n\n.fa-telegram:before {\n  content: \"\\F2C6\"; }\n\n.fa-thermometer-4:before,\n.fa-thermometer:before,\n.fa-thermometer-full:before {\n  content: \"\\F2C7\"; }\n\n.fa-thermometer-3:before,\n.fa-thermometer-three-quarters:before {\n  content: \"\\F2C8\"; }\n\n.fa-thermometer-2:before,\n.fa-thermometer-half:before {\n  content: \"\\F2C9\"; }\n\n.fa-thermometer-1:before,\n.fa-thermometer-quarter:before {\n  content: \"\\F2CA\"; }\n\n.fa-thermometer-0:before,\n.fa-thermometer-empty:before {\n  content: \"\\F2CB\"; }\n\n.fa-shower:before {\n  content: \"\\F2CC\"; }\n\n.fa-bathtub:before,\n.fa-s15:before,\n.fa-bath:before {\n  content: \"\\F2CD\"; }\n\n.fa-podcast:before {\n  content: \"\\F2CE\"; }\n\n.fa-window-maximize:before {\n  content: \"\\F2D0\"; }\n\n.fa-window-minimize:before {\n  content: \"\\F2D1\"; }\n\n.fa-window-restore:before {\n  content: \"\\F2D2\"; }\n\n.fa-times-rectangle:before,\n.fa-window-close:before {\n  content: \"\\F2D3\"; }\n\n.fa-times-rectangle-o:before,\n.fa-window-close-o:before {\n  content: \"\\F2D4\"; }\n\n.fa-bandcamp:before {\n  content: \"\\F2D5\"; }\n\n.fa-grav:before {\n  content: \"\\F2D6\"; }\n\n.fa-etsy:before {\n  content: \"\\F2D7\"; }\n\n.fa-imdb:before {\n  content: \"\\F2D8\"; }\n\n.fa-ravelry:before {\n  content: \"\\F2D9\"; }\n\n.fa-eercast:before {\n  content: \"\\F2DA\"; }\n\n.fa-microchip:before {\n  content: \"\\F2DB\"; }\n\n.fa-snowflake-o:before {\n  content: \"\\F2DC\"; }\n\n.fa-superpowers:before {\n  content: \"\\F2DD\"; }\n\n.fa-wpexplorer:before {\n  content: \"\\F2DE\"; }\n\n.fa-meetup:before {\n  content: \"\\F2E0\"; }\n\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0; }\n\n.sr-only-focusable:active,\n.sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  margin: 0;\n  overflow: visible;\n  clip: auto; }\n", ""]);

// exports


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "674f50d287a8c48dc19ba404d20fe713.eot";

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "674f50d287a8c48dc19ba404d20fe713.eot";

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "af7ae505a9eed503f8b8e6982036873e.woff2";

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fee66e712a8a08eef5805a46892932ad.woff";

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "b06871f281fee6b241d60582ae9369b9.ttf";

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "912ec66d7572ff821749319396470bde.svg";

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(16);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../css-loader/index.js!../../../sass-loader/lib/loader.js!./spectre.css", function() {
			var newContent = require("!!../../../css-loader/index.js!../../../sass-loader/lib/loader.js!./spectre.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*! Spectre.css | MIT License | github.com/picturepan2/spectre */\n/* Manually forked from Normalize.css */\n/* normalize.css v5.0.0 | MIT License | github.com/necolas/normalize.css */\n/**\n * 1. Change the default font family in all browsers (opinionated).\n * 2. Correct the line height in all browsers.\n * 3. Prevent adjustments of font size after orientation changes in\n *    IE on Windows Phone and in iOS.\n */\n/* Document\n   ========================================================================== */\nhtml {\n  font-family: sans-serif;\n  /* 1 */\n  line-height: 1.15;\n  /* 3 */\n  -webkit-text-size-adjust: 100%;\n  /* 2 */\n  -ms-text-size-adjust: 100%;\n  /* 3 */ }\n\n/* Sections\n   ========================================================================== */\n/**\n * Remove the margin in all browsers (opinionated).\n */\nbody {\n  margin: 0; }\n\n/**\n * Add the correct display in IE 9-.\n */\narticle,\naside,\nfooter,\nheader,\nnav,\nsection {\n  display: block; }\n\n/**\n * Correct the font size and margin on `h1` elements within `section` and\n * `article` contexts in Chrome, Firefox, and Safari.\n */\nh1 {\n  font-size: 2em;\n  margin: .67em 0; }\n\n/* Grouping content\n   ========================================================================== */\n/**\n * Add the correct display in IE 9-.\n * 1. Add the correct display in IE.\n */\nfigcaption,\nfigure,\nmain {\n  /* 1 */\n  display: block; }\n\n/**\n * Add the correct margin in IE 8 (removed).\n */\n/**\n * 1. Add the correct box sizing in Firefox.\n * 2. Show the overflow in Edge and IE.\n */\nhr {\n  box-sizing: content-box;\n  /* 1 */\n  height: 0;\n  /* 1 */\n  overflow: visible;\n  /* 2 */ }\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers. (removed)\n * 2. Correct the odd `em` font sizing in all browsers.\n */\n/* Text-level semantics\n   ========================================================================== */\n/**\n * 1. Remove the gray background on active links in IE 10.\n * 2. Remove gaps in links underline in iOS 8+ and Safari 8+.\n */\na {\n  background-color: transparent;\n  /* 1 */\n  -webkit-text-decoration-skip: objects;\n  /* 2 */ }\n\n/**\n * Remove the outline on focused links when they are also active or hovered\n * in all browsers (opinionated).\n */\na:active,\na:hover {\n  outline-width: 0; }\n\n/**\n * 1. Remove the bottom border in Firefox 39-.\n * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari. (removed)\n */\n/**\n * Prevent the duplicate application of `bolder` by the next rule in Safari 6.\n */\nb,\nstrong {\n  font-weight: inherit; }\n\n/**\n * Add the correct font weight in Chrome, Edge, and Safari.\n */\nb,\nstrong {\n  font-weight: bolder; }\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace;\n  /* 1 */\n  font-size: 1em;\n  /* 2 */ }\n\n/**\n * Add the correct font style in Android 4.3-.\n */\ndfn {\n  font-style: italic; }\n\n/**\n * Add the correct background and color in IE 9-. (Removed)\n */\n/**\n * Add the correct font size in all browsers.\n */\nsmall {\n  font-size: 80%; }\n\n/**\n * Prevent `sub` and `sup` elements from affecting the line height in\n * all browsers.\n */\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline; }\n\nsub {\n  bottom: -.25em; }\n\nsup {\n  top: -.5em; }\n\n/* Embedded content\n   ========================================================================== */\n/**\n * Add the correct display in IE 9-.\n */\naudio,\nvideo {\n  display: inline-block; }\n\n/**\n * Add the correct display in iOS 4-7.\n */\naudio:not([controls]) {\n  display: none;\n  height: 0; }\n\n/**\n * Remove the border on images inside links in IE 10-.\n */\nimg {\n  border-style: none; }\n\n/**\n * Hide the overflow in IE.\n */\nsvg:not(:root) {\n  overflow: hidden; }\n\n/* Forms\n   ========================================================================== */\n/**\n * 1. Change the font styles in all browsers (opinionated).\n * 2. Remove the margin in Firefox and Safari.\n */\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit;\n  /* 1 (changed) */\n  font-size: inherit;\n  /* 1 (changed) */\n  line-height: inherit;\n  /* 1 (changed) */\n  margin: 0;\n  /* 2 */ }\n\n/**\n * Show the overflow in IE.\n * 1. Show the overflow in Edge.\n */\nbutton,\ninput {\n  /* 1 */\n  overflow: visible; }\n\n/**\n * Remove the inheritance of text transform in Edge, Firefox, and IE.\n * 1. Remove the inheritance of text transform in Firefox.\n */\nbutton,\nselect {\n  /* 1 */\n  text-transform: none; }\n\n/**\n * 1. Prevent a WebKit bug where (2) destroys native `audio` and `video`\n *    controls in Android 4.\n * 2. Correct the inability to style clickable types in iOS and Safari.\n */\nbutton,\nhtml [type=\"button\"],\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button;\n  /* 2 */ }\n\n/**\n * Remove the inner border and padding in Firefox.\n */\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  border-style: none;\n  padding: 0; }\n\n/**\n * Restore the focus styles unset by the previous rule (removed).\n */\n/**\n * Change the border, margin, and padding in all browsers (opinionated) (changed).\n */\nfieldset {\n  border: 0;\n  margin: 0;\n  padding: 0; }\n\n/**\n * 1. Correct the text wrapping in Edge and IE.\n * 2. Correct the color inheritance from `fieldset` elements in IE.\n * 3. Remove the padding so developers are not caught out when they zero out\n *    `fieldset` elements in all browsers.\n */\nlegend {\n  box-sizing: border-box;\n  /* 1 */\n  color: inherit;\n  /* 2 */\n  display: table;\n  /* 1 */\n  max-width: 100%;\n  /* 1 */\n  padding: 0;\n  /* 3 */\n  white-space: normal;\n  /* 1 */ }\n\n/**\n * 1. Add the correct display in IE 9-.\n * 2. Add the correct vertical alignment in Chrome, Firefox, and Opera.\n */\nprogress {\n  display: inline-block;\n  /* 1 */\n  vertical-align: baseline;\n  /* 2 */ }\n\n/**\n * Remove the default vertical scrollbar in IE.\n */\ntextarea {\n  overflow: auto; }\n\n/**\n * 1. Add the correct box sizing in IE 10-.\n * 2. Remove the padding in IE 10-.\n */\n[type=\"checkbox\"],\n[type=\"radio\"] {\n  box-sizing: border-box;\n  /* 1 */\n  padding: 0;\n  /* 2 */ }\n\n/**\n * Correct the cursor style of increment and decrement buttons in Chrome.\n */\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto; }\n\n/**\n * 1. Correct the odd appearance in Chrome and Safari.\n * 2. Correct the outline style in Safari.\n */\n[type=\"search\"] {\n  -webkit-appearance: textfield;\n  /* 1 */\n  outline-offset: -2px;\n  /* 2 */ }\n\n/**\n * Remove the inner padding and cancel buttons in Chrome and Safari on macOS.\n */\n[type=\"search\"]::-webkit-search-cancel-button,\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none; }\n\n/**\n * 1. Correct the inability to style clickable types in iOS and Safari.\n * 2. Change font properties to `inherit` in Safari.\n */\n::-webkit-file-upload-button {\n  -webkit-appearance: button;\n  /* 1 */\n  font: inherit;\n  /* 2 */ }\n\n/* Interactive\n   ========================================================================== */\n/*\n * Add the correct display in IE 9-.\n * 1. Add the correct display in Edge, IE, and Firefox.\n */\ndetails,\nmenu {\n  display: block; }\n\n/*\n * Add the correct display in all browsers.\n */\nsummary {\n  display: list-item; }\n\n/* Scripting\n   ========================================================================== */\n/**\n * Add the correct display in IE 9-.\n */\ncanvas {\n  display: inline-block; }\n\n/**\n * Add the correct display in IE.\n */\ntemplate {\n  display: none; }\n\n/* Hidden\n   ========================================================================== */\n/**\n * Add the correct display in IE 10-.\n */\n[hidden] {\n  display: none; }\n\n*,\n*::before,\n*::after {\n  box-sizing: inherit; }\n\nhtml {\n  box-sizing: border-box;\n  font-size: 10px;\n  line-height: 1.42857143;\n  -webkit-tap-highlight-color: transparent; }\n\nbody {\n  background: #fff;\n  color: #50596c;\n  font-family: -apple-system, system-ui, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif;\n  font-size: 1.4rem;\n  overflow-x: hidden;\n  text-rendering: optimizeLegibility; }\n\na {\n  color: #5764c6;\n  outline: none;\n  text-decoration: none; }\n\na:focus {\n  box-shadow: 0 0 0 0.2rem rgba(87, 100, 198, 0.15); }\n\na:focus,\na:hover,\na:active,\na.active {\n  color: #3b49af;\n  text-decoration: underline; }\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  color: inherit;\n  font-weight: 300;\n  line-height: 1.2;\n  margin-bottom: 1.5rem;\n  margin-top: 0; }\n\nh1 {\n  font-size: 5rem; }\n\nh2 {\n  font-size: 4rem; }\n\nh3 {\n  font-size: 3rem; }\n\nh4 {\n  font-size: 2.4rem; }\n\nh5 {\n  font-size: 2rem; }\n\nh6 {\n  font-size: 1.6rem; }\n\np {\n  line-height: 2.4rem;\n  margin: 0 0 1rem; }\n\na,\nins,\nu {\n  -webkit-text-decoration-skip: ink edges;\n  text-decoration-skip: ink edges; }\n\nblockquote {\n  border-left: .2rem solid #f0f1f4;\n  margin-left: 0;\n  padding: 1rem 2rem; }\n\nblockquote p:last-child {\n  margin-bottom: 0; }\n\nblockquote cite {\n  color: #acb3c2; }\n\nul,\nol {\n  margin: 2rem 0 2rem 2rem;\n  padding: 0; }\n\nul ul,\nol ul,\nul ol,\nol ol {\n  margin: 1.5rem 0 1.5rem 2rem; }\n\nul li,\nol li {\n  margin-top: 1rem; }\n\nul {\n  list-style: disc inside; }\n\nul ul {\n  list-style-type: circle; }\n\nol {\n  list-style: decimal inside; }\n\nol ol {\n  list-style-type: lower-alpha; }\n\ndl dt {\n  font-weight: bold; }\n\ndl dd {\n  margin: .5rem 0 1.5rem 0; }\n\nmark {\n  background: #ffe9b3;\n  border-radius: .2rem;\n  color: #50596c;\n  display: inline-block;\n  line-height: 1;\n  padding: .3rem .4rem;\n  vertical-align: baseline; }\n\nkbd {\n  background: #454d5d;\n  border-radius: .2rem;\n  color: #fff;\n  display: inline-block;\n  line-height: 1;\n  padding: .3rem .4rem;\n  vertical-align: baseline; }\n\nabbr[title] {\n  border-bottom: .1rem dotted;\n  cursor: help;\n  text-decoration: none; }\n\n:lang(zh),\n:lang(ja),\n:lang(ko),\n.cjk {\n  font-family: -apple-system, system-ui, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Hiragino Kaku Gothic Pro\", Meiryo, \"Malgun Gothic\", \"Helvetica Neue\", sans-serif; }\n\n:lang(zh) ins,\n:lang(ja) ins,\n.cjk ins,\n:lang(zh) u,\n:lang(ja) u,\n.cjk u {\n  border-bottom: .1rem solid;\n  text-decoration: none; }\n\n:lang(zh) del + del,\n:lang(ja) del + del,\n.cjk del + del,\n:lang(zh) del + s,\n:lang(ja) del + s,\n.cjk del + s,\n:lang(zh) ins + ins,\n:lang(ja) ins + ins,\n.cjk ins + ins,\n:lang(zh) ins + u,\n:lang(ja) ins + u,\n.cjk ins + u,\n:lang(zh) s + del,\n:lang(ja) s + del,\n.cjk s + del,\n:lang(zh) s + s,\n:lang(ja) s + s,\n.cjk s + s,\n:lang(zh) u + ins,\n:lang(ja) u + ins,\n.cjk u + ins,\n:lang(zh) u + u,\n:lang(ja) u + u,\n.cjk u + u {\n  margin-left: .125em; }\n\n.table {\n  border-collapse: collapse;\n  border-spacing: 0;\n  text-align: left;\n  width: 100%; }\n\n.table.table-striped tbody tr:nth-of-type(odd) {\n  background: #f8f9fa; }\n\n.table.table-hover tbody tr:hover {\n  background: #f0f1f4; }\n\n.table tbody tr.active,\n.table.table-striped tbody tr.active {\n  background: #f0f1f4; }\n\n.table td {\n  border-bottom: .1rem solid #f0f1f4;\n  padding: 1.5rem 1rem; }\n\n.table th {\n  border-bottom: .1rem solid #727e96;\n  padding: 1.5rem 1rem; }\n\n.btn {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  background: #fff;\n  border: .1rem solid #5764c6;\n  border-radius: .2rem;\n  color: #5764c6;\n  cursor: pointer;\n  display: inline-block;\n  font-size: 1.4rem;\n  height: 3.2rem;\n  line-height: 2rem;\n  outline: none;\n  padding: .5rem .8rem;\n  text-align: center;\n  text-decoration: none;\n  transition: all .2s ease;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  vertical-align: middle;\n  white-space: nowrap; }\n\n.btn:focus {\n  background: #fbfbfe;\n  box-shadow: 0 0 0 0.2rem rgba(87, 100, 198, 0.15);\n  text-decoration: none; }\n\n.btn:hover {\n  background: #5764c6;\n  border-color: #4c59c2;\n  color: #fff;\n  text-decoration: none; }\n\n.btn:active,\n.btn.active {\n  background: #4c59c2;\n  border-color: #3e4cb6;\n  color: #fff;\n  text-decoration: none; }\n\n.btn[disabled],\n.btn:disabled,\n.btn.disabled {\n  cursor: default;\n  opacity: .5;\n  pointer-events: none; }\n\n.btn.btn-primary {\n  background: #5764c6;\n  border-color: #4c59c2;\n  color: #fff; }\n\n.btn.btn-primary:focus,\n.btn.btn-primary:hover {\n  background: #4452c0;\n  border-color: #3e4cb6;\n  color: #fff; }\n\n.btn.btn-primary:active,\n.btn.btn-primary.active {\n  background: #3f4eba;\n  border-color: #3b49af;\n  color: #fff; }\n\n.btn.btn-primary.loading::after {\n  border-bottom-color: #fff;\n  border-left-color: #fff; }\n\n.btn.btn-link {\n  background: transparent;\n  border-color: transparent;\n  color: #5764c6; }\n\n.btn.btn-link:focus,\n.btn.btn-link:hover,\n.btn.btn-link:active,\n.btn.btn-link.active {\n  color: #3b49af; }\n\n.btn.btn-sm {\n  font-size: 1.2rem;\n  height: 2.4rem;\n  padding: .1rem .8rem; }\n\n.btn.btn-lg {\n  font-size: 1.6rem;\n  height: 4rem;\n  padding: .9rem .8rem; }\n\n.btn.btn-block {\n  display: block;\n  width: 100%; }\n\n.btn.btn-action {\n  padding-left: 0;\n  padding-right: 0;\n  width: 3.2rem; }\n\n.btn.btn-action.btn-sm {\n  width: 2.4rem; }\n\n.btn.btn-action.btn-lg {\n  width: 4rem; }\n\n.btn.btn-clear {\n  background: transparent;\n  border: 0;\n  color: currentColor;\n  height: 1.6rem;\n  line-height: 1.6rem;\n  margin-left: .4rem;\n  margin-right: -.2rem;\n  opacity: .45;\n  padding: 0 .2rem;\n  text-decoration: none;\n  width: 1.6rem; }\n\n.btn.btn-clear:hover {\n  opacity: .85; }\n\n.btn.btn-clear::before {\n  content: \"\\2715\"; }\n\n.btn-group {\n  display: inline-flex;\n  display: -ms-inline-flexbox;\n  display: -webkit-inline-flex;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap; }\n\n.btn-group .btn {\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto; }\n\n.btn-group .btn:first-child:not(:last-child) {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0; }\n\n.btn-group .btn:not(:first-child):not(:last-child) {\n  border-radius: 0;\n  margin-left: -.1rem; }\n\n.btn-group .btn:last-child:not(:first-child) {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n  margin-left: -.1rem; }\n\n.btn-group .btn:focus,\n.btn-group .btn:hover,\n.btn-group .btn:active,\n.btn-group .btn.active {\n  z-index: 1; }\n\n.btn-group.btn-group-block {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex; }\n\n.btn-group.btn-group-block .btn {\n  -webkit-flex: 1 0 0;\n  -ms-flex: 1 0 0;\n  flex: 1 0 0; }\n\n.form-group:not(:last-child) {\n  margin-bottom: 1rem; }\n\n.form-label {\n  display: block;\n  padding: .6rem 0; }\n\n.form-label.label-sm {\n  padding: .2rem 0; }\n\n.form-label.label-lg {\n  padding: 1rem 0; }\n\n.form-input {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  background: #fff;\n  background-image: none;\n  border: .1rem solid #c4c9d3;\n  border-radius: .2rem;\n  color: #50596c;\n  display: block;\n  font-size: 1.4rem;\n  height: 3.2rem;\n  line-height: 2rem;\n  max-width: 100%;\n  outline: none;\n  padding: .5rem .8rem;\n  position: relative;\n  transition: all .2s ease;\n  width: 100%; }\n\n.form-input:focus {\n  border-color: #5764c6;\n  box-shadow: 0 0 0 0.2rem rgba(87, 100, 198, 0.15); }\n\n.form-input::-webkit-input-placeholder {\n  color: #acb3c2; }\n\n.form-input::-moz-placeholder {\n  color: #acb3c2; }\n\n.form-input:-ms-input-placeholder {\n  color: #acb3c2; }\n\n.form-input::placeholder {\n  color: #acb3c2; }\n\n.form-input.input-sm {\n  font-size: 1.2rem;\n  height: 2.4rem;\n  padding: .1rem .8rem; }\n\n.form-input.input-lg {\n  font-size: 1.6rem;\n  height: 4rem;\n  padding: .9rem .8rem; }\n\n.form-input.input-inline {\n  display: inline-block;\n  vertical-align: middle;\n  width: auto; }\n\ntextarea.form-input {\n  height: auto; }\n\n.form-input[type=\"file\"] {\n  height: auto; }\n\n.form-input-hint {\n  color: #acb3c2;\n  margin-top: .4rem; }\n\n.has-success .form-input-hint,\n.is-success + .form-input-hint {\n  color: #32b643; }\n\n.has-error .form-input-hint,\n.is-error + .form-input-hint {\n  color: #e85600; }\n\n.form-select {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  border: .1rem solid #c4c9d3;\n  border-radius: .2rem;\n  color: inherit;\n  font-size: 1.4rem;\n  line-height: 2rem;\n  outline: none;\n  padding: .5rem .8rem;\n  vertical-align: middle;\n  width: 100%; }\n\n.form-select[multiple] option {\n  padding: .2rem .4rem; }\n\n.form-select:not([multiple]) {\n  background: #fff url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23667189' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center/0.8rem 1rem;\n  height: 3.2rem;\n  padding-right: 2.4rem; }\n\n.form-select:focus {\n  border-color: #5764c6;\n  box-shadow: 0 0 0 0.2rem rgba(87, 100, 198, 0.15); }\n\n.form-select::-ms-expand {\n  display: none; }\n\n.form-select.select-sm {\n  font-size: 1.2rem;\n  height: 2.4rem;\n  padding: .1rem 2rem .1rem .6rem; }\n\n.form-select.select-lg {\n  font-size: 1.6rem;\n  height: 4rem;\n  padding: .9rem 2.4rem .9rem .8rem; }\n\n.has-success .form-input,\n.has-success .form-select,\n.form-input.is-success,\n.form-select.is-success {\n  border-color: #32b643; }\n\n.has-success .form-input:focus,\n.has-success .form-select:focus,\n.form-input.is-success:focus,\n.form-select.is-success:focus {\n  box-shadow: 0 0 0 0.2rem rgba(50, 182, 67, 0.15); }\n\n.has-error .form-input,\n.has-error .form-select,\n.form-input.is-error,\n.form-select.is-error {\n  border-color: #e85600; }\n\n.has-error .form-input:focus,\n.has-error .form-select:focus,\n.form-input.is-error:focus,\n.form-select.is-error:focus {\n  box-shadow: 0 0 0 0.2rem rgba(232, 86, 0, 0.15); }\n\n.form-input:not(:placeholder-shown):invalid {\n  border-color: #e85600; }\n\n.form-input:not(:placeholder-shown):invalid:focus {\n  box-shadow: 0 0 0 0.2rem rgba(232, 86, 0, 0.15); }\n\n.form-input:not(:placeholder-shown):invalid + .form-input-hint {\n  color: #e85600; }\n\n.has-icon-left,\n.has-icon-right {\n  position: relative; }\n\n.has-icon-left .form-icon,\n.has-icon-right .form-icon {\n  margin: 0 .8rem;\n  min-width: 1.4rem;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: translateY(-50%);\n  -ms-transform: translateY(-50%);\n  transform: translateY(-50%); }\n\n.has-icon-left .form-icon {\n  left: 0; }\n\n.has-icon-left .form-input {\n  padding-left: 3rem; }\n\n.has-icon-right .form-icon {\n  right: 0; }\n\n.has-icon-right .form-input {\n  padding-right: 3rem; }\n\n.form-checkbox,\n.form-radio,\n.form-switch {\n  display: inline-block;\n  line-height: 2rem;\n  position: relative; }\n\n.form-checkbox input,\n.form-radio input,\n.form-switch input {\n  clip: rect(0, 0, 0, 0);\n  height: .1rem;\n  margin: -.1rem;\n  overflow: hidden;\n  position: absolute;\n  width: .1rem; }\n\n.form-checkbox input:focus + .form-icon,\n.form-radio input:focus + .form-icon,\n.form-switch input:focus + .form-icon {\n  border-color: #5764c6;\n  box-shadow: 0 0 0 0.2rem rgba(87, 100, 198, 0.15); }\n\n.form-checkbox input:checked + .form-icon,\n.form-radio input:checked + .form-icon,\n.form-switch input:checked + .form-icon {\n  background: #5764c6;\n  border-color: #5764c6; }\n\n.form-checkbox .form-icon,\n.form-radio .form-icon,\n.form-switch .form-icon {\n  border: .1rem solid #c4c9d3;\n  cursor: pointer;\n  display: inline-block;\n  position: absolute;\n  transition: all .2s ease; }\n\n.form-checkbox,\n.form-radio {\n  padding: .2rem 2rem; }\n\n.form-checkbox .form-icon,\n.form-radio .form-icon {\n  background: #fff;\n  height: 1.4rem;\n  left: 0;\n  top: .5rem;\n  width: 1.4rem; }\n\n.form-checkbox input:active + .form-icon,\n.form-radio input:active + .form-icon {\n  background: #f0f1f4; }\n\n.form-checkbox .form-icon {\n  border-radius: .2rem; }\n\n.form-checkbox input:checked + .form-icon::before {\n  background-clip: padding-box;\n  border: .2rem solid #fff;\n  border-left-width: 0;\n  border-top-width: 0;\n  content: \"\";\n  height: 1rem;\n  left: 50%;\n  margin-left: -.3rem;\n  margin-top: -.6rem;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: rotate(45deg);\n  -ms-transform: rotate(45deg);\n  transform: rotate(45deg);\n  width: .6rem; }\n\n.form-checkbox input:indeterminate + .form-icon {\n  background: #5764c6;\n  border-color: #5764c6; }\n\n.form-checkbox input:indeterminate + .form-icon::before {\n  background: #fff;\n  content: \"\";\n  height: .2rem;\n  left: 50%;\n  margin-left: -.5rem;\n  margin-top: -.1rem;\n  position: absolute;\n  top: 50%;\n  width: 1rem; }\n\n.form-radio .form-icon {\n  border-radius: .7rem; }\n\n.form-radio input:checked + .form-icon::before {\n  background: #fff;\n  border-radius: .2rem;\n  content: \"\";\n  height: .4rem;\n  left: 50%;\n  margin-left: -.2rem;\n  margin-top: -.2rem;\n  position: absolute;\n  top: 50%;\n  width: .4rem; }\n\n.form-switch {\n  padding: .2rem 2rem .2rem 3.6rem; }\n\n.form-switch .form-icon {\n  background: #e7e9ed;\n  background-clip: padding-box;\n  border-radius: .9rem;\n  height: 1.8rem;\n  left: 0;\n  top: .3rem;\n  width: 3rem; }\n\n.form-switch .form-icon::before {\n  background: #fff;\n  border-radius: .8rem;\n  content: \"\";\n  display: block;\n  height: 1.6rem;\n  left: 0;\n  position: absolute;\n  top: 0;\n  transition: all .2s ease;\n  width: 1.6rem; }\n\n.form-switch input:checked + .form-icon::before {\n  left: 1.2rem; }\n\n.form-switch input:active + .form-icon::before {\n  background: #f8f9fa; }\n\n.input-group {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex; }\n\n.input-group .input-group-addon {\n  background: #f8f9fa;\n  border: .1rem solid #c4c9d3;\n  border-radius: .2rem;\n  line-height: 2rem;\n  padding: .5rem .8rem; }\n\n.input-group .input-group-addon.addon-sm {\n  font-size: 1.2rem;\n  padding: .1rem .8rem; }\n\n.input-group .input-group-addon.addon-lg {\n  font-size: 1.6rem;\n  padding: .9rem .8rem; }\n\n.input-group .input-group-addon,\n.input-group .input-group-btn {\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto; }\n\n.input-group .form-input:first-child:not(:last-child),\n.input-group .form-select:first-child:not(:last-child),\n.input-group .input-group-addon:first-child:not(:last-child),\n.input-group .input-group-btn:first-child:not(:last-child) {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0; }\n\n.input-group .form-input:not(:first-child):not(:last-child),\n.input-group .form-select:not(:first-child):not(:last-child),\n.input-group .input-group-addon:not(:first-child):not(:last-child),\n.input-group .input-group-btn:not(:first-child):not(:last-child) {\n  border-radius: 0;\n  margin-left: -.1rem; }\n\n.input-group .form-input:last-child:not(:first-child),\n.input-group .form-select:last-child:not(:first-child),\n.input-group .input-group-addon:last-child:not(:first-child),\n.input-group .input-group-btn:last-child:not(:first-child) {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n  margin-left: -.1rem; }\n\n.input-group .form-input:focus,\n.input-group .form-select:focus,\n.input-group .input-group-addon:focus,\n.input-group .input-group-btn:focus {\n  z-index: 1; }\n\n.input-group .form-select {\n  width: auto; }\n\n.input-group.input-inline {\n  display: inline-flex;\n  display: -ms-inline-flexbox;\n  display: -webkit-inline-flex; }\n\n.form-input:disabled,\n.form-select:disabled,\n.form-input.disabled,\n.form-select.disabled {\n  background-color: #f0f1f4;\n  cursor: not-allowed;\n  opacity: .5; }\n\n.form-input[readonly] {\n  background-color: #f8f9fa; }\n\ninput:disabled + .form-icon,\ninput.disabled + .form-icon {\n  background: #f0f1f4;\n  cursor: not-allowed;\n  opacity: .5; }\n\n.form-switch input:disabled + .form-icon::before,\n.form-switch input.disabled + .form-icon::before {\n  background: #fff; }\n\n.form-horizontal {\n  padding: 1rem; }\n\n.form-horizontal .form-group {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex; }\n\n.form-horizontal .form-checkbox,\n.form-horizontal .form-radio,\n.form-horizontal .form-switch {\n  margin: .4rem 0; }\n\n.label {\n  background: #f8f9fa;\n  border-radius: .2rem;\n  color: #5b657a;\n  display: inline-block;\n  line-height: 1;\n  padding: .3rem .4rem;\n  vertical-align: baseline; }\n\n.label.label-primary {\n  background: #5764c6;\n  color: #fff; }\n\n.label.label-success {\n  background: #32b643;\n  color: #fff; }\n\n.label.label-warning {\n  background: #ffb700;\n  color: #fff; }\n\n.label.label-error {\n  background: #e85600;\n  color: #fff; }\n\ncode {\n  background: #fdf4f4;\n  border-radius: .2rem;\n  color: #e06870;\n  display: inline-block;\n  line-height: 1;\n  padding: .3rem .4rem;\n  vertical-align: baseline; }\n\n.code {\n  border-radius: .2rem;\n  color: #50596c;\n  line-height: 2rem;\n  position: relative; }\n\n.code::before {\n  color: #acb3c2;\n  content: attr(data-lang);\n  font-size: 1.2rem;\n  position: absolute;\n  right: 1rem;\n  top: .2rem; }\n\n.code code {\n  background: #f8f9fa;\n  color: inherit;\n  display: block;\n  line-height: inherit;\n  overflow-x: auto;\n  padding: 2rem;\n  width: 100%; }\n\n.img-responsive {\n  display: block;\n  height: auto;\n  max-width: 100%; }\n\n.img-fit-cover {\n  object-fit: cover; }\n\n.img-fit-contain {\n  object-fit: contain; }\n\n.video-responsive {\n  display: block;\n  overflow: hidden;\n  padding: 0;\n  position: relative;\n  width: 100%; }\n\n.video-responsive::before {\n  content: \"\";\n  display: block;\n  padding-bottom: 56.25%; }\n\n.video-responsive iframe,\n.video-responsive object,\n.video-responsive embed {\n  bottom: 0;\n  height: 100%;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  width: 100%; }\n\n.video-responsive video {\n  height: auto;\n  max-width: 100%;\n  width: 100%; }\n\n.video-responsive-4-3::before {\n  padding-bottom: 75%; }\n\n.video-responsive-1-1::before {\n  padding-bottom: 100%; }\n\n.figure {\n  margin: 0 0 1rem 0; }\n\n.figure .figure-caption {\n  color: #727e96;\n  margin-top: 1rem; }\n\n.container {\n  margin-left: auto;\n  margin-right: auto;\n  padding-left: 1rem;\n  padding-right: 1rem;\n  width: 100%; }\n\n.container.grid-1280 {\n  max-width: 130rem; }\n\n.container.grid-960 {\n  max-width: 98rem; }\n\n.container.grid-480 {\n  max-width: 50rem; }\n\n.columns {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  margin-left: -1rem;\n  margin-right: -1rem; }\n\n.columns.col-gapless {\n  margin-left: 0;\n  margin-right: 0; }\n\n.columns.col-gapless .column {\n  padding-left: 0;\n  padding-right: 0; }\n\n.columns.col-oneline {\n  -webkit-flex-wrap: nowrap;\n  -ms-flex-wrap: nowrap;\n  flex-wrap: nowrap;\n  overflow-x: auto; }\n\n.column {\n  -webkit-flex: 1;\n  -ms-flex: 1;\n  flex: 1;\n  max-width: 100%;\n  padding: 1rem; }\n\n.column.col-12,\n.column.col-11,\n.column.col-10,\n.column.col-9,\n.column.col-8,\n.column.col-7,\n.column.col-6,\n.column.col-5,\n.column.col-4,\n.column.col-3,\n.column.col-2,\n.column.col-1 {\n  -webkit-flex: none;\n  -ms-flex: none;\n  flex: none; }\n\n.col-12 {\n  width: 100%; }\n\n.col-11 {\n  width: 91.66666667%; }\n\n.col-10 {\n  width: 83.33333333%; }\n\n.col-9 {\n  width: 75%; }\n\n.col-8 {\n  width: 66.66666667%; }\n\n.col-7 {\n  width: 58.33333333%; }\n\n.col-6 {\n  width: 50%; }\n\n.col-5 {\n  width: 41.66666667%; }\n\n.col-4 {\n  width: 33.33333333%; }\n\n.col-3 {\n  width: 25%; }\n\n.col-2 {\n  width: 16.66666667%; }\n\n.col-1 {\n  width: 8.33333333%; }\n\n@media screen and (max-width: 1280px) {\n  .col-xl-12,\n  .col-xl-11,\n  .col-xl-10,\n  .col-xl-9,\n  .col-xl-8,\n  .col-xl-7,\n  .col-xl-6,\n  .col-xl-5,\n  .col-xl-4,\n  .col-xl-3,\n  .col-xl-2,\n  .col-xl-1 {\n    -webkit-flex: none;\n    -ms-flex: none;\n    flex: none; }\n  .col-xl-12 {\n    width: 100%; }\n  .col-xl-11 {\n    width: 91.66666667%; }\n  .col-xl-10 {\n    width: 83.33333333%; }\n  .col-xl-9 {\n    width: 75%; }\n  .col-xl-8 {\n    width: 66.66666667%; }\n  .col-xl-7 {\n    width: 58.33333333%; }\n  .col-xl-6 {\n    width: 50%; }\n  .col-xl-5 {\n    width: 41.66666667%; }\n  .col-xl-4 {\n    width: 33.33333333%; }\n  .col-xl-3 {\n    width: 25%; }\n  .col-xl-2 {\n    width: 16.66666667%; }\n  .col-xl-1 {\n    width: 8.33333333%; } }\n\n@media screen and (max-width: 960px) {\n  .col-lg-12,\n  .col-lg-11,\n  .col-lg-10,\n  .col-lg-9,\n  .col-lg-8,\n  .col-lg-7,\n  .col-lg-6,\n  .col-lg-5,\n  .col-lg-4,\n  .col-lg-3,\n  .col-lg-2,\n  .col-lg-1 {\n    -webkit-flex: none;\n    -ms-flex: none;\n    flex: none; }\n  .col-lg-12 {\n    width: 100%; }\n  .col-lg-11 {\n    width: 91.66666667%; }\n  .col-lg-10 {\n    width: 83.33333333%; }\n  .col-lg-9 {\n    width: 75%; }\n  .col-lg-8 {\n    width: 66.66666667%; }\n  .col-lg-7 {\n    width: 58.33333333%; }\n  .col-lg-6 {\n    width: 50%; }\n  .col-lg-5 {\n    width: 41.66666667%; }\n  .col-lg-4 {\n    width: 33.33333333%; }\n  .col-lg-3 {\n    width: 25%; }\n  .col-lg-2 {\n    width: 16.66666667%; }\n  .col-lg-1 {\n    width: 8.33333333%; } }\n\n@media screen and (max-width: 840px) {\n  .col-md-12,\n  .col-md-11,\n  .col-md-10,\n  .col-md-9,\n  .col-md-8,\n  .col-md-7,\n  .col-md-6,\n  .col-md-5,\n  .col-md-4,\n  .col-md-3,\n  .col-md-2,\n  .col-md-1 {\n    -webkit-flex: none;\n    -ms-flex: none;\n    flex: none; }\n  .col-md-12 {\n    width: 100%; }\n  .col-md-11 {\n    width: 91.66666667%; }\n  .col-md-10 {\n    width: 83.33333333%; }\n  .col-md-9 {\n    width: 75%; }\n  .col-md-8 {\n    width: 66.66666667%; }\n  .col-md-7 {\n    width: 58.33333333%; }\n  .col-md-6 {\n    width: 50%; }\n  .col-md-5 {\n    width: 41.66666667%; }\n  .col-md-4 {\n    width: 33.33333333%; }\n  .col-md-3 {\n    width: 25%; }\n  .col-md-2 {\n    width: 16.66666667%; }\n  .col-md-1 {\n    width: 8.33333333%; } }\n\n@media screen and (max-width: 600px) {\n  .col-sm-12,\n  .col-sm-11,\n  .col-sm-10,\n  .col-sm-9,\n  .col-sm-8,\n  .col-sm-7,\n  .col-sm-6,\n  .col-sm-5,\n  .col-sm-4,\n  .col-sm-3,\n  .col-sm-2,\n  .col-sm-1 {\n    -webkit-flex: none;\n    -ms-flex: none;\n    flex: none; }\n  .col-sm-12 {\n    width: 100%; }\n  .col-sm-11 {\n    width: 91.66666667%; }\n  .col-sm-10 {\n    width: 83.33333333%; }\n  .col-sm-9 {\n    width: 75%; }\n  .col-sm-8 {\n    width: 66.66666667%; }\n  .col-sm-7 {\n    width: 58.33333333%; }\n  .col-sm-6 {\n    width: 50%; }\n  .col-sm-5 {\n    width: 41.66666667%; }\n  .col-sm-4 {\n    width: 33.33333333%; }\n  .col-sm-3 {\n    width: 25%; }\n  .col-sm-2 {\n    width: 16.66666667%; }\n  .col-sm-1 {\n    width: 8.33333333%; } }\n\n@media screen and (max-width: 480px) {\n  .col-xs-12,\n  .col-xs-11,\n  .col-xs-10,\n  .col-xs-9,\n  .col-xs-8,\n  .col-xs-7,\n  .col-xs-6,\n  .col-xs-5,\n  .col-xs-4,\n  .col-xs-3,\n  .col-xs-2,\n  .col-xs-1 {\n    -webkit-flex: none;\n    -ms-flex: none;\n    flex: none; }\n  .col-xs-12 {\n    width: 100%; }\n  .col-xs-11 {\n    width: 91.66666667%; }\n  .col-xs-10 {\n    width: 83.33333333%; }\n  .col-xs-9 {\n    width: 75%; }\n  .col-xs-8 {\n    width: 66.66666667%; }\n  .col-xs-7 {\n    width: 58.33333333%; }\n  .col-xs-6 {\n    width: 50%; }\n  .col-xs-5 {\n    width: 41.66666667%; }\n  .col-xs-4 {\n    width: 33.33333333%; }\n  .col-xs-3 {\n    width: 25%; }\n  .col-xs-2 {\n    width: 16.66666667%; }\n  .col-xs-1 {\n    width: 8.33333333%; } }\n\n.show-xs,\n.show-sm,\n.show-md,\n.show-lg,\n.show-xl {\n  display: none !important; }\n\n@media screen and (max-width: 480px) {\n  .hide-xs {\n    display: none !important; }\n  .show-xs {\n    display: block !important; } }\n\n@media screen and (max-width: 600px) {\n  .hide-sm {\n    display: none !important; }\n  .show-sm {\n    display: block !important; } }\n\n@media screen and (max-width: 840px) {\n  .hide-md {\n    display: none !important; }\n  .show-md {\n    display: block !important; } }\n\n@media screen and (max-width: 960px) {\n  .hide-lg {\n    display: none !important; }\n  .show-lg {\n    display: block !important; } }\n\n@media screen and (max-width: 1280px) {\n  .hide-xl {\n    display: none !important; }\n  .show-xl {\n    display: block !important; } }\n\n.navbar {\n  -webkit-align-items: stretch;\n  align-items: stretch;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -ms-flex-align: stretch;\n  -ms-flex-pack: justify;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -webkit-justify-content: space-between;\n  justify-content: space-between; }\n\n.navbar .navbar-section {\n  -webkit-align-items: center;\n  align-items: center;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -webkit-flex: 1 0 0;\n  -ms-flex: 1 0 0;\n  flex: 1 0 0;\n  -ms-flex-align: center; }\n\n.navbar .navbar-section:last-child {\n  -ms-flex-pack: end;\n  -webkit-justify-content: flex-end;\n  justify-content: flex-end; }\n\n.navbar .navbar-center {\n  -webkit-align-items: center;\n  align-items: center;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  -ms-flex-align: center; }\n\n.navbar .navbar-brand {\n  font-size: 1.6rem;\n  font-weight: 500;\n  text-decoration: none; }\n\n.panel {\n  border: .1rem solid #f0f1f4;\n  border-radius: .2rem;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column; }\n\n.panel .panel-header,\n.panel .panel-footer {\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  padding: 1.5rem; }\n\n.panel .panel-nav {\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto; }\n\n.panel .panel-body {\n  -webkit-flex: 1 1 auto;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  overflow-y: auto;\n  padding: 0 1.5rem; }\n\n.panel .panel-title {\n  font-size: 2rem; }\n\n.panel .panel-subtitle {\n  color: #bbc1cd; }\n\n.empty {\n  background: #f8f9fa;\n  border-radius: .2rem;\n  color: #727e96;\n  padding: 4rem;\n  text-align: center; }\n\n.empty .empty-title,\n.empty .empty-subtitle {\n  margin: 1rem auto; }\n\n.empty .empty-subtitle {\n  color: #bbc1cd; }\n\n.empty .empty-action {\n  margin-top: 1.5rem; }\n\n.form-autocomplete {\n  position: relative; }\n\n.form-autocomplete .form-autocomplete-input {\n  -webkit-align-content: flex-start;\n  align-content: flex-start;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -ms-flex-line-pack: start;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  height: auto;\n  min-height: 3.2rem;\n  padding: .1rem 0 0 .1rem; }\n\n.form-autocomplete .form-autocomplete-input.is-focused {\n  border-color: #5764c6;\n  box-shadow: 0 0 0 0.2rem rgba(87, 100, 198, 0.15); }\n\n.form-autocomplete .form-autocomplete-input .form-input {\n  border-color: transparent;\n  box-shadow: none;\n  display: inline-block;\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  height: 2.8rem;\n  padding: .3rem .8rem;\n  width: auto; }\n\n.form-autocomplete mark {\n  font-size: 1;\n  padding: .1em 0; }\n\n.form-autocomplete .menu {\n  left: 0;\n  position: absolute;\n  top: 100%;\n  width: 100%; }\n\n.avatar {\n  background: #5764c6;\n  border-radius: 50%;\n  color: rgba(255, 255, 255, 0.85);\n  display: inline-block;\n  font-size: 1.4rem;\n  font-weight: 300;\n  height: 3.2rem;\n  line-height: 1;\n  margin: 0;\n  position: relative;\n  vertical-align: middle;\n  width: 3.2rem; }\n\n.avatar.avatar-xs {\n  font-size: .8rem;\n  height: 1.6rem;\n  width: 1.6rem; }\n\n.avatar.avatar-sm {\n  font-size: 1rem;\n  height: 2.4rem;\n  width: 2.4rem; }\n\n.avatar.avatar-lg {\n  font-size: 2rem;\n  height: 4.8rem;\n  width: 4.8rem; }\n\n.avatar.avatar-xl {\n  font-size: 2.6rem;\n  height: 6.4rem;\n  width: 6.4rem; }\n\n.avatar img {\n  border-radius: 50%;\n  height: 100%;\n  position: relative;\n  width: 100%;\n  z-index: 100; }\n\n.avatar .avatar-icon {\n  background: #fff;\n  bottom: 14.64%;\n  height: 50%;\n  padding: .2rem;\n  position: absolute;\n  right: 14.64%;\n  -webkit-transform: translate(50%, 50%);\n  -ms-transform: translate(50%, 50%);\n  transform: translate(50%, 50%);\n  width: 50%; }\n\n.avatar[data-initial]::before {\n  color: currentColor;\n  content: attr(data-initial);\n  left: 50%;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%);\n  -ms-transform: translate(-50%, -50%);\n  transform: translate(-50%, -50%);\n  z-index: 1; }\n\n.badge {\n  position: relative;\n  white-space: nowrap; }\n\n.badge[data-badge]::after,\n.badge:not([data-badge])::after {\n  background: #5764c6;\n  background-clip: padding-box;\n  border-radius: 1rem;\n  box-shadow: 0 0 0 .2rem #fff;\n  color: #fff;\n  content: attr(data-badge);\n  display: inline-block;\n  -webkit-transform: translate(-0.2rem, -1rem);\n  -ms-transform: translate(-0.2rem, -1rem);\n  transform: translate(-0.2rem, -1rem); }\n\n.badge[data-badge]::after {\n  font-size: 1.2rem;\n  height: 1.8rem;\n  line-height: 1;\n  min-width: 1.8rem;\n  padding: .3rem .5rem;\n  text-align: center;\n  white-space: nowrap; }\n\n.badge:not([data-badge])::after,\n.badge[data-badge=\"\"]::after {\n  height: .6rem;\n  min-width: .6rem;\n  padding: 0;\n  width: .6rem; }\n\n.badge.btn::after {\n  position: absolute;\n  right: 0;\n  top: 0;\n  -webkit-transform: translate(50%, -50%);\n  -ms-transform: translate(50%, -50%);\n  transform: translate(50%, -50%); }\n\n.badge.avatar::after {\n  position: absolute;\n  right: 14.64%;\n  top: 14.64%;\n  -webkit-transform: translate(50%, -50%);\n  -ms-transform: translate(50%, -50%);\n  transform: translate(50%, -50%);\n  z-index: 100; }\n\n.badge.avatar-xs::after {\n  content: \"\";\n  height: .8rem;\n  min-width: .8rem;\n  padding: 0;\n  width: .8rem; }\n\n.bar {\n  background: #f0f1f4;\n  border-radius: .2rem;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -webkit-flex-wrap: nowrap;\n  -ms-flex-wrap: nowrap;\n  flex-wrap: nowrap;\n  height: 1.6rem;\n  width: 100%; }\n\n.bar.bar-sm {\n  height: .4rem; }\n\n.bar .bar-item {\n  background: #5764c6;\n  color: #fff;\n  display: block;\n  -ms-flex-negative: 0;\n  -webkit-flex-shrink: 0;\n  flex-shrink: 0;\n  font-size: 1.2rem;\n  height: 100%;\n  line-height: 1;\n  padding: .2rem 0;\n  position: relative;\n  text-align: center;\n  width: 0; }\n\n.bar .bar-item:first-child {\n  border-bottom-left-radius: .2rem;\n  border-top-left-radius: .2rem; }\n\n.bar .bar-item:last-child {\n  border-bottom-right-radius: .2rem;\n  border-top-right-radius: .2rem;\n  -ms-flex-negative: 1;\n  -webkit-flex-shrink: 1;\n  flex-shrink: 1; }\n\n.bar-slider {\n  height: .2rem;\n  margin: 1rem 0;\n  position: relative; }\n\n.bar-slider .bar-item {\n  left: 0;\n  padding: 0;\n  position: absolute; }\n\n.bar-slider .bar-item:not(:last-child):first-child {\n  background: #f0f1f4;\n  z-index: 1; }\n\n.bar-slider .bar-slider-btn {\n  background: #5764c6;\n  border: 0;\n  border-radius: 50%;\n  height: 1.2rem;\n  padding: 0;\n  position: absolute;\n  right: 0;\n  top: 50%;\n  -webkit-transform: translate(50%, -50%);\n  -ms-transform: translate(50%, -50%);\n  transform: translate(50%, -50%);\n  width: 1.2rem; }\n\n.bar-slider .bar-slider-btn:active {\n  box-shadow: 0 0 0 .2rem #5764c6; }\n\n.card {\n  background: #fff;\n  border: .1rem solid #f0f1f4;\n  border-radius: .2rem;\n  display: block; }\n\n.card .card-header,\n.card .card-body,\n.card .card-footer {\n  padding: 1.5rem;\n  padding-bottom: 0; }\n\n.card .card-header:last-child,\n.card .card-body:last-child,\n.card .card-footer:last-child {\n  padding-bottom: 1.5rem; }\n\n.card .card-image {\n  padding-top: 1.5rem; }\n\n.card .card-image:first-child {\n  padding-top: 0; }\n\n.card .card-image:first-child img {\n  border-top-left-radius: .2rem;\n  border-top-right-radius: .2rem; }\n\n.card .card-image:last-child img {\n  border-bottom-left-radius: .2rem;\n  border-bottom-right-radius: .2rem; }\n\n.card .card-title {\n  font-size: 2rem; }\n\n.card .card-subtitle {\n  color: #bbc1cd;\n  font-size: 1.2rem; }\n\n.chip {\n  -webkit-align-items: center;\n  align-items: center;\n  background: #f0f1f4;\n  border-radius: .2rem;\n  color: #727e96;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  display: -webkit-inline-flex;\n  -ms-flex-align: center;\n  height: 2.8rem;\n  margin: 0 .1rem .1rem 0;\n  max-width: 100%;\n  padding: .1rem .8rem;\n  text-decoration: none;\n  vertical-align: middle; }\n\n.chip.active {\n  background: #5764c6;\n  color: #fff; }\n\n.chip .avatar {\n  margin-left: -.4rem;\n  margin-right: .4rem; }\n\n.dropdown {\n  display: inline-block;\n  position: relative; }\n\n.dropdown .menu {\n  -webkit-animation: slide-down .2s ease 1;\n  animation: slide-down .2s ease 1;\n  display: none;\n  left: 0;\n  position: absolute;\n  top: 100%; }\n\n.dropdown.dropdown-right .menu {\n  left: auto;\n  right: 0; }\n\n.dropdown.active .menu,\n.dropdown .dropdown-toggle:focus + .menu,\n.dropdown .menu:hover {\n  display: block; }\n\n.dropdown .btn-group .dropdown-toggle:nth-last-child(2) {\n  border-bottom-right-radius: .2rem;\n  border-top-right-radius: .2rem; }\n\n.menu {\n  background: #fff;\n  border-radius: .2rem;\n  box-shadow: 0 0.1rem 0.4rem rgba(69, 77, 93, 0.3);\n  list-style: none;\n  margin: 0;\n  min-width: 18rem;\n  padding: 1rem;\n  -webkit-transform: translateY(0.5rem);\n  -ms-transform: translateY(0.5rem);\n  transform: translateY(0.5rem);\n  z-index: 100; }\n\n.menu .menu-item {\n  margin-top: 0;\n  padding: 0 .8rem;\n  text-decoration: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none; }\n\n.menu .menu-item > a {\n  border-radius: .2rem;\n  color: inherit;\n  display: block;\n  margin: 0 -.8rem;\n  padding: .6rem .8rem;\n  text-decoration: none; }\n\n.menu .menu-item > a:focus,\n.menu .menu-item > a:hover {\n  color: #5764c6; }\n\n.menu .menu-item > a:active,\n.menu .menu-item > a.active {\n  background: #fbfbfe;\n  color: #5764c6; }\n\n.menu .menu-badge {\n  float: right;\n  padding: .6rem 0; }\n\n.menu .menu-badge .btn {\n  margin-top: -.2rem; }\n\n.modal {\n  -webkit-align-items: center;\n  align-items: center;\n  bottom: 0;\n  display: none;\n  -ms-flex-align: center;\n  -ms-flex-pack: center;\n  -webkit-justify-content: center;\n  justify-content: center;\n  left: 0;\n  opacity: 0;\n  overflow: hidden;\n  padding: 1rem;\n  position: fixed;\n  right: 0;\n  top: 0; }\n\n.modal:target,\n.modal.active {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  opacity: 1;\n  z-index: 400; }\n\n.modal:target .modal-overlay,\n.modal.active .modal-overlay {\n  background: rgba(69, 77, 93, 0.5);\n  bottom: 0;\n  cursor: default;\n  display: block;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0; }\n\n.modal:target .modal-container,\n.modal.active .modal-container {\n  -webkit-animation: slide-down .2s ease 1;\n  animation: slide-down .2s ease 1;\n  max-width: 64rem;\n  z-index: 1; }\n\n.modal.modal-sm .modal-container {\n  max-width: 32rem; }\n\n.modal-container {\n  background: #fff;\n  border-radius: .2rem;\n  box-shadow: 0 0.4rem 1rem rgba(69, 77, 93, 0.3);\n  display: block;\n  padding: 0;\n  text-align: left; }\n\n.modal-container .modal-header {\n  padding: 1.5rem; }\n\n.modal-container .modal-header .modal-title {\n  font-size: 1.6rem;\n  margin: 0; }\n\n.modal-container .modal-body {\n  max-height: 50vh;\n  overflow-y: auto;\n  padding: 1.5rem;\n  position: relative; }\n\n.modal-container .modal-footer {\n  padding: 1.5rem;\n  text-align: right; }\n\n.breadcrumb,\n.tab,\n.pagination,\n.nav {\n  list-style: none;\n  margin: .5rem 0; }\n\n.breadcrumb {\n  padding: 1.2rem; }\n\n.breadcrumb .breadcrumb-item {\n  display: inline-block;\n  margin: 0; }\n\n.breadcrumb .breadcrumb-item:last-child {\n  color: #acb3c2; }\n\n.breadcrumb .breadcrumb-item:not(:first-child)::before {\n  color: #e7e9ed;\n  content: \"/\";\n  padding: 0 .4rem; }\n\n.tab {\n  -webkit-align-items: center;\n  align-items: center;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -ms-flex-align: center;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap; }\n\n.tab .tab-item {\n  margin-top: 0; }\n\n.tab .tab-item.tab-action {\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  text-align: right; }\n\n.tab .tab-item a {\n  border-bottom: .2rem solid transparent;\n  color: inherit;\n  display: block;\n  margin-top: 0;\n  padding: .6rem 1.2rem .4rem 1.2rem;\n  text-decoration: none; }\n\n.tab .tab-item a:focus,\n.tab .tab-item a:hover {\n  color: #5764c6; }\n\n.tab .tab-item.active a,\n.tab .tab-item a.active {\n  border-bottom-color: #5764c6;\n  color: #5764c6; }\n\n.tab.tab-block .tab-item {\n  -webkit-flex: 1 0 0;\n  -ms-flex: 1 0 0;\n  flex: 1 0 0;\n  text-align: center; }\n\n.tab.tab-block .tab-item .badge[data-badge]::after {\n  position: absolute;\n  right: -.4rem;\n  top: -.4rem;\n  -webkit-transform: translate(0, 0);\n  -ms-transform: translate(0, 0);\n  transform: translate(0, 0); }\n\n.tab:not(.tab-block) .badge {\n  padding-right: .2rem; }\n\n.pagination {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex; }\n\n.pagination .page-item {\n  margin: 1rem .1rem; }\n\n.pagination .page-item span {\n  display: inline-block;\n  padding: .6rem .4rem; }\n\n.pagination .page-item a {\n  border-radius: .2rem;\n  color: #727e96;\n  display: inline-block;\n  padding: .6rem .8rem;\n  text-decoration: none; }\n\n.pagination .page-item a:focus,\n.pagination .page-item a:hover {\n  color: #5764c6; }\n\n.pagination .page-item a[disabled],\n.pagination .page-item a.disabled {\n  cursor: default;\n  opacity: .5;\n  pointer-events: none; }\n\n.pagination .page-item.active a {\n  background: #5764c6;\n  color: #fff; }\n\n.pagination .page-item.page-prev,\n.pagination .page-item.page-next {\n  -webkit-flex: 1 0 50%;\n  -ms-flex: 1 0 50%;\n  flex: 1 0 50%; }\n\n.pagination .page-item.page-next {\n  text-align: right; }\n\n.pagination .page-item .page-item-title {\n  margin: 0; }\n\n.pagination .page-item .page-item-subtitle {\n  margin: 0;\n  opacity: .5; }\n\n.nav {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column; }\n\n.nav .nav-item a {\n  color: #727e96;\n  padding: .6rem .8rem;\n  text-decoration: none; }\n\n.nav .nav-item a:focus,\n.nav .nav-item a:hover {\n  color: #5764c6; }\n\n.nav .nav-item.active > a {\n  font-weight: bold; }\n\n.nav .nav-item.active > a:focus,\n.nav .nav-item.active > a:hover {\n  color: #5764c6; }\n\n.nav .nav {\n  margin-bottom: 1rem;\n  margin-left: 2rem; }\n\n.nav .nav a {\n  color: #acb3c2; }\n\n.popover {\n  display: inline-block;\n  position: relative; }\n\n.popover .popover-container {\n  content: attr(data-tooltip);\n  left: 50%;\n  opacity: 0;\n  padding: 1rem;\n  position: absolute;\n  top: 0;\n  -webkit-transform: translate(-50%, -50%) scale(0);\n  -ms-transform: translate(-50%, -50%) scale(0);\n  transform: translate(-50%, -50%) scale(0);\n  transition: transform .2s ease, -webkit-transform .2s ease;\n  transition: transform .2s ease;\n  transition: -webkit-transform .2s ease;\n  width: 32rem;\n  z-index: 400; }\n\n.popover :focus + .popover-container,\n.popover:hover .popover-container,\n.popover .popover-container:hover {\n  display: block;\n  opacity: 1;\n  -webkit-transform: translate(-50%, -100%) scale(1);\n  -ms-transform: translate(-50%, -100%) scale(1);\n  transform: translate(-50%, -100%) scale(1); }\n\n.popover.popover-right .popover-container {\n  left: 100%;\n  top: 50%; }\n\n.popover.popover-right :focus + .popover-container,\n.popover.popover-right:hover .popover-container,\n.popover.popover-right .popover-container:hover {\n  -webkit-transform: translate(0, -50%) scale(1);\n  -ms-transform: translate(0, -50%) scale(1);\n  transform: translate(0, -50%) scale(1); }\n\n.popover.popover-bottom .popover-container {\n  left: 50%;\n  top: 100%; }\n\n.popover.popover-bottom :focus + .popover-container,\n.popover.popover-bottom:hover .popover-container,\n.popover.popover-bottom .popover-container:hover {\n  -webkit-transform: translate(-50%, 0) scale(1);\n  -ms-transform: translate(-50%, 0) scale(1);\n  transform: translate(-50%, 0) scale(1); }\n\n.popover.popover-left .popover-container {\n  left: 0;\n  top: 50%; }\n\n.popover.popover-left :focus + .popover-container,\n.popover.popover-left:hover .popover-container,\n.popover.popover-left .popover-container:hover {\n  -webkit-transform: translate(-100%, -50%) scale(1);\n  -ms-transform: translate(-100%, -50%) scale(1);\n  transform: translate(-100%, -50%) scale(1); }\n\n.popover .card {\n  border: 0;\n  box-shadow: 0 0.4rem 1rem rgba(69, 77, 93, 0.3); }\n\n.step {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -webkit-flex-wrap: nowrap;\n  -ms-flex-wrap: nowrap;\n  flex-wrap: nowrap;\n  list-style: none;\n  margin: .5rem 0;\n  width: 100%; }\n\n.step .step-item {\n  -webkit-flex: 1 1 0;\n  -ms-flex: 1 1 0;\n  flex: 1 1 0;\n  margin-top: 0;\n  min-height: 2rem;\n  position: relative;\n  text-align: center; }\n\n.step .step-item:not(:first-child)::before {\n  background: #5764c6;\n  content: \"\";\n  height: .2rem;\n  left: -50%;\n  position: absolute;\n  top: .9rem;\n  width: 100%; }\n\n.step .step-item a {\n  color: #acb3c2;\n  display: inline-block;\n  padding: 2rem 1rem 0;\n  text-decoration: none; }\n\n.step .step-item a::before {\n  background: #5764c6;\n  border: .2rem solid #fff;\n  border-radius: 50%;\n  content: \"\";\n  display: block;\n  height: 1.2rem;\n  left: 50%;\n  position: absolute;\n  top: .4rem;\n  -webkit-transform: translateX(-50%);\n  -ms-transform: translateX(-50%);\n  transform: translateX(-50%);\n  width: 1.2rem;\n  z-index: 1; }\n\n.step .step-item.active a::before {\n  background: #fff;\n  border: .2rem solid #5764c6; }\n\n.step .step-item.active ~ .step-item::before {\n  background: #f0f1f4; }\n\n.step .step-item.active ~ .step-item a::before {\n  background: #e7e9ed; }\n\n.tile {\n  -webkit-align-content: space-between;\n  align-content: space-between;\n  -webkit-align-items: flex-start;\n  align-items: flex-start;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -ms-flex-align: start;\n  -ms-flex-line-pack: justify; }\n\n.tile .tile-icon,\n.tile .tile-action {\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto; }\n\n.tile .tile-content {\n  -webkit-flex: 1 1 auto;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto; }\n\n.tile .tile-content:not(:first-child) {\n  padding-left: 1rem; }\n\n.tile .tile-content:not(:last-child) {\n  padding-right: 1rem; }\n\n.tile .tile-title {\n  line-height: 2rem; }\n\n.tile .tile-subtitle {\n  color: #bbc1cd;\n  line-height: 2rem; }\n\n.tile.tile-centered {\n  -webkit-align-items: center;\n  align-items: center;\n  -ms-flex-align: center; }\n\n.tile.tile-centered .tile-content {\n  overflow: hidden; }\n\n.tile.tile-centered .tile-title,\n.tile.tile-centered .tile-subtitle {\n  margin-bottom: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap; }\n\n.toast {\n  background: rgba(69, 77, 93, 0.9);\n  border: .1rem solid #454d5d;\n  border-color: #454d5d;\n  border-radius: .2rem;\n  color: #fff;\n  display: block;\n  padding: 1rem;\n  width: 100%; }\n\n.toast.toast-primary {\n  background: rgba(87, 100, 198, 0.9);\n  border-color: #5764c6; }\n\n.toast.toast-success {\n  background: rgba(50, 182, 67, 0.9);\n  border-color: #32b643; }\n\n.toast.toast-warning {\n  background: rgba(255, 183, 0, 0.9);\n  border-color: #ffb700; }\n\n.toast.toast-error {\n  background: rgba(232, 86, 0, 0.9);\n  border-color: #e85600; }\n\n.toast a {\n  color: #fff;\n  text-decoration: underline; }\n\n.toast a:focus,\n.toast a:hover,\n.toast a:active,\n.toast a.active {\n  opacity: .75; }\n\n.tooltip {\n  position: relative; }\n\n.tooltip::after {\n  background: rgba(69, 77, 93, 0.9);\n  border-radius: .2rem;\n  bottom: 100%;\n  color: #fff;\n  content: attr(data-tooltip);\n  display: block;\n  font-size: 1.2rem;\n  left: 50%;\n  max-width: 32rem;\n  opacity: 0;\n  overflow: hidden;\n  padding: .4rem .8rem;\n  pointer-events: none;\n  position: absolute;\n  text-overflow: ellipsis;\n  -webkit-transform: translate(-50%, 1rem);\n  -ms-transform: translate(-50%, 1rem);\n  transform: translate(-50%, 1rem);\n  transition: all .2s ease;\n  white-space: nowrap;\n  z-index: 200; }\n\n.tooltip:focus::after,\n.tooltip:hover::after {\n  opacity: 1;\n  -webkit-transform: translate(-50%, -0.5rem);\n  -ms-transform: translate(-50%, -0.5rem);\n  transform: translate(-50%, -0.5rem); }\n\n.tooltip[disabled],\n.tooltip.disabled {\n  pointer-events: auto; }\n\n.tooltip.tooltip-right::after {\n  bottom: 50%;\n  left: 100%;\n  -webkit-transform: translate(-1rem, 50%);\n  -ms-transform: translate(-1rem, 50%);\n  transform: translate(-1rem, 50%); }\n\n.tooltip.tooltip-right:focus::after,\n.tooltip.tooltip-right:hover::after {\n  -webkit-transform: translate(0.5rem, 50%);\n  -ms-transform: translate(0.5rem, 50%);\n  transform: translate(0.5rem, 50%); }\n\n.tooltip.tooltip-bottom::after {\n  bottom: auto;\n  top: 100%;\n  -webkit-transform: translate(-50%, -1rem);\n  -ms-transform: translate(-50%, -1rem);\n  transform: translate(-50%, -1rem); }\n\n.tooltip.tooltip-bottom:focus::after,\n.tooltip.tooltip-bottom:hover::after {\n  -webkit-transform: translate(-50%, 0.5rem);\n  -ms-transform: translate(-50%, 0.5rem);\n  transform: translate(-50%, 0.5rem); }\n\n.tooltip.tooltip-left::after {\n  bottom: 50%;\n  left: auto;\n  right: 100%;\n  -webkit-transform: translate(1rem, 50%);\n  -ms-transform: translate(1rem, 50%);\n  transform: translate(1rem, 50%); }\n\n.tooltip.tooltip-left:focus::after,\n.tooltip.tooltip-left:hover::after {\n  -webkit-transform: translate(-0.5rem, 50%);\n  -ms-transform: translate(-0.5rem, 50%);\n  transform: translate(-0.5rem, 50%); }\n\n@-webkit-keyframes loading {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg); }\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg); } }\n\n@keyframes loading {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg); }\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg); } }\n\n@-webkit-keyframes slide-down {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateY(-3rem);\n    transform: translateY(-3rem); }\n  100% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0); } }\n\n@keyframes slide-down {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateY(-3rem);\n    transform: translateY(-3rem); }\n  100% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0); } }\n\n.divider,\n.divider-vert {\n  display: block;\n  position: relative; }\n\n.divider[data-content]::after,\n.divider-vert[data-content]::after {\n  background: #fff;\n  color: #e7e9ed;\n  content: attr(data-content);\n  display: inline-block;\n  font-size: 1.2rem;\n  padding: 0 .8rem;\n  -webkit-transform: translateY(-1.1rem);\n  -ms-transform: translateY(-1.1rem);\n  transform: translateY(-1.1rem); }\n\n.divider {\n  border-top: .1rem solid #f0f1f4;\n  height: .1rem;\n  margin: 1rem 0; }\n\n.divider-vert {\n  display: block;\n  padding: 1rem; }\n\n.divider-vert::before {\n  border-left: .1rem solid #f0f1f4;\n  bottom: 1rem;\n  content: \"\";\n  display: block;\n  left: 50%;\n  position: absolute;\n  top: 1rem;\n  -webkit-transform: translateX(-50%);\n  -ms-transform: translateX(-50%);\n  transform: translateX(-50%); }\n\n.divider-vert[data-content]::after {\n  left: 50%;\n  padding: .4rem 0;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%);\n  -ms-transform: translate(-50%, -50%);\n  transform: translate(-50%, -50%); }\n\n.loading {\n  color: transparent !important;\n  min-height: 1.6rem;\n  pointer-events: none;\n  position: relative; }\n\n.loading::after {\n  -webkit-animation: loading 500ms infinite linear;\n  animation: loading 500ms infinite linear;\n  border: .2rem solid #5764c6;\n  border-radius: .8rem;\n  border-right-color: transparent;\n  border-top-color: transparent;\n  content: \"\";\n  display: block;\n  height: 1.6rem;\n  left: 50%;\n  margin-left: -.8rem;\n  margin-top: -.8rem;\n  position: absolute;\n  top: 50%;\n  width: 1.6rem;\n  z-index: 1; }\n\n.clearfix::after,\n.container::after {\n  clear: both;\n  content: \"\";\n  display: table; }\n\n.float-left {\n  float: left !important; }\n\n.float-right {\n  float: right !important; }\n\n.rel {\n  position: relative; }\n\n.abs {\n  position: absolute; }\n\n.fixed {\n  position: fixed; }\n\n.centered {\n  display: block;\n  float: none;\n  margin-left: auto;\n  margin-right: auto; }\n\n.mt-10 {\n  margin-top: 1rem; }\n\n.mr-10 {\n  margin-right: 1rem; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.ml-10 {\n  margin-left: 1rem; }\n\n.mt-5 {\n  margin-top: .5rem; }\n\n.mr-5 {\n  margin-right: .5rem; }\n\n.mb-5 {\n  margin-bottom: .5rem; }\n\n.ml-5 {\n  margin-left: .5rem; }\n\n.pt-10 {\n  padding-top: 1rem; }\n\n.pr-10 {\n  padding-right: 1rem; }\n\n.pb-10 {\n  padding-bottom: 1rem; }\n\n.pl-10 {\n  padding-left: 1rem; }\n\n.pt-5 {\n  padding-top: .5rem; }\n\n.pr-5 {\n  padding-right: .5rem; }\n\n.pb-5 {\n  padding-bottom: .5rem; }\n\n.pl-5 {\n  padding-left: .5rem; }\n\n.block {\n  display: block; }\n\n.inline {\n  display: inline; }\n\n.inline-block {\n  display: inline-block; }\n\n.flex {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex; }\n\n.inline-flex {\n  display: inline-flex;\n  display: -ms-inline-flexbox;\n  display: -webkit-inline-flex; }\n\n.hide {\n  display: none !important; }\n\n.visible {\n  visibility: visible; }\n\n.invisible {\n  visibility: hidden; }\n\n.text-hide {\n  background: transparent;\n  border: 0;\n  color: transparent;\n  font-size: 0;\n  line-height: 0;\n  text-shadow: none; }\n\n.text-assistive {\n  border: 0;\n  clip: rect(0, 0, 0, 0);\n  height: .1rem;\n  margin: -.1rem;\n  overflow: hidden;\n  padding: 0;\n  position: absolute;\n  width: .1rem; }\n\n.text-left {\n  text-align: left; }\n\n.text-right {\n  text-align: right; }\n\n.text-center {\n  text-align: center; }\n\n.text-justify {\n  text-align: justify; }\n\n.text-lowercase {\n  text-transform: lowercase; }\n\n.text-uppercase {\n  text-transform: uppercase; }\n\n.text-capitalize {\n  text-transform: capitalize; }\n\n.text-normal {\n  font-weight: normal; }\n\n.text-bold {\n  font-weight: bold; }\n\n.text-italic {\n  font-style: italic; }\n\n.text-large {\n  font-size: 1.2em; }\n\n.text-ellipsis {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap; }\n\n.text-clip {\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap; }\n\n.text-break {\n  -webkit-hyphens: auto;\n  -ms-hyphens: auto;\n  hyphens: auto;\n  word-break: break-word;\n  word-wrap: break-word; }\n\n.hand {\n  cursor: pointer; }\n\n.shadow-0 {\n  box-shadow: 0 0 0.2rem rgba(69, 77, 93, 0.3); }\n\n.shadow-1 {\n  box-shadow: 0 0.1rem 0.4rem rgba(69, 77, 93, 0.3); }\n\n.shadow-2 {\n  box-shadow: 0 0.2rem 0.6rem rgba(69, 77, 93, 0.3); }\n\n.shadow-3 {\n  box-shadow: 0 0.3rem 0.8rem rgba(69, 77, 93, 0.3); }\n\n.shadow-4 {\n  box-shadow: 0 0.4rem 1rem rgba(69, 77, 93, 0.3); }\n\n.rounded {\n  border-radius: .2rem; }\n\n.circle {\n  border-radius: 50%; }\n", ""]);

// exports


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(18);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../css-loader/index.js!../../sass-loader/lib/loader.js!./spectre-icons.css", function() {
			var newContent = require("!!../../css-loader/index.js!../../sass-loader/lib/loader.js!./spectre-icons.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*! Spectre.css Icons | MIT License | github.com/picturepan2/spectre */\n.icon {\n  box-sizing: border-box;\n  display: inline-block;\n  font-size: inherit;\n  font-style: normal;\n  height: 1em;\n  position: relative;\n  text-indent: -999rem;\n  vertical-align: middle;\n  width: 1em; }\n\n.icon::before,\n.icon::after {\n  display: block;\n  left: 50%;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%);\n  -ms-transform: translate(-50%, -50%);\n  transform: translate(-50%, -50%); }\n\n.icon-arrow-down::before,\n.icon-arrow-left::before,\n.icon-arrow-right::before,\n.icon-arrow-up::before,\n.icon-downward::before,\n.icon-back::before,\n.icon-forward::before,\n.icon-upward::before {\n  border: .2rem solid currentColor;\n  border-bottom: 0;\n  border-right: 0;\n  content: \"\";\n  height: .65em;\n  -webkit-transform: translate(-25%, -50%) rotate(-45deg);\n  -ms-transform: translate(-25%, -50%) rotate(-45deg);\n  transform: translate(-25%, -50%) rotate(-45deg);\n  width: .65em; }\n\n.icon-arrow-down,\n.icon-downward {\n  -webkit-transform: rotate(-90deg);\n  -ms-transform: rotate(-90deg);\n  transform: rotate(-90deg); }\n\n.icon-arrow-right,\n.icon-forward {\n  -webkit-transform: rotate(180deg);\n  -ms-transform: rotate(180deg);\n  transform: rotate(180deg); }\n\n.icon-arrow-up,\n.icon-upward {\n  -webkit-transform: rotate(90deg);\n  -ms-transform: rotate(90deg);\n  transform: rotate(90deg); }\n\n.icon-downward::before,\n.icon-back::before,\n.icon-forward::before,\n.icon-upward::before {\n  -webkit-transform: translate(-50%, -50%) rotate(-45deg);\n  -ms-transform: translate(-50%, -50%) rotate(-45deg);\n  transform: translate(-50%, -50%) rotate(-45deg); }\n\n.icon-downward::after,\n.icon-back::after,\n.icon-forward::after,\n.icon-upward::after {\n  background: currentColor;\n  content: \"\";\n  height: .2rem;\n  left: 55%;\n  width: .8em; }\n\n.icon-caret::before {\n  border-left: .3em solid transparent;\n  border-right: .3em solid transparent;\n  border-top: .3em solid currentColor;\n  content: \"\";\n  height: 0;\n  -webkit-transform: translate(-50%, -25%);\n  -ms-transform: translate(-50%, -25%);\n  transform: translate(-50%, -25%);\n  width: 0; }\n\n.icon-menu::before {\n  background: currentColor;\n  box-shadow: 0 -.35em, 0 .35em;\n  content: \"\";\n  height: .2rem;\n  width: 100%; }\n\n.icon-apps::before {\n  background: currentColor;\n  box-shadow: -.35em -.35em, -.35em 0, -.35em .35em, 0 -.35em, 0 .35em, .35em -.35em, .35em 0, .35em .35em;\n  content: \"\";\n  height: .3rem;\n  width: .3rem; }\n\n.icon-resize-horiz::before,\n.icon-resize-vert::before,\n.icon-resize-horiz::after,\n.icon-resize-vert::after {\n  border: .2rem solid currentColor;\n  border-bottom: 0;\n  border-right: 0;\n  content: \"\";\n  height: .45em;\n  width: .45em; }\n\n.icon-resize-horiz::before,\n.icon-resize-vert::before {\n  -webkit-transform: translate(-50%, -90%) rotate(45deg);\n  -ms-transform: translate(-50%, -90%) rotate(45deg);\n  transform: translate(-50%, -90%) rotate(45deg); }\n\n.icon-resize-horiz::after,\n.icon-resize-vert::after {\n  -webkit-transform: translate(-50%, -10%) rotate(225deg);\n  -ms-transform: translate(-50%, -10%) rotate(225deg);\n  transform: translate(-50%, -10%) rotate(225deg); }\n\n.icon-resize-horiz::before {\n  -webkit-transform: translate(-90%, -50%) rotate(-45deg);\n  -ms-transform: translate(-90%, -50%) rotate(-45deg);\n  transform: translate(-90%, -50%) rotate(-45deg); }\n\n.icon-resize-horiz::after {\n  -webkit-transform: translate(-10%, -50%) rotate(135deg);\n  -ms-transform: translate(-10%, -50%) rotate(135deg);\n  transform: translate(-10%, -50%) rotate(135deg); }\n\n.icon-more-horiz::before,\n.icon-more-vert::before {\n  background: currentColor;\n  border-radius: 50%;\n  box-shadow: -.4em 0, .4em 0;\n  content: \"\";\n  height: .3rem;\n  width: .3rem; }\n\n.icon-more-vert::before {\n  box-shadow: 0 -.4em, 0 .4em; }\n\n.icon-plus::before,\n.icon-minus::before,\n.icon-cross::before {\n  background: currentColor;\n  content: \"\";\n  height: .2rem;\n  width: 100%; }\n\n.icon-plus::after,\n.icon-cross::after {\n  background: currentColor;\n  content: \"\";\n  height: 100%;\n  width: .2rem; }\n\n.icon-cross::before {\n  width: 100%; }\n\n.icon-cross::after {\n  height: 100%; }\n\n.icon-cross::before,\n.icon-cross::after {\n  -webkit-transform: translate(-50%, -50%) rotate(45deg);\n  -ms-transform: translate(-50%, -50%) rotate(45deg);\n  transform: translate(-50%, -50%) rotate(45deg); }\n\n.icon-check::before {\n  border: .2rem solid currentColor;\n  border-right: 0;\n  border-top: 0;\n  content: \"\";\n  height: .5em;\n  -webkit-transform: translate(-50%, -75%) rotate(-45deg);\n  -ms-transform: translate(-50%, -75%) rotate(-45deg);\n  transform: translate(-50%, -75%) rotate(-45deg);\n  width: .9em; }\n\n.icon-stop {\n  border: .2rem solid currentColor;\n  border-radius: 50%; }\n\n.icon-stop::before {\n  background: currentColor;\n  content: \"\";\n  height: .2rem;\n  -webkit-transform: translate(-50%, -50%) rotate(45deg);\n  -ms-transform: translate(-50%, -50%) rotate(45deg);\n  transform: translate(-50%, -50%) rotate(45deg);\n  width: 1em; }\n\n.icon-shutdown {\n  border: .2rem solid currentColor;\n  border-radius: 50%;\n  border-top-color: transparent; }\n\n.icon-shutdown::before {\n  background: currentColor;\n  content: \"\";\n  height: .5em;\n  top: .1em;\n  width: .2rem; }\n\n.icon-refresh::before {\n  border: .2rem solid currentColor;\n  border-radius: 50%;\n  border-right-color: transparent;\n  content: \"\";\n  height: 1em;\n  width: 1em; }\n\n.icon-refresh::after {\n  border: .2em solid currentColor;\n  border-left-color: transparent;\n  border-top-color: transparent;\n  content: \"\";\n  height: 0;\n  left: 80%;\n  top: 20%;\n  width: 0; }\n\n.icon-search::before {\n  border: .2rem solid currentColor;\n  border-radius: 50%;\n  content: \"\";\n  height: .75em;\n  left: 5%;\n  top: 5%;\n  -webkit-transform: translate(0, 0) rotate(45deg);\n  -ms-transform: translate(0, 0) rotate(45deg);\n  transform: translate(0, 0) rotate(45deg);\n  width: .75em; }\n\n.icon-search::after {\n  background: currentColor;\n  content: \"\";\n  height: .2rem;\n  left: 80%;\n  top: 80%;\n  -webkit-transform: translate(-50%, -50%) rotate(45deg);\n  -ms-transform: translate(-50%, -50%) rotate(45deg);\n  transform: translate(-50%, -50%) rotate(45deg);\n  width: .4em; }\n\n.icon-edit::before {\n  border: .2rem solid currentColor;\n  content: \"\";\n  height: .4em;\n  -webkit-transform: translate(-40%, -60%) rotate(-45deg);\n  -ms-transform: translate(-40%, -60%) rotate(-45deg);\n  transform: translate(-40%, -60%) rotate(-45deg);\n  width: .85em; }\n\n.icon-edit::after {\n  border: .15em solid currentColor;\n  border-right-color: transparent;\n  border-top-color: transparent;\n  content: \"\";\n  height: 0;\n  left: 5%;\n  top: 95%;\n  -webkit-transform: translate(0, -100%);\n  -ms-transform: translate(0, -100%);\n  transform: translate(0, -100%);\n  width: 0; }\n\n.icon-delete::before {\n  border: .2rem solid currentColor;\n  border-bottom-left-radius: .2rem;\n  border-bottom-right-radius: .2rem;\n  border-top: 0;\n  content: \"\";\n  height: .75em;\n  top: 60%;\n  width: .75em; }\n\n.icon-delete::after {\n  background: currentColor;\n  box-shadow: -.25em .2em, .25em .2em;\n  content: \"\";\n  height: .2rem;\n  top: .1rem;\n  width: .5em; }\n\n.icon-share {\n  border: .2rem solid currentColor;\n  border-radius: .2rem;\n  border-right: 0;\n  border-top: 0; }\n\n.icon-share::before {\n  border: .2rem solid currentColor;\n  border-left: 0;\n  border-top: 0;\n  content: \"\";\n  height: .4em;\n  left: 100%;\n  top: .25em;\n  -webkit-transform: translate(-125%, -50%) rotate(-45deg);\n  -ms-transform: translate(-125%, -50%) rotate(-45deg);\n  transform: translate(-125%, -50%) rotate(-45deg);\n  width: .4em; }\n\n.icon-share::after {\n  border: .2rem solid currentColor;\n  border-bottom: 0;\n  border-radius: 75% 0;\n  border-right: 0;\n  content: \"\";\n  height: .5em;\n  width: .6em; }\n\n.icon-flag::before {\n  background: currentColor;\n  content: \"\";\n  height: 1em;\n  left: 15%;\n  width: .2rem; }\n\n.icon-flag::after {\n  border: .2rem solid currentColor;\n  border-bottom-right-radius: .2rem;\n  border-left: 0;\n  border-top-right-radius: .2rem;\n  content: \"\";\n  height: .65em;\n  left: 60%;\n  top: 35%;\n  width: .8em; }\n\n.icon-bookmark::before {\n  border: .2rem solid currentColor;\n  border-bottom: 0;\n  border-top-left-radius: .2rem;\n  border-top-right-radius: .2rem;\n  content: \"\";\n  height: .9em;\n  width: .8em; }\n\n.icon-bookmark::after {\n  border: .2rem solid currentColor;\n  border-bottom: 0;\n  border-left: 0;\n  border-radius: .2rem;\n  content: \"\";\n  height: .5em;\n  -webkit-transform: translate(-50%, 35%) rotate(-45deg) skew(15deg, 15deg);\n  -ms-transform: translate(-50%, 35%) rotate(-45deg) skew(15deg, 15deg);\n  transform: translate(-50%, 35%) rotate(-45deg) skew(15deg, 15deg);\n  width: .5em; }\n\n.icon-download,\n.icon-upload {\n  border-bottom: .2rem solid currentColor; }\n\n.icon-download::before,\n.icon-upload::before {\n  border: .2rem solid currentColor;\n  border-bottom: 0;\n  border-right: 0;\n  content: \"\";\n  height: .5em;\n  -webkit-transform: translate(-50%, -60%) rotate(-135deg);\n  -ms-transform: translate(-50%, -60%) rotate(-135deg);\n  transform: translate(-50%, -60%) rotate(-135deg);\n  width: .5em; }\n\n.icon-download::after,\n.icon-upload::after {\n  background: currentColor;\n  content: \"\";\n  height: .6em;\n  top: 40%;\n  width: .2rem; }\n\n.icon-upload::before {\n  -webkit-transform: translate(-50%, -60%) rotate(45deg);\n  -ms-transform: translate(-50%, -60%) rotate(45deg);\n  transform: translate(-50%, -60%) rotate(45deg); }\n\n.icon-upload::after {\n  top: 50%; }\n\n.icon-time {\n  border: .2rem solid currentColor;\n  border-radius: 50%; }\n\n.icon-time::before {\n  background: currentColor;\n  content: \"\";\n  height: .4em;\n  -webkit-transform: translate(-50%, -75%);\n  -ms-transform: translate(-50%, -75%);\n  transform: translate(-50%, -75%);\n  width: .2rem; }\n\n.icon-time::after {\n  background: currentColor;\n  content: \"\";\n  height: .3em;\n  -webkit-transform: translate(-50%, -75%) rotate(90deg);\n  -ms-transform: translate(-50%, -75%) rotate(90deg);\n  transform: translate(-50%, -75%) rotate(90deg);\n  -webkit-transform-origin: 50% 90%;\n  -ms-transform-origin: 50% 90%;\n  transform-origin: 50% 90%;\n  width: .2rem; }\n\n.icon-mail::before {\n  border: .2rem solid currentColor;\n  border-radius: .2rem;\n  content: \"\";\n  height: .8em;\n  width: 1em; }\n\n.icon-mail::after {\n  border: .2rem solid currentColor;\n  border-right: 0;\n  border-top: 0;\n  content: \"\";\n  height: .5em;\n  -webkit-transform: translate(-50%, -90%) rotate(-45deg) skew(10deg, 10deg);\n  -ms-transform: translate(-50%, -90%) rotate(-45deg) skew(10deg, 10deg);\n  transform: translate(-50%, -90%) rotate(-45deg) skew(10deg, 10deg);\n  width: .5em; }\n\n.icon-people::before {\n  border: .2rem solid currentColor;\n  border-radius: 50%;\n  content: \"\";\n  height: .45em;\n  top: 25%;\n  width: .45em; }\n\n.icon-people::after {\n  border: .2rem solid currentColor;\n  border-radius: 50% 50% 0 0;\n  content: \"\";\n  height: .4em;\n  top: 75%;\n  width: .9em; }\n\n.icon-message {\n  border: .2rem solid currentColor;\n  border-bottom: 0;\n  border-radius: .2rem;\n  border-right: 0; }\n\n.icon-message::before {\n  border: .2rem solid currentColor;\n  border-bottom-right-radius: .2rem;\n  border-left: 0;\n  border-top: 0;\n  content: \"\";\n  height: .8em;\n  left: 65%;\n  top: 40%;\n  width: .7em; }\n\n.icon-message::after {\n  background: currentColor;\n  border-radius: .2rem;\n  content: \"\";\n  height: .3em;\n  left: 10%;\n  top: 100%;\n  -webkit-transform: translate(0, -90%) rotate(45deg);\n  -ms-transform: translate(0, -90%) rotate(45deg);\n  transform: translate(0, -90%) rotate(45deg);\n  width: .2rem; }\n\n.icon-photo {\n  border: .2rem solid currentColor;\n  border-radius: .2rem; }\n\n.icon-photo::before {\n  border: .2rem solid currentColor;\n  border-radius: 50%;\n  content: \"\";\n  height: .25em;\n  left: 35%;\n  top: 35%;\n  width: .25em; }\n\n.icon-photo::after {\n  border: .2rem solid currentColor;\n  border-bottom: 0;\n  border-left: 0;\n  content: \"\";\n  height: .5em;\n  left: 60%;\n  -webkit-transform: translate(-50%, 25%) rotate(-45deg);\n  -ms-transform: translate(-50%, 25%) rotate(-45deg);\n  transform: translate(-50%, 25%) rotate(-45deg);\n  width: .5em; }\n\n.icon-link::before,\n.icon-link::after {\n  border: .2rem solid currentColor;\n  border-radius: 5em 0 0 5em;\n  border-right: 0;\n  content: \"\";\n  height: .5em;\n  width: .75em; }\n\n.icon-link::before {\n  -webkit-transform: translate(-70%, -45%) rotate(-45deg);\n  -ms-transform: translate(-70%, -45%) rotate(-45deg);\n  transform: translate(-70%, -45%) rotate(-45deg); }\n\n.icon-link::after {\n  -webkit-transform: translate(-30%, -55%) rotate(135deg);\n  -ms-transform: translate(-30%, -55%) rotate(135deg);\n  transform: translate(-30%, -55%) rotate(135deg); }\n\n.icon-location::before {\n  border: .2rem solid currentColor;\n  border-radius: 50% 50% 50% 0;\n  content: \"\";\n  height: .8em;\n  -webkit-transform: translate(-50%, -60%) rotate(-45deg);\n  -ms-transform: translate(-50%, -60%) rotate(-45deg);\n  transform: translate(-50%, -60%) rotate(-45deg);\n  width: .8em; }\n\n.icon-location::after {\n  border: .2rem solid currentColor;\n  border-radius: 50%;\n  content: \"\";\n  height: .2em;\n  -webkit-transform: translate(-50%, -80%);\n  -ms-transform: translate(-50%, -80%);\n  transform: translate(-50%, -80%);\n  width: .2em; }\n\n.icon-emoji {\n  border: .2rem solid currentColor;\n  border-radius: 50%; }\n\n.icon-emoji::before {\n  border-radius: 50%;\n  box-shadow: -.17em -.15em, .17em -.15em;\n  content: \"\";\n  height: .1em;\n  width: .1em; }\n\n.icon-emoji::after {\n  border: .2rem solid currentColor;\n  border-bottom-color: transparent;\n  border-radius: 50%;\n  border-right-color: transparent;\n  content: \"\";\n  height: .5em;\n  -webkit-transform: translate(-50%, -40%) rotate(-135deg);\n  -ms-transform: translate(-50%, -40%) rotate(-135deg);\n  transform: translate(-50%, -40%) rotate(-135deg);\n  width: .5em; }\n\n.btn .icon,\n.toast .icon,\n.menu .icon {\n  vertical-align: -10%; }\n", ""]);

// exports


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(20);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../css-loader/index.js!../../sass-loader/lib/loader.js!./spectre-exp.css", function() {
			var newContent = require("!!../../css-loader/index.js!../../sass-loader/lib/loader.js!./spectre-exp.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*! Spectre.css Experimentals | MIT License | github.com/picturepan2/spectre */\n.accordion .accordion-item input:checked ~ .accordion-body {\n  max-height: 100rem;\n  transition: max-height 3s ease; }\n\n.accordion .accordion-item .accordion-header {\n  background: #f8f9fa;\n  display: block;\n  padding: 1rem 1.6rem; }\n\n.accordion .accordion-item .accordion-body {\n  margin-bottom: .8rem;\n  max-height: 0;\n  overflow: hidden;\n  padding: .2rem .8rem;\n  transition: max-height .3s ease; }\n\n.calendar {\n  border: .1rem solid #f0f1f4;\n  border-radius: .2rem;\n  display: block;\n  min-width: 28rem;\n  text-align: center; }\n\n.calendar .calendar-nav {\n  -webkit-align-items: center;\n  align-items: center;\n  background: #f8f9fa;\n  border-top-left-radius: .2rem;\n  border-top-right-radius: .2rem;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -ms-flex-align: center;\n  font-size: 1.6rem;\n  padding: 1rem; }\n\n.calendar .calendar-header,\n.calendar .calendar-body {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -ms-flex-pack: center;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -webkit-justify-content: center;\n  justify-content: center;\n  padding: 1rem 0; }\n\n.calendar .calendar-header .calendar-date,\n.calendar .calendar-body .calendar-date {\n  -webkit-flex: 0 0 14.28%;\n  -ms-flex: 0 0 14.28%;\n  flex: 0 0 14.28%;\n  max-width: 14.28%; }\n\n.calendar .calendar-header {\n  background: #f8f9fa;\n  border-bottom: .1rem solid #f0f1f4;\n  color: #acb3c2;\n  font-size: 1.2rem; }\n\n.calendar .calendar-body {\n  color: #727e96; }\n\n.calendar .calendar-date {\n  border: 0;\n  padding: .4rem; }\n\n.calendar .calendar-date .date-item {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  background: transparent;\n  border: .1rem solid transparent;\n  border-radius: 50%;\n  color: #727e96;\n  cursor: pointer;\n  height: 2.8rem;\n  line-height: 2rem;\n  outline: none;\n  padding: .3rem;\n  position: relative;\n  text-align: center;\n  text-decoration: none;\n  transition: all .2s ease;\n  vertical-align: middle;\n  white-space: nowrap;\n  width: 2.8rem; }\n\n.calendar .calendar-date .date-item.date-today {\n  border-color: #e4e6f6;\n  color: #5764c6; }\n\n.calendar .calendar-date .date-item:focus {\n  box-shadow: 0 0 0 0.2rem rgba(87, 100, 198, 0.15); }\n\n.calendar .calendar-date .date-item:focus,\n.calendar .calendar-date .date-item:hover {\n  background: #fbfbfe;\n  border-color: #e4e6f6;\n  color: #5764c6;\n  text-decoration: none; }\n\n.calendar .calendar-date .date-item:active,\n.calendar .calendar-date .date-item.active {\n  background: #4c59c2;\n  border-color: #3e4cb6;\n  color: #fff; }\n\n.calendar .calendar-date .date-item.badge::after {\n  position: absolute;\n  right: .3rem;\n  top: .3rem;\n  -webkit-transform: translate(50%, -50%);\n  -ms-transform: translate(50%, -50%);\n  transform: translate(50%, -50%); }\n\n.calendar .calendar-date.disabled .date-item,\n.calendar .calendar-date.disabled .calendar-event,\n.calendar .calendar-date .date-item:disabled,\n.calendar .calendar-date .calendar-event:disabled {\n  cursor: default;\n  opacity: .25;\n  pointer-events: none; }\n\n.calendar .calendar-range {\n  position: relative; }\n\n.calendar .calendar-range::before {\n  background: #eff1fa;\n  content: \"\";\n  height: 2.8rem;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 50%;\n  -webkit-transform: translateY(-50%);\n  -ms-transform: translateY(-50%);\n  transform: translateY(-50%); }\n\n.calendar .calendar-range.range-start::before {\n  left: 50%; }\n\n.calendar .calendar-range.range-end::before {\n  right: 50%; }\n\n.calendar .calendar-range .date-item {\n  color: #5764c6; }\n\n.calendar.calendar-lg .calendar-body {\n  padding: 0; }\n\n.calendar.calendar-lg .calendar-body .calendar-date {\n  border-bottom: .1rem solid #f0f1f4;\n  border-right: .1rem solid #f0f1f4;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  height: 11rem;\n  padding: 0; }\n\n.calendar.calendar-lg .calendar-body .calendar-date:nth-child(7n) {\n  border-right: 0; }\n\n.calendar.calendar-lg .calendar-body .calendar-date:nth-last-child(-n+7) {\n  border-bottom: 0; }\n\n.calendar.calendar-lg .date-item {\n  -webkit-align-self: flex-end;\n  align-self: flex-end;\n  -ms-flex-item-align: end;\n  height: 2.8rem;\n  margin-right: .5rem;\n  margin-top: .5rem; }\n\n.calendar.calendar-lg .calendar-range::before {\n  top: 1.9rem; }\n\n.calendar.calendar-lg .calendar-range.range-start::before {\n  left: auto;\n  width: 1.9rem; }\n\n.calendar.calendar-lg .calendar-range.range-end::before {\n  right: 1.9rem; }\n\n.calendar.calendar-lg .calendar-events {\n  -webkit-flex-grow: 1;\n  flex-grow: 1;\n  -ms-flex-positive: 1;\n  line-height: 1;\n  overflow-y: auto;\n  padding: .5rem; }\n\n.calendar.calendar-lg .calendar-event {\n  background: #eff1fa;\n  border-radius: .2rem;\n  color: #5764c6;\n  display: block;\n  font-size: 1.2rem;\n  margin: .2rem auto;\n  overflow: hidden;\n  padding: .3rem .4rem;\n  text-align: left;\n  text-overflow: ellipsis;\n  vertical-align: baseline;\n  white-space: nowrap; }\n\n.carousel {\n  background: #f8f9fa;\n  display: block;\n  overflow: hidden;\n  position: relative;\n  width: 100%; }\n\n.carousel .carousel-container {\n  height: 100%;\n  left: 0;\n  position: relative; }\n\n.carousel .carousel-container::before {\n  content: \"\";\n  display: block;\n  padding-bottom: 56.25%; }\n\n.carousel .carousel-container .carousel-item {\n  -webkit-animation: carousel-slideout 1s ease-in-out 1;\n  animation: carousel-slideout 1s ease-in-out 1;\n  height: 100%;\n  left: 0;\n  margin: 0;\n  opacity: 0;\n  position: absolute;\n  top: 0;\n  width: 100%; }\n\n.carousel .carousel-container .carousel-item:hover .item-prev,\n.carousel .carousel-container .carousel-item:hover .item-next {\n  opacity: 1; }\n\n.carousel .carousel-container .item-prev,\n.carousel .carousel-container .item-next {\n  background: rgba(231, 233, 237, 0.25);\n  border-color: rgba(231, 233, 237, 0.5);\n  color: #e7e9ed;\n  opacity: 0;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: translateY(-50%);\n  -ms-transform: translateY(-50%);\n  transform: translateY(-50%);\n  transition: all .4s ease;\n  z-index: 200; }\n\n.carousel .carousel-container .item-prev {\n  left: 2rem; }\n\n.carousel .carousel-container .item-next {\n  right: 2rem; }\n\n.carousel .carousel-locator:nth-of-type(1):checked ~ .carousel-container .carousel-item:nth-of-type(1),\n.carousel .carousel-locator:nth-of-type(2):checked ~ .carousel-container .carousel-item:nth-of-type(2),\n.carousel .carousel-locator:nth-of-type(3):checked ~ .carousel-container .carousel-item:nth-of-type(3),\n.carousel .carousel-locator:nth-of-type(4):checked ~ .carousel-container .carousel-item:nth-of-type(4) {\n  -webkit-animation: carousel-slidein .75s ease-in-out 1;\n  animation: carousel-slidein .75s ease-in-out 1;\n  opacity: 1;\n  z-index: 100; }\n\n.carousel .carousel-locator:nth-of-type(1):checked ~ .carousel-nav .nav-item:nth-of-type(1),\n.carousel .carousel-locator:nth-of-type(2):checked ~ .carousel-nav .nav-item:nth-of-type(2),\n.carousel .carousel-locator:nth-of-type(3):checked ~ .carousel-nav .nav-item:nth-of-type(3),\n.carousel .carousel-locator:nth-of-type(4):checked ~ .carousel-nav .nav-item:nth-of-type(4) {\n  color: #e7e9ed; }\n\n.carousel .carousel-nav {\n  bottom: 1rem;\n  display: -webkit-flex;\n  display: flex;\n  display: -ms-flexbox;\n  -ms-flex-pack: center;\n  -webkit-justify-content: center;\n  justify-content: center;\n  left: 50%;\n  position: absolute;\n  -webkit-transform: translateX(-50%);\n  -ms-transform: translateX(-50%);\n  transform: translateX(-50%);\n  width: 20rem;\n  z-index: 200; }\n\n.carousel .carousel-nav .nav-item {\n  color: rgba(231, 233, 237, 0.5);\n  display: block;\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  height: 4rem;\n  margin: .4rem;\n  max-width: 5rem;\n  position: relative; }\n\n.carousel .carousel-nav .nav-item::before {\n  background: currentColor;\n  content: \"\";\n  display: block;\n  height: .3rem;\n  position: absolute;\n  top: 2rem;\n  width: 100%; }\n\n@-webkit-keyframes carousel-slidein {\n  0% {\n    -webkit-transform: translateX(100%);\n    transform: translateX(100%); }\n  100% {\n    -webkit-transform: translateX(0);\n    transform: translateX(0); } }\n\n@keyframes carousel-slidein {\n  0% {\n    -webkit-transform: translateX(100%);\n    transform: translateX(100%); }\n  100% {\n    -webkit-transform: translateX(0);\n    transform: translateX(0); } }\n\n@-webkit-keyframes carousel-slideout {\n  0% {\n    opacity: 1;\n    -webkit-transform: translateX(0);\n    transform: translateX(0); }\n  100% {\n    opacity: 1;\n    -webkit-transform: translateX(-50%);\n    transform: translateX(-50%); } }\n\n@keyframes carousel-slideout {\n  0% {\n    opacity: 1;\n    -webkit-transform: translateX(0);\n    transform: translateX(0); }\n  100% {\n    opacity: 1;\n    -webkit-transform: translateX(-50%);\n    transform: translateX(-50%); } }\n\n.comparison-slider {\n  height: 50vh;\n  overflow: hidden;\n  position: relative;\n  width: 100%; }\n\n.comparison-slider .comparison-before,\n.comparison-slider .comparison-after {\n  height: 100%;\n  left: 0;\n  margin: 0;\n  overflow: hidden;\n  position: absolute;\n  top: 0; }\n\n.comparison-slider .comparison-before img,\n.comparison-slider .comparison-after img {\n  height: 100%;\n  object-fit: none;\n  object-position: left top;\n  position: absolute;\n  width: 100%;\n  z-index: -1; }\n\n.comparison-slider .comparison-before {\n  width: 100%; }\n\n.comparison-slider .comparison-before .comparison-label {\n  right: 1.6rem; }\n\n.comparison-slider .comparison-after {\n  max-width: 100%;\n  min-width: 0;\n  z-index: 1; }\n\n.comparison-slider .comparison-after::before {\n  background: transparent;\n  content: \"\";\n  cursor: default;\n  height: 100%;\n  left: 0;\n  position: absolute;\n  right: 1.6rem;\n  top: 0;\n  z-index: 1; }\n\n.comparison-slider .comparison-after::after {\n  background: currentColor;\n  border-radius: 50%;\n  box-shadow: 0 -.5rem, 0 .5rem;\n  color: #fff;\n  content: \"\";\n  height: .3rem;\n  position: absolute;\n  right: .8rem;\n  top: 50%;\n  -webkit-transform: translate(50%, -50%);\n  -ms-transform: translate(50%, -50%);\n  transform: translate(50%, -50%);\n  width: .3rem;\n  z-index: -1; }\n\n.comparison-slider .comparison-after .comparison-label {\n  left: 1.6rem; }\n\n.comparison-slider .comparison-resizer {\n  -webkit-animation: first-run 1.5s 1 ease-in-out;\n  animation: first-run 1.5s 1 ease-in-out;\n  cursor: ew-resize;\n  height: 1.5rem;\n  left: 0;\n  max-width: 100%;\n  min-width: 1.6rem;\n  opacity: 0;\n  outline: none;\n  position: relative;\n  resize: horizontal;\n  top: 50%;\n  -webkit-transform: translateY(-50%) scaleY(30);\n  -ms-transform: translateY(-50%) scaleY(30);\n  transform: translateY(-50%) scaleY(30);\n  width: 0; }\n\n.comparison-slider .comparison-label {\n  background: rgba(69, 77, 93, 0.5);\n  bottom: 1.6rem;\n  color: #fff;\n  padding: .3rem .8rem;\n  position: absolute;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none; }\n\n@-webkit-keyframes first-run {\n  0% {\n    width: 0; }\n  25% {\n    width: 4.8rem; }\n  50% {\n    width: 1.6rem; }\n  75% {\n    width: 2.4rem; }\n  100% {\n    width: 0; } }\n\n@keyframes first-run {\n  0% {\n    width: 0; }\n  25% {\n    width: 4.8rem; }\n  50% {\n    width: 1.6rem; }\n  75% {\n    width: 2.4rem; }\n  100% {\n    width: 0; } }\n\n.filter .filter-nav {\n  margin: 1rem 0; }\n\n.filter .filter-body {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap; }\n\n.filter .filter-tag#tag-all:checked ~ .filter-nav .chip[for=\"tag-all\"],\n.filter .filter-tag#tag-action:checked ~ .filter-nav .chip[for=\"tag-action\"],\n.filter .filter-tag#tag-roleplaying:checked ~ .filter-nav .chip[for=\"tag-roleplaying\"],\n.filter .filter-tag#tag-shooter:checked ~ .filter-nav .chip[for=\"tag-shooter\"],\n.filter .filter-tag#tag-sports:checked ~ .filter-nav .chip[for=\"tag-sports\"] {\n  background: #5764c6;\n  color: #fff; }\n\n.filter .filter-tag#tag-action:checked ~ .filter-body .column:not([data-tag~=\"tag-action\"]),\n.filter .filter-tag#tag-roleplaying:checked ~ .filter-body .column:not([data-tag~=\"tag-roleplaying\"]),\n.filter .filter-tag#tag-shooter:checked ~ .filter-body .column:not([data-tag~=\"tag-shooter\"]),\n.filter .filter-tag#tag-sports:checked ~ .filter-body .column:not([data-tag~=\"tag-sports\"]) {\n  display: none; }\n\n.meter {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  background: #f8f9fa;\n  border: 0;\n  border-radius: .2rem;\n  display: block;\n  height: 1.6rem;\n  width: 100%; }\n\n.meter::-webkit-meter-inner-element {\n  display: block; }\n\n.meter::-webkit-meter-bar,\n.meter::-webkit-meter-optimum-value,\n.meter::-webkit-meter-suboptimum-value,\n.meter::-webkit-meter-even-less-good-value {\n  border-radius: .2rem; }\n\n.meter::-webkit-meter-bar {\n  background: #f8f9fa; }\n\n.meter::-webkit-meter-optimum-value {\n  background: #32b643; }\n\n.meter::-webkit-meter-suboptimum-value {\n  background: #ffb700; }\n\n.meter::-webkit-meter-even-less-good-value {\n  background: #e85600; }\n\n.meter::-moz-meter-bar,\n.meter:-moz-meter-optimum,\n.meter:-moz-meter-sub-optimum,\n.meter:-moz-meter-sub-sub-optimum {\n  border-radius: .2rem; }\n\n.meter:-moz-meter-optimum::-moz-meter-bar {\n  background: #32b643; }\n\n.meter:-moz-meter-sub-optimum::-moz-meter-bar {\n  background: #ffb700; }\n\n.meter:-moz-meter-sub-sub-optimum::-moz-meter-bar {\n  background: #e85600; }\n\n.parallax {\n  display: block;\n  height: auto;\n  position: relative;\n  width: auto; }\n\n.parallax .parallax-content {\n  box-shadow: 0 2rem 4.2rem rgba(69, 77, 93, 0.3);\n  height: auto;\n  -webkit-transform: perspective(100rem);\n  transform: perspective(100rem);\n  -webkit-transform-style: preserve-3d;\n  transform-style: preserve-3d;\n  transition: all .4s ease;\n  width: 100%; }\n\n.parallax .parallax-content::before {\n  content: \"\";\n  display: block;\n  height: 100%;\n  left: 0;\n  position: absolute;\n  top: 0;\n  width: 100%; }\n\n.parallax .parallax-front {\n  -webkit-align-items: center;\n  align-items: center;\n  color: #fff;\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  -ms-flex-align: center;\n  -ms-flex-pack: center;\n  height: 100%;\n  -webkit-justify-content: center;\n  justify-content: center;\n  left: 0;\n  position: absolute;\n  text-align: center;\n  text-shadow: 0 0 3rem rgba(69, 77, 93, 0.95);\n  top: 0;\n  -webkit-transform: translateZ(10rem) scale(0.9);\n  transform: translateZ(10rem) scale(0.9);\n  transition: all .4s ease;\n  width: 100%;\n  z-index: 1; }\n\n.parallax .parallax-top-left {\n  height: 50%;\n  left: 0;\n  position: absolute;\n  top: 0;\n  width: 50%;\n  z-index: 300; }\n\n.parallax .parallax-top-left:hover ~ .parallax-content {\n  -webkit-transform: perspective(100rem) rotateX(-3deg) rotateY(3deg);\n  transform: perspective(100rem) rotateX(-3deg) rotateY(3deg); }\n\n.parallax .parallax-top-left:hover ~ .parallax-content::before {\n  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 50%); }\n\n.parallax .parallax-top-left:hover ~ .parallax-content .parallax-front {\n  -webkit-transform: translate3d(-0.65rem, -0.65rem, 10rem) scale(0.9);\n  transform: translate3d(-0.65rem, -0.65rem, 10rem) scale(0.9); }\n\n.parallax .parallax-top-right {\n  height: 50%;\n  position: absolute;\n  right: 0;\n  top: 0;\n  width: 50%;\n  z-index: 300; }\n\n.parallax .parallax-top-right:hover ~ .parallax-content {\n  -webkit-transform: perspective(100rem) rotateX(-3deg) rotateY(-3deg);\n  transform: perspective(100rem) rotateX(-3deg) rotateY(-3deg); }\n\n.parallax .parallax-top-right:hover ~ .parallax-content::before {\n  background: linear-gradient(-135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 50%); }\n\n.parallax .parallax-top-right:hover ~ .parallax-content .parallax-front {\n  -webkit-transform: translate3d(0.65rem, -0.65rem, 10rem) scale(0.9);\n  transform: translate3d(0.65rem, -0.65rem, 10rem) scale(0.9); }\n\n.parallax .parallax-bottom-left {\n  bottom: 0;\n  height: 50%;\n  left: 0;\n  position: absolute;\n  width: 50%;\n  z-index: 300; }\n\n.parallax .parallax-bottom-left:hover ~ .parallax-content {\n  -webkit-transform: perspective(100rem) rotateX(3deg) rotateY(3deg);\n  transform: perspective(100rem) rotateX(3deg) rotateY(3deg); }\n\n.parallax .parallax-bottom-left:hover ~ .parallax-content::before {\n  background: linear-gradient(45deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 50%); }\n\n.parallax .parallax-bottom-left:hover ~ .parallax-content .parallax-front {\n  -webkit-transform: translate3d(-0.65rem, 0.65rem, 10rem) scale(0.9);\n  transform: translate3d(-0.65rem, 0.65rem, 10rem) scale(0.9); }\n\n.parallax .parallax-bottom-right {\n  bottom: 0;\n  height: 50%;\n  position: absolute;\n  right: 0;\n  width: 50%;\n  z-index: 300; }\n\n.parallax .parallax-bottom-right:hover ~ .parallax-content {\n  -webkit-transform: perspective(100rem) rotateX(3deg) rotateY(-3deg);\n  transform: perspective(100rem) rotateX(3deg) rotateY(-3deg); }\n\n.parallax .parallax-bottom-right:hover ~ .parallax-content::before {\n  background: linear-gradient(-45deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 50%); }\n\n.parallax .parallax-bottom-right:hover ~ .parallax-content .parallax-front {\n  -webkit-transform: translate3d(0.65rem, 0.65rem, 10rem) scale(0.9);\n  transform: translate3d(0.65rem, 0.65rem, 10rem) scale(0.9); }\n\n.progress {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  background: #f0f1f4;\n  border: 0;\n  border-radius: .2rem;\n  color: #5764c6;\n  height: .4rem;\n  position: relative;\n  width: 100%; }\n\n.progress::-webkit-progress-bar {\n  background: transparent;\n  border-radius: .2rem; }\n\n.progress::-webkit-progress-value {\n  background: #5764c6;\n  border-radius: .2rem; }\n\n.progress::-moz-progress-bar {\n  background: #5764c6;\n  border-radius: .2rem; }\n\n.progress:indeterminate {\n  -webkit-animation: progress-indeterminate 1.5s linear infinite;\n  animation: progress-indeterminate 1.5s linear infinite;\n  background: #f0f1f4 linear-gradient(to right, #5764c6 30%, #f0f1f4 30%) top left/150% 150% no-repeat; }\n\n.progress:indeterminate::-moz-progress-bar {\n  background: transparent; }\n\n@-webkit-keyframes progress-indeterminate {\n  0% {\n    background-position: 200% 0; }\n  100% {\n    background-position: -200% 0; } }\n\n@keyframes progress-indeterminate {\n  0% {\n    background-position: 200% 0; }\n  100% {\n    background-position: -200% 0; } }\n\n.slider {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  background: transparent;\n  display: block;\n  height: 2.4rem;\n  width: 100%; }\n\n.slider:focus {\n  box-shadow: 0 0 0 0.2rem rgba(87, 100, 198, 0.15);\n  outline: none; }\n\n.slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  background: #5764c6;\n  border: 0;\n  border-radius: 50%;\n  height: 1.2rem;\n  margin-top: -.5rem;\n  transition: transform .2s ease, -webkit-transform .2s ease;\n  transition: transform .2s ease;\n  transition: -webkit-transform .2s ease;\n  width: 1.2rem; }\n\n.slider::-moz-range-thumb {\n  background: #5764c6;\n  border: 0;\n  border-radius: 50%;\n  height: 1.2rem;\n  transition: transform .2s ease, -webkit-transform .2s ease;\n  transition: transform .2s ease;\n  transition: -webkit-transform .2s ease;\n  width: 1.2rem; }\n\n.slider::-ms-thumb {\n  background: #5764c6;\n  border: 0;\n  border-radius: 50%;\n  height: 1.2rem;\n  transition: transform .2s ease, -webkit-transform .2s ease;\n  transition: transform .2s ease;\n  transition: -webkit-transform .2s ease;\n  width: 1.2rem; }\n\n.slider:active::-webkit-slider-thumb {\n  -webkit-transform: scale(1.25);\n  transform: scale(1.25); }\n\n.slider:active::-moz-range-thumb {\n  transform: scale(1.25); }\n\n.slider:active::-ms-thumb {\n  -ms-transform: scale(1.25);\n  transform: scale(1.25); }\n\n.slider:disabled::-webkit-slider-thumb,\n.slider.disabled::-webkit-slider-thumb {\n  background: #e7e9ed;\n  -webkit-transform: scale(1);\n  transform: scale(1); }\n\n.slider:disabled::-moz-range-thumb,\n.slider.disabled::-moz-range-thumb {\n  background: #e7e9ed;\n  transform: scale(1); }\n\n.slider:disabled::-ms-thumb,\n.slider.disabled::-ms-thumb {\n  background: #e7e9ed;\n  -ms-transform: scale(1);\n  transform: scale(1); }\n\n.slider::-webkit-slider-runnable-track {\n  background: #f0f1f4;\n  border-radius: .2rem;\n  height: .2rem;\n  width: 100%; }\n\n.slider::-moz-range-track {\n  background: #f0f1f4;\n  border-radius: .2rem;\n  height: .2rem;\n  width: 100%; }\n\n.slider::-ms-track {\n  background: #f0f1f4;\n  border-radius: .2rem;\n  height: .2rem;\n  width: 100%; }\n\n.slider::-ms-fill-lower {\n  background: #5764c6; }\n\n.timeline .timeline-item {\n  display: flex;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  margin-bottom: 2.4rem;\n  position: relative; }\n\n.timeline .timeline-item::before {\n  background: #f0f1f4;\n  content: \"\";\n  height: 100%;\n  left: 1.1rem;\n  position: absolute;\n  top: 2.4rem;\n  width: .2rem; }\n\n.timeline .timeline-item .timeline-left {\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto; }\n\n.timeline .timeline-item .timeline-content {\n  -webkit-flex: 1 1 auto;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  padding: .2rem 0 .2rem 1.5rem; }\n\n.timeline .timeline-item .timeline-icon {\n  border-radius: 50%;\n  color: #fff;\n  display: block;\n  height: 2.4rem;\n  text-align: center;\n  width: 2.4rem; }\n\n.timeline .timeline-item .timeline-icon::before {\n  border: .2rem solid #5764c6;\n  border-radius: 50%;\n  content: \"\";\n  display: block;\n  height: .8rem;\n  left: .8rem;\n  position: absolute;\n  top: .8rem;\n  width: .8rem; }\n\n.timeline .timeline-item .timeline-icon.icon-lg {\n  background: #5764c6;\n  font-size: 1.6rem;\n  line-height: 2rem; }\n\n.timeline .timeline-item .timeline-icon.icon-lg::before {\n  content: none; }\n", ""]);

// exports


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "index.html";

/***/ }),
/* 22 */
/***/ (function(module, exports) {


(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _eeue56$elm_all_dict$EveryDict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_eeue56$elm_all_dict$EveryDict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _eeue56$elm_all_dict$EveryDict$keys = function (dict) {
	return A3(
		_eeue56$elm_all_dict$EveryDict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _eeue56$elm_all_dict$EveryDict$values = function (dict) {
	return A3(
		_eeue56$elm_all_dict$EveryDict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _eeue56$elm_all_dict$EveryDict$toList = function (dict) {
	return A3(
		_eeue56$elm_all_dict$EveryDict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _eeue56$elm_all_dict$EveryDict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_eeue56$elm_all_dict$EveryDict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _eeue56$elm_all_dict$EveryDict$isBBlack = function (dict) {
	var _p2 = dict;
	_v8_2:
	do {
		if (_p2.ctor === 'RBNode_elm_builtin') {
			if (_p2._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v8_2;
			}
		} else {
			if (_p2._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v8_2;
			}
		}
	} while(false);
	return false;
};
var _eeue56$elm_all_dict$EveryDict$showFlag = function (f) {
	var _p3 = f;
	switch (_p3.ctor) {
		case 'Insert':
			return 'Insert';
		case 'Remove':
			return 'Remove';
		default:
			return 'Same';
	}
};
var _eeue56$elm_all_dict$EveryDict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p4 = dict;
			if (_p4.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v11 = A2(_eeue56$elm_all_dict$EveryDict$sizeHelp, n + 1, _p4._4),
					_v12 = _p4._3;
				n = _v11;
				dict = _v12;
				continue sizeHelp;
			}
		}
	});
var _eeue56$elm_all_dict$EveryDict$size = function (dict) {
	return A2(_eeue56$elm_all_dict$EveryDict$sizeHelp, 0, dict);
};
var _eeue56$elm_all_dict$EveryDict$isEmpty = function (dict) {
	var _p5 = dict;
	if (_p5.ctor === 'RBEmpty_elm_builtin') {
		return true;
	} else {
		return false;
	}
};
var _eeue56$elm_all_dict$EveryDict$max = function (dict) {
	max:
	while (true) {
		var _p6 = dict;
		if (_p6.ctor === 'RBNode_elm_builtin') {
			if (_p6._4.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: _p6._1, _1: _p6._2};
			} else {
				var _v15 = _p6._4;
				dict = _v15;
				continue max;
			}
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'EveryDict',
				{
					start: {line: 127, column: 5},
					end: {line: 135, column: 51}
				},
				_p6)('(max Empty) is not defined');
		}
	}
};
var _eeue56$elm_all_dict$EveryDict$min = function (dict) {
	min:
	while (true) {
		var _p8 = dict;
		if (_p8.ctor === 'RBNode_elm_builtin') {
			if ((_p8._3.ctor === 'RBEmpty_elm_builtin') && (_p8._3._0.ctor === 'LBlack')) {
				return {ctor: '_Tuple2', _0: _p8._1, _1: _p8._2};
			} else {
				var _v17 = _p8._3;
				dict = _v17;
				continue min;
			}
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'EveryDict',
				{
					start: {line: 115, column: 5},
					end: {line: 123, column: 51}
				},
				_p8)('(min Empty) is not defined');
		}
	}
};
var _eeue56$elm_all_dict$EveryDict$eq = F2(
	function (first, second) {
		return _elm_lang$core$Native_Utils.eq(
			_eeue56$elm_all_dict$EveryDict$toList(first),
			_eeue56$elm_all_dict$EveryDict$toList(second));
	});
var _eeue56$elm_all_dict$EveryDict$ord = _elm_lang$core$Basics$toString;
var _eeue56$elm_all_dict$EveryDict$get_ = F2(
	function (targetKey, dict) {
		get_:
		while (true) {
			var _p10 = dict;
			if (_p10.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p11 = A2(
					_elm_lang$core$Basics$compare,
					_eeue56$elm_all_dict$EveryDict$ord(targetKey),
					_eeue56$elm_all_dict$EveryDict$ord(_p10._1));
				switch (_p11.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p10._3;
						targetKey = _v20;
						dict = _v21;
						continue get_;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p10._2);
					default:
						var _v22 = targetKey,
							_v23 = _p10._4;
						targetKey = _v22;
						dict = _v23;
						continue get_;
				}
			}
		}
	});
var _eeue56$elm_all_dict$EveryDict$get = F2(
	function (targetKey, dict) {
		return A2(_eeue56$elm_all_dict$EveryDict$get_, targetKey, dict);
	});
var _eeue56$elm_all_dict$EveryDict$member = F2(
	function (key, dict) {
		var _p12 = A2(_eeue56$elm_all_dict$EveryDict$get_, key, dict);
		if (_p12.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _eeue56$elm_all_dict$EveryDict$showLColor = function (color) {
	var _p13 = color;
	if (_p13.ctor === 'LBlack') {
		return 'LBlack';
	} else {
		return 'LBBlack';
	}
};
var _eeue56$elm_all_dict$EveryDict$showNColor = function (c) {
	var _p14 = c;
	switch (_p14.ctor) {
		case 'Red':
			return 'Red';
		case 'Black':
			return 'Black';
		case 'BBlack':
			return 'BBlack';
		default:
			return 'NBlack';
	}
};
var _eeue56$elm_all_dict$EveryDict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Utils.crash(
			'EveryDict',
			{
				start: {line: 320, column: 3},
				end: {line: 320, column: 14}
			})(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _eeue56$elm_all_dict$EveryDict$showNColor(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/Elm/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _eeue56$elm_all_dict$EveryDict$NBlack = {ctor: 'NBlack'};
var _eeue56$elm_all_dict$EveryDict$BBlack = {ctor: 'BBlack'};
var _eeue56$elm_all_dict$EveryDict$Black = {ctor: 'Black'};
var _eeue56$elm_all_dict$EveryDict$blackish = function (t) {
	var _p15 = t;
	if (_p15.ctor === 'RBNode_elm_builtin') {
		var _p16 = _p15._0;
		return _elm_lang$core$Native_Utils.eq(_p16, _eeue56$elm_all_dict$EveryDict$Black) || _elm_lang$core$Native_Utils.eq(_p16, _eeue56$elm_all_dict$EveryDict$BBlack);
	} else {
		return true;
	}
};
var _eeue56$elm_all_dict$EveryDict$Red = {ctor: 'Red'};
var _eeue56$elm_all_dict$EveryDict$moreBlack = function (color) {
	var _p17 = color;
	switch (_p17.ctor) {
		case 'Black':
			return _eeue56$elm_all_dict$EveryDict$BBlack;
		case 'Red':
			return _eeue56$elm_all_dict$EveryDict$Black;
		case 'NBlack':
			return _eeue56$elm_all_dict$EveryDict$Red;
		default:
			return _elm_lang$core$Native_Utils.crashCase(
				'EveryDict',
				{
					start: {line: 294, column: 5},
					end: {line: 298, column: 73}
				},
				_p17)('Can\'t make a double black node more black!');
	}
};
var _eeue56$elm_all_dict$EveryDict$lessBlack = function (color) {
	var _p19 = color;
	switch (_p19.ctor) {
		case 'BBlack':
			return _eeue56$elm_all_dict$EveryDict$Black;
		case 'Black':
			return _eeue56$elm_all_dict$EveryDict$Red;
		case 'Red':
			return _eeue56$elm_all_dict$EveryDict$NBlack;
		default:
			return _elm_lang$core$Native_Utils.crashCase(
				'EveryDict',
				{
					start: {line: 303, column: 5},
					end: {line: 307, column: 75}
				},
				_p19)('Can\'t make a negative black node less black!');
	}
};
var _eeue56$elm_all_dict$EveryDict$LBBlack = {ctor: 'LBBlack'};
var _eeue56$elm_all_dict$EveryDict$LBlack = {ctor: 'LBlack'};
var _eeue56$elm_all_dict$EveryDict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _eeue56$elm_all_dict$EveryDict$empty = _eeue56$elm_all_dict$EveryDict$RBEmpty_elm_builtin(_eeue56$elm_all_dict$EveryDict$LBlack);
var _eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _eeue56$elm_all_dict$EveryDict$ensureBlackRoot = function (dict) {
	var _p21 = dict;
	if (_p21.ctor === 'RBNode_elm_builtin') {
		switch (_p21._0.ctor) {
			case 'Red':
				return A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _eeue56$elm_all_dict$EveryDict$Black, _p21._1, _p21._2, _p21._3, _p21._4);
			case 'Black':
				return dict;
			default:
				return dict;
		}
	} else {
		return dict;
	}
};
var _eeue56$elm_all_dict$EveryDict$lessBlackTree = function (dict) {
	var _p22 = dict;
	if (_p22.ctor === 'RBNode_elm_builtin') {
		return A5(
			_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin,
			_eeue56$elm_all_dict$EveryDict$lessBlack(_p22._0),
			_p22._1,
			_p22._2,
			_p22._3,
			_p22._4);
	} else {
		if (_p22._0.ctor === 'LBBlack') {
			return _eeue56$elm_all_dict$EveryDict$RBEmpty_elm_builtin(_eeue56$elm_all_dict$EveryDict$LBlack);
		} else {
			return dict;
		}
	}
};
var _eeue56$elm_all_dict$EveryDict$blacken = function (t) {
	var _p23 = t;
	if (_p23.ctor === 'RBEmpty_elm_builtin') {
		return _eeue56$elm_all_dict$EveryDict$RBEmpty_elm_builtin(_eeue56$elm_all_dict$EveryDict$LBlack);
	} else {
		return A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _eeue56$elm_all_dict$EveryDict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	}
};
var _eeue56$elm_all_dict$EveryDict$redden = function (t) {
	var _p24 = t;
	if (_p24.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Utils.crashCase(
			'EveryDict',
			{
				start: {line: 440, column: 5},
				end: {line: 442, column: 69}
			},
			_p24)('can\'t make a Leaf red');
	} else {
		return A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _eeue56$elm_all_dict$EveryDict$Red, _p24._1, _p24._2, _p24._3, _p24._4);
	}
};
var _eeue56$elm_all_dict$EveryDict$balance_node = function (t) {
	var assemble = function (col) {
		return function (xk) {
			return function (xv) {
				return function (yk) {
					return function (yv) {
						return function (zk) {
							return function (zv) {
								return function (a) {
									return function (b) {
										return function (c) {
											return function (d) {
												return A5(
													_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin,
													_eeue56$elm_all_dict$EveryDict$lessBlack(col),
													yk,
													yv,
													A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _eeue56$elm_all_dict$EveryDict$Black, xk, xv, a, b),
													A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _eeue56$elm_all_dict$EveryDict$Black, zk, zv, c, d));
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
	if (_eeue56$elm_all_dict$EveryDict$blackish(t)) {
		var _p26 = t;
		_v34_6:
		do {
			_v34_5:
			do {
				_v34_4:
				do {
					_v34_3:
					do {
						_v34_2:
						do {
							_v34_1:
							do {
								_v34_0:
								do {
									if (_p26.ctor === 'RBNode_elm_builtin') {
										if (_p26._3.ctor === 'RBNode_elm_builtin') {
											if (_p26._4.ctor === 'RBNode_elm_builtin') {
												switch (_p26._3._0.ctor) {
													case 'Red':
														switch (_p26._4._0.ctor) {
															case 'Red':
																if ((_p26._3._3.ctor === 'RBNode_elm_builtin') && (_p26._3._3._0.ctor === 'Red')) {
																	break _v34_0;
																} else {
																	if ((_p26._3._4.ctor === 'RBNode_elm_builtin') && (_p26._3._4._0.ctor === 'Red')) {
																		break _v34_1;
																	} else {
																		if ((_p26._4._3.ctor === 'RBNode_elm_builtin') && (_p26._4._3._0.ctor === 'Red')) {
																			break _v34_2;
																		} else {
																			if ((_p26._4._4.ctor === 'RBNode_elm_builtin') && (_p26._4._4._0.ctor === 'Red')) {
																				break _v34_3;
																			} else {
																				break _v34_6;
																			}
																		}
																	}
																}
															case 'NBlack':
																if ((_p26._3._3.ctor === 'RBNode_elm_builtin') && (_p26._3._3._0.ctor === 'Red')) {
																	break _v34_0;
																} else {
																	if ((_p26._3._4.ctor === 'RBNode_elm_builtin') && (_p26._3._4._0.ctor === 'Red')) {
																		break _v34_1;
																	} else {
																		if (((_p26._0.ctor === 'BBlack') && (_p26._4._3.ctor === 'RBNode_elm_builtin')) && (_p26._4._3._0.ctor === 'Black')) {
																			break _v34_4;
																		} else {
																			break _v34_6;
																		}
																	}
																}
															default:
																if ((_p26._3._3.ctor === 'RBNode_elm_builtin') && (_p26._3._3._0.ctor === 'Red')) {
																	break _v34_0;
																} else {
																	if ((_p26._3._4.ctor === 'RBNode_elm_builtin') && (_p26._3._4._0.ctor === 'Red')) {
																		break _v34_1;
																	} else {
																		break _v34_6;
																	}
																}
														}
													case 'NBlack':
														switch (_p26._4._0.ctor) {
															case 'Red':
																if ((_p26._4._3.ctor === 'RBNode_elm_builtin') && (_p26._4._3._0.ctor === 'Red')) {
																	break _v34_2;
																} else {
																	if ((_p26._4._4.ctor === 'RBNode_elm_builtin') && (_p26._4._4._0.ctor === 'Red')) {
																		break _v34_3;
																	} else {
																		if (((_p26._0.ctor === 'BBlack') && (_p26._3._4.ctor === 'RBNode_elm_builtin')) && (_p26._3._4._0.ctor === 'Black')) {
																			break _v34_5;
																		} else {
																			break _v34_6;
																		}
																	}
																}
															case 'NBlack':
																if (_p26._0.ctor === 'BBlack') {
																	if ((_p26._4._3.ctor === 'RBNode_elm_builtin') && (_p26._4._3._0.ctor === 'Black')) {
																		break _v34_4;
																	} else {
																		if ((_p26._3._4.ctor === 'RBNode_elm_builtin') && (_p26._3._4._0.ctor === 'Black')) {
																			break _v34_5;
																		} else {
																			break _v34_6;
																		}
																	}
																} else {
																	break _v34_6;
																}
															default:
																if (((_p26._0.ctor === 'BBlack') && (_p26._3._4.ctor === 'RBNode_elm_builtin')) && (_p26._3._4._0.ctor === 'Black')) {
																	break _v34_5;
																} else {
																	break _v34_6;
																}
														}
													default:
														switch (_p26._4._0.ctor) {
															case 'Red':
																if ((_p26._4._3.ctor === 'RBNode_elm_builtin') && (_p26._4._3._0.ctor === 'Red')) {
																	break _v34_2;
																} else {
																	if ((_p26._4._4.ctor === 'RBNode_elm_builtin') && (_p26._4._4._0.ctor === 'Red')) {
																		break _v34_3;
																	} else {
																		break _v34_6;
																	}
																}
															case 'NBlack':
																if (((_p26._0.ctor === 'BBlack') && (_p26._4._3.ctor === 'RBNode_elm_builtin')) && (_p26._4._3._0.ctor === 'Black')) {
																	break _v34_4;
																} else {
																	break _v34_6;
																}
															default:
																break _v34_6;
														}
												}
											} else {
												switch (_p26._3._0.ctor) {
													case 'Red':
														if ((_p26._3._3.ctor === 'RBNode_elm_builtin') && (_p26._3._3._0.ctor === 'Red')) {
															break _v34_0;
														} else {
															if ((_p26._3._4.ctor === 'RBNode_elm_builtin') && (_p26._3._4._0.ctor === 'Red')) {
																break _v34_1;
															} else {
																break _v34_6;
															}
														}
													case 'NBlack':
														if (((_p26._0.ctor === 'BBlack') && (_p26._3._4.ctor === 'RBNode_elm_builtin')) && (_p26._3._4._0.ctor === 'Black')) {
															break _v34_5;
														} else {
															break _v34_6;
														}
													default:
														break _v34_6;
												}
											}
										} else {
											if (_p26._4.ctor === 'RBNode_elm_builtin') {
												switch (_p26._4._0.ctor) {
													case 'Red':
														if ((_p26._4._3.ctor === 'RBNode_elm_builtin') && (_p26._4._3._0.ctor === 'Red')) {
															break _v34_2;
														} else {
															if ((_p26._4._4.ctor === 'RBNode_elm_builtin') && (_p26._4._4._0.ctor === 'Red')) {
																break _v34_3;
															} else {
																break _v34_6;
															}
														}
													case 'NBlack':
														if (((_p26._0.ctor === 'BBlack') && (_p26._4._3.ctor === 'RBNode_elm_builtin')) && (_p26._4._3._0.ctor === 'Black')) {
															break _v34_4;
														} else {
															break _v34_6;
														}
													default:
														break _v34_6;
												}
											} else {
												break _v34_6;
											}
										}
									} else {
										break _v34_6;
									}
								} while(false);
								return assemble(_p26._0)(_p26._3._3._1)(_p26._3._3._2)(_p26._3._1)(_p26._3._2)(_p26._1)(_p26._2)(_p26._3._3._3)(_p26._3._3._4)(_p26._3._4)(_p26._4);
							} while(false);
							return assemble(_p26._0)(_p26._3._1)(_p26._3._2)(_p26._3._4._1)(_p26._3._4._2)(_p26._1)(_p26._2)(_p26._3._3)(_p26._3._4._3)(_p26._3._4._4)(_p26._4);
						} while(false);
						return assemble(_p26._0)(_p26._1)(_p26._2)(_p26._4._3._1)(_p26._4._3._2)(_p26._4._1)(_p26._4._2)(_p26._3)(_p26._4._3._3)(_p26._4._3._4)(_p26._4._4);
					} while(false);
					return assemble(_p26._0)(_p26._1)(_p26._2)(_p26._4._1)(_p26._4._2)(_p26._4._4._1)(_p26._4._4._2)(_p26._3)(_p26._4._3)(_p26._4._4._3)(_p26._4._4._4);
				} while(false);
				var _p28 = _p26._4._4;
				var _p27 = _p28;
				if ((_p27.ctor === 'RBNode_elm_builtin') && (_p27._0.ctor === 'Black')) {
					return A5(
						_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin,
						_eeue56$elm_all_dict$EveryDict$Black,
						_p26._4._3._1,
						_p26._4._3._2,
						A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _eeue56$elm_all_dict$EveryDict$Black, _p26._1, _p26._2, _p26._3, _p26._4._3._3),
						A5(
							_eeue56$elm_all_dict$EveryDict$balance,
							_eeue56$elm_all_dict$EveryDict$Black,
							_p26._4._1,
							_p26._4._2,
							_p26._4._3._4,
							_eeue56$elm_all_dict$EveryDict$redden(_p28)));
				} else {
					return t;
				}
			} while(false);
			var _p30 = _p26._3._3;
			var _p29 = _p30;
			if ((_p29.ctor === 'RBNode_elm_builtin') && (_p29._0.ctor === 'Black')) {
				return A5(
					_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin,
					_eeue56$elm_all_dict$EveryDict$Black,
					_p26._3._4._1,
					_p26._3._4._2,
					A5(
						_eeue56$elm_all_dict$EveryDict$balance,
						_eeue56$elm_all_dict$EveryDict$Black,
						_p26._3._1,
						_p26._3._2,
						_eeue56$elm_all_dict$EveryDict$redden(_p30),
						_p26._3._4._3),
					A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _eeue56$elm_all_dict$EveryDict$Black, _p26._1, _p26._2, _p26._3._4._4, _p26._4));
			} else {
				return t;
			}
		} while(false);
		return t;
	} else {
		return t;
	}
};
var _eeue56$elm_all_dict$EveryDict$balance = F5(
	function (c, k, v, l, r) {
		return _eeue56$elm_all_dict$EveryDict$balance_node(
			A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, c, k, v, l, r));
	});
var _eeue56$elm_all_dict$EveryDict$bubble = F5(
	function (c, k, v, l, r) {
		return (_eeue56$elm_all_dict$EveryDict$isBBlack(l) || _eeue56$elm_all_dict$EveryDict$isBBlack(r)) ? A5(
			_eeue56$elm_all_dict$EveryDict$balance,
			_eeue56$elm_all_dict$EveryDict$moreBlack(c),
			k,
			v,
			_eeue56$elm_all_dict$EveryDict$lessBlackTree(l),
			_eeue56$elm_all_dict$EveryDict$lessBlackTree(r)) : A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _eeue56$elm_all_dict$EveryDict$remove_max = F5(
	function (c, k, v, l, r) {
		var _p31 = r;
		if (_p31.ctor === 'RBEmpty_elm_builtin') {
			return A3(_eeue56$elm_all_dict$EveryDict$rem, c, l, r);
		} else {
			return A5(
				_eeue56$elm_all_dict$EveryDict$bubble,
				c,
				k,
				v,
				l,
				A5(_eeue56$elm_all_dict$EveryDict$remove_max, _p31._0, _p31._1, _p31._2, _p31._3, _p31._4));
		}
	});
var _eeue56$elm_all_dict$EveryDict$rem = F3(
	function (c, l, r) {
		var _p32 = {ctor: '_Tuple2', _0: l, _1: r};
		if (_p32._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p32._1.ctor === 'RBEmpty_elm_builtin') {
				var _p33 = c;
				switch (_p33.ctor) {
					case 'Red':
						return _eeue56$elm_all_dict$EveryDict$RBEmpty_elm_builtin(_eeue56$elm_all_dict$EveryDict$LBlack);
					case 'Black':
						return _eeue56$elm_all_dict$EveryDict$RBEmpty_elm_builtin(_eeue56$elm_all_dict$EveryDict$LBBlack);
					default:
						return _eeue56$elm_all_dict$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p36 = _p32._1._0;
				var _p35 = _p32._0._0;
				var _p34 = {ctor: '_Tuple3', _0: c, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'LBlack')) && (_p34._2.ctor === 'Red')) {
					return A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _eeue56$elm_all_dict$EveryDict$Black, _p32._1._1, _p32._1._2, _p32._1._3, _p32._1._4);
				} else {
					return A4(
						_eeue56$elm_all_dict$EveryDict$reportRemBug,
						'Black/LBlack/Red',
						c,
						_eeue56$elm_all_dict$EveryDict$showLColor(_p35),
						_eeue56$elm_all_dict$EveryDict$showNColor(_p36));
				}
			}
		} else {
			if (_p32._1.ctor === 'RBEmpty_elm_builtin') {
				var _p39 = _p32._1._0;
				var _p38 = _p32._0._0;
				var _p37 = {ctor: '_Tuple3', _0: c, _1: _p38, _2: _p39};
				if ((((_p37.ctor === '_Tuple3') && (_p37._0.ctor === 'Black')) && (_p37._1.ctor === 'Red')) && (_p37._2.ctor === 'LBlack')) {
					return A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _eeue56$elm_all_dict$EveryDict$Black, _p32._0._1, _p32._0._2, _p32._0._3, _p32._0._4);
				} else {
					return A4(
						_eeue56$elm_all_dict$EveryDict$reportRemBug,
						'Black/Red/LBlack',
						c,
						_eeue56$elm_all_dict$EveryDict$showNColor(_p38),
						_eeue56$elm_all_dict$EveryDict$showLColor(_p39));
				}
			} else {
				var _p45 = _p32._0._2;
				var _p44 = _p32._0._4;
				var _p43 = _p32._0._3;
				var _p42 = _p32._0._1;
				var _p41 = _p32._0._0;
				var l_ = A5(_eeue56$elm_all_dict$EveryDict$remove_max, _p41, _p42, _p45, _p43, _p44);
				var r = A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _p32._1._0, _p32._1._1, _p32._1._2, _p32._1._3, _p32._1._4);
				var l = A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _p41, _p42, _p45, _p43, _p44);
				var _p40 = _eeue56$elm_all_dict$EveryDict$max(l);
				var k = _p40._0;
				var v = _p40._1;
				return A5(_eeue56$elm_all_dict$EveryDict$bubble, c, k, v, l_, r);
			}
		}
	});
var _eeue56$elm_all_dict$EveryDict$map = F2(
	function (f, dict) {
		var _p46 = dict;
		if (_p46.ctor === 'RBEmpty_elm_builtin') {
			return _eeue56$elm_all_dict$EveryDict$RBEmpty_elm_builtin(_p46._0);
		} else {
			var _p47 = _p46._1;
			return A5(
				_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin,
				_p46._0,
				_p47,
				A2(f, _p47, _p46._2),
				A2(_eeue56$elm_all_dict$EveryDict$map, f, _p46._3),
				A2(_eeue56$elm_all_dict$EveryDict$map, f, _p46._4));
		}
	});
var _eeue56$elm_all_dict$EveryDict$Same = {ctor: 'Same'};
var _eeue56$elm_all_dict$EveryDict$Remove = {ctor: 'Remove'};
var _eeue56$elm_all_dict$EveryDict$Insert = {ctor: 'Insert'};
var _eeue56$elm_all_dict$EveryDict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p48 = dict;
			if (_p48.ctor === 'RBEmpty_elm_builtin') {
				var _p49 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p49.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _eeue56$elm_all_dict$EveryDict$Same, _1: _eeue56$elm_all_dict$EveryDict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _eeue56$elm_all_dict$EveryDict$Insert,
						_1: A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _eeue56$elm_all_dict$EveryDict$Red, k, _p49._0, _eeue56$elm_all_dict$EveryDict$empty, _eeue56$elm_all_dict$EveryDict$empty)
					};
				}
			} else {
				var _p60 = _p48._2;
				var _p59 = _p48._4;
				var _p58 = _p48._3;
				var _p57 = _p48._1;
				var _p56 = _p48._0;
				var _p50 = A2(
					_elm_lang$core$Basics$compare,
					_eeue56$elm_all_dict$EveryDict$ord(k),
					_eeue56$elm_all_dict$EveryDict$ord(_p57));
				switch (_p50.ctor) {
					case 'EQ':
						var _p51 = alter(
							_elm_lang$core$Maybe$Just(_p60));
						if (_p51.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _eeue56$elm_all_dict$EveryDict$Remove,
								_1: A3(_eeue56$elm_all_dict$EveryDict$rem, _p56, _p58, _p59)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _eeue56$elm_all_dict$EveryDict$Same,
								_1: A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _p56, _p57, _p51._0, _p58, _p59)
							};
						}
					case 'LT':
						var _p52 = up(_p58);
						var flag = _p52._0;
						var newLeft = _p52._1;
						var _p53 = flag;
						switch (_p53.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _eeue56$elm_all_dict$EveryDict$Same,
									_1: A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _p56, _p57, _p60, newLeft, _p59)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _eeue56$elm_all_dict$EveryDict$Insert,
									_1: A5(_eeue56$elm_all_dict$EveryDict$balance, _p56, _p57, _p60, newLeft, _p59)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _eeue56$elm_all_dict$EveryDict$Remove,
									_1: A5(_eeue56$elm_all_dict$EveryDict$bubble, _p56, _p57, _p60, newLeft, _p59)
								};
						}
					default:
						var _p54 = up(_p59);
						var flag = _p54._0;
						var newRight = _p54._1;
						var _p55 = flag;
						switch (_p55.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _eeue56$elm_all_dict$EveryDict$Same,
									_1: A5(_eeue56$elm_all_dict$EveryDict$RBNode_elm_builtin, _p56, _p57, _p60, _p58, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _eeue56$elm_all_dict$EveryDict$Insert,
									_1: A5(_eeue56$elm_all_dict$EveryDict$balance, _p56, _p57, _p60, _p58, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _eeue56$elm_all_dict$EveryDict$Remove,
									_1: A5(_eeue56$elm_all_dict$EveryDict$bubble, _p56, _p57, _p60, _p58, newRight)
								};
						}
				}
			}
		};
		var _p61 = up(dict);
		var flag = _p61._0;
		var updatedDict = _p61._1;
		var _p62 = flag;
		switch (_p62.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _eeue56$elm_all_dict$EveryDict$ensureBlackRoot(updatedDict);
			default:
				return _eeue56$elm_all_dict$EveryDict$blacken(updatedDict);
		}
	});
var _eeue56$elm_all_dict$EveryDict$insert = F3(
	function (key, value, dict) {
		return A3(
			_eeue56$elm_all_dict$EveryDict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _eeue56$elm_all_dict$EveryDict$singleton = F2(
	function (key, value) {
		return A3(_eeue56$elm_all_dict$EveryDict$insert, key, value, _eeue56$elm_all_dict$EveryDict$empty);
	});
var _eeue56$elm_all_dict$EveryDict$union = F2(
	function (t1, t2) {
		return A3(_eeue56$elm_all_dict$EveryDict$foldl, _eeue56$elm_all_dict$EveryDict$insert, t2, t1);
	});
var _eeue56$elm_all_dict$EveryDict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_eeue56$elm_all_dict$EveryDict$insert, _p64._0, _p64._1, dict);
			}),
		_eeue56$elm_all_dict$EveryDict$empty,
		assocs);
};
var _eeue56$elm_all_dict$EveryDict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_eeue56$elm_all_dict$EveryDict$insert, key, value, dict) : dict;
			});
		return A3(_eeue56$elm_all_dict$EveryDict$foldl, add, _eeue56$elm_all_dict$EveryDict$empty, dictionary);
	});
var _eeue56$elm_all_dict$EveryDict$intersect = F2(
	function (t1, t2) {
		return A2(
			_eeue56$elm_all_dict$EveryDict$filter,
			F2(
				function (k, _p65) {
					return A2(_eeue56$elm_all_dict$EveryDict$member, k, t2);
				}),
			t1);
	});
var _eeue56$elm_all_dict$EveryDict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p66) {
				var _p67 = _p66;
				var _p69 = _p67._1;
				var _p68 = _p67._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_eeue56$elm_all_dict$EveryDict$insert, key, value, _p68),
					_1: _p69
				} : {
					ctor: '_Tuple2',
					_0: _p68,
					_1: A3(_eeue56$elm_all_dict$EveryDict$insert, key, value, _p69)
				};
			});
		return A3(
			_eeue56$elm_all_dict$EveryDict$foldl,
			add,
			{ctor: '_Tuple2', _0: _eeue56$elm_all_dict$EveryDict$empty, _1: _eeue56$elm_all_dict$EveryDict$empty},
			dict);
	});
var _eeue56$elm_all_dict$EveryDict$remove = F2(
	function (key, dict) {
		return A3(
			_eeue56$elm_all_dict$EveryDict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _eeue56$elm_all_dict$EveryDict$diff = F2(
	function (t1, t2) {
		return A3(
			_eeue56$elm_all_dict$EveryDict$foldl,
			F3(
				function (k, v, t) {
					return A2(_eeue56$elm_all_dict$EveryDict$remove, k, t);
				}),
			t1,
			t2);
	});

var _Gizra$elm_all_set$EverySet$foldr = F3(
	function (f, b, _p0) {
		var _p1 = _p0;
		return A3(
			_eeue56$elm_all_dict$EveryDict$foldr,
			F3(
				function (k, _p2, b) {
					return A2(f, k, b);
				}),
			b,
			_p1._0);
	});
var _Gizra$elm_all_set$EverySet$foldl = F3(
	function (f, b, _p3) {
		var _p4 = _p3;
		return A3(
			_eeue56$elm_all_dict$EveryDict$foldl,
			F3(
				function (k, _p5, b) {
					return A2(f, k, b);
				}),
			b,
			_p4._0);
	});
var _Gizra$elm_all_set$EverySet$toList = function (_p6) {
	var _p7 = _p6;
	return _eeue56$elm_all_dict$EveryDict$keys(_p7._0);
};
var _Gizra$elm_all_set$EverySet$size = function (_p8) {
	var _p9 = _p8;
	return _eeue56$elm_all_dict$EveryDict$size(_p9._0);
};
var _Gizra$elm_all_set$EverySet$member = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return A2(_eeue56$elm_all_dict$EveryDict$member, k, _p11._0);
	});
var _Gizra$elm_all_set$EverySet$isEmpty = function (_p12) {
	var _p13 = _p12;
	return _eeue56$elm_all_dict$EveryDict$isEmpty(_p13._0);
};
var _Gizra$elm_all_set$EverySet$EverySet = function (a) {
	return {ctor: 'EverySet', _0: a};
};
var _Gizra$elm_all_set$EverySet$empty = _Gizra$elm_all_set$EverySet$EverySet(_eeue56$elm_all_dict$EveryDict$empty);
var _Gizra$elm_all_set$EverySet$singleton = function (k) {
	return _Gizra$elm_all_set$EverySet$EverySet(
		A2(
			_eeue56$elm_all_dict$EveryDict$singleton,
			k,
			{ctor: '_Tuple0'}));
};
var _Gizra$elm_all_set$EverySet$insert = F2(
	function (k, _p14) {
		var _p15 = _p14;
		return _Gizra$elm_all_set$EverySet$EverySet(
			A3(
				_eeue56$elm_all_dict$EveryDict$insert,
				k,
				{ctor: '_Tuple0'},
				_p15._0));
	});
var _Gizra$elm_all_set$EverySet$fromList = function (xs) {
	return A3(_elm_lang$core$List$foldl, _Gizra$elm_all_set$EverySet$insert, _Gizra$elm_all_set$EverySet$empty, xs);
};
var _Gizra$elm_all_set$EverySet$map = F2(
	function (f, s) {
		return _Gizra$elm_all_set$EverySet$fromList(
			A2(
				_elm_lang$core$List$map,
				f,
				_Gizra$elm_all_set$EverySet$toList(s)));
	});
var _Gizra$elm_all_set$EverySet$remove = F2(
	function (k, _p16) {
		var _p17 = _p16;
		return _Gizra$elm_all_set$EverySet$EverySet(
			A2(_eeue56$elm_all_dict$EveryDict$remove, k, _p17._0));
	});
var _Gizra$elm_all_set$EverySet$union = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return _Gizra$elm_all_set$EverySet$EverySet(
			A2(_eeue56$elm_all_dict$EveryDict$union, _p20._0, _p21._0));
	});
var _Gizra$elm_all_set$EverySet$intersect = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _Gizra$elm_all_set$EverySet$EverySet(
			A2(_eeue56$elm_all_dict$EveryDict$intersect, _p24._0, _p25._0));
	});
var _Gizra$elm_all_set$EverySet$diff = F2(
	function (_p27, _p26) {
		var _p28 = _p27;
		var _p29 = _p26;
		return _Gizra$elm_all_set$EverySet$EverySet(
			A2(_eeue56$elm_all_dict$EveryDict$diff, _p28._0, _p29._0));
	});
var _Gizra$elm_all_set$EverySet$filter = F2(
	function (p, _p30) {
		var _p31 = _p30;
		return _Gizra$elm_all_set$EverySet$EverySet(
			A2(
				_eeue56$elm_all_dict$EveryDict$filter,
				F2(
					function (k, _p32) {
						return p(k);
					}),
				_p31._0));
	});
var _Gizra$elm_all_set$EverySet$partition = F2(
	function (p, _p33) {
		var _p34 = _p33;
		var _p35 = A2(
			_eeue56$elm_all_dict$EveryDict$partition,
			F2(
				function (k, _p36) {
					return p(k);
				}),
			_p34._0);
		var p1 = _p35._0;
		var p2 = _p35._1;
		return {
			ctor: '_Tuple2',
			_0: _Gizra$elm_all_set$EverySet$EverySet(p1),
			_1: _Gizra$elm_all_set$EverySet$EverySet(p2)
		};
	});

var _elm_lang$animation_frame$Native_AnimationFrame = function()
{

function create()
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = requestAnimationFrame(function() {
			callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
		});

		return function() {
			cancelAnimationFrame(id);
		};
	});
}

return {
	create: create
};

}();

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$animation_frame$AnimationFrame$rAF = _elm_lang$animation_frame$Native_AnimationFrame.create(
	{ctor: '_Tuple0'});
var _elm_lang$animation_frame$AnimationFrame$subscription = _elm_lang$core$Native_Platform.leaf('AnimationFrame');
var _elm_lang$animation_frame$AnimationFrame$State = F3(
	function (a, b, c) {
		return {subs: a, request: b, oldTime: c};
	});
var _elm_lang$animation_frame$AnimationFrame$init = _elm_lang$core$Task$succeed(
	A3(
		_elm_lang$animation_frame$AnimationFrame$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing,
		0));
var _elm_lang$animation_frame$AnimationFrame$onEffects = F3(
	function (router, subs, _p0) {
		var _p1 = _p0;
		var _p5 = _p1.request;
		var _p4 = _p1.oldTime;
		var _p2 = {ctor: '_Tuple2', _0: _p5, _1: subs};
		if (_p2._0.ctor === 'Nothing') {
			if (_p2._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(
					A3(
						_elm_lang$animation_frame$AnimationFrame$State,
						{ctor: '[]'},
						_elm_lang$core$Maybe$Nothing,
						_p4));
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (time) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$animation_frame$AnimationFrame$State,
										subs,
										_elm_lang$core$Maybe$Just(pid),
										time));
							},
							_elm_lang$core$Time$now);
					},
					_elm_lang$core$Process$spawn(
						A2(
							_elm_lang$core$Task$andThen,
							_elm_lang$core$Platform$sendToSelf(router),
							_elm_lang$animation_frame$AnimationFrame$rAF)));
			}
		} else {
			if (_p2._1.ctor === '[]') {
				return A2(
					_elm_lang$core$Task$andThen,
					function (_p3) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$animation_frame$AnimationFrame$State,
								{ctor: '[]'},
								_elm_lang$core$Maybe$Nothing,
								_p4));
					},
					_elm_lang$core$Process$kill(_p2._0._0));
			} else {
				return _elm_lang$core$Task$succeed(
					A3(_elm_lang$animation_frame$AnimationFrame$State, subs, _p5, _p4));
			}
		}
	});
var _elm_lang$animation_frame$AnimationFrame$onSelfMsg = F3(
	function (router, newTime, _p6) {
		var _p7 = _p6;
		var _p10 = _p7.subs;
		var diff = newTime - _p7.oldTime;
		var send = function (sub) {
			var _p8 = sub;
			if (_p8.ctor === 'Time') {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p8._0(newTime));
			} else {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p8._0(diff));
			}
		};
		return A2(
			_elm_lang$core$Task$andThen,
			function (pid) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (_p9) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$animation_frame$AnimationFrame$State,
								_p10,
								_elm_lang$core$Maybe$Just(pid),
								newTime));
					},
					_elm_lang$core$Task$sequence(
						A2(_elm_lang$core$List$map, send, _p10)));
			},
			_elm_lang$core$Process$spawn(
				A2(
					_elm_lang$core$Task$andThen,
					_elm_lang$core$Platform$sendToSelf(router),
					_elm_lang$animation_frame$AnimationFrame$rAF)));
	});
var _elm_lang$animation_frame$AnimationFrame$Diff = function (a) {
	return {ctor: 'Diff', _0: a};
};
var _elm_lang$animation_frame$AnimationFrame$diffs = function (tagger) {
	return _elm_lang$animation_frame$AnimationFrame$subscription(
		_elm_lang$animation_frame$AnimationFrame$Diff(tagger));
};
var _elm_lang$animation_frame$AnimationFrame$Time = function (a) {
	return {ctor: 'Time', _0: a};
};
var _elm_lang$animation_frame$AnimationFrame$times = function (tagger) {
	return _elm_lang$animation_frame$AnimationFrame$subscription(
		_elm_lang$animation_frame$AnimationFrame$Time(tagger));
};
var _elm_lang$animation_frame$AnimationFrame$subMap = F2(
	function (func, sub) {
		var _p11 = sub;
		if (_p11.ctor === 'Time') {
			return _elm_lang$animation_frame$AnimationFrame$Time(
				function (_p12) {
					return func(
						_p11._0(_p12));
				});
		} else {
			return _elm_lang$animation_frame$AnimationFrame$Diff(
				function (_p13) {
					return func(
						_p11._0(_p13));
				});
		}
	});
_elm_lang$core$Native_Platform.effectManagers['AnimationFrame'] = {pkg: 'elm-lang/animation-frame', init: _elm_lang$animation_frame$AnimationFrame$init, onEffects: _elm_lang$animation_frame$AnimationFrame$onEffects, onSelfMsg: _elm_lang$animation_frame$AnimationFrame$onSelfMsg, tag: 'sub', subMap: _elm_lang$animation_frame$AnimationFrame$subMap};

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _myrho$elm_round$Round$funNum = F3(
	function (fun, s, fl) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			1 / 0,
			_elm_lang$core$Result$toMaybe(
				_elm_lang$core$String$toFloat(
					A2(fun, s, fl))));
	});
var _myrho$elm_round$Round$splitComma = function (str) {
	var _p0 = A2(_elm_lang$core$String$split, '.', str);
	if (_p0.ctor === '::') {
		if (_p0._1.ctor === '::') {
			return {ctor: '_Tuple2', _0: _p0._0, _1: _p0._1._0};
		} else {
			return {ctor: '_Tuple2', _0: _p0._0, _1: '0'};
		}
	} else {
		return {ctor: '_Tuple2', _0: '0', _1: '0'};
	}
};
var _myrho$elm_round$Round$toDecimal = function (fl) {
	var _p1 = A2(
		_elm_lang$core$String$split,
		'e',
		_elm_lang$core$Basics$toString(fl));
	if (_p1.ctor === '::') {
		if (_p1._1.ctor === '::') {
			var _p4 = _p1._1._0;
			var _p2 = function () {
				var hasSign = _elm_lang$core$Native_Utils.cmp(fl, 0) < 0;
				var _p3 = _myrho$elm_round$Round$splitComma(_p1._0);
				var b = _p3._0;
				var a = _p3._1;
				return {
					ctor: '_Tuple3',
					_0: hasSign ? '-' : '',
					_1: hasSign ? A2(_elm_lang$core$String$dropLeft, 1, b) : b,
					_2: a
				};
			}();
			var sign = _p2._0;
			var before = _p2._1;
			var after = _p2._2;
			var e = A2(
				_elm_lang$core$Maybe$withDefault,
				0,
				_elm_lang$core$Result$toMaybe(
					_elm_lang$core$String$toInt(
						A2(_elm_lang$core$String$startsWith, '+', _p4) ? A2(_elm_lang$core$String$dropLeft, 1, _p4) : _p4)));
			var newBefore = (_elm_lang$core$Native_Utils.cmp(e, 0) > -1) ? before : ((_elm_lang$core$Native_Utils.cmp(
				_elm_lang$core$Basics$abs(e),
				_elm_lang$core$String$length(before)) < 0) ? A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$String$left,
					_elm_lang$core$String$length(before) - _elm_lang$core$Basics$abs(e),
					before),
				A2(
					_elm_lang$core$Basics_ops['++'],
					'.',
					A2(
						_elm_lang$core$String$right,
						_elm_lang$core$Basics$abs(e),
						before))) : A2(
				_elm_lang$core$Basics_ops['++'],
				'0.',
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$String$repeat,
						_elm_lang$core$Basics$abs(e) - _elm_lang$core$String$length(before),
						'0'),
					before)));
			var newAfter = (_elm_lang$core$Native_Utils.cmp(e, 0) < 1) ? after : ((_elm_lang$core$Native_Utils.cmp(
				e,
				_elm_lang$core$String$length(after)) < 0) ? A2(
				_elm_lang$core$Basics_ops['++'],
				A2(_elm_lang$core$String$left, e, after),
				A2(
					_elm_lang$core$Basics_ops['++'],
					'.',
					A2(
						_elm_lang$core$String$right,
						_elm_lang$core$String$length(after) - e,
						after))) : A2(
				_elm_lang$core$Basics_ops['++'],
				after,
				A2(
					_elm_lang$core$String$repeat,
					e - _elm_lang$core$String$length(after),
					'0')));
			return A2(
				_elm_lang$core$Basics_ops['++'],
				sign,
				A2(_elm_lang$core$Basics_ops['++'], newBefore, newAfter));
		} else {
			return _p1._0;
		}
	} else {
		return '';
	}
};
var _myrho$elm_round$Round$truncate = function (n) {
	return (_elm_lang$core$Native_Utils.cmp(n, 0) < 0) ? _elm_lang$core$Basics$ceiling(n) : _elm_lang$core$Basics$floor(n);
};
var _myrho$elm_round$Round$roundFun = F3(
	function (functor, s, fl) {
		if (_elm_lang$core$Native_Utils.eq(s, 0)) {
			return _elm_lang$core$Basics$toString(
				functor(fl));
		} else {
			if (_elm_lang$core$Native_Utils.cmp(s, 0) < 0) {
				return function (r) {
					return (!_elm_lang$core$Native_Utils.eq(r, '0')) ? A2(
						_elm_lang$core$Basics_ops['++'],
						r,
						A2(
							_elm_lang$core$String$repeat,
							_elm_lang$core$Basics$abs(s),
							'0')) : r;
				}(
					A3(
						_myrho$elm_round$Round$roundFun,
						functor,
						0,
						A2(
							F2(
								function (x, y) {
									return x / y;
								}),
							fl,
							A2(
								F2(
									function (x, y) {
										return Math.pow(x, y);
									}),
								10,
								_elm_lang$core$Basics$abs(
									_elm_lang$core$Basics$toFloat(s))))));
			} else {
				var dd = (_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? 2 : 1;
				var n = (_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? -1 : 1;
				var e = Math.pow(10, s);
				var _p5 = _myrho$elm_round$Round$splitComma(
					_myrho$elm_round$Round$toDecimal(fl));
				var before = _p5._0;
				var after = _p5._1;
				var a = A3(
					_elm_lang$core$String$padRight,
					s + 1,
					_elm_lang$core$Native_Utils.chr('0'),
					after);
				var b = A2(_elm_lang$core$String$left, s, a);
				var c = A2(_elm_lang$core$String$dropLeft, s, a);
				var f = functor(
					A2(
						_elm_lang$core$Maybe$withDefault,
						_elm_lang$core$Basics$toFloat(e),
						_elm_lang$core$Result$toMaybe(
							_elm_lang$core$String$toFloat(
								A2(
									_elm_lang$core$Basics_ops['++'],
									(_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? '-' : '',
									A2(
										_elm_lang$core$Basics_ops['++'],
										'1',
										A2(
											_elm_lang$core$Basics_ops['++'],
											b,
											A2(_elm_lang$core$Basics_ops['++'], '.', c))))))));
				var g = A2(
					_elm_lang$core$String$dropLeft,
					dd,
					_elm_lang$core$Basics$toString(f));
				var h = _myrho$elm_round$Round$truncate(fl) + (_elm_lang$core$Native_Utils.eq(f - (e * n), e * n) ? ((_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? -1 : 1) : 0);
				var j = _elm_lang$core$Basics$toString(h);
				var i = (_elm_lang$core$Native_Utils.eq(j, '0') && ((!_elm_lang$core$Native_Utils.eq(f - (e * n), 0)) && ((_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) && (_elm_lang$core$Native_Utils.cmp(fl, -1) > 0)))) ? A2(_elm_lang$core$Basics_ops['++'], '-', j) : j;
				return A2(
					_elm_lang$core$Basics_ops['++'],
					i,
					A2(_elm_lang$core$Basics_ops['++'], '.', g));
			}
		}
	});
var _myrho$elm_round$Round$round = _myrho$elm_round$Round$roundFun(_elm_lang$core$Basics$round);
var _myrho$elm_round$Round$roundNum = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$round);
var _myrho$elm_round$Round$ceiling = _myrho$elm_round$Round$roundFun(_elm_lang$core$Basics$ceiling);
var _myrho$elm_round$Round$ceilingNum = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$ceiling);
var _myrho$elm_round$Round$floor = _myrho$elm_round$Round$roundFun(_elm_lang$core$Basics$floor);
var _myrho$elm_round$Round$floorCom = F2(
	function (s, fl) {
		return (_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? A2(_myrho$elm_round$Round$ceiling, s, fl) : A2(_myrho$elm_round$Round$floor, s, fl);
	});
var _myrho$elm_round$Round$floorNumCom = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$floorCom);
var _myrho$elm_round$Round$ceilingCom = F2(
	function (s, fl) {
		return (_elm_lang$core$Native_Utils.cmp(fl, 0) < 0) ? A2(_myrho$elm_round$Round$floor, s, fl) : A2(_myrho$elm_round$Round$ceiling, s, fl);
	});
var _myrho$elm_round$Round$ceilingNumCom = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$ceilingCom);
var _myrho$elm_round$Round$floorNum = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$floor);
var _myrho$elm_round$Round$roundCom = _myrho$elm_round$Round$roundFun(
	function (fl) {
		var dec = fl - _elm_lang$core$Basics$toFloat(
			_myrho$elm_round$Round$truncate(fl));
		return (_elm_lang$core$Native_Utils.cmp(dec, 0.5) > -1) ? _elm_lang$core$Basics$ceiling(fl) : ((_elm_lang$core$Native_Utils.cmp(dec, -0.5) < 1) ? _elm_lang$core$Basics$floor(fl) : _elm_lang$core$Basics$round(fl));
	});
var _myrho$elm_round$Round$roundNumCom = _myrho$elm_round$Round$funNum(_myrho$elm_round$Round$roundCom);

var _user$project$Ability$priceOf = function (ability) {
	var millis = function () {
		var _p0 = ability;
		if (_p0.ctor === 'ShallowBreathing') {
			return 30 * _elm_lang$core$Time$second;
		} else {
			return 45 * _elm_lang$core$Time$second;
		}
	}();
	return _elm_lang$core$Time$inSeconds(millis);
};
var _user$project$Ability$Engineering = {ctor: 'Engineering'};
var _user$project$Ability$ShallowBreathing = {ctor: 'ShallowBreathing'};

var _user$project$Abilities$descriptionOf = function (ability) {
	var _p0 = ability;
	if (_p0.ctor === 'ShallowBreathing') {
		return 'Survivor consumes less oxygen while conscious';
	} else {
		return 'Survivor becomes more efficient with the fabricator';
	}
};
var _user$project$Abilities$toList = function (_p1) {
	var _p2 = _p1;
	return _Gizra$elm_all_set$EverySet$toList(_p2._0);
};
var _user$project$Abilities$member = F2(
	function (k, _p3) {
		var _p4 = _p3;
		return A2(_Gizra$elm_all_set$EverySet$member, k, _p4._0);
	});
var _user$project$Abilities$isEmpty = function (_p5) {
	var _p6 = _p5;
	return _Gizra$elm_all_set$EverySet$isEmpty(_p6._0);
};
var _user$project$Abilities$Abilities = function (a) {
	return {ctor: 'Abilities', _0: a};
};
var _user$project$Abilities$empty = _user$project$Abilities$Abilities(_Gizra$elm_all_set$EverySet$empty);
var _user$project$Abilities$insert = F2(
	function (k, _p7) {
		var _p8 = _p7;
		return _user$project$Abilities$Abilities(
			A2(_Gizra$elm_all_set$EverySet$insert, k, _p8._0));
	});

var _user$project$Item$matterCostOf = F2(
	function (item, quantity) {
		var _p0 = item;
		switch (_p0.ctor) {
			case 'SolarPanel':
				return 20 + (_elm_lang$core$Basics$toFloat(quantity) * 20);
			case 'MatterBin':
				return 20 + (_elm_lang$core$Basics$toFloat(quantity) * 20);
			default:
				return 12;
		}
	});
var _user$project$Item$Amphetamine = {ctor: 'Amphetamine'};
var _user$project$Item$MatterBin = {ctor: 'MatterBin'};
var _user$project$Item$SolarPanel = {ctor: 'SolarPanel'};

var _user$project$Quantity$Quantity = F2(
	function (a, b) {
		return {curr: a, max: b};
	});

var _user$project$Action$SpaceSuit = F3(
	function (a, b, c) {
		return {power: a, oxygen: b, food: c};
	});
var _user$project$Action$Researching = F2(
	function (a, b) {
		return {ctor: 'Researching', _0: a, _1: b};
	});
var _user$project$Action$Fabricating = F2(
	function (a, b) {
		return {ctor: 'Fabricating', _0: a, _1: b};
	});
var _user$project$Action$Idling = {ctor: 'Idling'};

var _user$project$Inventory$size = function (inventory) {
	return _elm_lang$core$List$sum(
		{
			ctor: '::',
			_0: inventory.solarPanels,
			_1: {
				ctor: '::',
				_0: inventory.matterBins,
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Inventory$isEmpty = function (inventory) {
	return _elm_lang$core$Native_Utils.eq(
		0,
		_user$project$Inventory$size(inventory));
};
var _user$project$Inventory$empty = {solarPanels: 0, matterBins: 0};
var _user$project$Inventory$Inventory = F2(
	function (a, b) {
		return {solarPanels: a, matterBins: b};
	});

var _user$project$Port$mouseUp = _elm_lang$core$Native_Platform.incomingPort(
	'mouseUp',
	_elm_lang$core$Json_Decode$null(
		{ctor: '_Tuple0'}));

var _user$project$Price$priceOfMatterBin = function (count) {
	return 20 + (_elm_lang$core$Basics$toFloat(count) * 20);
};
var _user$project$Price$priceOfSolarPanel = function (count) {
	return 20 + (_elm_lang$core$Basics$toFloat(count) * 20);
};

var _user$project$Spectre$progressBar = F2(
	function (percent, body) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('bar'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('bar-item'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'width',
										_1: A2(
											_elm_lang$core$Basics_ops['++'],
											A2(_myrho$elm_round$Round$round, 1, percent * 100),
											'%')
									},
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: body,
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Spectre$meter = function (_p0) {
	var _p1 = _p0;
	return A2(
		_elm_lang$html$Html$meter,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('meter'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$value(
					_elm_lang$core$Basics$toString(_p1.value)),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$min(
						_elm_lang$core$Basics$toString(_p1.min)),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$max(
							_elm_lang$core$Basics$toString(_p1.max)),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html_Attributes$property,
								'low',
								_elm_lang$core$Json_Encode$string(
									_elm_lang$core$Basics$toString(_p1.low))),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html_Attributes$property,
									'high',
									_elm_lang$core$Json_Encode$string(
										_elm_lang$core$Basics$toString(_p1.high))),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html_Attributes$property,
										'optimum',
										_elm_lang$core$Json_Encode$string(
											_elm_lang$core$Basics$toString(_p1.optimum))),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		},
		{ctor: '[]'});
};
var _user$project$Spectre$Meter = F6(
	function (a, b, c, d, e, f) {
		return {value: a, min: b, max: c, low: d, high: e, optimum: f};
	});
var _user$project$Spectre$ProgressBar = F2(
	function (a, b) {
		return {value: a, max: b};
	});

var _user$project$StatusEffects$tick = F2(
	function (dt, effects) {
		var updater = F2(
			function (k, _p0) {
				var _p1 = _p0;
				return {ctor: '_Tuple2', _0: _p1._0 + dt, _1: _p1._1};
			});
		return A2(
			_eeue56$elm_all_dict$EveryDict$filter,
			F2(
				function (_p3, _p2) {
					var _p4 = _p2;
					return _elm_lang$core$Native_Utils.cmp(_p4._0, _p4._1) < 0;
				}),
			A2(
				_eeue56$elm_all_dict$EveryDict$map,
				F2(
					function (_p6, _p5) {
						var _p7 = _p5;
						return {ctor: '_Tuple2', _0: _p7._0 + dt, _1: _p7._1};
					}),
				effects));
	});
var _user$project$StatusEffects$descriptionOf = function (effect) {
	var _p8 = effect;
	return 'Survivor consumes less food when conscious and works harder';
};
var _user$project$StatusEffects$viewEffect = F2(
	function (effect, _p9) {
		var _p10 = _p9;
		return A2(
			_elm_lang$html$Html$li,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$strong,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(effect),
								': ')),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html$text(
						A2(
							_elm_lang$core$Basics_ops['++'],
							A2(_myrho$elm_round$Round$round, 0, _p10._1 - _p10._0),
							' seconds')),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(
									_user$project$StatusEffects$descriptionOf(effect)),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$StatusEffects$viewSidebar = function (effects) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('panel'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('panel-header'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel-title'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Temporary Effects'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('panel-body'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$ul,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('list-unstyled'),
										_1: {ctor: '[]'}
									},
									A2(
										_elm_lang$core$List$map,
										function (_p11) {
											var _p12 = _p11;
											return A2(_user$project$StatusEffects$viewEffect, _p12._0, _p12._1);
										},
										_eeue56$elm_all_dict$EveryDict$toList(effects))),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$StatusEffects$durationOf = function (effect) {
	return _elm_lang$core$Time$inSeconds(
		function () {
			var _p13 = effect;
			return _elm_lang$core$Time$minute * 3;
		}());
};
var _user$project$StatusEffects$member = function (key) {
	return _eeue56$elm_all_dict$EveryDict$member(key);
};
var _user$project$StatusEffects$insert = function (effect) {
	return A2(
		_eeue56$elm_all_dict$EveryDict$insert,
		effect,
		{
			ctor: '_Tuple2',
			_0: 0,
			_1: _user$project$StatusEffects$durationOf(effect)
		});
};
var _user$project$StatusEffects$isEmpty = _eeue56$elm_all_dict$EveryDict$isEmpty;
var _user$project$StatusEffects$empty = _eeue56$elm_all_dict$EveryDict$empty;
var _user$project$StatusEffects$Amphetamine = {ctor: 'Amphetamine'};

var _user$project$Survivor$isResearching = function (survivor) {
	var _p0 = survivor.action;
	if (_p0.ctor === 'Researching') {
		return true;
	} else {
		return false;
	}
};
var _user$project$Survivor$isFabricating = function (survivor) {
	var _p1 = survivor.action;
	if (_p1.ctor === 'Fabricating') {
		return true;
	} else {
		return false;
	}
};
var _user$project$Survivor$isIdling = function (survivor) {
	var _p2 = survivor.action;
	if (_p2.ctor === 'Idling') {
		return true;
	} else {
		return false;
	}
};
var _user$project$Survivor$isSuspended = function (_) {
	return _.suspended;
};
var _user$project$Survivor$init = {suspended: true, dead: false, action: _user$project$Action$Idling};
var _user$project$Survivor$Survivor = F3(
	function (a, b, c) {
		return {suspended: a, dead: b, action: c};
	});

var _user$project$Main$viewHelp = A2(
	_elm_lang$html$Html$div,
	{ctor: '[]'},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$html$Html$p,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('\n                An escape pod has crash-landed on a planet with a single survivor.\n            '),
				_1: {ctor: '[]'}
			}),
		_1: {
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$p,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('\n                The survivor can be suspended in the pod\'s stasis goo to consume very few resources.\n                Or you can wake them up to build / research improvements that will help them get\n                off the planet.\n            '),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$ul,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$li,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('\n                The pod\'s weak energy grid can only power either the matter collector or the life support system\n             '),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$li,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('\n                Until you fabricate some energy subsystems, you\'ll have to click and hold on the Power\n                Uplink button to charge the pod remotely.\n             '),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$li,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('\n                The survivor can only work on their task when conscious.\n             '),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$li,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('\n                The survivor dies once any of the life support vitals reaches zero.\n             '),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$li,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('\n                Fabrication costs power and matter. Research only costs time.\n             '),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			}
		}
	});
var _user$project$Main$viewDeathMessage = A2(
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('toast'),
		_1: {ctor: '[]'}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$p,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$strong,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Your survivor has died.'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html$text(' Thanks for checking out this crude lil demo.'),
					_1: {ctor: '[]'}
				}
			}),
		_1: {ctor: '[]'}
	});
var _user$project$Main$viewAbilities = function (_p0) {
	var _p1 = _p0;
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('panel'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('panel-header'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel-title'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Abilities'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('panel-body'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$ul,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('list-unstyled'),
										_1: {ctor: '[]'}
									},
									A2(
										_elm_lang$core$List$map,
										function (a) {
											return A2(
												_elm_lang$html$Html$li,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text(
														_elm_lang$core$Basics$toString(a)),
													_1: {ctor: '[]'}
												});
										},
										_user$project$Abilities$toList(_p1.abilities))),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$viewInventory = function (_p2) {
	var _p3 = _p2;
	var _p4 = _p3.inventory;
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('panel'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('panel-header'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel-title'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Inventory'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('panel-body'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$ul,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('list-unstyled'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$core$Native_Utils.eq(_p4.solarPanels, 0) ? _elm_lang$html$Html$text('') : A2(
											_elm_lang$html$Html$li,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(
													A2(
														_elm_lang$core$Basics_ops['++'],
														'Solar Panels: ',
														_elm_lang$core$Basics$toString(_p4.solarPanels))),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: _elm_lang$core$Native_Utils.eq(_p4.matterBins, 0) ? _elm_lang$html$Html$text('') : A2(
												_elm_lang$html$Html$li,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text(
														A2(
															_elm_lang$core$Basics_ops['++'],
															'Matter Bins: ',
															_elm_lang$core$Basics$toString(_p4.matterBins))),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$powerGrowthPerSecond = function (model) {
	var charged = function () {
		var chargedFromSolarPanels = _elm_lang$core$Basics$toFloat(model.inventory.solarPanels) * 0.75;
		var chargedFromUplink = model.charging ? 3 : 0;
		return chargedFromUplink + chargedFromSolarPanels;
	}();
	return charged;
};
var _user$project$Main$matterGrowthPerSecond = function (model) {
	var _p5 = model.powerTarget;
	if (_p5.ctor === 'MatterCollector') {
		return _elm_lang$core$Native_Utils.eq(model.power.curr, 0) ? 0 : 1;
	} else {
		return 0;
	}
};
var _user$project$Main$tickMatterGrowth = F2(
	function (dt, model) {
		var prev = model.matter;
		var next = _elm_lang$core$Native_Utils.update(
			prev,
			{
				curr: A2(
					_elm_lang$core$Basics$min,
					prev.max,
					A2(
						F2(
							function (x, y) {
								return x + y;
							}),
						dt * _user$project$Main$matterGrowthPerSecond(model),
						prev.curr))
			});
		return _elm_lang$core$Native_Utils.update(
			model,
			{matter: next});
	});
var _user$project$Main$getFabricatorConsumption = function (model) {
	if (model.survivor.suspended) {
		return {matter: 0, power: 0};
	} else {
		var _p6 = model.survivor.action;
		if (_p6.ctor === 'Fabricating') {
			return {matter: 2, power: 1};
		} else {
			return {matter: 0, power: 0};
		}
	}
};
var _user$project$Main$netMatterPerSecond = function (model) {
	var produced = _user$project$Main$matterGrowthPerSecond(model);
	var consumed = function (_) {
		return _.matter;
	}(
		_user$project$Main$getFabricatorConsumption(model));
	return produced - consumed;
};
var _user$project$Main$netPowerPerSecond = function (model) {
	var produced = _user$project$Main$powerGrowthPerSecond(model);
	var consumed = function () {
		var fabricator = function (_) {
			return _.power;
		}(
			_user$project$Main$getFabricatorConsumption(model));
		var base = 1;
		return base + fabricator;
	}();
	return produced - consumed;
};
var _user$project$Main$tickPower = F2(
	function (dt, model) {
		var power = model.power;
		var nextPower = _elm_lang$core$Native_Utils.update(
			power,
			{
				curr: A2(
					_elm_lang$core$Basics$max,
					0,
					A2(
						_elm_lang$core$Basics$min,
						power.max,
						A2(
							F2(
								function (x, y) {
									return x + y;
								}),
							dt * _user$project$Main$netPowerPerSecond(model),
							power.curr)))
			});
		return _elm_lang$core$Native_Utils.update(
			model,
			{power: nextPower});
	});
var _user$project$Main$getFabricatorEfficiency = function (model) {
	return _elm_lang$core$List$sum(
		{
			ctor: '::',
			_0: 0.5,
			_1: {
				ctor: '::',
				_0: A2(_user$project$Abilities$member, _user$project$Ability$Engineering, model.abilities) ? 0.25 : 0,
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$tickFabrication = F2(
	function (dt, model) {
		var _p7 = model;
		var survivor = _p7.survivor;
		var inventory = _p7.inventory;
		var matter = _p7.matter;
		var power = _p7.power;
		if (_elm_lang$core$Native_Utils.eq(matter.curr, 0) || _elm_lang$core$Native_Utils.eq(power.curr, 0)) {
			return model;
		} else {
			var _p8 = survivor.action;
			if (_p8.ctor === 'Fabricating') {
				var _p15 = _p8._1.max;
				var _p14 = _p8._0;
				var _p13 = _p8._1.curr;
				var _p9 = function () {
					var consumed = _user$project$Main$getFabricatorConsumption(model);
					return {
						ctor: '_Tuple2',
						_0: A2(
							F2(
								function (x, y) {
									return x * y;
								}),
							dt,
							A2(_elm_lang$core$Basics$min, matter.curr, consumed.matter)),
						_1: A2(
							F2(
								function (x, y) {
									return x * y;
								}),
							dt,
							A2(_elm_lang$core$Basics$min, power.curr, consumed.power))
					};
				}();
				var matterConsumed = _p9._0;
				var powerConsumed = _p9._1;
				var matterApplied = matterConsumed * _user$project$Main$getFabricatorEfficiency(model);
				var nextMatter = A2(_user$project$Quantity$Quantity, matter.curr - matterConsumed, matter.max);
				var nextPower = A2(_user$project$Quantity$Quantity, power.curr - powerConsumed, power.max);
				return (_elm_lang$core$Native_Utils.cmp(_p13 + matterApplied, _p15) > -1) ? _elm_lang$core$Native_Utils.update(
					model,
					{
						survivor: _elm_lang$core$Native_Utils.update(
							survivor,
							{action: _user$project$Action$Idling}),
						statusEffects: function () {
							var _p10 = _p14;
							if (_p10.ctor === 'Amphetamine') {
								return A2(_user$project$StatusEffects$insert, _user$project$StatusEffects$Amphetamine, model.statusEffects);
							} else {
								return model.statusEffects;
							}
						}(),
						inventory: function () {
							var _p11 = _p14;
							switch (_p11.ctor) {
								case 'SolarPanel':
									return _elm_lang$core$Native_Utils.update(
										inventory,
										{solarPanels: inventory.solarPanels + 1});
								case 'MatterBin':
									return _elm_lang$core$Native_Utils.update(
										inventory,
										{matterBins: inventory.matterBins + 1});
								default:
									return inventory;
							}
						}(),
						matter: function () {
							var _p12 = _p14;
							if (_p12.ctor === 'MatterBin') {
								return _elm_lang$core$Native_Utils.update(
									nextMatter,
									{max: nextMatter.max + 100});
							} else {
								return nextMatter;
							}
						}()
					}) : _elm_lang$core$Native_Utils.update(
					model,
					{
						survivor: _elm_lang$core$Native_Utils.update(
							survivor,
							{
								action: A2(
									_user$project$Action$Fabricating,
									_p14,
									A2(_user$project$Quantity$Quantity, _p13 + matterApplied, _p15))
							}),
						matter: nextMatter,
						power: nextPower
					});
			} else {
				return model;
			}
		}
	});
var _user$project$Main$tickAction = F2(
	function (dt, model) {
		var _p16 = model;
		var survivor = _p16.survivor;
		if (survivor.suspended) {
			return model;
		} else {
			var _p17 = survivor.action;
			switch (_p17.ctor) {
				case 'Idling':
					return model;
				case 'Fabricating':
					return A2(_user$project$Main$tickFabrication, dt, model);
				default:
					var _p20 = _p17._1._1;
					var _p19 = _p17._1._0;
					var _p18 = _p17._0;
					var deltaResearch = function (dr) {
						return A2(_user$project$StatusEffects$member, _user$project$StatusEffects$Amphetamine, model.statusEffects) ? (dr + (dr * 0.25)) : dr;
					}(dt);
					return (_elm_lang$core$Native_Utils.cmp(_p19 + deltaResearch, _p20) > -1) ? _elm_lang$core$Native_Utils.update(
						model,
						{
							abilities: A2(_user$project$Abilities$insert, _p18, model.abilities),
							survivor: _elm_lang$core$Native_Utils.update(
								survivor,
								{action: _user$project$Action$Idling})
						}) : _elm_lang$core$Native_Utils.update(
						model,
						{
							survivor: _elm_lang$core$Native_Utils.update(
								survivor,
								{
									action: A2(
										_user$project$Action$Researching,
										_p18,
										{ctor: '_Tuple2', _0: _p19 + deltaResearch, _1: _p20})
								})
						});
			}
		}
	});
var _user$project$Main$oxygenConsumedPerSecond = function (model) {
	var consumedBySurvivor = function () {
		if (model.survivor.suspended) {
			return 0.5;
		} else {
			var consciousBase = 3.0;
			return A2(_user$project$Abilities$member, _user$project$Ability$ShallowBreathing, model.abilities) ? (consciousBase - 0.75) : consciousBase;
		}
	}();
	return consumedBySurvivor;
};
var _user$project$Main$oxygenProducedPerSecond = function (model) {
	var _p21 = model.powerTarget;
	if (_p21.ctor === 'LifeSupport') {
		return _elm_lang$core$Native_Utils.eq(model.power.curr, 0) ? 0 : 1;
	} else {
		return 0;
	}
};
var _user$project$Main$oxygenNetPerSecond = function (model) {
	return _user$project$Main$oxygenProducedPerSecond(model) - _user$project$Main$oxygenConsumedPerSecond(model);
};
var _user$project$Main$tickOxygen = F2(
	function (dt, model) {
		var oxygen = model.oxygen;
		var nextOxygen = _elm_lang$core$Native_Utils.update(
			oxygen,
			{
				curr: A2(
					_elm_lang$core$Basics$max,
					0,
					A2(
						_elm_lang$core$Basics$min,
						oxygen.max,
						A2(
							F2(
								function (x, y) {
									return x + y;
								}),
							dt * _user$project$Main$oxygenNetPerSecond(model),
							oxygen.curr)))
			});
		var _p22 = model;
		var survivor = _p22.survivor;
		var nextSurvivor = _elm_lang$core$Native_Utils.update(
			survivor,
			{
				dead: _elm_lang$core$Native_Utils.eq(nextOxygen.curr, 0)
			});
		return _elm_lang$core$Native_Utils.update(
			model,
			{oxygen: nextOxygen, survivor: nextSurvivor, paused: nextSurvivor.dead});
	});
var _user$project$Main$foodConsumedPerSecond = function (model) {
	return function (consumed) {
		return A2(_user$project$StatusEffects$member, _user$project$StatusEffects$Amphetamine, model.statusEffects) ? (consumed * 0.5) : consumed;
	}(
		model.survivor.suspended ? 0.2 : 2.0);
};
var _user$project$Main$foodProducedPerSecond = function (model) {
	var _p23 = model.powerTarget;
	if (_p23.ctor === 'LifeSupport') {
		return _elm_lang$core$Native_Utils.eq(model.power.curr, 0) ? 0 : 0.8;
	} else {
		return 0;
	}
};
var _user$project$Main$foodNetPerSecond = function (model) {
	return _user$project$Main$foodProducedPerSecond(model) - _user$project$Main$foodConsumedPerSecond(model);
};
var _user$project$Main$tickFood = F2(
	function (dt, model) {
		var food = model.food;
		var nextFood = _elm_lang$core$Native_Utils.update(
			food,
			{
				curr: A2(
					_elm_lang$core$Basics$max,
					0,
					A2(
						_elm_lang$core$Basics$min,
						food.max,
						A2(
							F2(
								function (x, y) {
									return x + y;
								}),
							dt * _user$project$Main$foodNetPerSecond(model),
							food.curr)))
			});
		return _elm_lang$core$Native_Utils.update(
			model,
			{food: nextFood});
	});
var _user$project$Main$tickPod = F2(
	function (dt, model) {
		return function (m) {
			return _elm_lang$core$Native_Utils.update(
				m,
				{
					statusEffects: A2(_user$project$StatusEffects$tick, dt, m.statusEffects)
				});
		}(
			A2(
				_user$project$Main$tickAction,
				dt,
				A2(
					_user$project$Main$tickMatterGrowth,
					dt,
					A2(
						_user$project$Main$tickFood,
						dt,
						A2(
							_user$project$Main$tickOxygen,
							dt,
							A2(_user$project$Main$tickPower, dt, model))))));
	});
var _user$project$Main$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return {survivor: a, power: b, powerTarget: c, oxygen: d, food: e, matter: f, charging: g, paused: h, inventory: i, statusEffects: j, abilities: k, isDev: l, actionTab: m, showHelp: n};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Main$Flags = function (a) {
	return {isDev: a};
};
var _user$project$Main$Research = {ctor: 'Research'};
var _user$project$Main$Fabrication = {ctor: 'Fabrication'};
var _user$project$Main$MatterCollector = {ctor: 'MatterCollector'};
var _user$project$Main$LifeSupport = {ctor: 'LifeSupport'};
var _user$project$Main$initPodState = {
	survivor: _user$project$Survivor$init,
	power: A2(_user$project$Quantity$Quantity, 30, 100),
	powerTarget: _user$project$Main$LifeSupport,
	oxygen: A2(_user$project$Quantity$Quantity, 50, 100),
	food: A2(_user$project$Quantity$Quantity, 30, 50),
	matter: A2(_user$project$Quantity$Quantity, 20, 100),
	charging: false,
	paused: false,
	inventory: _user$project$Inventory$empty,
	statusEffects: _user$project$StatusEffects$empty,
	abilities: _user$project$Abilities$empty,
	isDev: false,
	actionTab: _user$project$Main$Fabrication,
	showHelp: true
};
var _user$project$Main$init = function (_p24) {
	var _p25 = _p24;
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Native_Utils.update(
			_user$project$Main$initPodState,
			{isDev: _p25.isDev}),
		_1: _elm_lang$core$Platform_Cmd$none
	};
};
var _user$project$Main$IncResources = {ctor: 'IncResources'};
var _user$project$Main$AddAbility = function (a) {
	return {ctor: 'AddAbility', _0: a};
};
var _user$project$Main$AddInventory = function (a) {
	return {ctor: 'AddInventory', _0: a};
};
var _user$project$Main$AddStatusEffect = function (a) {
	return {ctor: 'AddStatusEffect', _0: a};
};
var _user$project$Main$DevCheat = function (a) {
	return {ctor: 'DevCheat', _0: a};
};
var _user$project$Main$viewDevBar = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text('You are in dev mode. Double-click fabrications / upgrades to insta-buy them for free.'),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$button,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onClick(
							_user$project$Main$DevCheat(_user$project$Main$IncResources)),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('btn'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Increase Resources'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$DismissHelp = {ctor: 'DismissHelp'};
var _user$project$Main$BeginFabricating = function (a) {
	return {ctor: 'BeginFabricating', _0: a};
};
var _user$project$Main$SetActionTab = function (a) {
	return {ctor: 'SetActionTab', _0: a};
};
var _user$project$Main$SetPaused = function (a) {
	return {ctor: 'SetPaused', _0: a};
};
var _user$project$Main$viewPauseButton = function (model) {
	return A2(
		_elm_lang$html$Html$button,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(
				_user$project$Main$SetPaused(!model.paused)),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('btn'),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(
				model.paused ? 'Unpause' : 'Pause'),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$SetSurvivorAction = function (a) {
	return {ctor: 'SetSurvivorAction', _0: a};
};
var _user$project$Main$viewResearchTab = function (model) {
	var viewPrice = function (price) {
		return A2(
			_elm_lang$html$Html$strong,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(
					A2(
						_elm_lang$core$Basics_ops['++'],
						' (',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(price),
							' seconds) '))),
				_1: {ctor: '[]'}
			});
	};
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$ul,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: function () {
						var isSelected = function () {
							var _p26 = model.survivor.action;
							if ((_p26.ctor === 'Researching') && (_p26._0.ctor === 'ShallowBreathing')) {
								return true;
							} else {
								return false;
							}
						}();
						return A2(_user$project$Abilities$member, _user$project$Ability$ShallowBreathing, model.abilities) ? _elm_lang$html$Html$text('') : A2(
							_elm_lang$html$Html$li,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onClick(
									_user$project$Main$SetSurvivorAction(
										A2(
											_user$project$Action$Researching,
											_user$project$Ability$ShallowBreathing,
											{ctor: '_Tuple2', _0: 0, _1: 5}))),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onDoubleClick(
										_user$project$Main$DevCheat(
											_user$project$Main$AddAbility(_user$project$Ability$ShallowBreathing))),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$button,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$classList(
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'btn', _1: true},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'btn-primary', _1: isSelected},
													_1: {ctor: '[]'}
												}
											}),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$disabled(isSelected),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Shallow Breathing'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: viewPrice(
										_user$project$Ability$priceOf(_user$project$Ability$ShallowBreathing)),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											_user$project$Abilities$descriptionOf(_user$project$Ability$ShallowBreathing)),
										_1: {ctor: '[]'}
									}
								}
							});
					}(),
					_1: {
						ctor: '::',
						_0: function () {
							var isSelected = function () {
								var _p27 = model.survivor.action;
								if ((_p27.ctor === 'Researching') && (_p27._0.ctor === 'Engineering')) {
									return true;
								} else {
									return false;
								}
							}();
							return A2(_user$project$Abilities$member, _user$project$Ability$Engineering, model.abilities) ? _elm_lang$html$Html$text('') : A2(
								_elm_lang$html$Html$li,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(
										_user$project$Main$SetSurvivorAction(
											A2(
												_user$project$Action$Researching,
												_user$project$Ability$Engineering,
												{ctor: '_Tuple2', _0: 0, _1: 100}))),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Events$onDoubleClick(
											_user$project$Main$DevCheat(
												_user$project$Main$AddAbility(_user$project$Ability$Engineering))),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$button,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$classList(
												{
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'btn', _1: true},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'btn-primary', _1: isSelected},
														_1: {ctor: '[]'}
													}
												}),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$disabled(isSelected),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Engineering'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: viewPrice(
											_user$project$Ability$priceOf(_user$project$Ability$Engineering)),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												_user$project$Abilities$descriptionOf(_user$project$Ability$Engineering)),
											_1: {ctor: '[]'}
										}
									}
								});
						}(),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$SetSurvivorSuspension = function (a) {
	return {ctor: 'SetSurvivorSuspension', _0: a};
};
var _user$project$Main$SetPowerTarget = function (a) {
	return {ctor: 'SetPowerTarget', _0: a};
};
var _user$project$Main$viewStats = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('panel'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('panel-header'),
							_1: {ctor: '[]'}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('panel-body'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Survivor: '),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$span,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class(
												model.survivor.suspended ? 'text-green' : 'text-red'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												model.survivor.suspended ? 'Suspended' : 'Conscious'),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html$text(
													model.survivor.suspended ? ' 💤 ' : ' ❗ ️'),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html$text(' '),
													_1: {ctor: '[]'}
												}
											}
										}),
									_1: {
										ctor: '::',
										_0: model.survivor.suspended ? A2(
											_elm_lang$html$Html$button,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onClick(
													_user$project$Main$SetSurvivorSuspension(false)),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('btn btn-sm'),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Wake Up'),
												_1: {ctor: '[]'}
											}) : A2(
											_elm_lang$html$Html$button,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onClick(
													_user$project$Main$SetSurvivorSuspension(true)),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('btn btn-sm'),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Suspend'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: function () {
												var rate = _user$project$Main$netPowerPerSecond(model);
												return A2(
													_elm_lang$html$Html$div,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$span,
															{ctor: '[]'},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text('Power: '),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html$text(
																		A2(_myrho$elm_round$Round$round, 1, model.power.curr)),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('/'),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html$text(
																				A2(_myrho$elm_round$Round$round, 1, model.power.max)),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html$text(' '),
																				_1: {
																					ctor: '::',
																					_0: (_elm_lang$core$Native_Utils.cmp(rate, 0) > -1) ? A2(
																						_elm_lang$html$Html$span,
																						{
																							ctor: '::',
																							_0: _elm_lang$html$Html_Attributes$class('text-green'),
																							_1: {ctor: '[]'}
																						},
																						{
																							ctor: '::',
																							_0: _elm_lang$html$Html$text(
																								A2(
																									_elm_lang$core$Basics_ops['++'],
																									'+',
																									A2(
																										_elm_lang$core$Basics_ops['++'],
																										A2(_myrho$elm_round$Round$round, 1, rate),
																										'/sec'))),
																							_1: {ctor: '[]'}
																						}) : A2(
																						_elm_lang$html$Html$span,
																						{
																							ctor: '::',
																							_0: _elm_lang$html$Html_Attributes$class('text-red'),
																							_1: {ctor: '[]'}
																						},
																						{
																							ctor: '::',
																							_0: _elm_lang$html$Html$text(
																								A2(
																									_elm_lang$core$Basics_ops['++'],
																									A2(_myrho$elm_round$Round$round, 1, rate),
																									'/sec')),
																							_1: {ctor: '[]'}
																						}),
																					_1: {ctor: '[]'}
																				}
																			}
																		}
																	}
																}
															}),
														_1: {
															ctor: '::',
															_0: _user$project$Spectre$meter(
																{value: model.power.curr, min: 0, max: model.power.max, low: 25, high: 50, optimum: model.power.max}),
															_1: {ctor: '[]'}
														}
													});
											}(),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$div,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$class('divider'),
														_1: {ctor: '[]'}
													},
													{ctor: '[]'}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$div,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('Matter Collector '),
															_1: {
																ctor: '::',
																_0: _elm_lang$core$Native_Utils.eq(model.powerTarget, _user$project$Main$MatterCollector) ? A2(
																	_elm_lang$html$Html$span,
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html_Attributes$class('label label-success'),
																		_1: {ctor: '[]'}
																	},
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('Powered '),
																		_1: {ctor: '[]'}
																	}) : A2(
																	_elm_lang$html$Html$button,
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html_Events$onClick(
																			_user$project$Main$SetPowerTarget(_user$project$Main$MatterCollector)),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html_Attributes$class('btn btn-sm'),
																			_1: {ctor: '[]'}
																		}
																	},
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('Divert Power'),
																		_1: {ctor: '[]'}
																	}),
																_1: {ctor: '[]'}
															}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$div,
															{ctor: '[]'},
															{
																ctor: '::',
																_0: function () {
																	var rate = _user$project$Main$netMatterPerSecond(model);
																	return A2(
																		_elm_lang$html$Html$span,
																		{ctor: '[]'},
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html$text('Matter: '),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html$text(
																					A2(_myrho$elm_round$Round$round, 1, model.matter.curr)),
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$html$Html$text('/'),
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$html$Html$text(
																							A2(_myrho$elm_round$Round$round, 1, model.matter.max)),
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$html$Html$text(' '),
																							_1: {
																								ctor: '::',
																								_0: (_elm_lang$core$Native_Utils.cmp(rate, 0) > -1) ? A2(
																									_elm_lang$html$Html$span,
																									{
																										ctor: '::',
																										_0: _elm_lang$html$Html_Attributes$class('text-green'),
																										_1: {ctor: '[]'}
																									},
																									{
																										ctor: '::',
																										_0: _elm_lang$html$Html$text(
																											A2(
																												_elm_lang$core$Basics_ops['++'],
																												'+',
																												A2(
																													_elm_lang$core$Basics_ops['++'],
																													A2(_myrho$elm_round$Round$round, 1, rate),
																													'/sec'))),
																										_1: {ctor: '[]'}
																									}) : A2(
																									_elm_lang$html$Html$span,
																									{
																										ctor: '::',
																										_0: _elm_lang$html$Html_Attributes$class('text-red'),
																										_1: {ctor: '[]'}
																									},
																									{
																										ctor: '::',
																										_0: _elm_lang$html$Html$text(
																											A2(
																												_elm_lang$core$Basics_ops['++'],
																												A2(_myrho$elm_round$Round$round, 1, rate),
																												'/sec')),
																										_1: {ctor: '[]'}
																									}),
																								_1: {ctor: '[]'}
																							}
																						}
																					}
																				}
																			}
																		});
																}(),
																_1: {
																	ctor: '::',
																	_0: _user$project$Spectre$meter(
																		{value: model.matter.curr, min: 0, max: model.matter.max, low: 0, high: 0, optimum: model.matter.max}),
																	_1: {ctor: '[]'}
																}
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$html$Html$div,
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html_Attributes$class('divider'),
																	_1: {ctor: '[]'}
																},
																{ctor: '[]'}),
															_1: {
																ctor: '::',
																_0: A2(
																	_elm_lang$html$Html$div,
																	{ctor: '[]'},
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('Life Support '),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$core$Native_Utils.eq(model.powerTarget, _user$project$Main$LifeSupport) ? A2(
																				_elm_lang$html$Html$span,
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html_Attributes$class('label label-success'),
																					_1: {ctor: '[]'}
																				},
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html$text('Powered '),
																					_1: {ctor: '[]'}
																				}) : A2(
																				_elm_lang$html$Html$button,
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html_Events$onClick(
																						_user$project$Main$SetPowerTarget(_user$project$Main$LifeSupport)),
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$html$Html_Attributes$class('btn btn-sm'),
																						_1: {ctor: '[]'}
																					}
																				},
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html$text('Divert Power'),
																					_1: {ctor: '[]'}
																				}),
																			_1: {ctor: '[]'}
																		}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$html$Html$div,
																		{ctor: '[]'},
																		{
																			ctor: '::',
																			_0: function () {
																				var rate = _user$project$Main$oxygenNetPerSecond(model);
																				return A2(
																					_elm_lang$html$Html$span,
																					{ctor: '[]'},
																					{
																						ctor: '::',
																						_0: _elm_lang$html$Html$text('Oxygen: '),
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$html$Html$text(
																								A2(_myrho$elm_round$Round$round, 1, model.oxygen.curr)),
																							_1: {
																								ctor: '::',
																								_0: _elm_lang$html$Html$text('/'),
																								_1: {
																									ctor: '::',
																									_0: _elm_lang$html$Html$text(
																										A2(_myrho$elm_round$Round$round, 1, model.oxygen.max)),
																									_1: {
																										ctor: '::',
																										_0: _elm_lang$html$Html$text(' '),
																										_1: {
																											ctor: '::',
																											_0: (_elm_lang$core$Native_Utils.cmp(rate, 0) > -1) ? A2(
																												_elm_lang$html$Html$span,
																												{
																													ctor: '::',
																													_0: _elm_lang$html$Html_Attributes$class('text-green'),
																													_1: {ctor: '[]'}
																												},
																												{
																													ctor: '::',
																													_0: _elm_lang$html$Html$text(
																														A2(
																															_elm_lang$core$Basics_ops['++'],
																															'+',
																															A2(
																																_elm_lang$core$Basics_ops['++'],
																																A2(_myrho$elm_round$Round$round, 1, rate),
																																'/sec'))),
																													_1: {ctor: '[]'}
																												}) : A2(
																												_elm_lang$html$Html$span,
																												{
																													ctor: '::',
																													_0: _elm_lang$html$Html_Attributes$class('text-red'),
																													_1: {ctor: '[]'}
																												},
																												{
																													ctor: '::',
																													_0: _elm_lang$html$Html$text(
																														A2(
																															_elm_lang$core$Basics_ops['++'],
																															A2(_myrho$elm_round$Round$round, 1, rate),
																															'/sec')),
																													_1: {ctor: '[]'}
																												}),
																											_1: {ctor: '[]'}
																										}
																									}
																								}
																							}
																						}
																					});
																			}(),
																			_1: {
																				ctor: '::',
																				_0: _user$project$Spectre$meter(
																					{value: model.oxygen.curr, min: 0, max: model.oxygen.max, low: 25, high: 50, optimum: model.oxygen.max}),
																				_1: {
																					ctor: '::',
																					_0: function () {
																						var rate = _user$project$Main$foodNetPerSecond(model);
																						return A2(
																							_elm_lang$html$Html$span,
																							{ctor: '[]'},
																							{
																								ctor: '::',
																								_0: _elm_lang$html$Html$text('Food: '),
																								_1: {
																									ctor: '::',
																									_0: _elm_lang$html$Html$text(
																										A2(_myrho$elm_round$Round$round, 1, model.food.curr)),
																									_1: {
																										ctor: '::',
																										_0: _elm_lang$html$Html$text('/'),
																										_1: {
																											ctor: '::',
																											_0: _elm_lang$html$Html$text(
																												A2(_myrho$elm_round$Round$round, 1, model.food.max)),
																											_1: {
																												ctor: '::',
																												_0: _elm_lang$html$Html$text(' '),
																												_1: {
																													ctor: '::',
																													_0: (_elm_lang$core$Native_Utils.cmp(rate, 0) > -1) ? A2(
																														_elm_lang$html$Html$span,
																														{
																															ctor: '::',
																															_0: _elm_lang$html$Html_Attributes$class('text-green'),
																															_1: {ctor: '[]'}
																														},
																														{
																															ctor: '::',
																															_0: _elm_lang$html$Html$text(
																																A2(
																																	_elm_lang$core$Basics_ops['++'],
																																	'+',
																																	A2(
																																		_elm_lang$core$Basics_ops['++'],
																																		A2(_myrho$elm_round$Round$round, 1, rate),
																																		'/sec'))),
																															_1: {ctor: '[]'}
																														}) : A2(
																														_elm_lang$html$Html$span,
																														{
																															ctor: '::',
																															_0: _elm_lang$html$Html_Attributes$class('text-red'),
																															_1: {ctor: '[]'}
																														},
																														{
																															ctor: '::',
																															_0: _elm_lang$html$Html$text(
																																A2(
																																	_elm_lang$core$Basics_ops['++'],
																																	A2(_myrho$elm_round$Round$round, 1, rate),
																																	'/sec')),
																															_1: {ctor: '[]'}
																														}),
																													_1: {ctor: '[]'}
																												}
																											}
																										}
																									}
																								}
																							});
																					}(),
																					_1: {
																						ctor: '::',
																						_0: _user$project$Spectre$meter(
																							{value: model.food.curr, min: 0, max: model.food.max, low: model.food.max * 0.25, high: model.food.max * 0.5, optimum: model.food.max}),
																						_1: {ctor: '[]'}
																					}
																				}
																			}
																		}),
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel-footer'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$SetCharging = function (a) {
	return {ctor: 'SetCharging', _0: a};
};
var _user$project$Main$viewPowerUplink = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('panel'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('panel-header'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('panel-title'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text('Remote Power Uplink'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('panel-body'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$p,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$button,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Events$onMouseDown(
											_user$project$Main$SetCharging(true)),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Events$onMouseUp(
												_user$project$Main$SetCharging(false)),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$style(
													{
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('btn'),
													_1: {ctor: '[]'}
												}
											}
										}
									},
									{
										ctor: '::',
										_0: model.charging ? A2(
											_elm_lang$html$Html$span,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$i,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$class('fa fa-spinner fa-spin'),
														_1: {ctor: '[]'}
													},
													{ctor: '[]'}),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html$text(' Charging'),
													_1: {ctor: '[]'}
												}
											}) : _elm_lang$html$Html$text('Click and hold to charge the pod remotely'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$Tick = function (a) {
	return {ctor: 'Tick', _0: a};
};
var _user$project$Main$subscriptions = function (model) {
	return model.paused ? _elm_lang$core$Platform_Sub$none : _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: _elm_lang$animation_frame$AnimationFrame$diffs(_user$project$Main$Tick),
			_1: {
				ctor: '::',
				_0: _user$project$Port$mouseUp(
					function (_p28) {
						return _user$project$Main$SetCharging(false);
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$NoOp = {ctor: 'NoOp'};
var _user$project$Main$update = F2(
	function (msg, model) {
		update:
		while (true) {
			var _p29 = msg;
			switch (_p29.ctor) {
				case 'NoOp':
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				case 'DismissHelp':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{showHelp: false}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'SetPaused':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{paused: _p29._0}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'Tick':
					var dt = _elm_lang$core$Time$inSeconds(_p29._0);
					var nextModel = A2(_user$project$Main$tickPod, dt, model);
					return {ctor: '_Tuple2', _0: nextModel, _1: _elm_lang$core$Platform_Cmd$none};
				case 'SetCharging':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{charging: _p29._0}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'SetSurvivorSuspension':
					var survivor = model.survivor;
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								survivor: _elm_lang$core$Native_Utils.update(
									survivor,
									{suspended: _p29._0})
							}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'SetSurvivorAction':
					var survivor = model.survivor;
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								survivor: _elm_lang$core$Native_Utils.update(
									survivor,
									{action: _p29._0})
							}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'SetPowerTarget':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{powerTarget: _p29._0}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'SetActionTab':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{actionTab: _p29._0}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'BeginFabricating':
					var _p32 = _p29._0;
					var price = function () {
						var _p30 = _p32;
						switch (_p30.ctor) {
							case 'SolarPanel':
								return A2(_user$project$Item$matterCostOf, _p32, model.inventory.solarPanels);
							case 'MatterBin':
								return A2(_user$project$Item$matterCostOf, _p32, model.inventory.matterBins);
							default:
								return A2(_user$project$Item$matterCostOf, _p32, 0);
						}
					}();
					var _p31 = model;
					var survivor = _p31.survivor;
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								survivor: _elm_lang$core$Native_Utils.update(
									survivor,
									{
										action: A2(
											_user$project$Action$Fabricating,
											_p32,
											A2(_user$project$Quantity$Quantity, 0, price))
									})
							}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				default:
					if (!model.isDev) {
						var _v16 = _user$project$Main$NoOp,
							_v17 = model;
						msg = _v16;
						model = _v17;
						continue update;
					} else {
						var nextModel = function () {
							var _p33 = _p29._0;
							switch (_p33.ctor) {
								case 'AddStatusEffect':
									return _elm_lang$core$Native_Utils.update(
										model,
										{
											statusEffects: A2(_user$project$StatusEffects$insert, _p33._0, model.statusEffects)
										});
								case 'AddAbility':
									return _elm_lang$core$Native_Utils.update(
										model,
										{
											abilities: A2(_user$project$Abilities$insert, _p33._0, model.abilities)
										});
								case 'AddInventory':
									var inventory = model.inventory;
									return _elm_lang$core$Native_Utils.update(
										model,
										{
											inventory: function () {
												var _p34 = _p33._0;
												switch (_p34.ctor) {
													case 'SolarPanel':
														return _elm_lang$core$Native_Utils.update(
															inventory,
															{solarPanels: inventory.solarPanels + 1});
													case 'MatterBin':
														return _elm_lang$core$Native_Utils.update(
															inventory,
															{matterBins: inventory.matterBins + 1});
													default:
														return inventory;
												}
											}()
										});
								default:
									var maxFood = model.food.max;
									var maxOxygen = model.oxygen.max;
									var maxMatter = model.matter.max;
									var maxPower = model.power.max;
									return _elm_lang$core$Native_Utils.update(
										model,
										{
											power: A2(_user$project$Quantity$Quantity, maxPower, maxPower),
											matter: A2(_user$project$Quantity$Quantity, maxMatter, maxMatter),
											oxygen: A2(_user$project$Quantity$Quantity, maxOxygen, maxOxygen),
											food: A2(_user$project$Quantity$Quantity, maxFood, maxFood)
										});
							}
						}();
						return {ctor: '_Tuple2', _0: nextModel, _1: _elm_lang$core$Platform_Cmd$none};
					}
			}
		}
	});
var _user$project$Main$viewFabricationTab = function (model) {
	var viewPrice = function (price) {
		return A2(
			_elm_lang$html$Html$strong,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(
					A2(
						_elm_lang$core$Basics_ops['++'],
						' (',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(price),
							' matter)'))),
				_1: {ctor: '[]'}
			});
	};
	var efficiency = _user$project$Main$getFabricatorEfficiency(model);
	var percentString = A2(
		_elm_lang$core$Basics_ops['++'],
		A2(_myrho$elm_round$Round$round, 2, efficiency * 100),
		'%');
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$p,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$strong,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(
								A2(_elm_lang$core$Basics_ops['++'], percentString, ' Efficiency: ')),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'For every 1.00 matter consumed, ',
								A2(
									_elm_lang$core$Basics_ops['++'],
									A2(_myrho$elm_round$Round$round, 2, efficiency),
									' matter is fabricated.'))),
						_1: {ctor: '[]'}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$p,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('The survivor can build items while they are conscious and there is matter in the matter collector.'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('divider text-center'),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$html$Html_Attributes$attribute, 'data-content', 'Permanent'),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$ul,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: function () {
									var price = _user$project$Price$priceOfSolarPanel(model.inventory.solarPanels);
									var isSelected = function () {
										var _p35 = model.survivor.action;
										if ((_p35.ctor === 'Fabricating') && (_p35._0.ctor === 'SolarPanel')) {
											return true;
										} else {
											return false;
										}
									}();
									return A2(
										_elm_lang$html$Html$li,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Events$onClick(
												isSelected ? _user$project$Main$NoOp : _user$project$Main$BeginFabricating(_user$project$Item$SolarPanel)),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onDoubleClick(
													_user$project$Main$DevCheat(
														_user$project$Main$AddInventory(_user$project$Item$SolarPanel))),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$button,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$classList(
														{
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'btn', _1: true},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'btn-primary', _1: isSelected},
																_1: {ctor: '[]'}
															}
														}),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$disabled(isSelected),
														_1: {ctor: '[]'}
													}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Solar Panel'),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: viewPrice(price),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html$text(' Solar panels allow the pod to charge passively'),
													_1: {ctor: '[]'}
												}
											}
										});
								}(),
								_1: {
									ctor: '::',
									_0: function () {
										var price = _user$project$Price$priceOfSolarPanel(model.inventory.matterBins);
										var isSelected = function () {
											var _p36 = model.survivor.action;
											if ((_p36.ctor === 'Fabricating') && (_p36._0.ctor === 'MatterBin')) {
												return true;
											} else {
												return false;
											}
										}();
										return A2(
											_elm_lang$html$Html$li,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onClick(
													isSelected ? _user$project$Main$NoOp : _user$project$Main$BeginFabricating(_user$project$Item$MatterBin)),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onDoubleClick(
														_user$project$Main$DevCheat(
															_user$project$Main$AddInventory(_user$project$Item$MatterBin))),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$button,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$classList(
															{
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'btn', _1: true},
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'btn-primary', _1: isSelected},
																	_1: {ctor: '[]'}
																}
															}),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$disabled(isSelected),
															_1: {ctor: '[]'}
														}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Matter Bin'),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: viewPrice(price),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html$text(' +100 max matter storage'),
														_1: {ctor: '[]'}
													}
												}
											});
									}(),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('divider text-center'),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$html$Html_Attributes$attribute, 'data-content', 'Temporary Buffs'),
										_1: {ctor: '[]'}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$ul,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: function () {
											var price = 12;
											var isSelected = function () {
												var _p37 = model.survivor.action;
												if ((_p37.ctor === 'Fabricating') && (_p37._0.ctor === 'Amphetamine')) {
													return true;
												} else {
													return false;
												}
											}();
											return A2(
												_elm_lang$html$Html$li,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onClick(
														isSelected ? _user$project$Main$NoOp : _user$project$Main$BeginFabricating(_user$project$Item$Amphetamine)),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html_Events$onDoubleClick(
															_user$project$Main$DevCheat(
																_user$project$Main$AddStatusEffect(_user$project$StatusEffects$Amphetamine))),
														_1: {ctor: '[]'}
													}
												},
												{
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$button,
														{
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$classList(
																{
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'btn', _1: true},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: 'btn-primary', _1: isSelected},
																		_1: {ctor: '[]'}
																	}
																}),
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$disabled(isSelected),
																_1: {ctor: '[]'}
															}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('Amphetamine'),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: viewPrice(price),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html$text(
																A2(
																	F2(
																		function (x, y) {
																			return A2(_elm_lang$core$Basics_ops['++'], x, y);
																		}),
																	' ',
																	_user$project$StatusEffects$descriptionOf(_user$project$StatusEffects$Amphetamine))),
															_1: {ctor: '[]'}
														}
													}
												});
										}(),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		});
};
var _user$project$Main$viewActions = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('panel'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('panel-header'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('panel-title'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$span,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Current Task: '),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$span,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class(
											A2(
												_elm_lang$core$Basics_ops['++'],
												'label ',
												_user$project$Survivor$isIdling(model.survivor) ? 'label-default' : 'label-success')),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: function () {
											var _p38 = model.survivor.action;
											switch (_p38.ctor) {
												case 'Idling':
													return _elm_lang$html$Html$text('No task');
												case 'Fabricating':
													return _elm_lang$html$Html$text('Fabricating');
												default:
													return _elm_lang$html$Html$text('Researching');
											}
										}(),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html$text(' '),
											_1: {
												ctor: '::',
												_0: _user$project$Survivor$isIdling(model.survivor) ? _elm_lang$html$Html$text('') : A2(
													_elm_lang$html$Html$button,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$class('btn btn-sm'),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Events$onClick(
																_user$project$Main$SetSurvivorAction(_user$project$Action$Idling)),
															_1: {ctor: '[]'}
														}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Cancel'),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}
										}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('panel-body'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('divider'),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$ul,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('tab tab-block'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$li,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class(
														A2(
															_elm_lang$core$Basics_ops['++'],
															'tab-item ',
															function () {
																var _p39 = model.actionTab;
																if (_p39.ctor === 'Fabrication') {
																	return 'active';
																} else {
																	return '';
																}
															}())),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$a,
														{
															ctor: '::',
															_0: _elm_lang$html$Html_Events$onClick(
																_user$project$Main$SetActionTab(_user$project$Main$Fabrication)),
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$href('javascript:void(0)'),
																_1: {ctor: '[]'}
															}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('Fabrication '),
															_1: {
																ctor: '::',
																_0: function () {
																	var _p40 = model.survivor.action;
																	if (_p40.ctor === 'Fabricating') {
																		return A2(
																			_elm_lang$html$Html$span,
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html_Attributes$class('label label-primary'),
																				_1: {ctor: '[]'}
																			},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text(
																					A2(
																						_elm_lang$core$Basics_ops['++'],
																						A2(_myrho$elm_round$Round$round, 2, (_p40._1.curr / _p40._1.max) * 100),
																						'%')),
																				_1: {ctor: '[]'}
																			});
																	} else {
																		return _elm_lang$html$Html$text('');
																	}
																}(),
																_1: {ctor: '[]'}
															}
														}),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$li,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$class(
															A2(
																_elm_lang$core$Basics_ops['++'],
																'tab-item ',
																function () {
																	var _p41 = model.actionTab;
																	if (_p41.ctor === 'Research') {
																		return 'active';
																	} else {
																		return '';
																	}
																}())),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Events$onClick(
																_user$project$Main$SetActionTab(_user$project$Main$Research)),
															_1: {ctor: '[]'}
														}
													},
													{
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$a,
															{
																ctor: '::',
																_0: _elm_lang$html$Html_Events$onClick(
																	_user$project$Main$SetActionTab(_user$project$Main$Research)),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html_Attributes$href('javascript:void(0)'),
																	_1: {ctor: '[]'}
																}
															},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text('Research '),
																_1: {
																	ctor: '::',
																	_0: function () {
																		var _p42 = model.survivor.action;
																		if ((_p42.ctor === 'Researching') && (_p42._1.ctor === '_Tuple2')) {
																			return A2(
																				_elm_lang$html$Html$span,
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html_Attributes$class('label label-primary'),
																					_1: {ctor: '[]'}
																				},
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html$text(
																						A2(
																							_elm_lang$core$Basics_ops['++'],
																							A2(_myrho$elm_round$Round$round, 2, (_p42._1._0 / _p42._1._1) * 100),
																							'%')),
																					_1: {ctor: '[]'}
																				});
																		} else {
																			return _elm_lang$html$Html$text('');
																		}
																	}(),
																	_1: {ctor: '[]'}
																}
															}),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}
										}),
									_1: {
										ctor: '::',
										_0: function () {
											var _p43 = model.actionTab;
											if (_p43.ctor === 'Fabrication') {
												return _user$project$Main$viewFabricationTab(model);
											} else {
												return _user$project$Main$viewResearchTab(model);
											}
										}(),
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('container grid-1280'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: model.survivor.dead ? _user$project$Main$viewDeathMessage : _elm_lang$html$Html$text(''),
			_1: {
				ctor: '::',
				_0: model.showHelp ? _user$project$Main$viewHelp : _elm_lang$html$Html$text(''),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _user$project$Main$viewPauseButton(model),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html$text(' '),
								_1: {
									ctor: '::',
									_0: model.showHelp ? A2(
										_elm_lang$html$Html$button,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Events$onClick(_user$project$Main$DismissHelp),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('btn'),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Dismiss Help'),
											_1: {ctor: '[]'}
										}) : _elm_lang$html$Html$text(''),
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('columns'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('column col-4 col-xs-12'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _user$project$Main$viewStats(model),
										_1: {
											ctor: '::',
											_0: _user$project$StatusEffects$isEmpty(model.statusEffects) ? _elm_lang$html$Html$text('') : _user$project$StatusEffects$viewSidebar(model.statusEffects),
											_1: {
												ctor: '::',
												_0: _user$project$Inventory$isEmpty(model.inventory) ? _elm_lang$html$Html$text('') : _user$project$Main$viewInventory(model),
												_1: {
													ctor: '::',
													_0: _user$project$Abilities$isEmpty(model.abilities) ? _elm_lang$html$Html$text('') : _user$project$Main$viewAbilities(model),
													_1: {ctor: '[]'}
												}
											}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$div,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('column col-8 col-xs-12'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$div,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('columns'),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$div,
														{
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$class('column col-12'),
															_1: {ctor: '[]'}
														},
														{
															ctor: '::',
															_0: _user$project$Main$viewPowerUplink(model),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$div,
															{
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$class('column col-12'),
																_1: {ctor: '[]'}
															},
															{
																ctor: '::',
																_0: _user$project$Main$viewActions(model),
																_1: {ctor: '[]'}
															}),
														_1: {ctor: '[]'}
													}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: model.isDev ? _user$project$Main$viewDevBar(model) : _elm_lang$html$Html$text(''),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _user$project$Main$main = _elm_lang$html$Html$programWithFlags(
	{init: _user$project$Main$init, view: _user$project$Main$view, update: _user$project$Main$update, subscriptions: _user$project$Main$subscriptions})(
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (isDev) {
			return _elm_lang$core$Json_Decode$succeed(
				{isDev: isDev});
		},
		A2(_elm_lang$core$Json_Decode$field, 'isDev', _elm_lang$core$Json_Decode$bool)));

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);



/***/ })
/******/ ]);