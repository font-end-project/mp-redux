!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";function r(t){return Object.prototype.toString.call(t).slice(8,-1)}n.r(e);let o={preState:null,state:null,listeners:[],action:{},reducers:null,effects:null,logger:!1};function c(){return o.state}function i(t){"Function"!==r(t)?o.state=t:o.state=t()}function a(){return o.preState}function s(t){"Function"!==r(t)?o.preState=t:o.preState=t()}function u(t){o.action=t}function l(){o.listeners.forEach(t=>t.listener.call(t.that))}function f(t,e){const n={};for(let c in t)"Function"===r(t[c])?n[c]=t[c](e&&e[c]||void 0,o.action):n[c]=f(t[c],e&&e[c]||void 0);return n}const d=Behavior({lifetimes:{attached(){!function(t,e,n){const{listeners:r}=o;let c=!0;for(let e in r)if(r[e].id===t){c=!1;break}c&&r.push({id:t,listener:e,that:n})}(this.__wxExparserNodeId__,this._checkState,this),this._checkState.call(this,!0)},detached(){!function(t){const{listeners:e}=o;let n=-1;for(let r in e)if(e[r].id===t){n=+r;break}-1!==n&&e.splice(n,1)}(this.__wxExparserNodeId__)}},definitionFilter(t){var e=t.selector;if(!e)throw new Error("no selector function");t.methods||(t.methods={}),t.methods._selector=e,t.stateUpdated&&(t.methods._stateUpdated=t.stateUpdated)},methods:{_checkState(t){const e=this._selector(this.data);e&&(t||e.needUpdate)&&this._updateData(e,t)},_updateData(t,e){const{pageState:n,prePageState:r}=t;n&&this.setData(n),e||this._stateUpdated&&r&&this._stateUpdated(r)}}});e.default={createStore:function(t,e=null,n=!1){if(!t)throw new Error("There must be a Reducer for wmp-redux");if(t&&"Object"!==r(t))throw new Error("Reducer must be a Object");if(e&&"Object"!==r(e))throw new Error("Effects must be a Object");o={...o,reducers:t,effects:e,logger:n},i(f(o.reducers,a()))},dispatch:function(t){if(!t)throw new Error("there must commit a action when use dispatch");if("Object"!==r(t))throw new Error("action must be a object");u(t),s(c()),i(f(o.reducers,a())),function(){const{logger:t,action:e}=o;t&&console.log("prev state:",a(),"\n",e,"\n","next state:",c())}(),l(),function(){const{effects:t,action:e}=o;t&&t[e.type]&&t[e.type].forEach(t=>t(c(),e))}()},getState:c,clearState:function(){s(c()),u({}),i(f(o.reducers)),l()},connect:d,stateSelector:function(t,e){if(e&&"Object"!==r(e))throw new Error("the second arg of stateSelector should be object or undefined");return t(e)},createSelector:function(...t){return e=>{if(!t||t&&t.length<=1)return null;const n=t.slice(0,-1),r=t[t.length-1],o=n.map(t=>t(c(),e));if(!a())return{needUpdate:!1,pageState:r(...o)};const i=n.map(t=>t(a(),e)),s=!function(t,e){let n=!0;const r=t.length;for(let o=0;o<r;o++)if(t[o]!==e[o]){n=!1;break}return n}(o,i);return{needUpdate:s,pageState:r(...o),prePageState:s?r(...i):null}}}}}]);