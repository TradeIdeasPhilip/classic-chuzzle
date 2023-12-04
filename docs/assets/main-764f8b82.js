(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(o){if(o.ep)return;o.ep=!0;const s=t(o);fetch(o.href,s)}})();var i={};Object.defineProperty(i,"__esModule",{value:!0});i.permutations=i.polarToRectangular=i.makeBoundedLinear=X=i.makeLinear=i.sum=i.countMap=z=i.initializedArray=i.count=i.zip=i.FIGURE_SPACE=i.NON_BREAKING_SPACE=i.dateIsValid=i.MIN_DATE=i.MAX_DATE=i.makePromise=i.filterMap=D=i.pick=i.pickAny=i.csvStringToArray=i.parseTimeT=i.parseIntX=i.parseFloatX=i.getAttribute=i.followPath=i.parseXml=i.testXml=Q=i.sleep=J=i.assertClass=void 0;function se(r,e,t="Assertion Failed."){const n=o=>{throw new Error(`${t}  Expected type:  ${e.name}.  Found type:  ${o}.`)};if(r===null)n("null");else if(typeof r!="object")n(typeof r);else if(!(r instanceof e))n(r.constructor.name);else return r;throw new Error("wtf")}var J=i.assertClass=se;function ie(r){return new Promise(e=>setTimeout(e,r))}var Q=i.sleep=ie;function W(r){const t=new DOMParser().parseFromString(r,"application/xml");for(const n of Array.from(t.querySelectorAll("parsererror")))if(n instanceof HTMLElement)return{error:n};return{parsed:t}}i.testXml=W;function ae(r){if(r!==void 0)return W(r)?.parsed?.documentElement}i.parseXml=ae;function U(r,...e){for(const t of e){if(r===void 0)return;if(typeof t=="number")r=r.children[t];else{const n=r.getElementsByTagName(t);if(n.length!=1)return;r=n[0]}}return r}i.followPath=U;function ce(r,e,...t){if(e=U(e,...t),e!==void 0&&e.hasAttribute(r))return e.getAttribute(r)??void 0}i.getAttribute=ce;function _(r){if(r==null)return;const e=parseFloat(r);if(isFinite(e))return e}i.parseFloatX=_;function ee(r){const e=_(r);if(e!==void 0)return e>Number.MAX_SAFE_INTEGER||e<Number.MIN_SAFE_INTEGER||e!=Math.floor(e)?void 0:e}i.parseIntX=ee;function le(r){if(typeof r=="string"&&(r=ee(r)),r!=null&&!(r<=0))return new Date(r*1e3)}i.parseTimeT=le;const ue=r=>{const e=/(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi,t=[[]];let n;for(;n=e.exec(r);)n[1].length&&n[1]!==","&&t.push([]),t[t.length-1].push(n[2]!==void 0?n[2].replace(/""/g,'"'):n[3]);return t};i.csvStringToArray=ue;function fe(r){const e=r.values().next();if(!e.done)return e.value}i.pickAny=fe;function de(r){return r[Math.random()*r.length|0]}var D=i.pick=de;function he(r,e){const t=[];return r.forEach((n,o)=>{const s=e(n,o);s!==void 0&&t.push(s)}),t}i.filterMap=he;function pe(){let r,e;return{promise:new Promise((n,o)=>{r=n,e=o}),resolve:r,reject:e}}i.makePromise=pe;i.MAX_DATE=new Date(864e13);i.MIN_DATE=new Date(-864e13);function me(r){return isFinite(r.getTime())}i.dateIsValid=me;i.NON_BREAKING_SPACE=" ";i.FIGURE_SPACE=" ";function*we(...r){const e=r.map(t=>t[Symbol.iterator]());for(;;){const t=e.map(n=>n.next());if(t.some(({done:n})=>n))break;yield t.map(({value:n})=>n)}}i.zip=we;function*ge(r=0,e=1/0,t=1){for(let n=r;n<e;n+=t)yield n}i.count=ge;function te(r,e){const t=[];for(let n=0;n<r;n++)t.push(e(n));return t}var z=i.initializedArray=te;i.countMap=te;function Ee(r){return r.reduce((e,t)=>e+t,0)}i.sum=Ee;function ve(r,e,t,n){const o=(n-e)/(t-r);return function(s){return(s-r)*o+e}}var X=i.makeLinear=ve;function Me(r,e,t,n){t<r&&([r,e,t,n]=[t,n,r,e]);const o=(n-e)/(t-r);return function(s){return s<=r?e:s>=t?n:(s-r)*o+e}}i.makeBoundedLinear=Me;function Se(r,e){return{x:Math.sin(e)*r,y:Math.cos(e)*r}}i.polarToRectangular=Se;function*ne(r,e=[]){if(r.length==0)yield e;else for(let t=0;t<r.length;t++){const n=r[t],o=[...e,n],s=[...r.slice(0,t),...r.slice(t+1)];yield*ne(s,o)}}i.permutations=ne;var v={};Object.defineProperty(v,"__esModule",{value:!0});v.download=v.createElementFromHTML=v.getHashInfo=v.getAudioBalanceControl=v.getBlobFromCanvas=v.loadDateTimeLocal=O=v.getById=void 0;const re=i;function ye(r,e){const t=document.getElementById(r);if(!t)throw new Error("Could not find element with id "+r+".  Expected type:  "+e.name);if(t instanceof e)return t;throw new Error("Element with id "+r+" has type "+t.constructor.name+".  Expected type:  "+e.name)}var O=v.getById=ye;function be(r,e,t="milliseconds"){let n;switch(t){case"minutes":{n=e.getSeconds()*1e3+e.getMilliseconds();break}case"seconds":{n=e.getMilliseconds();break}case"milliseconds":{n=0;break}default:throw new Error("wtf")}r.valueAsNumber=+e-e.getTimezoneOffset()*6e4-n}v.loadDateTimeLocal=be;function Ie(r){const{reject:e,resolve:t,promise:n}=(0,re.makePromise)();return r.toBlob(o=>{o?t(o):e(new Error("blob is null!"))}),n}v.getBlobFromCanvas=Ie;function Ce(r){const e=new AudioContext,t=e.createMediaElementSource(r),n=new StereoPannerNode(e,{pan:0});return t.connect(n).connect(e.destination),o=>{n.pan.value=o}}v.getAudioBalanceControl=Ce;function ke(){const r=new Map;return/^#?(.*)$/.exec(location.hash.replace("+","%20"))[1].split("&").forEach(n=>{const o=n.split("=",2);if(o.length==2){const s=decodeURIComponent(o[0]),a=decodeURIComponent(o[1]);r.set(s,a)}}),r}v.getHashInfo=ke;function Ae(r,e){var t=document.createElement("div");return t.innerHTML=r.trim(),(0,re.assertClass)(t.firstChild,e,"createElementFromHTML:")}v.createElementFromHTML=Ae;function Te(r,e){var t=document.createElement("a");if(t.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(e)),t.setAttribute("download",r),document.createEvent){var n=document.createEvent("MouseEvents");n.initEvent("click",!0,!0),t.dispatchEvent(n)}else t.click()}v.download=Te;class j{#e=new Set;get contents(){return this.#e}static#n=0;#t=j.#n++;debugInitialGroup;debugInfo(){return{row:this.debugInitialGroup.row,column:this.debugInitialGroup.column,contents:this.valid?this.#e.size:"invalid",id:this.#t}}color;constructor(e){this.color=e.color,this.debugInitialGroup=e,this.#e.add(e)}consume(e){const t=this.#e,n=e.#e;return n.forEach(o=>t.add(o)),e.#e=void 0,n}get valid(){return!!this.#e?.has(this.debugInitialGroup)}}class q{constructor(e,t,n){this.row=e,this.column=t,this.piece=n,this.#e=new j(this)}#e;get color(){return this.piece.color}static createAll(e){return e.allPieces.map((t,n)=>t.map((o,s)=>new q(n,s,o)))}tryCombine(e){if(this.#e!=e.#e&&this.color==e.color&&(this.#e.consume(e.#e).forEach(n=>n.#e=this.#e),!this.#e.valid))throw new Error("wtf")}static combineAll(e){e.forEach((t,n)=>{t.forEach((o,s)=>{if(n){const a=n-1,h=e[a][s];o.tryCombine(h)}if(s){const a=s-1,h=t[a];o.tryCombine(h)}})})}static findBigGroups(e){const t=new Map;e.forEach(o=>o.forEach(s=>{const a=s.#e,h=t.get(a)??0;t.set(a,h+1)}));const n=[];for(const[o,s]of t)s>=3&&n.push(o);return n}static findActionable(e){const t=this.createAll(e);return this.combineAll(t),this.findBigGroups(t)}}function V(r){return q.findActionable(r)}function L(r,e){const t=r%e;return t<0?t+Math.abs(e):t}function Pe(r,e){if((e|0)!=e)throw new Error(`invalid input: ${e}`);return e=L(e,r.length),e==0?r:[...r.slice(e),...r.slice(0,e)]}const Y=["red","green","blue","yellow","orange","violet"];class c{constructor(e){this.allPieces=e}static SIZE=6;getColumn(e){return this.allPieces.map(t=>t[e])}static randomPiece(){return{weight:1,color:D(Y)}}static createRandom(){const e=z(c.SIZE,()=>z(c.SIZE,this.randomPiece));return V(new c(e)).forEach(n=>{n.contents.forEach(({row:o,column:s})=>{const a=new Set;[[0,1],[0,-1],[1,0],[-1,0]].forEach(([h,g])=>{const u=e[o+h];if(u){const T=u[s+g];T&&a.add(T.color)}}),e[o][s]={color:D(Y.filter(h=>!a.has(h))),weight:1}})}),new this(e)}rotateLeft(e,t){const n=this.allPieces[e],o=Pe(n,t);return n==o?this:new c(this.allPieces.map(s=>s==n?o:s))}rotateUp(e,t){const n=this.allPieces.length;return t=L(t,n),t==0?this:new c(this.allPieces.map((o,s)=>{const a=[...o];return a[e]=this.allPieces[(s+t)%n][e],a}))}compileAnimation(e){const t=z(c.SIZE,()=>new Set);e.forEach(s=>{s.contents.forEach(({row:a,column:h})=>{const g=t[h];if(g.has(a))throw new Error("wtf");g.add(a)})});const n=t.map(s=>({addFromBottom:[],addFromTop:[],indicesToRemove:s})),o=z(c.SIZE,()=>new Array(c.SIZE));return n.forEach((s,a)=>{const h=t[a],g=[];for(let u=0;u<c.SIZE;u++)h.has(u)||g.push(this.allPieces[u][a]);for(;g.length<c.SIZE;){const u=c.randomPiece();s.addFromTop.push(u),g.unshift(u)}g.forEach((u,T)=>o[T][a]=u)}),{columns:n,final:new c(o)}}}{let r="☆";setInterval(()=>{document.title=`${r} Classic Chuzzle`,r=r=="☆"?"★":"☆"},1e3)}{const[r,e]=O("background",SVGGElement).querySelectorAll("circle");r.animate([{transform:"rotate(720deg)"},{transform:"rotate(0deg)"}],{duration:67973,easing:"ease",iterations:1/0}),e.animate([{transform:"rotate(0deg)"},{transform:"rotate(360deg)"}],{duration:19701,easing:"cubic-bezier(0.42, 0, 0.32, 1.83)",iterations:1/0})}class w{constructor(e){this.piece=e,e[w.#a]=this;const t=J(w.#n.cloneNode(!0),SVGGElement);this.element=t,this.decorationElement=t.querySelector("text"),t.setAttribute("fill",e.color),w.#e.appendChild(t)}static flashGroupDecorations(e){e.forEach(t=>{const n=[...t.contents].map(g=>w.for(g.piece)),o=1,a=[{opacity:Math.random()*.2+.05},{opacity:o}],h={direction:D(["alternate","alternate-reverse","normal","reverse"]),duration:550+Math.random()*150,easing:D(["linear","ease-in","ease-out","ease-in-out"]),iterationStart:Math.random(),iterations:1/0};n.forEach(g=>{g.decorationElement.animate(a,h)})})}static removeAll(){this.#e.innerHTML=""}static#e=O("board",SVGElement);static#n=O("piece",HTMLTemplateElement).content.querySelector("g");element;decorationElement;static#t=CSS.px(Math.E);static#r=CSS.px(Math.PI);static#s=new CSSTransformValue([new CSSTranslate(this.#t,this.#r)]);#o=0;get row(){return this.#o}#i=0;get column(){return this.#i}setPosition(e,t){w.#t.value=this.#i=t,w.#r.value=this.#o=e,this.element.attributeStyleMap.set("transform",w.#s)}animateMove(e,t,n){const o=this.#i,s=this.#o;this.setPosition(e,t);const a=this.element;return a.parentElement?.appendChild(a),a.animate([{transform:`translate(${o}px, ${s}px)`},{transform:`translate(${t}px, ${e}px)`}],n).finished}static#a=Symbol("GuiPiece");static for(e){const t=e[this.#a];if(!(t instanceof w))throw console.error(t),new Error("wtf");return t}static showGroups(e){e.forEach(({group:t,decorationColor:n,decorationText:o})=>{t.contents.forEach(s=>{const a=w.for(s.piece).decorationElement;a.textContent=o,a.style.fill=n})})}}class b{static#e=O("newScore",HTMLDivElement);static#n=O("chainBonus",HTMLDivElement);#t=[];#r=c.createRandom();get currentBoard(){return this.#r}set currentBoard(e){this.#r=e,this.draw()}static#s=new Map([["orange",["cyan","brown","white","darkviolet","lightyellow","darkgreen","darkolivegreen","darkred"]],["yellow",["brown","darkviolet","lightcoral","lightsalmon","lightseagreen","darkblue","darkcyan","darkgoldenrod","darkgreen","darkkhaki","darkolivegreen","darkorange","darkred","darksalmon","darkseagreen"]],["violet",["cyan","brown","white","darkviolet","lightgreen","darkblue"]],["blue",["cyan","white","lightcoral","lightgreen","lightgray","lightsalmon","lightseagreen","lightseagreen","lightskyblue","lightslategray","darkorange","darkseagreen","darkturquoise"]],["red",["cyan","white","lightcoral","lightgreen","lightsalmon","darkkhaki","darkseagreen","chartreuse"]],["green",["cyan","white","lightcoral","lightcyan","lightgreen","lightyellow","darkred","darkseagreen","chartreuse"]]]);static#o=["ʻ","☆","𝛿","∞","•","⭑","†","‡","؟","*","◦","§","_","ɝ","Ԕ","⟳","⚐","🜚","愛","❝","ℵ","を","ᇸ","ڰ","ॾ","ৼ","ན","ᛧ","ß","⧕","↯","➷","⅋","☙","„","⌥","⧷","⁎","╕","₰","…","⑈","۽","ₜ","ಠ","෴","ጃ","ᔱ","ᔰ","Ѧ","ᑥ","𝄢"];static assignGroupDecorations(e){if(e.length==0)return[];{const t=[...this.#o];return e.map(n=>{const o=D(this.#s.get(n.color)),s=Math.floor(Math.random()*t.length),a=t[s];return t.splice(s,1),{group:n,decorationColor:o,decorationText:a}})}}removeGroups(){this.#t.forEach(e=>e.forEach(t=>t.element.querySelector("text").textContent=""))}draw(){this.resetAll(),this.#t=this.#r.allPieces.map((e,t)=>e.map((n,o)=>{const s=new w(n);return s.setPosition(t,o),s}))}resetAll(){w.removeAll(),this.#t=[]}static animationOptions(e){return{duration:Math.abs(e)*2e3/c.SIZE}}constructor(){this.draw();const e=O("board",SVGElement);function t(p){const l=e.getBoundingClientRect(),B=X(l.top,0,l.bottom,c.SIZE),m=X(l.left,0,l.right,c.SIZE);return{row:B(p.clientY),column:m(p.clientX)}}let n="none",o=-1,s=-1,a=-1;e.addEventListener("pointerdown",p=>{if(n=="none"){p.stopPropagation(),n="started",e.setPointerCapture(p.pointerId);const l=t(p);o=l.row,s=l.column,e.style.cursor="move"}});const h=p=>{switch(n){case"none":case"started":case"animation":return;case"horizontal":{const{column:l}=t(p);return s-l}case"vertical":{const{row:l}=t(p);return o-l}}throw new Error("wtf")},g=p=>{if(n=="none")return 0;{const l=t(p);if(n=="horizontal")return L(Math.round(s-l.column),c.SIZE);if(n=="vertical")return L(Math.round(o-l.row),c.SIZE);if(n=="started")return 0}throw new Error("wtf")};let u,T=0;e.addEventListener("pointermove",p=>{if(n=="none"||n=="animation")return;p.stopPropagation();const l=t(p);if(n=="started"){const m=Math.abs(l.row-o),R=Math.abs(l.column-s);if(Math.max(m,R)<.05)return;if(m>R)n="vertical",e.style.cursor="ns-resize",a=Math.floor(s);else if(R>m)n="horizontal",e.style.cursor="ew-resize",a=Math.floor(o);else return;if(a=Math.max(0,Math.min(c.SIZE,a)),u)throw new Error("wtf");const x=n=="vertical"?"rotateUp":"rotateLeft";u=z(c.SIZE,Z=>{const N=this.#r[x](a,Z),G=b.assignGroupDecorations(V(N));return{board:N,decoratedGroups:G}}),T=0}const B=m=>L(m+.5,c.SIZE)-.5;if(n=="horizontal"){const m=s-l.column;this.#t[a].forEach((x,Z)=>{x.setPosition(a,B(Z-m))})}else if(n=="vertical"){const m=o-l.row;this.#t.forEach((R,x)=>{R[a].setPosition(B(x-m),a)})}if(u){const m=g(p);m!=T&&(T=m,this.removeGroups(),w.showGroups(u[T].decoratedGroups))}}),e.addEventListener("lostpointercapture",async p=>{if(n=="none"||n=="started"){if(n="none",e.style.cursor="",u)throw new Error("wtf");return}e.style.cursor="none";const l=[];if(!u)throw new Error("wtf");const B=g(p),m=u[B],{newBoard:R,newOffset:x}=m.decoratedGroups.length==0?{newBoard:this.currentBoard,newOffset:0}:{newBoard:m.board,newOffset:B},Z=L(h(p)-x+c.SIZE/2,c.SIZE)-c.SIZE/2,N=b.animationOptions(Z),G=I=>{const M=[I],k=[0],f=L(Math.round(I+Z),c.SIZE);if(f>5.1)throw new Error("wtf");const S=(y,E)=>{M.push(y,E);const d=Math.abs(I-y),A=Math.abs(E-f),C=d+A,P=d/C;k.push(P,P)};return Math.sign(Z)==-1?f>I&&S(-.5,c.SIZE-.5):f<I&&S(c.SIZE-.5,-.5),M.push(f),k.push(1),{position:M,offset:k,finalPosition:f}};n=="horizontal"?this.#t[a].forEach(M=>{const{position:k,offset:f,finalPosition:S}=G(M.column),y=k.map(E=>`translate(${E}px, ${a}px)`);l.push(M.element.animate({transform:y,offset:f},N).finished),M.setPosition(a,S)}):n=="vertical"&&this.#t.forEach(I=>{const M=I[a],{position:k,offset:f,finalPosition:S}=G(M.row),y=k.map(E=>`translate(${a}px, ${E}px)`);l.push(M.element.animate({transform:y,offset:f},N).finished),M.setPosition(S,a)}),n="animation",l.length>0&&(await Promise.all(l),l.length=0,this.currentBoard=R),u=void 0;let{decoratedGroups:F}=m,H=1;for(;F.length>0;){H<2?b.#n.innerHTML="":b.#n.innerText=`Chain Bonus: ⨉ ${H}`,H++,b.#e.innerHTML="",F.forEach(({group:f,decorationText:S,decorationColor:y},E)=>{E>0&&b.#e.append(" + ");const d=document.createElement("span");d.innerText=`${S} ${f.contents.size}`,d.style.color=y,d.style.borderColor=d.style.backgroundColor=f.color,d.classList.add("individualScore"),b.#e.appendChild(d)}),w.showGroups(F);const I=F.map(f=>f.group);w.flashGroupDecorations(I),await Q(2e3);const{columns:M,final:k}=this.currentBoard.compileAnimation(I);M.forEach((f,S)=>{for(const y of f.indicesToRemove){const E=this.#t[y][S];let d,A;d=Math.random()*(c.SIZE/2-1),A=Math.random()*(c.SIZE/2-1);{const C=Math.random()*3;C>1&&(d-=c.SIZE/2),C<2&&(A-=c.SIZE/2)}{const C=P=>Math.random()>(P+1)/(c.SIZE+1);C(y)&&(d=c.SIZE-d-1),C(S)&&(A=c.SIZE-A-1)}l.push(E.animateMove(d,A,{duration:1e3,easing:"ease-in"}))}}),await Promise.all(l),l.length=0,M.forEach(({addFromTop:f,addFromBottom:S,indicesToRemove:y},E)=>{if(S.length>0)throw new Error("Not implemented yet.");if(S.length+f.length!=y.size)throw new Error("wtf");let d=f.length;const A=b.animationOptions(d);f.forEach((C,P)=>{const $=new w(C),K=-(P+1),oe=K+d;$.setPosition(K,E),l.push($.animateMove(oe,E,A))}),this.currentBoard.getColumn(E).forEach((C,P)=>{y.has(P)?d--:d&&w.for(C).animateMove(P+d,E,A)})}),await Promise.all(l),l.length=0,this.currentBoard=k,F=b.assignGroupDecorations(V(k))}b.#e.innerHTML="",b.#n.innerHTML="",e.style.cursor="",n="none"})}}new b;