(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=t(o);fetch(o.href,s)}})();var i={};Object.defineProperty(i,"__esModule",{value:!0});i.permutations=i.polarToRectangular=i.makeBoundedLinear=b=i.makeLinear=i.sum=i.countMap=I=i.initializedArray=i.count=i.zip=i.FIGURE_SPACE=i.NON_BREAKING_SPACE=i.dateIsValid=i.MIN_DATE=i.MAX_DATE=i.makePromise=i.filterMap=A=i.pick=i.pickAny=i.csvStringToArray=i.parseTimeT=i.parseIntX=i.parseFloatX=i.getAttribute=i.followPath=i.parseXml=i.testXml=i.sleep=P=i.assertClass=void 0;function N(n,e,t="Assertion Failed."){const r=o=>{throw new Error(`${t}  Expected type:  ${e.name}.  Found type:  ${o}.`)};if(n===null)r("null");else if(typeof n!="object")r(typeof n);else if(!(n instanceof e))r(n.constructor.name);else return n;throw new Error("wtf")}var P=i.assertClass=N;function z(n){return new Promise(e=>setTimeout(e,n))}i.sleep=z;function S(n){const t=new DOMParser().parseFromString(n,"application/xml");for(const r of Array.from(t.querySelectorAll("parsererror")))if(r instanceof HTMLElement)return{error:r};return{parsed:t}}i.testXml=S;function X(n){if(n!==void 0)return S(n)?.parsed?.documentElement}i.parseXml=X;function B(n,...e){for(const t of e){if(n===void 0)return;if(typeof t=="number")n=n.children[t];else{const r=n.getElementsByTagName(t);if(r.length!=1)return;n=r[0]}}return n}i.followPath=B;function _(n,e,...t){if(e=B(e,...t),e!==void 0&&e.hasAttribute(n))return e.getAttribute(n)??void 0}i.getAttribute=_;function L(n){if(n==null)return;const e=parseFloat(n);if(isFinite(e))return e}i.parseFloatX=L;function G(n){const e=L(n);if(e!==void 0)return e>Number.MAX_SAFE_INTEGER||e<Number.MIN_SAFE_INTEGER||e!=Math.floor(e)?void 0:e}i.parseIntX=G;function D(n){if(typeof n=="string"&&(n=G(n)),n!=null&&!(n<=0))return new Date(n*1e3)}i.parseTimeT=D;const O=n=>{const e=/(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi,t=[[]];let r;for(;r=e.exec(n);)r[1].length&&r[1]!==","&&t.push([]),t[t.length-1].push(r[2]!==void 0?r[2].replace(/""/g,'"'):r[3]);return t};i.csvStringToArray=O;function U(n){const e=n.values().next();if(!e.done)return e.value}i.pickAny=U;function x(n){return n[Math.random()*n.length|0]}var A=i.pick=x;function H(n,e){const t=[];return n.forEach((r,o)=>{const s=e(r,o);s!==void 0&&t.push(s)}),t}i.filterMap=H;function $(){let n,e;return{promise:new Promise((r,o)=>{n=r,e=o}),resolve:n,reject:e}}i.makePromise=$;i.MAX_DATE=new Date(864e13);i.MIN_DATE=new Date(-864e13);function V(n){return isFinite(n.getTime())}i.dateIsValid=V;i.NON_BREAKING_SPACE=" ";i.FIGURE_SPACE=" ";function*Z(...n){const e=n.map(t=>t[Symbol.iterator]());for(;;){const t=e.map(r=>r.next());if(t.some(({done:r})=>r))break;yield t.map(({value:r})=>r)}}i.zip=Z;function*j(n=0,e=1/0,t=1){for(let r=n;r<e;r+=t)yield r}i.count=j;function k(n,e){const t=[];for(let r=0;r<n;r++)t.push(e(r));return t}var I=i.initializedArray=k;i.countMap=k;function K(n){return n.reduce((e,t)=>e+t,0)}i.sum=K;function q(n,e,t,r){const o=(r-e)/(t-n);return function(s){return(s-n)*o+e}}var b=i.makeLinear=q;function Q(n,e,t,r){t<n&&([n,e,t,r]=[t,r,n,e]);const o=(r-e)/(t-n);return function(s){return s<=n?e:s>=t?r:(s-n)*o+e}}i.makeBoundedLinear=Q;function Y(n,e){return{x:Math.sin(e)*n,y:Math.cos(e)*n}}i.polarToRectangular=Y;function*R(n,e=[]){if(n.length==0)yield e;else for(let t=0;t<n.length;t++){const r=n[t],o=[...e,r],s=[...n.slice(0,t),...n.slice(t+1)];yield*R(s,o)}}i.permutations=R;var u={};Object.defineProperty(u,"__esModule",{value:!0});u.download=u.createElementFromHTML=u.getHashInfo=u.getAudioBalanceControl=u.getBlobFromCanvas=u.loadDateTimeLocal=w=u.getById=void 0;const F=i;function J(n,e){const t=document.getElementById(n);if(!t)throw new Error("Could not find element with id "+n+".  Expected type:  "+e.name);if(t instanceof e)return t;throw new Error("Element with id "+n+" has type "+t.constructor.name+".  Expected type:  "+e.name)}var w=u.getById=J;function W(n,e,t="milliseconds"){let r;switch(t){case"minutes":{r=e.getSeconds()*1e3+e.getMilliseconds();break}case"seconds":{r=e.getMilliseconds();break}case"milliseconds":{r=0;break}default:throw new Error("wtf")}n.valueAsNumber=+e-e.getTimezoneOffset()*6e4-r}u.loadDateTimeLocal=W;function ee(n){const{reject:e,resolve:t,promise:r}=(0,F.makePromise)();return n.toBlob(o=>{o?t(o):e(new Error("blob is null!"))}),r}u.getBlobFromCanvas=ee;function te(n){const e=new AudioContext,t=e.createMediaElementSource(n),r=new StereoPannerNode(e,{pan:0});return t.connect(r).connect(e.destination),o=>{r.pan.value=o}}u.getAudioBalanceControl=te;function ne(){const n=new Map;return/^#?(.*)$/.exec(location.hash.replace("+","%20"))[1].split("&").forEach(r=>{const o=r.split("=",2);if(o.length==2){const s=decodeURIComponent(o[0]),a=decodeURIComponent(o[1]);n.set(s,a)}}),n}u.getHashInfo=ne;function re(n,e){var t=document.createElement("div");return t.innerHTML=n.trim(),(0,F.assertClass)(t.firstChild,e,"createElementFromHTML:")}u.createElementFromHTML=re;function oe(n,e){var t=document.createElement("a");if(t.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(e)),t.setAttribute("download",n),document.createEvent){var r=document.createEvent("MouseEvents");r.initEvent("click",!0,!0),t.dispatchEvent(r)}else t.click()}u.download=oe;{let n="☆";setInterval(()=>{document.title=`${n} Classic Chuzzle`,n=n=="☆"?"★":"☆"},1e3)}function M(n,e){const t=n%e;return t<0?t+Math.abs(e):t}const T=["red","green","blue","yellow","orange","violet"];class g{constructor(e){this.piece=e;const t=P(g.#t.cloneNode(!0),SVGGElement);this.element=t,t.setAttribute("fill",e.color),g.#e.appendChild(t)}static#e=w("board",SVGElement);static#t=w("piece",HTMLTemplateElement).content.querySelector("g");element;setPosition(e,t){this.element.setAttribute("transform",`translate(${t}, ${e})`)}remove(){this.element.remove()}}function ie(n,e){if((e|0)!=e)throw new Error(`invalid input: ${e}`);return e=M(e,n.length),e==0?n:[...n.slice(e),...n.slice(0,e)]}class E{constructor(e,t,r){this.row=e,this.column=t,this.piece=r,this.#e=new y(this)}#e;get color(){return this.piece.color}static createAll(e){return e.map((t,r)=>t.map((o,s)=>new E(r,s,o)))}tryCombine(e){if(this.#e!=e.#e&&this.color==e.color&&(this.#e.consume(e.#e).forEach(r=>r.#e=this.#e),!this.#e.valid))throw window.showGreen(),new Error("wtf")}static combineAll(e){window.showGreen=()=>{const t=[],r=[];e.forEach(o=>{o.forEach(s=>{s.color=="green"&&(t.push(s.#e.debugInfo()),r.push(s.#e))})}),console.table(t),console.log(r)},e.forEach((t,r)=>{t.forEach((o,s)=>{if(r){const a=r-1,c=e[a][s];o.tryCombine(c)}if(s){const a=s-1,c=t[a];o.tryCombine(c)}})}),delete window.showGreen}static findBigGroups(e){const t=new Map;e.forEach(o=>o.forEach(s=>{const a=s.#e,c=t.get(a)??0;t.set(a,c+1)}));const r=[];for(const[o,s]of t)s>=3&&r.push(o);return r}static findActionable(e){const t=this.createAll(e);return this.combineAll(t),this.findBigGroups(t)}}class y{#e=new Set;get contents(){return this.#e}static#t=0;#n=y.#t++;debugInitialGroup;debugInfo(){return{row:this.debugInitialGroup.row,column:this.debugInitialGroup.column,contents:this.valid?this.#e.size:"invalid",id:this.#n}}constructor(e){this.debugInitialGroup=e,this.#e.add(e)}consume(e){const t=this.#e,r=e.#e;return r.forEach(o=>t.add(o)),e.#e=void 0,r}get valid(){return!!this.#e?.has(this.debugInitialGroup)}}class f{constructor(e){this.allPieces=e}static SIZE=6;static createRandom(){const e=I(f.SIZE,()=>I(f.SIZE,()=>({weight:1,color:A(T)})));return E.findActionable(e).forEach(r=>{r.contents.forEach(({row:o,column:s})=>{const a=new Set;[[0,1],[0,-1],[1,0],[-1,0]].forEach(([c,l])=>{const h=e[o+c];if(h){const d=h[s+l];d&&a.add(d.color)}}),e[o][s]={color:A(T.filter(c=>!a.has(c))),weight:1}})}),new this(e)}static QUICK=this.createRandom();rotateLeft(e,t){const r=this.allPieces[e],o=ie(r,t);return r==o?this:new f(this.allPieces.map(s=>s==r?o:s))}rotateUp(e,t){const r=this.allPieces.length;return t=M(t,r),t==0?this:new f(this.allPieces.map((o,s)=>{const a=[...o];return a[e]=this.allPieces[(s+t)%r][e],a}))}}class p{constructor(){throw p.#n,new Error("wtf")}static#e=[];static#t=f.createRandom();static get currentBoard(){return this.#t}static set currentBoard(e){this.#t=e,this.draw(e),this.hideTemporaries()}static hideTemporaries(){}static draw(e){this.resetAll(),this.#e=e.allPieces.map((t,r)=>t.map((o,s)=>{const a=new g(o);return a.setPosition(r,s),a}))}static resetAll(){this.#e.forEach(e=>{e.forEach(t=>{t.remove()})}),this.#e=[],this.hideTemporaries()}static#n=(()=>{this.draw(this.#t);const e=w("board",SVGElement);function t(c){const l=e.getBoundingClientRect(),h=b(l.top,0,l.bottom,f.SIZE),d=b(l.left,0,l.right,f.SIZE);return{row:h(c.clientY),column:d(c.clientX)}}let r="none",o=-1,s=-1,a=-1;e.addEventListener("pointerdown",c=>{if(r=="none"){r="started",e.setPointerCapture(c.pointerId);const l=t(c);o=l.row,s=l.column,e.style.cursor="move"}}),e.addEventListener("pointermove",c=>{if(r=="none")return;const l=t(c);if(r=="started"){const d=Math.abs(l.row-o),m=Math.abs(l.column-s);if(Math.max(d,m)<.05)return;if(d>m)r="vertical",e.style.cursor="ns-resize",a=Math.floor(s);else if(m>d)r="horizontal",e.style.cursor="ew-resize",a=Math.floor(o);else return;a=Math.max(0,Math.min(f.SIZE,a))}const h=d=>M(d+.5,f.SIZE)-.5;if(r=="horizontal"){const d=s-l.column;this.#e[a].forEach((v,C)=>{v.setPosition(a,h(C-d))})}else if(r=="vertical"){const d=o-l.row;this.#e.forEach((m,v)=>{m[a].setPosition(h(v-d),a)})}}),e.addEventListener("pointerup",c=>{if(r=="none")return;const l=t(c);r=="horizontal"?this.currentBoard=this.currentBoard.rotateLeft(a,Math.round(s-l.column)):r=="vertical"?this.currentBoard=this.currentBoard.rotateUp(a,Math.round(o-l.row)):r=="started"&&this.draw(this.currentBoard),r="none",e.style.cursor="",console.log("pointerup",t(c))})})()}function se(){const n=E.findActionable(p.currentBoard.allPieces);console.log(n)}window.checkGroups=se;window.rotateLeft=(n,e)=>{p.currentBoard=p.currentBoard.rotateLeft(n,e)};window.rotateUp=(n,e)=>{p.currentBoard=p.currentBoard.rotateUp(n,e)};