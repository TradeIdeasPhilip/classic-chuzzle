(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function e(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(r){if(r.ep)return;r.ep=!0;const s=e(r);fetch(r.href,s)}})();var w={},u={};Object.defineProperty(u,"__esModule",{value:!0});u.permutations=u.polarToRectangular=u.makeBoundedLinear=x=u.makeLinear=u.sum=u.countMap=b=u.initializedArray=u.count=u.zip=u.FIGURE_SPACE=u.NON_BREAKING_SPACE=u.dateIsValid=u.MIN_DATE=u.MAX_DATE=u.makePromise=u.filterMap=v=u.pick=u.pickAny=u.csvStringToArray=u.parseTimeT=u.parseIntX=u.parseFloatX=u.getAttribute=u.followPath=u.parseXml=u.testXml=V=u.sleep=u.assertClass=void 0;function nt(n,t,e="Assertion Failed."){const o=r=>{throw new Error(`${e}  Expected type:  ${t.name}.  Found type:  ${r}.`)};if(n===null)o("null");else if(typeof n!="object")o(typeof n);else if(!(n instanceof t))o(n.constructor.name);else return n;throw new Error("wtf")}u.assertClass=nt;function ot(n){return new Promise(t=>setTimeout(t,n))}var V=u.sleep=ot;function H(n){const e=new DOMParser().parseFromString(n,"application/xml");for(const o of Array.from(e.querySelectorAll("parsererror")))if(o instanceof HTMLElement)return{error:o};return{parsed:e}}u.testXml=H;function rt(n){if(n!==void 0)return H(n)?.parsed?.documentElement}u.parseXml=rt;function X(n,...t){for(const e of t){if(n===void 0)return;if(typeof e=="number")n=n.children[e];else{const o=n.getElementsByTagName(e);if(o.length!=1)return;n=o[0]}}return n}u.followPath=X;function st(n,t,...e){if(t=X(t,...e),t!==void 0&&t.hasAttribute(n))return t.getAttribute(n)??void 0}u.getAttribute=st;function j(n){if(n==null)return;const t=parseFloat(n);if(isFinite(t))return t}u.parseFloatX=j;function _(n){const t=j(n);if(t!==void 0)return t>Number.MAX_SAFE_INTEGER||t<Number.MIN_SAFE_INTEGER||t!=Math.floor(t)?void 0:t}u.parseIntX=_;function it(n){if(typeof n=="string"&&(n=_(n)),n!=null&&!(n<=0))return new Date(n*1e3)}u.parseTimeT=it;const at=n=>{const t=/(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi,e=[[]];let o;for(;o=t.exec(n);)o[1].length&&o[1]!==","&&e.push([]),e[e.length-1].push(o[2]!==void 0?o[2].replace(/""/g,'"'):o[3]);return e};u.csvStringToArray=at;function lt(n){const t=n.values().next();if(!t.done)return t.value}u.pickAny=lt;function ct(n){return n[Math.random()*n.length|0]}var v=u.pick=ct;function ut(n,t){const e=[];return n.forEach((o,r)=>{const s=t(o,r);s!==void 0&&e.push(s)}),e}u.filterMap=ut;function dt(){let n,t;return{promise:new Promise((o,r)=>{n=o,t=r}),resolve:n,reject:t}}u.makePromise=dt;u.MAX_DATE=new Date(864e13);u.MIN_DATE=new Date(-864e13);function ht(n){return isFinite(n.getTime())}u.dateIsValid=ht;u.NON_BREAKING_SPACE=" ";u.FIGURE_SPACE=" ";function*mt(...n){const t=n.map(e=>e[Symbol.iterator]());for(;;){const e=t.map(o=>o.next());if(e.some(({done:o})=>o))break;yield e.map(({value:o})=>o)}}u.zip=mt;function*ft(n=0,t=1/0,e=1){for(let o=n;o<t;o+=e)yield o}u.count=ft;function U(n,t){const e=[];for(let o=0;o<n;o++)e.push(t(o));return e}var b=u.initializedArray=U;u.countMap=U;function pt(n){return n.reduce((t,e)=>t+e,0)}u.sum=pt;function gt(n,t,e,o){const r=(o-t)/(e-n);return function(s){return(s-n)*r+t}}var x=u.makeLinear=gt;function wt(n,t,e,o){e<n&&([n,t,e,o]=[e,o,n,t]);const r=(o-t)/(e-n);return function(s){return s<=n?t:s>=e?o:(s-n)*r+t}}u.makeBoundedLinear=wt;function yt(n,t){return{x:Math.sin(t)*n,y:Math.cos(t)*n}}u.polarToRectangular=yt;function*q(n,t=[]){if(n.length==0)yield t;else for(let e=0;e<n.length;e++){const o=n[e],r=[...t,o],s=[...n.slice(0,e),...n.slice(e+1)];yield*q(s,r)}}u.permutations=q;Object.defineProperty(w,"__esModule",{value:!0});w.download=w.createElementFromHTML=w.getHashInfo=w.getAudioBalanceControl=w.getBlobFromCanvas=w.loadDateTimeLocal=I=w.getById=void 0;const K=u;function Et(n,t){const e=document.getElementById(n);if(!e)throw new Error("Could not find element with id "+n+".  Expected type:  "+t.name);if(e instanceof t)return e;throw new Error("Element with id "+n+" has type "+e.constructor.name+".  Expected type:  "+t.name)}var I=w.getById=Et;function bt(n,t,e="milliseconds"){let o;switch(e){case"minutes":{o=t.getSeconds()*1e3+t.getMilliseconds();break}case"seconds":{o=t.getMilliseconds();break}case"milliseconds":{o=0;break}default:throw new Error("wtf")}n.valueAsNumber=+t-t.getTimezoneOffset()*6e4-o}w.loadDateTimeLocal=bt;function vt(n){const{reject:t,resolve:e,promise:o}=(0,K.makePromise)();return n.toBlob(r=>{r?e(r):t(new Error("blob is null!"))}),o}w.getBlobFromCanvas=vt;function It(n){const t=new AudioContext,e=t.createMediaElementSource(n),o=new StereoPannerNode(t,{pan:0});return e.connect(o).connect(t.destination),r=>{o.pan.value=r}}w.getAudioBalanceControl=It;function Mt(){const n=new Map;return/^#?(.*)$/.exec(location.hash.replace("+","%20"))[1].split("&").forEach(o=>{const r=o.split("=",2);if(r.length==2){const s=decodeURIComponent(r[0]),i=decodeURIComponent(r[1]);n.set(s,i)}}),n}w.getHashInfo=Mt;function xt(n,t){var e=document.createElement("div");return e.innerHTML=n.trim(),(0,K.assertClass)(e.firstChild,t,"createElementFromHTML:")}w.createElementFromHTML=xt;function St(n,t){var e=document.createElement("a");if(e.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(t)),e.setAttribute("download",n),document.createEvent){var o=document.createEvent("MouseEvents");o.initEvent("click",!0,!0),e.dispatchEvent(o)}else e.click()}w.download=St;class Ct{#t=new Set;get contents(){return[...this.#t].map(t=>t.piece)}get size(){return this.#t.size}debugInitialCell;color;constructor(t){this.color=t.color,this.debugInitialCell=t,this.#t.add(t)}consume(t){const e=this.#t,o=t.#t;return o.forEach(r=>e.add(r)),t.#t=void 0,o}get valid(){return!!this.#t?.has(this.debugInitialCell)}}class F{constructor(t){this.piece=t,this.#t=new Ct(this)}#t;get color(){return this.piece.color}static createAll(t){return t.map(e=>e.map(o=>new F(o)))}tryCombine(t){if(this.#t!=t.#t&&this.color==t.color&&(this.#t.consume(t.#t).forEach(o=>o.#t=this.#t),!this.#t.valid))throw new Error("wtf")}static combineAll(t){t.forEach((e,o)=>{e.forEach((r,s)=>{if(o){const i=o-1,a=t[i][s];r.tryCombine(a)}if(s){const i=s-1,a=e[i];r.tryCombine(a)}})})}static findBigGroups(t){const e=new Map;t.forEach(r=>r.forEach(s=>{const i=s.#t,a=e.get(i)??0;e.set(i,a+1)}));const o=[];for(const[r,s]of e)s>=3&&o.push(r);return o}static findActionable(t){const e=this.createAll(t);return this.combineAll(e),this.findBigGroups(e)}}function P(n){return F.findActionable(n).map(t=>t.contents)}function A(n,t){const e=n%t;return e<0?e+Math.abs(t):e}function Tt(n,t){if((t|0)!=t)throw new Error(`invalid input: ${t}`);return t=A(t,n.length),t==0?n:[...n.slice(t),...n.slice(0,t)]}function N(n,t,e="Assertion Failed."){const o=r=>{throw new Error(`${e}  Expected type:  ${t.name}.  Found type:  ${r}.`)};if(n===null)o("null");else if(typeof n!="object")o(typeof n);else if(!(n instanceof t))o(n.constructor.name);else return n;throw new Error("wtf")}function Q(n,t){return{x:Math.cos(t)*n,y:Math.sin(t)*n}}function W(n){if(n.length<1)throw new Error("wtf");const t=Math.random()*n.length|0;return n.splice(t,1)[0]}const B=n=>A(Math.round(n),f.SIZE);function kt(n,t,e){const o=n[t],r=Tt(o,e);return o==r?n:n.map(s=>s==o?r:s)}function At(n,t,e){const o=n.length;return e=A(e,o),e==0?n:n.map((r,s)=>{const i=[...r];return i[t]=n[(s+e)%o][t],i})}const Y=["red","green","blue","yellow","orange","violet"];class k{constructor(t,e,o=k.randomColor()){this.rowIndex=t,this.columnIndex=e,this.color=o}weight=1;bomb=!1;static randomColor(){return v(Y)}}class f{constructor(t){this.animator=t,this.#t=this.createRandom(),this.animator.initializeBoard(this.#t.flat())}static SIZE=6;#t;getColumn(t){return this.#t.map(e=>e[t])}createRandom(){const t=b(f.SIZE,o=>b(f.SIZE,r=>new k(o,r)));return P(t).forEach(o=>{o.forEach(({rowIndex:r,columnIndex:s})=>{const i=new Set;[[0,1],[0,-1],[1,0],[-1,0]].forEach(([a,l])=>{const h=t[r+a];if(h){const c=h[s+l];c&&i.add(c.color)}}),t[r][s]=new k(r,s,v(Y.filter(a=>!i.has(a))))})}),t}async updateLoop(t,e){for(let o=1;t.length>0;o++){const r=new Set,s=[];t.forEach(d=>{if(d.length>5)s.push(d);else if(d.length==5){const m=v(d);m.bomb=!0,r.add(m)}});const i=[];{let d=t.flat();const m=new Set(d);for(;;){const p=d.filter(g=>g.bomb&&!r.has(g));if(p.length==0)break;d.length=0;for(let g=-1;g<=1;g++)for(let y=-1;y<=1;y++)p.forEach(C=>{const E=this.#t[C.rowIndex+g]?.[C.columnIndex+y];E&&!m.has(E)&&(d.push(E),m.add(E))});i.push(d)}}console.log(i),e.addToScore(o,i.flat().length);const a=t.flatMap(d=>d.filter(m=>!r.has(m))),l=this.removePieces(a),h=this.#t.flat().filter(d=>!d.bomb),c=s.map(d=>{const m=[];return d.forEach(p=>{if(!p.bomb&&h.length>0){const g=W(h);m.push({source:p,destination:g})}}),m});await this.animator.updateBoard({remove:a,counter:o,flingBomb:c,destroyByBomb:i,add:l}),c.flat().forEach(({destination:d})=>d.bomb=!0),t=P(this.#t),e=this.animator.assignGroupDecorations(t),e.highlightGroups()}}setAllPieces(t){this.#t=t,t.forEach((e,o)=>{e.forEach((r,s)=>{r.columnIndex=s,r.rowIndex=o})})}startHorizontalMove(t){const e=b(f.SIZE,s=>{const i=kt(this.#t,t,-s),a=P(i);return{actions:this.animator.assignGroupDecorations(a),groups:a,pieces:i}}),o=s=>{const i=this.#t[t];this.animator.drawPreview("horizontal",i,s),e[B(s)].actions.highlightGroups()};return{preview:o,release:async s=>{o(s);const i=B(s),l=e[i].groups.length==0?0:i,h=e[l];this.setAllPieces(h.pieces);const c=this.#t[t];await this.animator.rotateTo("horizontal",c),await this.updateLoop(h.groups,h.actions)}}}startVerticalMove(t){const e=b(f.SIZE,s=>{const i=At(this.#t,t,-s),a=P(i);return{actions:this.animator.assignGroupDecorations(a),groups:a,pieces:i}}),o=s=>{const i=this.getColumn(t);this.animator.drawPreview("vertical",i,s),e[B(s)].actions.highlightGroups()};return{preview:o,release:async s=>{o(s);const i=B(s),l=e[i].groups.length==0?0:i,h=e[l];this.setAllPieces(h.pieces);const c=this.getColumn(t);await this.animator.rotateTo("vertical",c),await this.updateLoop(h.groups,h.actions)}}}removePieces(t){const e=b(f.SIZE,()=>new Set);t.forEach(({rowIndex:s,columnIndex:i})=>{const a=e[i];if(a.has(s))throw new Error("wtf");a.add(s)});const o=b(f.SIZE,()=>new Array(f.SIZE)),r=[];return e.forEach((s,i)=>{const a=[];for(let l=0;l<f.SIZE;l++)s.has(l)||a.push(this.#t[l][i]);for(let l=0;a.length<f.SIZE;l++){const h=-1-l,c=new k(NaN,i);r.push({initialRow:h,piece:c}),a.unshift(c)}a.forEach((l,h)=>{o[h][i]=l,l.columnIndex=i,l.rowIndex=h})}),this.setAllPieces(o),r}}function Pt(n,t,e){if(!(t>=0&&t<=1))throw new Error("Expected 0 ≤ t ≤ 1");const o=Math.max(0,t-e),r=n(o),s=Math.max(0,t+e),i=n(s),a=i.x-r.x,l=i.y-r.y;return a==0&&l==0?NaN:Math.atan2(l,a)}function J(n,t={}){const e=Math.ceil(t.numberOfSegments??10);if(e<1)throw new Error(`Invalid numberOfSegments: ${e}`);const o=.01/e,r=b(e+1,a=>{const l=a/e,h=n(l),c=Pt(n,l,o);return{t:l,point:h,direction:c}}),s=b(e,a=>[{from:r[a],to:r[a+1]}][0]);let i=`M ${s[0].from.point.x}, ${s[0].from.point.y}`;return s.forEach(a=>{const l=$t({x0:a.from.point.x,y0:a.from.point.y,slope:Math.tan(a.from.direction)},{x0:a.to.point.x,y0:a.to.point.y,slope:Math.tan(a.to.direction)});l?i+=` Q ${l.x},${l.y}`:i+=" M",i+=` ${a.to.point.x},${a.to.point.y}`}),i}function Bt(n,t,e){const o=Dt(n,t,e);return J(o,{numberOfSegments:e*9.001002})}function Dt(n,t,e){const s={x:n.x-t.x,y:n.y-t.y},i=Math.hypot(s.x,s.y),a=x(0,i,1,0),l=Math.atan2(s.y,s.x),h=x(0,l,1,l+e*2*Math.PI);return function(c){const d=a(c),m=h(c),p=Q(d,m);return{x:t.x+p.x,y:t.y+p.y}}}function Rt(n,t,e){const o=x(0,t,1,e);return r=>Q(n,o(r))}function Nt(n,t){const e=x(0,n.x,1,t.x),o=x(0,n.y,1,t.y);return r=>({x:e(r),y:o(r)})}function Ft(n,t,...e){const o=a=>{const l={x:0,y:0};return e.forEach(h=>{const c=h(a);l.x+=c.x,l.y+=c.y}),l},r=o(0),s=o(1),i=Nt({x:n.x-r.x,y:n.y-r.y},{x:t.x-s.x,y:t.y-s.y});return e.push(i),o}function $t(n,t){if(isNaN(n.slope)||isNaN(t.slope)||n.slope==t.slope)return;const e=n.slope==1/0||n.slope==-1/0,o=t.slope==1/0||t.slope==-1/0;if(e||o)return;const r=e?n.x0:o?t.x0:(t.y0-t.slope*t.x0-n.y0+n.slope*n.x0)/(n.slope-t.slope),s=e?t.slope*(r-t.x0)+t.y0:n.slope*(r-n.x0)+n.y0;return{x:r,y:s}}const T=I("newScore",HTMLDivElement),O=I("chainBonus",HTMLDivElement),tt=new Map([["orange",["cyan","brown","white","darkviolet","lightyellow","darkgreen","darkolivegreen","darkred"]],["yellow",["brown","darkviolet","lightcoral","lightsalmon","lightseagreen","darkblue","darkcyan","darkgoldenrod","darkgreen","darkkhaki","darkolivegreen","darkorange","darkred","darksalmon","darkseagreen"]],["violet",["cyan","brown","white","darkviolet","lightgreen","darkblue"]],["blue",["cyan","white","lightcoral","lightgreen","lightgray","lightsalmon","lightseagreen","lightseagreen","lightskyblue","lightslategray","darkorange","darkseagreen","darkturquoise"]],["red",["cyan","white","lightcoral","lightgreen","lightsalmon","darkkhaki","darkseagreen","chartreuse"]],["green",["cyan","white","lightcoral","lightcyan","lightgreen","lightyellow","darkred","darkseagreen","chartreuse"]]]),$=["༟","༴","℣","⌰","⍷","⎙","ʻ","☆","𝛿","∞","•","⭑","†","‡","؟","༗","ၯ","◦","§","_","ɝ","Ԕ","⟳","⚐","🜚","愛","❝","ℵ","を","ᇸ","ڰ","ॾ","ན","ᛧ","ß","⧕","↯","➷","⅋","☙","„","⌥","⧷","⁎","╕","₰","…","⑈","۽","ₜ","ಠ","෴","ጃ","ᔱ","ᔰ","Ѧ","ᑥ","𝄢","ƈ","Ɣ","ƕ","Ɋ","ɕ","ɮ","ʆ","Ξ","Ж","Ѭ","Զ","ঔ","ਐ","ઝ","ଈ","ஜ","ధ","ൠ","ඊ","ጯ","ᡀ","‰","₻","↉","↜","↸","⋨","⌤","⎌","⍾","☏","✗","➘","〷","ご","ᇌ","㊤","﹆","🜇","🝤","⅏"];setInterval(()=>{document.title=`${v($)} Classic Chuzzle`},1500);let M=1;function et(n){return Math.abs(n)*2e3/f.SIZE*M}const L=I("board",SVGElement);function G(){L.querySelectorAll("text.crystal-decoration,text.crystal-decoration-background").forEach(n=>n.textContent="")}class S{static#t=I("piece",HTMLTemplateElement).content.querySelector("g");element;decorationElement;decorationBackgroundElement;bombElement;get bombVisible(){return this.bombElement.style.display==""}set bombVisible(t){this.bombElement.style.display=t?"":"none"}static#o=CSS.px(Math.E);static#r=CSS.px(Math.PI);static#s=new CSSTransformValue([new CSSTranslate(this.#o,this.#r)]);updateFinalPosition(t){this.#n=t.columnIndex,this.#e=t.rowIndex,S.#o.value=t.columnIndex,S.#r.value=t.rowIndex,this.element.attributeStyleMap.set("transform",S.#s)}async slideDirectlyTo(t,e){const o=this.#n,r=this.#e,s=t.columnIndex,i=t.rowIndex;(o!=s||r!=i)&&(await this.element.animate([{transform:`translate(${o}px, ${r}px)`},{transform:`translate(${s}px, ${i}px)`}],e).finished,this.updateFinalPosition(t))}async rotateTo(t,e){const o=e=="horizontal",r=(()=>{const l=o?t.columnIndex-this.#n:t.rowIndex-this.#e,h=A(l+f.SIZE/2,f.SIZE)-f.SIZE/2;return et(Math.abs(h))})(),{position:s,offset:i}=o?Z(this.#n,t.columnIndex):Z(this.#e,t.rowIndex),a=s.map(l=>o?`translate(${l}px, ${t.rowIndex}px)`:`translate(${t.columnIndex}px, ${l}px)`);this.updateFinalPosition(t),await this.element.animate({transform:a,offset:i},r).finished}#e=NaN;get rowIndex(){return this.#e}#n=NaN;get columnIndex(){return this.#n}constructor(t){const e=N(S.#t.cloneNode(!0),SVGGElement);this.element=e,this.decorationElement=e.querySelector("text.crystal-decoration"),this.decorationBackgroundElement=e.querySelector("text.crystal-decoration-background"),this.bombElement=e.querySelector(".bomb"),e.style.fill=t.color,this.decorationBackgroundElement.style.stroke=t.color,this.bombColor=v(tt.get(t.color)),this.bombVisible=!1,this.updateFinalPosition(t),L.appendChild(e)}async remove(t=0){let e,o;e=Math.random()*(f.SIZE/2-1),o=Math.random()*(f.SIZE/2-1);{const r=Math.random()*3;r>1&&(e-=f.SIZE/2),r<2&&(o-=f.SIZE/2)}{const r=s=>Math.random()>(s+1)/(f.SIZE+1);r(this.#e)&&(e=f.SIZE-e-1),r(this.#n)&&(o=f.SIZE-o-1)}this.element.parentElement.appendChild(this.element),await this.slideDirectlyTo({rowIndex:e,columnIndex:o},{duration:1e3*M,easing:"ease-in",delay:t,fill:"backwards"}),this.element.remove(),this.element="💀"}get bombColor(){return this.bombElement.style.fill}set bombColor(t){this.bombElement.style.fill=t}removeDecoration(){[this.decorationElement,this.decorationBackgroundElement].forEach(t=>{t.textContent="",t.getAnimations().forEach(e=>e.cancel())})}}const z=n=>A(n+.5,f.SIZE)-.5,Z=(n,t)=>{const e=[n],o=[0];if(Math.abs(n-t)>f.SIZE/2){const r=(s,i)=>{e.push(s,i);const a=Math.abs(n-s),l=Math.abs(i-t),h=a+l,c=a/h;o.push(c,c)};t>n?r(-.5,f.SIZE-.5):r(f.SIZE-.5,-.5)}return e.push(t),o.push(1),{position:e,offset:o}},R=I("piece",HTMLTemplateElement).content.querySelector(".bomb"),Lt=I("main",SVGSVGElement);class Ot{initializeBoard(t){L.innerHTML="",this.#t.clear(),t.forEach(e=>this.#t.set(e,new S(e)))}async updateBoard(t){this.#t.forEach((c,d)=>{c.bombVisible=d.bomb}),M=Math.pow(.75,t.counter-1)*.9+.1,t.flingBomb.length>1&&(M=Math.max(.5,Math.min(1,M*2)));const e=2e3*M,o=t.flingBomb.map(c=>c.map(({source:d,destination:m})=>{const p=this.#t.get(d);if(p===void 0)throw new Error("wtf");return{logicalSource:d,logicalDestination:m,guiSource:p}})),r=Promise.all(t.remove.map(c=>{const d=this.#t.get(c).remove(e);return this.#t.delete(c),d}));setTimeout(()=>this.#t.forEach(c=>c.removeDecoration()),e);const s=1e3*M;t.add.forEach(({initialRow:c,piece:d})=>{const m=new S(d);this.#t.set(d,m),m.updateFinalPosition({columnIndex:d.columnIndex,rowIndex:c})});let i=0;const a=[];this.#t.forEach((c,d)=>{const m=c.columnIndex,p=c.rowIndex,g=d.columnIndex,y=d.rowIndex,C=Math.hypot(y-p,g-m),E=et(C),D={duration:E,delay:e+s,fill:"backwards"};a.push(()=>c.slideDirectlyTo(d,D)),i=Math.max(i,E)});const l=Promise.all(o.flatMap(c=>{const d=e+s+i;return c.map((m,p)=>{const g=Math.min(e,d/2)/(c.length+1)*(p+1),y=d-g;return this.flingBomb(m,g,y)})})),h=Promise.all(a.map(c=>c()));await Promise.all([r,h,l])}async flingBomb(t,e,o){const{logicalSource:r,logicalDestination:s,guiSource:i}=t,a=this.#t.get(s),l=s.color,h=a.bombColor;i.bombColor=h,i.bombVisible=!0;const c=(()=>{const m=N(R.cloneNode(!0),SVGPathElement),p=N(R.cloneNode(!0),SVGPathElement);p.style.strokeWidth="75",m.style.fill=h,p.style.stroke=l;const g=document.createElementNS("http://www.w3.org/2000/svg","g");return g.appendChild(p),g.appendChild(m),g.style.offsetRotate="0deg",g})(),d=(()=>{const m={x:r.columnIndex,y:r.rowIndex},p={x:s.columnIndex,y:s.rowIndex};if(Math.random()<.3333333)return Bt(m,p,.5+Math.random()*2+Math.random()*2);{const g=Math.random()*2*Math.PI,y=(Math.random()*2|0)*2-1,C=g+y*(.5+Math.random()*2)*2*Math.PI,E=.5+Math.random()*2,D=Ft(m,p,Rt(E,g,C));return J(D,{numberOfSegments:20})}})();await V(e),i.bombVisible=!1,Lt.appendChild(c),c.style.offsetPath=`path('${d}')`,await c.animate({offsetDistance:["0%","100%"]},{duration:o,iterations:1,easing:"ease-in",fill:"both"}).finished,c.remove(),a.bombVisible=!0}#t=new Map;drawPreview(t,e,o){e.forEach(r=>{const s=this.#t.get(r);let{rowIndex:i,columnIndex:a}=r;t=="vertical"?i=z(i+o):a=z(a+o),s.updateFinalPosition({rowIndex:i,columnIndex:a})})}async rotateTo(t,e){const o=e.map(r=>this.#t.get(r).rotateTo(r,t));await Promise.all(o)}assignGroupDecorations(t){if(t.length==0)return{addToScore(){},highlightGroups(){G()}};{const e=[...$],o=t.map(r=>{const s=r[0].color,i=v(tt.get(s)),a=W(e);return{guiPieces:r.map(h=>{const c=this.#t.get(h);if(c==null)throw new Error("wtf");return c}),decorationColor:i,decorationText:a,backgroundColor:s}});return{addToScore(r,s){if(o.forEach(({guiPieces:i})=>{const h=[{opacity:Math.random()*.2+.05},{opacity:1}],c={direction:v(["alternate","alternate-reverse","normal","reverse"]),duration:(550+Math.random()*150)*M,easing:v(["linear","ease-in","ease-out","ease-in-out"]),iterationStart:Math.random(),iterations:1/0};i.forEach(d=>{d.decorationElement.animate(h,c),d.decorationBackgroundElement.animate(h,c)})}),r<2?O.innerHTML="":O.innerText=`Chain Bonus: ⨉ ${r}`,T.innerHTML="",o.forEach(({guiPieces:i,decorationColor:a,decorationText:l,backgroundColor:h},c)=>{c>0&&T.append(" + ");const d=document.createElement("span");d.innerText=`${l} ${i.length}`,d.style.color=a,d.style.borderColor=d.style.backgroundColor=h,d.classList.add("individualScore"),T.appendChild(d)}),s>0){o.length>0&&T.append(" + ");const i=document.createElementNS("http://www.w3.org/2000/svg","svg");i.setAttribute("viewBox","0.25 0.25 0.5 0.5");const a=R.cloneNode(!0);i.appendChild(a),i.style.width="1em",i.style.height="1em",i.style.fill="white";const l=document.createElement("span");l.innerHTML=`&nbsp;${s}`,l.style.color="white",l.style.borderColor=l.style.backgroundColor="black",l.classList.add("individualScore"),l.prepend(i),T.appendChild(l)}},highlightGroups(){G(),o.forEach(({guiPieces:r,decorationColor:s,decorationText:i})=>{r.forEach(a=>{const l=a.decorationElement;l.textContent=i,l.style.fill=s,a.decorationBackgroundElement.textContent=i})})}}}}}const Gt=new Ot,zt=I("decorationTester",HTMLDivElement);$.forEach(n=>{const t=document.createElement("div");t.innerText=`${n} u+${n.codePointAt(0).toString(16)}`,zt.appendChild(t)});const Zt=""+new URL("cursor-2110db60.svg",import.meta.url).href;function Vt(n){const t=I("main",SVGSVGElement);function e(r){const s=t.getBoundingClientRect(),i=x(s.top,0,s.bottom,f.SIZE),a=x(s.left,0,s.right,f.SIZE);return{row:i(r.clientY),column:a(r.clientX)}}let o={state:"none"};t.addEventListener("pointerdown",r=>{if(o.state=="none"){r.stopPropagation(),t.setPointerCapture(r.pointerId);const s=e(r);t.style.cursor="move",o={state:"started",startRow:s.row,startColumn:s.column}}}),t.addEventListener("pointermove",r=>{if(o.state=="none"||o.state=="animation")return;r.stopPropagation();const s=e(r);if(o.state=="started"){const i=Math.abs(s.row-o.startRow),a=Math.abs(s.column-o.startColumn);if(Math.max(i,a)<.05)return;if(i>a){const l="vertical",h=Math.floor(o.startColumn),c=o.startRow,d=p=>{const{row:g}=e(p);return g-c},m=n.startVerticalMove(h);o={state:l,fixedIndex:h,startIndex:c,relevantMouseMove:d,actions:m},t.style.cursor="ns-resize"}else if(a>i){const l="horizontal",h=Math.floor(o.startRow),c=o.startColumn,d=p=>{const{column:g}=e(p);return g-c},m=n.startHorizontalMove(h);o={state:l,fixedIndex:h,startIndex:c,relevantMouseMove:d,actions:m},t.style.cursor="ew-resize"}else return}o.actions.preview(o.relevantMouseMove(r))}),t.addEventListener("lostpointercapture",async r=>{switch(o.state){case"started":break;case"horizontal":case"vertical":{t.style.cursor=`url("${Zt}"),none`;const s=o;o={state:"animation"},await s.actions.release(s.relevantMouseMove(r));break}default:throw new Error("wtf")}o={state:"none"},t.style.cursor="grab"})}Vt(new f(Gt));