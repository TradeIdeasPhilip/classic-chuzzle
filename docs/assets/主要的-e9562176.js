(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function n(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=n(r);fetch(r.href,a)}})();var T={},w={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.countMap=e.Random=e.phi=e.radiansPerDegree=e.degreesPerRadian=e.FULL_CIRCLE=e.FIGURE_SPACE=e.NON_BREAKING_SPACE=e.MIN_DATE=e.MAX_DATE=e.csvStringToArray=void 0,e.assertClass=t,e.sleep=n,e.testXml=o,e.parseXml=r,e.followPath=a,e.getAttribute=l,e.parseFloatX=c,e.parseIntX=h,e.parseTimeT=f,e.pickAny=d,e.pick=g,e.take=E,e.filterMap=b,e.makePromise=S,e.dateIsValid=I,e.angleBetween=v,e.positiveModulo=A,e.rotateArray=Q,e.rectUnion=V,e.rectAddPoint=tt,e.dateToFileName=et,e.lerp=nt,e.assertFinite=ot,e.shuffleArray=rt,e.zip=it,e.count=at,e.initializedArray=Z,e.sum=st,e.makeLinear=lt,e.makeBoundedLinear=ct,e.polarToRectangular=ut,e.permutations=H;function t(i,s,m="Assertion Failed."){const p=k=>{throw new Error(`${m}  Expected type:  ${s.name}.  Found type:  ${k}.`)};if(i===null)p("null");else if(typeof i!="object")p(typeof i);else if(!(i instanceof s))p(i.constructor.name);else return i;throw new Error("wtf")}function n(i){return new Promise(s=>{setTimeout(s,i)})}function o(i){const m=new DOMParser().parseFromString(i,"application/xml");for(const p of Array.from(m.querySelectorAll("parsererror")))if(p instanceof HTMLElement)return{error:p};return{parsed:m}}function r(i){if(i!==void 0)return o(i)?.parsed?.documentElement}function a(i,...s){for(const m of s){if(i===void 0)return;if(typeof m=="number")i=i.children[m];else{const p=i.getElementsByTagName(m);if(p.length!=1)return;i=p[0]}}return i}function l(i,s,...m){if(s=a(s,...m),s!==void 0&&s.hasAttribute(i))return s.getAttribute(i)??void 0}function c(i){if(i==null)return;const s=+i;if(isFinite(s))return s}function h(i){const s=c(i);if(s!==void 0)return s>Number.MAX_SAFE_INTEGER||s<Number.MIN_SAFE_INTEGER||s!=Math.floor(s)?void 0:s}function f(i){if(typeof i=="string"&&(i=h(i)),i!=null&&!(i<=0))return new Date(i*1e3)}const u=i=>{const s=/(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi,m=[[]];let p;for(;p=s.exec(i);)p[1].length&&p[1]!==","&&m.push([]),m[m.length-1].push(p[2]!==void 0?p[2].replace(/""/g,'"'):p[3]);return m};e.csvStringToArray=u;function d(i){const s=i.values().next();if(!s.done)return s.value}function g(i){if(i.length==0)throw new Error("wtf");return i[Math.random()*i.length|0]}function E(i){if(i.length<1)throw new Error("wtf");const s=Math.random()*i.length|0;return i.splice(s,1)[0]}function b(i,s){const m=[];return i.forEach((p,k)=>{const M=s(p,k);M!==void 0&&m.push(M)}),m}function S(){let i,s;return{promise:new Promise((p,k)=>{i=p,s=k}),resolve:i,reject:s}}e.MAX_DATE=new Date(864e13),e.MIN_DATE=new Date(-864e13);function I(i){return isFinite(i.getTime())}e.NON_BREAKING_SPACE=" ",e.FIGURE_SPACE=" ",e.FULL_CIRCLE=2*Math.PI,e.degreesPerRadian=360/e.FULL_CIRCLE,e.radiansPerDegree=e.FULL_CIRCLE/360,e.phi=(1+Math.sqrt(5))/2;function v(i,s){const m=A(i,e.FULL_CIRCLE);let k=A(s,e.FULL_CIRCLE)-m;const M=e.FULL_CIRCLE/2;if(k>M?k-=e.FULL_CIRCLE:k<-M&&(k+=e.FULL_CIRCLE),Math.abs(k)>M)throw new Error("wtf");return k}function A(i,s){const m=i%s;return m<0?m+Math.abs(s):m}function Q(i,s){if((s|0)!=s)throw new Error(`invalid input: ${s}`);return s=A(s,i.length),s==0?i:[...i.slice(s),...i.slice(0,s)]}class Y{static sfc32(s,m,p,k){return function(){s|=0,m|=0,p|=0,k|=0;let M=(s+m|0)+k|0;return k=k+1|0,s=m^m>>>9,m=p+(p<<3)|0,p=p<<21|p>>>11,p=p+M|0,(M>>>0)/4294967296}}static#t=42;static create(s=this.newSeed()){console.info(s);const m=JSON.parse(s);if(!(m instanceof Array))throw new Error("invalid seed");if(m.length!=4)throw new Error("invalid seed");const[p,k,M,N]=m;if(!(typeof p=="number"&&typeof k=="number"&&typeof M=="number"&&typeof N=="number"))throw new Error("invalid seed");return this.sfc32(p,k,M,N)}static newSeed(){const s=[];return s.push(Date.now()),s.push(this.#t++),s.push(Math.random()*2**31|0),s.push(Math.random()*2**31|0),JSON.stringify(s)}}e.Random=Y;function V(i,s){const m=Math.min(i.x,s.x),p=Math.min(i.y,s.y),k=Math.max(i.x+i.width,s.x+s.width),M=Math.max(i.y+i.height,s.y+s.height),N=k-m,dt=M-p;return{x:m,y:p,width:N,height:dt}}function tt(i,s,m){return V(i,{x:s,y:m,width:0,height:0})}function et(i){return isNaN(i.getTime())?"0000⸱00⸱00 00⦂00⦂00":`${i.getFullYear().toString().padStart(4,"0")}⸱${(i.getMonth()+1).toString().padStart(2,"0")}⸱${i.getDate().toString().padStart(2,"0")} ${i.getHours().toString().padStart(2,"0")}⦂${i.getMinutes().toString().padStart(2,"0")}⦂${i.getSeconds().toString().padStart(2,"0")}`}function nt(i,s,m){return i+(s-i)*m}function ot(...i){i.forEach(s=>{if(!isFinite(s))throw new Error("wtf")})}function rt(i){for(let s=i.length-1;s>0;s--){const m=Math.floor(Math.random()*(s+1));[i[s],i[m]]=[i[m],i[s]]}return i}function*it(...i){const s=i.map(m=>m[Symbol.iterator]());for(;;){const m=s.map(p=>p.next());if(m.some(({done:p})=>p))break;yield m.map(({value:p})=>p)}}function*at(i=0,s=1/0,m=1){for(let p=i;p<s;p+=m)yield p}function Z(i,s){const m=[];for(let p=0;p<i;p++)m.push(s(p));return m}e.countMap=Z;function st(i){return i.reduce((s,m)=>s+m,0)}function lt(i,s,m,p){const k=(p-s)/(m-i);return function(M){return(M-i)*k+s}}function ct(i,s,m,p){m<i&&([i,s,m,p]=[m,p,i,s]);const k=(p-s)/(m-i);return function(M){return M<=i?s:M>=m?p:(M-i)*k+s}}function ut(i,s){return{x:Math.cos(s)*i,y:Math.sin(s)*i}}function*H(i,s=[]){if(i.length==0)yield s;else for(let m=0;m<i.length;m++){const p=i[m],k=[...s,p],M=[...i.slice(0,m),...i.slice(m+1)];yield*H(M,k)}}})(w);Object.defineProperty(T,"__esModule",{value:!0});T.AnimationLoop=void 0;var C=T.getById=ht;T.loadDateTimeLocal=mt;T.getBlobFromCanvas=ft;T.getAudioBalanceControl=pt;T.getHashInfo=gt;T.createElementFromHTML=wt;T.download=Et;const q=w;function ht(e,t){const n=document.getElementById(e);if(!n)throw new Error("Could not find element with id "+e+".  Expected type:  "+t.name);if(n instanceof t)return n;throw new Error("Element with id "+e+" has type "+n.constructor.name+".  Expected type:  "+t.name)}function mt(e,t,n="milliseconds"){let o;switch(n){case"minutes":{o=t.getSeconds()*1e3+t.getMilliseconds();break}case"seconds":{o=t.getMilliseconds();break}case"milliseconds":{o=0;break}default:throw new Error("wtf")}e.valueAsNumber=+t-t.getTimezoneOffset()*6e4-o}function ft(e){const{reject:t,resolve:n,promise:o}=(0,q.makePromise)();return e.toBlob(r=>{r?n(r):t(new Error("blob is null!"))}),o}function pt(e){const t=new AudioContext,n=t.createMediaElementSource(e),o=new StereoPannerNode(t,{pan:0});return n.connect(o).connect(t.destination),r=>{o.pan.value=r}}function gt(){const e=new Map;return/^#?(.*)$/.exec(location.hash.replace("+","%20"))[1].split("&").forEach(o=>{const r=o.split("=",2);if(r.length==2){const a=decodeURIComponent(r[0]),l=decodeURIComponent(r[1]);e.set(a,l)}}),e}function wt(e,t){var n=document.createElement("div");return n.innerHTML=e.trim(),(0,q.assertClass)(n.firstChild,t,"createElementFromHTML:")}function Et(e,t){var n=document.createElement("a");if(n.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(t)),n.setAttribute("download",e),document.createEvent){var o=document.createEvent("MouseEvents");o.initEvent("click",!0,!0),n.dispatchEvent(o)}else n.click()}class bt{onWake;constructor(t){this.onWake=t,this.callback=this.callback.bind(this),requestAnimationFrame(this.callback)}#t=!1;cancel(){this.#t=!0}callback(t){this.#t||(requestAnimationFrame(this.callback),this.onWake(t))}}T.AnimationLoop=bt;class yt{#t=new Set;get contents(){return[...this.#t].map(t=>t.piece)}get size(){return this.#t.size}debugInitialCell;color;constructor(t){this.color=t.color,this.debugInitialCell=t,this.#t.add(t)}consume(t){const n=this.#t,o=t.#t;return o.forEach(r=>n.add(r)),t.#t=void 0,o}get valid(){return!!this.#t?.has(this.debugInitialCell)}}class z{constructor(t){this.piece=t,this.#t=new yt(this)}#t;get color(){return this.piece.color}static createAll(t){return t.map(n=>n.map(o=>new z(o)))}tryCombine(t){if(this.#t!=t.#t&&this.color==t.color&&(this.#t.consume(t.#t).forEach(o=>o.#t=this.#t),!this.#t.valid))throw new Error("wtf")}static combineAll(t){t.forEach((n,o)=>{n.forEach((r,a)=>{if(o){const l=o-1,c=t[l][a];r.tryCombine(c)}if(a){const l=a-1,c=n[l];r.tryCombine(c)}})})}static findBigGroups(t){const n=new Map;t.forEach(r=>r.forEach(a=>{const l=a.#t,c=n.get(l)??0;n.set(l,c+1)}));const o=[];for(const[r,a]of n)a>=3&&o.push(r);return o}static findActionable(t){const n=this.createAll(t);return this.combineAll(n),this.findBigGroups(n)}}function D(e){return z.findActionable(e).map(t=>t.contents)}const B=e=>w.positiveModulo(Math.round(e),y.SIZE);function kt(e,t,n){const o=e[t],r=w.rotateArray(o,n);return o==r?e:e.map(a=>a==o?r:a)}function vt(e,t,n){const o=e.length;return n=w.positiveModulo(n,o),n==0?e:e.map((r,a)=>{const l=[...r];return l[t]=e[(a+n)%o][t],l})}const L=["red","green","blue","yellow","orange","violet","whitesmoke"];class F{constructor(t,n,o=F.randomColor()){this.rowIndex=t,this.columnIndex=n,this.color=o}weight=1;bomb=!1;static randomColor(){return w.pick(L)}}class y{constructor(t){this.animator=t,this.#t=this.createRandom(),this.animator.initializeBoard(this.#t.flat())}static SIZE=6;#t;getColumn(t){return this.#t.map(n=>n[t])}createRandom(){const t=w.initializedArray(y.SIZE,o=>w.initializedArray(y.SIZE,r=>new F(o,r)));return D(t).forEach(o=>{o.forEach(({rowIndex:r,columnIndex:a})=>{const l=new Set;[[0,1],[0,-1],[1,0],[-1,0]].forEach(([c,h])=>{const f=t[r+c];if(f){const u=f[a+h];u&&l.add(u.color)}}),t[r][a]=new F(r,a,w.pick(L.filter(c=>!l.has(c))))})}),t}async updateLoop(t,n){for(let o=1;t.length>0;o++){const r=new Set,a=[];t.forEach(d=>{if(d.length>5)a.push(d);else if(d.length==5){const g=w.pick(d);g.bomb=!0,r.add(g)}});const l=[];{let d=t.flat();const g=new Set(d);for(;;){const E=d.filter(b=>b.bomb&&!r.has(b));if(E.length==0)break;d.length=0;for(let b=-1;b<=1;b++)for(let S=-1;S<=1;S++)E.forEach(I=>{const v=this.#t[I.rowIndex+b]?.[I.columnIndex+S];v&&!g.has(v)&&(d.push(v),g.add(v))});l.push(d)}}console.log(l),n.addToScore(o,l.flat().length);const c=t.flatMap(d=>d.filter(g=>!r.has(g))),h=this.removePieces(c),f=this.#t.flat().filter(d=>!d.bomb),u=a.map(d=>{const g=[];return d.forEach(E=>{if(!E.bomb&&f.length>0){const b=w.take(f);g.push({source:E,destination:b})}}),g});await this.animator.updateBoard({remove:c,counter:o,flingBomb:u,destroyByBomb:l,add:h}),u.flat().forEach(({destination:d})=>d.bomb=!0),t=D(this.#t),n=this.animator.assignGroupDecorations(t),n.highlightGroups()}}setAllPieces(t){this.#t=t,t.forEach((n,o)=>{n.forEach((r,a)=>{r.columnIndex=a,r.rowIndex=o})})}startHorizontalMove(t){const n=w.initializedArray(y.SIZE,a=>{const l=kt(this.#t,t,-a),c=D(l);return{actions:this.animator.assignGroupDecorations(c),groups:c,pieces:l}}),o=a=>{const l=this.#t[t];this.animator.drawPreview("horizontal",l,a),n[B(a)].actions.highlightGroups()};return{preview:o,release:async a=>{o(a);const l=B(a),h=n[l].groups.length==0?0:l,f=n[h];this.setAllPieces(f.pieces);const u=this.#t[t];await this.animator.rotateTo("horizontal",u),await this.updateLoop(f.groups,f.actions)}}}startVerticalMove(t){const n=w.initializedArray(y.SIZE,a=>{const l=vt(this.#t,t,-a),c=D(l);return{actions:this.animator.assignGroupDecorations(c),groups:c,pieces:l}}),o=a=>{const l=this.getColumn(t);this.animator.drawPreview("vertical",l,a),n[B(a)].actions.highlightGroups()};return{preview:o,release:async a=>{o(a);const l=B(a),h=n[l].groups.length==0?0:l,f=n[h];this.setAllPieces(f.pieces);const u=this.getColumn(t);await this.animator.rotateTo("vertical",u),await this.updateLoop(f.groups,f.actions)}}}removePieces(t){const n=w.initializedArray(y.SIZE,()=>new Set);t.forEach(({rowIndex:a,columnIndex:l})=>{const c=n[l];if(c.has(a))throw new Error("wtf");c.add(a)});const o=w.initializedArray(y.SIZE,()=>new Array(y.SIZE)),r=[];return n.forEach((a,l)=>{const c=[];for(let h=0;h<y.SIZE;h++)a.has(h)||c.push(this.#t[h][l]);for(let h=0;c.length<y.SIZE;h++){const f=-1-h,u=new F(NaN,l);r.push({initialRow:f,piece:u}),c.unshift(u)}c.forEach((h,f)=>{o[f][l]=h,h.columnIndex=l,h.rowIndex=f})}),this.setAllPieces(o),r}}function Mt(e,t,n){if(!(t>=0&&t<=1))throw new Error("Expected 0 ≤ t ≤ 1");const o=Math.max(0,t-n),r=e(o),a=Math.max(0,t+n),l=e(a),c=l.x-r.x,h=l.y-r.y;return c==0&&h==0?NaN:Math.atan2(h,c)}function W(e,t={}){const n=Math.ceil(t.numberOfSegments??10);if(n<1)throw new Error(`Invalid numberOfSegments: ${n}`);const o=.01/n,r=w.initializedArray(n+1,c=>{const h=c/n,f=e(h),u=Mt(e,h,o);return{t:h,point:f,direction:u}}),a=w.initializedArray(n,c=>[{from:r[c],to:r[c+1]}][0]);let l=`M ${a[0].from.point.x}, ${a[0].from.point.y}`;return a.forEach(c=>{const h=Lt({x0:c.from.point.x,y0:c.from.point.y,slope:Math.tan(c.from.direction)},{x0:c.to.point.x,y0:c.to.point.y,slope:Math.tan(c.to.direction)});h?l+=` Q ${h.x},${h.y}`:l+=" M",l+=` ${c.to.point.x},${c.to.point.y}`}),l}function St(e,t,n){const o=It(e,t,n);return W(o,{numberOfSegments:n*9.001002})}function It(e,t,n){const a={x:e.x-t.x,y:e.y-t.y},l=Math.hypot(a.x,a.y),c=w.makeLinear(0,l,1,0),h=Math.atan2(a.y,a.x),f=w.makeLinear(0,h,1,h+n*2*Math.PI);return function(u){const d=c(u),g=f(u),E=w.polarToRectangular(d,g);return{x:t.x+E.x,y:t.y+E.y}}}function Ct(e,t,n){const o=w.makeLinear(0,t,1,n);return r=>w.polarToRectangular(e,o(r))}function Tt(e,t){const n=w.makeLinear(0,e.x,1,t.x),o=w.makeLinear(0,e.y,1,t.y);return r=>({x:n(r),y:o(r)})}function At(e,t,...n){const o=c=>{const h={x:0,y:0};return n.forEach(f=>{const u=f(c);h.x+=u.x,h.y+=u.y}),h},r=o(0),a=o(1),l=Tt({x:e.x-r.x,y:e.y-r.y},{x:t.x-a.x,y:t.y-a.y});return n.push(l),o}function Lt(e,t){if(isNaN(e.slope)||isNaN(t.slope)||e.slope==t.slope)return;const n=e.slope==1/0||e.slope==-1/0,o=t.slope==1/0||t.slope==-1/0;if(n||o)return;const r=n?e.x0:o?t.x0:(t.y0-t.slope*t.x0-e.y0+e.slope*e.x0)/(e.slope-t.slope),a=n?t.slope*(r-t.x0)+t.y0:e.slope*(r-e.x0)+e.y0;return{x:r,y:a}}const R=C("newScore",HTMLDivElement),U=C("chainBonus",HTMLDivElement),K=new Map([["orange",["cyan","brown","white","darkviolet","lightyellow","darkgreen","darkolivegreen","darkred"]],["yellow",["brown","darkviolet","lightcoral","lightsalmon","lightseagreen","darkblue","darkcyan","darkgoldenrod","darkgreen","darkkhaki","darkolivegreen","darkorange","darkred","darksalmon","darkseagreen"]],["violet",["cyan","brown","white","darkviolet","lightgreen","darkblue"]],["blue",["cyan","white","lightcoral","lightgreen","lightgray","lightsalmon","lightseagreen","lightseagreen","lightskyblue","lightslategray","darkorange","darkseagreen","darkturquoise"]],["red",["cyan","white","lightcoral","lightgreen","lightsalmon","darkkhaki","darkseagreen","chartreuse"]],["green",["cyan","white","lightcoral","lightcyan","lightgreen","lightyellow","darkred","darkseagreen","chartreuse"]],["whitesmoke",["green","red","blue","cadetblue","aqua","chartreuse","coral","darkblue","darkgoldenrod","darkgreen","darkmagenta","darkorange","fuchsia","tomato","peru"]]]),G=["୰","༕","࿈","࿊","᭧","℆","℥","⅊","⇰","⌬","⍩","⎃","⎗","⏕","ॐ","࿄","༟","༴","℣","⌰","⍷","⎙","ʻ","☆","𝛿","∞","•","⭑","†","‡","؟","༗","ၯ","◦","§","_","ɝ","Ԕ","⟳","⚐","🜚","愛","❝","ℵ","を","ᇸ","ڰ","ॾ","ན","ᛧ","ß","⧕","↯","➷","⅋","☙","„","⌥","⧷","⁎","╕","₰","…","⑈","۽","ₜ","ಠ","෴","ጃ","ᔱ","ᔰ","Ѧ","ᑥ","𝄢","ƈ","Ɣ","ƕ","Ɋ","ɕ","ɮ","ʆ","Ξ","Ж","Ѭ","Զ","ঔ","ਐ","ઝ","ଈ","ஜ","ధ","ൠ","ඊ","ጯ","ᡀ","‰","₻","↉","↜","↸","⋨","⌤","⎌","⍾","☏","✗","➘","〷","ご","ᇌ","㊤","﹆","🜇","🝤","⅏","៚","๛"];setInterval(()=>{document.title=`${w.pick(G)} Classic Chuzzle`},1500);let x=1;function J(e){return Math.abs(e)*2e3/y.SIZE*x}const O=C("board",SVGElement);function _(){O.querySelectorAll("text.crystal-decoration,text.crystal-decoration-background").forEach(e=>e.textContent="")}class P{static#t=C("piece",HTMLTemplateElement).content.querySelector("g");element;decorationElement;decorationBackgroundElement;bombElement;get bombVisible(){return this.bombElement.style.display==""}set bombVisible(t){this.bombElement.style.display=t?"":"none"}static#o=CSS.px(Math.E);static#r=CSS.px(Math.PI);static#i=new CSSTransformValue([new CSSTranslate(this.#o,this.#r)]);updateFinalPosition(t){this.#n=t.columnIndex,this.#e=t.rowIndex,P.#o.value=t.columnIndex,P.#r.value=t.rowIndex,this.element.attributeStyleMap.set("transform",P.#i)}async slideDirectlyTo(t,n){const o=this.#n,r=this.#e,a=t.columnIndex,l=t.rowIndex;(o!=a||r!=l)&&(await this.element.animate([{transform:`translate(${o}px, ${r}px)`},{transform:`translate(${a}px, ${l}px)`}],n).finished,this.updateFinalPosition(t))}async rotateTo(t,n){const o=n=="horizontal",r=(()=>{const h=o?t.columnIndex-this.#n:t.rowIndex-this.#e,f=w.positiveModulo(h+y.SIZE/2,y.SIZE)-y.SIZE/2;return J(Math.abs(f))})(),{position:a,offset:l}=o?X(this.#n,t.columnIndex):X(this.#e,t.rowIndex),c=a.map(h=>o?`translate(${h}px, ${t.rowIndex}px)`:`translate(${t.columnIndex}px, ${h}px)`);this.updateFinalPosition(t),await this.element.animate({transform:c,offset:l},r).finished}#e=NaN;get rowIndex(){return this.#e}#n=NaN;get columnIndex(){return this.#n}constructor(t){const n=w.assertClass(P.#t.cloneNode(!0),SVGGElement);this.element=n,this.decorationElement=n.querySelector("text.crystal-decoration"),this.decorationBackgroundElement=n.querySelector("text.crystal-decoration-background"),this.bombElement=n.querySelector(".bomb"),n.style.fill=t.color,this.decorationBackgroundElement.style.stroke=t.color,this.bombColor=w.pick(K.get(t.color)),this.bombVisible=!1,this.updateFinalPosition(t),O.appendChild(n)}async remove(t=0){let n,o;n=Math.random()*(y.SIZE/2-1),o=Math.random()*(y.SIZE/2-1);{const r=Math.random()*3;r>1&&(n-=y.SIZE/2),r<2&&(o-=y.SIZE/2)}{const r=a=>Math.random()>(a+1)/(y.SIZE+1);r(this.#e)&&(n=y.SIZE-n-1),r(this.#n)&&(o=y.SIZE-o-1)}this.element.parentElement.appendChild(this.element),await this.slideDirectlyTo({rowIndex:n,columnIndex:o},{duration:1e3*x,easing:"ease-in",delay:t,fill:"backwards"}),this.element.remove(),this.element="💀"}get bombColor(){return this.bombElement.style.fill}set bombColor(t){this.bombElement.style.fill=t}removeDecoration(){[this.decorationElement,this.decorationBackgroundElement].forEach(t=>{t.textContent="",t.getAnimations().forEach(n=>n.cancel())})}}const j=e=>w.positiveModulo(e+.5,y.SIZE)-.5,X=(e,t)=>{const n=[e],o=[0];if(Math.abs(e-t)>y.SIZE/2){const r=(a,l)=>{n.push(a,l);const c=Math.abs(e-a),h=Math.abs(l-t),f=c+h,u=c/f;o.push(u,u)};t>e?r(-.5,y.SIZE-.5):r(y.SIZE-.5,-.5)}return n.push(t),o.push(1),{position:n,offset:o}},$=C("piece",HTMLTemplateElement).content.querySelector(".bomb"),xt=C("main",SVGSVGElement);class Pt{initializeBoard(t){O.innerHTML="",this.#t.clear(),t.forEach(n=>this.#t.set(n,new P(n)))}async updateBoard(t){this.#t.forEach((u,d)=>{u.bombVisible=d.bomb}),x=Math.pow(.75,t.counter-1)*.9+.1,t.flingBomb.length>1&&(x=Math.max(.5,Math.min(1,x*2)));const n=2e3*x,o=t.flingBomb.map(u=>u.map(({source:d,destination:g})=>{const E=this.#t.get(d);if(E===void 0)throw new Error("wtf");return{logicalSource:d,logicalDestination:g,guiSource:E}})),r=Promise.all(t.remove.map(u=>{const d=this.#t.get(u).remove(n);return this.#t.delete(u),d}));setTimeout(()=>this.#t.forEach(u=>u.removeDecoration()),n);const a=1e3*x;t.add.forEach(({initialRow:u,piece:d})=>{const g=new P(d);this.#t.set(d,g),g.updateFinalPosition({columnIndex:d.columnIndex,rowIndex:u})});let l=0;const c=[];this.#t.forEach((u,d)=>{const g=u.columnIndex,E=u.rowIndex,b=d.columnIndex,S=d.rowIndex,I=Math.hypot(S-E,b-g),v=J(I),A={duration:v,delay:n+a,fill:"backwards"};c.push(()=>u.slideDirectlyTo(d,A)),l=Math.max(l,v)});const h=Promise.all(o.flatMap(u=>{const d=n+a+l;return u.map((g,E)=>{const b=Math.min(n,d/2)/(u.length+1)*(E+1),S=d-b;return this.flingBomb(g,b,S)})})),f=Promise.all(c.map(u=>u()));await Promise.all([r,f,h])}async flingBomb(t,n,o){const{logicalSource:r,logicalDestination:a,guiSource:l}=t,c=this.#t.get(a),h=a.color,f=c.bombColor;l.bombColor=f,l.bombVisible=!0;const u=(()=>{const g=w.assertClass($.cloneNode(!0),SVGPathElement),E=w.assertClass($.cloneNode(!0),SVGPathElement);E.style.strokeWidth="75",g.style.fill=f,E.style.stroke=h;const b=document.createElementNS("http://www.w3.org/2000/svg","g");return b.appendChild(E),b.appendChild(g),b.style.offsetRotate="0deg",b})(),d=(()=>{const g={x:r.columnIndex,y:r.rowIndex},E={x:a.columnIndex,y:a.rowIndex};if(Math.random()<.3333333)return St(g,E,.5+Math.random()*2+Math.random()*2);{const b=Math.random()*2*Math.PI,S=(Math.random()*2|0)*2-1,I=b+S*(.5+Math.random()*2)*2*Math.PI,v=.5+Math.random()*2,A=At(g,E,Ct(v,b,I));return W(A,{numberOfSegments:20})}})();await w.sleep(n),l.bombVisible=!1,xt.appendChild(u),u.style.offsetPath=`path('${d}')`,await u.animate({offsetDistance:["0%","100%"]},{duration:o,iterations:1,easing:"ease-in",fill:"both"}).finished,u.remove(),c.bombVisible=!0}#t=new Map;drawPreview(t,n,o){n.forEach(r=>{const a=this.#t.get(r);let{rowIndex:l,columnIndex:c}=r;t=="vertical"?l=j(l+o):c=j(c+o),a.updateFinalPosition({rowIndex:l,columnIndex:c})})}async rotateTo(t,n){const o=n.map(r=>this.#t.get(r).rotateTo(r,t));await Promise.all(o)}assignGroupDecorations(t){if(t.length==0)return{addToScore(){},highlightGroups(){_()}};{const n=[...G],o=t.map(r=>{const a=r[0].color,l=w.pick(K.get(a)),c=w.take(n);return{guiPieces:r.map(f=>{const u=this.#t.get(f);if(u==null)throw new Error("wtf");return u}),decorationColor:l,decorationText:c,backgroundColor:a}});return{addToScore(r,a){if(o.forEach(({guiPieces:l})=>{const f=[{opacity:Math.random()*.2+.05},{opacity:1}],u={direction:w.pick(["alternate","alternate-reverse","normal","reverse"]),duration:(550+Math.random()*150)*x,easing:w.pick(["linear","ease-in","ease-out","ease-in-out"]),iterationStart:Math.random(),iterations:1/0};l.forEach(d=>{d.decorationElement.animate(f,u),d.decorationBackgroundElement.animate(f,u)})}),r<2?U.innerHTML="":U.innerText=`Chain Bonus: ⨉ ${r}`,R.innerHTML="",o.forEach(({guiPieces:l,decorationColor:c,decorationText:h,backgroundColor:f},u)=>{u>0&&R.append(" + ");const d=document.createElement("span");d.innerText=`${h} ${l.length}`,d.style.color=c,d.style.borderColor=d.style.backgroundColor=f,d.classList.add("individualScore"),R.appendChild(d)}),a>0){o.length>0&&R.append(" + ");const l=document.createElementNS("http://www.w3.org/2000/svg","svg");l.setAttribute("viewBox","0.25 0.25 0.5 0.5");const c=$.cloneNode(!0);l.appendChild(c),l.style.width="1em",l.style.height="1em",l.style.fill="white";const h=document.createElement("span");h.innerHTML=`&nbsp;${a}`,h.style.color="white",h.style.borderColor=h.style.backgroundColor="black",h.classList.add("individualScore"),h.prepend(l),R.appendChild(h)}},highlightGroups(){_(),o.forEach(({guiPieces:r,decorationColor:a,decorationText:l})=>{r.forEach(c=>{const h=c.decorationElement;h.textContent=l,h.style.fill=a,c.decorationBackgroundElement.textContent=l})})}}}}}const Rt=new Pt,Ft=C("decorationTester",HTMLDivElement);G.forEach(e=>{const t=document.createElement("div");t.innerText=`${e} u+${e.codePointAt(0).toString(16)}`,Ft.appendChild(t)});const Nt=""+new URL("cursor-2110db60.svg",import.meta.url).href;function Dt(e){const t=C("main",SVGSVGElement);function n(r){const a=t.getBoundingClientRect(),l=w.makeLinear(a.top,0,a.bottom,y.SIZE),c=w.makeLinear(a.left,0,a.right,y.SIZE);return{row:l(r.clientY),column:c(r.clientX)}}let o={state:"none"};t.addEventListener("pointerdown",r=>{if(o.state=="none"){r.stopPropagation(),t.setPointerCapture(r.pointerId);const a=n(r);t.style.cursor="move",o={state:"started",startRow:a.row,startColumn:a.column}}}),t.addEventListener("pointermove",r=>{if(o.state=="none"||o.state=="animation")return;r.stopPropagation();const a=n(r);if(o.state=="started"){const l=Math.abs(a.row-o.startRow),c=Math.abs(a.column-o.startColumn);if(Math.max(l,c)<.05)return;if(l>c){const h="vertical",f=Math.floor(o.startColumn),u=o.startRow,d=E=>{const{row:b}=n(E);return b-u},g=e.startVerticalMove(f);o={state:h,fixedIndex:f,startIndex:u,relevantMouseMove:d,actions:g},t.style.cursor="ns-resize"}else if(c>l){const h="horizontal",f=Math.floor(o.startRow),u=o.startColumn,d=E=>{const{column:b}=n(E);return b-u},g=e.startHorizontalMove(f);o={state:h,fixedIndex:f,startIndex:u,relevantMouseMove:d,actions:g},t.style.cursor="ew-resize"}else return}o.actions.preview(o.relevantMouseMove(r))}),t.addEventListener("lostpointercapture",async r=>{switch(o.state){case"started":break;case"horizontal":case"vertical":{t.style.cursor=`url("${Nt}"),none`;const a=o;o={state:"animation"},await a.actions.release(a.relevantMouseMove(r));break}default:throw new Error("wtf")}o={state:"none"},t.style.cursor="grab"})}{class e{constructor(){throw new Error("wtf")}static#t=0;static get next(){return`Unique_${this.#t++}`}}const t=(f,u,d)=>{const g=u=="checked",E=e.next,b=document.createElement("div");C("debugButtons",HTMLDivElement).appendChild(b);const S=document.createElement("input");S.type="checkbox",S.checked=g,S.id=E,b.appendChild(S);const I=document.createElement("label");I.innerText=f,I.htmlFor=E,b.appendChild(I),d(g),S.addEventListener("change",()=>d(S.checked))},n=[],o=C("background",SVGGElement),[r,a]=w.initializedArray(2,()=>{const f=document.createElementNS("http://www.w3.org/2000/svg","g");o.appendChild(f);const u=y.SIZE*(Math.SQRT2-1)/2,d=0-u,E=y.SIZE+u-d,b=()=>Math.random()*E+d,S=Math.ceil(E*1.2);for(let I=0;I<S;I++){const v=document.createElementNS("http://www.w3.org/2000/svg","circle");v.cx.baseVal.value=b(),v.cy.baseVal.value=b(),Math.random()>.6?(v.style.fill="none",v.style.stroke=w.pick(L),v.style.strokeWidth=`${.05+.2*Math.random()}px`,v.r.baseVal.value=(Math.random()/3+.15)*y.SIZE):(v.style.stroke="none",v.style.fill=w.pick(L),v.r.baseVal.value=Math.random()*.3+.1),f.appendChild(v)}return f});r.style.transformOrigin="2px 2px",a.style.transformOrigin="4px 4px",o.style.transformOrigin="3px 3px",n.push(r.animate([{transform:"rotate(0deg)"},{transform:"rotate(720deg)"}],{duration:67973,easing:"ease",iterations:1/0})),n.push(a.animate([{transform:"rotate(0deg)"},{transform:"rotate(360deg)"}],{duration:19701,easing:"cubic-bezier(0.42, 0, 0.32, 1.83)",iterations:1/0})),n.push(o.animate([{transform:"rotate(0deg)"},{transform:"rotate(720deg)"}],{duration:16797,easing:"ease-in-out",iterations:1/0,direction:"alternate"}));const l=[r.animate(L.flatMap((f,u,d)=>[{stroke:"black",offset:u/d.length},{stroke:f,offset:(u+.25)/d.length},{stroke:f,offset:(u+.75)/d.length},{stroke:"black",offset:(u+1)/d.length}]),{duration:3210*L.length,iterations:1/0}),a.animate(L.flatMap((f,u,d)=>[{stroke:"white",offset:u/d.length},{stroke:f,offset:(u+.25)/d.length},{stroke:f,offset:(u+.75)/d.length},{stroke:"white",offset:(u+1)/d.length}]),{duration:4321*L.length,iterations:1/0})],c=C("main",SVGSVGElement).animate({backgroundColor:["#202020","#e0e0e0","#202020"]},{duration:97531,direction:"alternate",iterations:1/0});[[n,"line rotations","checked"],[l,"line colors","unchecked"],[[c],"back wall colors","checked"]].forEach(([f,u,d])=>{t(`Animate ${u}`,d,g=>{const E=g?"play":"pause";f.forEach(b=>b[E]())})});const h=C("curtain",SVGRectElement);[[o,"background","checked"],[C("board",SVGGElement),"board","checked"],[h,"curtain","unchecked"]].forEach(([f,u,d])=>{t(`Show ${u}`,d,g=>{f.style.display=g?"":"none"})})}Dt(new y(Rt));
