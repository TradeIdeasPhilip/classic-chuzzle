(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();var w={},u={};Object.defineProperty(u,"__esModule",{value:!0});u.permutations=u.polarToRectangular=u.makeBoundedLinear=x=u.makeLinear=u.sum=u.countMap=I=u.initializedArray=u.count=u.zip=u.FIGURE_SPACE=u.NON_BREAKING_SPACE=u.dateIsValid=u.MIN_DATE=u.MAX_DATE=u.makePromise=u.filterMap=M=u.pick=u.pickAny=u.csvStringToArray=u.parseTimeT=u.parseIntX=u.parseFloatX=u.getAttribute=u.followPath=u.parseXml=u.testXml=H=u.sleep=u.assertClass=void 0;function nt(e,t,n="Assertion Failed."){const o=r=>{throw new Error(`${n}  Expected type:  ${t.name}.  Found type:  ${r}.`)};if(e===null)o("null");else if(typeof e!="object")o(typeof e);else if(!(e instanceof t))o(e.constructor.name);else return e;throw new Error("wtf")}u.assertClass=nt;function ot(e){return new Promise(t=>setTimeout(t,e))}var H=u.sleep=ot;function X(e){const n=new DOMParser().parseFromString(e,"application/xml");for(const o of Array.from(n.querySelectorAll("parsererror")))if(o instanceof HTMLElement)return{error:o};return{parsed:n}}u.testXml=X;function rt(e){if(e!==void 0)return X(e)?.parsed?.documentElement}u.parseXml=rt;function j(e,...t){for(const n of t){if(e===void 0)return;if(typeof n=="number")e=e.children[n];else{const o=e.getElementsByTagName(n);if(o.length!=1)return;e=o[0]}}return e}u.followPath=j;function st(e,t,...n){if(t=j(t,...n),t!==void 0&&t.hasAttribute(e))return t.getAttribute(e)??void 0}u.getAttribute=st;function _(e){if(e==null)return;const t=parseFloat(e);if(isFinite(t))return t}u.parseFloatX=_;function U(e){const t=_(e);if(t!==void 0)return t>Number.MAX_SAFE_INTEGER||t<Number.MIN_SAFE_INTEGER||t!=Math.floor(t)?void 0:t}u.parseIntX=U;function it(e){if(typeof e=="string"&&(e=U(e)),e!=null&&!(e<=0))return new Date(e*1e3)}u.parseTimeT=it;const at=e=>{const t=/(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi,n=[[]];let o;for(;o=t.exec(e);)o[1].length&&o[1]!==","&&n.push([]),n[n.length-1].push(o[2]!==void 0?o[2].replace(/""/g,'"'):o[3]);return n};u.csvStringToArray=at;function lt(e){const t=e.values().next();if(!t.done)return t.value}u.pickAny=lt;function ct(e){return e[Math.random()*e.length|0]}var M=u.pick=ct;function ut(e,t){const n=[];return e.forEach((o,r)=>{const s=t(o,r);s!==void 0&&n.push(s)}),n}u.filterMap=ut;function dt(){let e,t;return{promise:new Promise((o,r)=>{e=o,t=r}),resolve:e,reject:t}}u.makePromise=dt;u.MAX_DATE=new Date(864e13);u.MIN_DATE=new Date(-864e13);function ht(e){return isFinite(e.getTime())}u.dateIsValid=ht;u.NON_BREAKING_SPACE=" ";u.FIGURE_SPACE=" ";function*ft(...e){const t=e.map(n=>n[Symbol.iterator]());for(;;){const n=t.map(o=>o.next());if(n.some(({done:o})=>o))break;yield n.map(({value:o})=>o)}}u.zip=ft;function*mt(e=0,t=1/0,n=1){for(let o=e;o<t;o+=n)yield o}u.count=mt;function q(e,t){const n=[];for(let o=0;o<e;o++)n.push(t(o));return n}var I=u.initializedArray=q;u.countMap=q;function pt(e){return e.reduce((t,n)=>t+n,0)}u.sum=pt;function gt(e,t,n,o){const r=(o-t)/(n-e);return function(s){return(s-e)*r+t}}var x=u.makeLinear=gt;function wt(e,t,n,o){n<e&&([e,t,n,o]=[n,o,e,t]);const r=(o-t)/(n-e);return function(s){return s<=e?t:s>=n?o:(s-e)*r+t}}u.makeBoundedLinear=wt;function yt(e,t){return{x:Math.sin(t)*e,y:Math.cos(t)*e}}u.polarToRectangular=yt;function*K(e,t=[]){if(e.length==0)yield t;else for(let n=0;n<e.length;n++){const o=e[n],r=[...t,o],s=[...e.slice(0,n),...e.slice(n+1)];yield*K(s,r)}}u.permutations=K;Object.defineProperty(w,"__esModule",{value:!0});w.download=w.createElementFromHTML=w.getHashInfo=w.getAudioBalanceControl=w.getBlobFromCanvas=w.loadDateTimeLocal=b=w.getById=void 0;const Q=u;function bt(e,t){const n=document.getElementById(e);if(!n)throw new Error("Could not find element with id "+e+".  Expected type:  "+t.name);if(n instanceof t)return n;throw new Error("Element with id "+e+" has type "+n.constructor.name+".  Expected type:  "+t.name)}var b=w.getById=bt;function Et(e,t,n="milliseconds"){let o;switch(n){case"minutes":{o=t.getSeconds()*1e3+t.getMilliseconds();break}case"seconds":{o=t.getMilliseconds();break}case"milliseconds":{o=0;break}default:throw new Error("wtf")}e.valueAsNumber=+t-t.getTimezoneOffset()*6e4-o}w.loadDateTimeLocal=Et;function vt(e){const{reject:t,resolve:n,promise:o}=(0,Q.makePromise)();return e.toBlob(r=>{r?n(r):t(new Error("blob is null!"))}),o}w.getBlobFromCanvas=vt;function It(e){const t=new AudioContext,n=t.createMediaElementSource(e),o=new StereoPannerNode(t,{pan:0});return n.connect(o).connect(t.destination),r=>{o.pan.value=r}}w.getAudioBalanceControl=It;function Mt(){const e=new Map;return/^#?(.*)$/.exec(location.hash.replace("+","%20"))[1].split("&").forEach(o=>{const r=o.split("=",2);if(r.length==2){const s=decodeURIComponent(r[0]),i=decodeURIComponent(r[1]);e.set(s,i)}}),e}w.getHashInfo=Mt;function St(e,t){var n=document.createElement("div");return n.innerHTML=e.trim(),(0,Q.assertClass)(n.firstChild,t,"createElementFromHTML:")}w.createElementFromHTML=St;function xt(e,t){var n=document.createElement("a");if(n.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(t)),n.setAttribute("download",e),document.createEvent){var o=document.createEvent("MouseEvents");o.initEvent("click",!0,!0),n.dispatchEvent(o)}else n.click()}w.download=xt;class kt{#t=new Set;get contents(){return[...this.#t].map(t=>t.piece)}get size(){return this.#t.size}debugInitialCell;color;constructor(t){this.color=t.color,this.debugInitialCell=t,this.#t.add(t)}consume(t){const n=this.#t,o=t.#t;return o.forEach(r=>n.add(r)),t.#t=void 0,o}get valid(){return!!this.#t?.has(this.debugInitialCell)}}class F{constructor(t){this.piece=t,this.#t=new kt(this)}#t;get color(){return this.piece.color}static createAll(t){return t.map(n=>n.map(o=>new F(o)))}tryCombine(t){if(this.#t!=t.#t&&this.color==t.color&&(this.#t.consume(t.#t).forEach(o=>o.#t=this.#t),!this.#t.valid))throw new Error("wtf")}static combineAll(t){t.forEach((n,o)=>{n.forEach((r,s)=>{if(o){const i=o-1,a=t[i][s];r.tryCombine(a)}if(s){const i=s-1,a=n[i];r.tryCombine(a)}})})}static findBigGroups(t){const n=new Map;t.forEach(r=>r.forEach(s=>{const i=s.#t,a=n.get(i)??0;n.set(i,a+1)}));const o=[];for(const[r,s]of n)s>=3&&o.push(r);return o}static findActionable(t){const n=this.createAll(t);return this.combineAll(n),this.findBigGroups(n)}}function B(e){return F.findActionable(e).map(t=>t.contents)}function P(e,t){const n=e%t;return n<0?n+Math.abs(t):n}function Ct(e,t){if((t|0)!=t)throw new Error(`invalid input: ${t}`);return t=P(t,e.length),t==0?e:[...e.slice(t),...e.slice(0,t)]}function N(e,t,n="Assertion Failed."){const o=r=>{throw new Error(`${n}  Expected type:  ${t.name}.  Found type:  ${r}.`)};if(e===null)o("null");else if(typeof e!="object")o(typeof e);else if(!(e instanceof t))o(e.constructor.name);else return e;throw new Error("wtf")}function W(e,t){return{x:Math.cos(t)*e,y:Math.sin(t)*e}}function Y(e){if(e.length<1)throw new Error("wtf");const t=Math.random()*e.length|0;return e.splice(t,1)[0]}const D=e=>P(Math.round(e),m.SIZE);function Tt(e,t,n){const o=e[t],r=Ct(o,n);return o==r?e:e.map(s=>s==o?r:s)}function At(e,t,n){const o=e.length;return n=P(n,o),n==0?e:e.map((r,s)=>{const i=[...r];return i[t]=e[(s+n)%o][t],i})}const y=["red","green","blue","yellow","orange","violet"];class A{constructor(t,n,o=A.randomColor()){this.rowIndex=t,this.columnIndex=n,this.color=o}weight=1;bomb=!1;static randomColor(){return M(y)}}class m{constructor(t){this.animator=t,this.#t=this.createRandom(),this.animator.initializeBoard(this.#t.flat())}static SIZE=6;#t;getColumn(t){return this.#t.map(n=>n[t])}createRandom(){const t=I(m.SIZE,o=>I(m.SIZE,r=>new A(o,r)));return B(t).forEach(o=>{o.forEach(({rowIndex:r,columnIndex:s})=>{const i=new Set;[[0,1],[0,-1],[1,0],[-1,0]].forEach(([a,l])=>{const h=t[r+a];if(h){const c=h[s+l];c&&i.add(c.color)}}),t[r][s]=new A(r,s,M(y.filter(a=>!i.has(a))))})}),t}async updateLoop(t,n){for(let o=1;t.length>0;o++){const r=new Set,s=[];t.forEach(d=>{if(d.length>5)s.push(d);else if(d.length==5){const f=M(d);f.bomb=!0,r.add(f)}});const i=[];{let d=t.flat();const f=new Set(d);for(;;){const p=d.filter(g=>g.bomb&&!r.has(g));if(p.length==0)break;d.length=0;for(let g=-1;g<=1;g++)for(let E=-1;E<=1;E++)p.forEach(C=>{const v=this.#t[C.rowIndex+g]?.[C.columnIndex+E];v&&!f.has(v)&&(d.push(v),f.add(v))});i.push(d)}}console.log(i),n.addToScore(o,i.flat().length);const a=t.flatMap(d=>d.filter(f=>!r.has(f))),l=this.removePieces(a),h=this.#t.flat().filter(d=>!d.bomb),c=s.map(d=>{const f=[];return d.forEach(p=>{if(!p.bomb&&h.length>0){const g=Y(h);f.push({source:p,destination:g})}}),f});await this.animator.updateBoard({remove:a,counter:o,flingBomb:c,destroyByBomb:i,add:l}),c.flat().forEach(({destination:d})=>d.bomb=!0),t=B(this.#t),n=this.animator.assignGroupDecorations(t),n.highlightGroups()}}setAllPieces(t){this.#t=t,t.forEach((n,o)=>{n.forEach((r,s)=>{r.columnIndex=s,r.rowIndex=o})})}startHorizontalMove(t){const n=I(m.SIZE,s=>{const i=Tt(this.#t,t,-s),a=B(i);return{actions:this.animator.assignGroupDecorations(a),groups:a,pieces:i}}),o=s=>{const i=this.#t[t];this.animator.drawPreview("horizontal",i,s),n[D(s)].actions.highlightGroups()};return{preview:o,release:async s=>{o(s);const i=D(s),l=n[i].groups.length==0?0:i,h=n[l];this.setAllPieces(h.pieces);const c=this.#t[t];await this.animator.rotateTo("horizontal",c),await this.updateLoop(h.groups,h.actions)}}}startVerticalMove(t){const n=I(m.SIZE,s=>{const i=At(this.#t,t,-s),a=B(i);return{actions:this.animator.assignGroupDecorations(a),groups:a,pieces:i}}),o=s=>{const i=this.getColumn(t);this.animator.drawPreview("vertical",i,s),n[D(s)].actions.highlightGroups()};return{preview:o,release:async s=>{o(s);const i=D(s),l=n[i].groups.length==0?0:i,h=n[l];this.setAllPieces(h.pieces);const c=this.getColumn(t);await this.animator.rotateTo("vertical",c),await this.updateLoop(h.groups,h.actions)}}}removePieces(t){const n=I(m.SIZE,()=>new Set);t.forEach(({rowIndex:s,columnIndex:i})=>{const a=n[i];if(a.has(s))throw new Error("wtf");a.add(s)});const o=I(m.SIZE,()=>new Array(m.SIZE)),r=[];return n.forEach((s,i)=>{const a=[];for(let l=0;l<m.SIZE;l++)s.has(l)||a.push(this.#t[l][i]);for(let l=0;a.length<m.SIZE;l++){const h=-1-l,c=new A(NaN,i);r.push({initialRow:h,piece:c}),a.unshift(c)}a.forEach((l,h)=>{o[h][i]=l,l.columnIndex=i,l.rowIndex=h})}),this.setAllPieces(o),r}}function Pt(e,t,n){if(!(t>=0&&t<=1))throw new Error("Expected 0 ≤ t ≤ 1");const o=Math.max(0,t-n),r=e(o),s=Math.max(0,t+n),i=e(s),a=i.x-r.x,l=i.y-r.y;return a==0&&l==0?NaN:Math.atan2(l,a)}function J(e,t={}){const n=Math.ceil(t.numberOfSegments??10);if(n<1)throw new Error(`Invalid numberOfSegments: ${n}`);const o=.01/n,r=I(n+1,a=>{const l=a/n,h=e(l),c=Pt(e,l,o);return{t:l,point:h,direction:c}}),s=I(n,a=>[{from:r[a],to:r[a+1]}][0]);let i=`M ${s[0].from.point.x}, ${s[0].from.point.y}`;return s.forEach(a=>{const l=Ft({x0:a.from.point.x,y0:a.from.point.y,slope:Math.tan(a.from.direction)},{x0:a.to.point.x,y0:a.to.point.y,slope:Math.tan(a.to.direction)});l?i+=` Q ${l.x},${l.y}`:i+=" M",i+=` ${a.to.point.x},${a.to.point.y}`}),i}function Bt(e,t,n){const o=Dt(e,t,n);return J(o,{numberOfSegments:n*9.001002})}function Dt(e,t,n){const s={x:e.x-t.x,y:e.y-t.y},i=Math.hypot(s.x,s.y),a=x(0,i,1,0),l=Math.atan2(s.y,s.x),h=x(0,l,1,l+n*2*Math.PI);return function(c){const d=a(c),f=h(c),p=W(d,f);return{x:t.x+p.x,y:t.y+p.y}}}function Rt(e,t,n){const o=x(0,t,1,n);return r=>W(e,o(r))}function Lt(e,t){const n=x(0,e.x,1,t.x),o=x(0,e.y,1,t.y);return r=>({x:n(r),y:o(r)})}function Nt(e,t,...n){const o=a=>{const l={x:0,y:0};return n.forEach(h=>{const c=h(a);l.x+=c.x,l.y+=c.y}),l},r=o(0),s=o(1),i=Lt({x:e.x-r.x,y:e.y-r.y},{x:t.x-s.x,y:t.y-s.y});return n.push(i),o}function Ft(e,t){if(isNaN(e.slope)||isNaN(t.slope)||e.slope==t.slope)return;const n=e.slope==1/0||e.slope==-1/0,o=t.slope==1/0||t.slope==-1/0;if(n||o)return;const r=n?e.x0:o?t.x0:(t.y0-t.slope*t.x0-e.y0+e.slope*e.x0)/(e.slope-t.slope),s=n?t.slope*(r-t.x0)+t.y0:e.slope*(r-e.x0)+e.y0;return{x:r,y:s}}const T=b("newScore",HTMLDivElement),O=b("chainBonus",HTMLDivElement),tt=new Map([["orange",["cyan","brown","white","darkviolet","lightyellow","darkgreen","darkolivegreen","darkred"]],["yellow",["brown","darkviolet","lightcoral","lightsalmon","lightseagreen","darkblue","darkcyan","darkgoldenrod","darkgreen","darkkhaki","darkolivegreen","darkorange","darkred","darksalmon","darkseagreen"]],["violet",["cyan","brown","white","darkviolet","lightgreen","darkblue"]],["blue",["cyan","white","lightcoral","lightgreen","lightgray","lightsalmon","lightseagreen","lightseagreen","lightskyblue","lightslategray","darkorange","darkseagreen","darkturquoise"]],["red",["cyan","white","lightcoral","lightgreen","lightsalmon","darkkhaki","darkseagreen","chartreuse"]],["green",["cyan","white","lightcoral","lightcyan","lightgreen","lightyellow","darkred","darkseagreen","chartreuse"]]]),G=["ॐ","࿄","༟","༴","℣","⌰","⍷","⎙","ʻ","☆","𝛿","∞","•","⭑","†","‡","؟","༗","ၯ","◦","§","_","ɝ","Ԕ","⟳","⚐","🜚","愛","❝","ℵ","を","ᇸ","ڰ","ॾ","ན","ᛧ","ß","⧕","↯","➷","⅋","☙","„","⌥","⧷","⁎","╕","₰","…","⑈","۽","ₜ","ಠ","෴","ጃ","ᔱ","ᔰ","Ѧ","ᑥ","𝄢","ƈ","Ɣ","ƕ","Ɋ","ɕ","ɮ","ʆ","Ξ","Ж","Ѭ","Զ","ঔ","ਐ","ઝ","ଈ","ஜ","ధ","ൠ","ඊ","ጯ","ᡀ","‰","₻","↉","↜","↸","⋨","⌤","⎌","⍾","☏","✗","➘","〷","ご","ᇌ","㊤","﹆","🜇","🝤","⅏"];setInterval(()=>{document.title=`${M(G)} Classic Chuzzle`},1500);let S=1;function et(e){return Math.abs(e)*2e3/m.SIZE*S}const $=b("board",SVGElement);function z(){$.querySelectorAll("text.crystal-decoration,text.crystal-decoration-background").forEach(e=>e.textContent="")}class k{static#t=b("piece",HTMLTemplateElement).content.querySelector("g");element;decorationElement;decorationBackgroundElement;bombElement;get bombVisible(){return this.bombElement.style.display==""}set bombVisible(t){this.bombElement.style.display=t?"":"none"}static#o=CSS.px(Math.E);static#r=CSS.px(Math.PI);static#s=new CSSTransformValue([new CSSTranslate(this.#o,this.#r)]);updateFinalPosition(t){this.#n=t.columnIndex,this.#e=t.rowIndex,k.#o.value=t.columnIndex,k.#r.value=t.rowIndex,this.element.attributeStyleMap.set("transform",k.#s)}async slideDirectlyTo(t,n){const o=this.#n,r=this.#e,s=t.columnIndex,i=t.rowIndex;(o!=s||r!=i)&&(await this.element.animate([{transform:`translate(${o}px, ${r}px)`},{transform:`translate(${s}px, ${i}px)`}],n).finished,this.updateFinalPosition(t))}async rotateTo(t,n){const o=n=="horizontal",r=(()=>{const l=o?t.columnIndex-this.#n:t.rowIndex-this.#e,h=P(l+m.SIZE/2,m.SIZE)-m.SIZE/2;return et(Math.abs(h))})(),{position:s,offset:i}=o?Z(this.#n,t.columnIndex):Z(this.#e,t.rowIndex),a=s.map(l=>o?`translate(${l}px, ${t.rowIndex}px)`:`translate(${t.columnIndex}px, ${l}px)`);this.updateFinalPosition(t),await this.element.animate({transform:a,offset:i},r).finished}#e=NaN;get rowIndex(){return this.#e}#n=NaN;get columnIndex(){return this.#n}constructor(t){const n=N(k.#t.cloneNode(!0),SVGGElement);this.element=n,this.decorationElement=n.querySelector("text.crystal-decoration"),this.decorationBackgroundElement=n.querySelector("text.crystal-decoration-background"),this.bombElement=n.querySelector(".bomb"),n.style.fill=t.color,this.decorationBackgroundElement.style.stroke=t.color,this.bombColor=M(tt.get(t.color)),this.bombVisible=!1,this.updateFinalPosition(t),$.appendChild(n)}async remove(t=0){let n,o;n=Math.random()*(m.SIZE/2-1),o=Math.random()*(m.SIZE/2-1);{const r=Math.random()*3;r>1&&(n-=m.SIZE/2),r<2&&(o-=m.SIZE/2)}{const r=s=>Math.random()>(s+1)/(m.SIZE+1);r(this.#e)&&(n=m.SIZE-n-1),r(this.#n)&&(o=m.SIZE-o-1)}this.element.parentElement.appendChild(this.element),await this.slideDirectlyTo({rowIndex:n,columnIndex:o},{duration:1e3*S,easing:"ease-in",delay:t,fill:"backwards"}),this.element.remove(),this.element="💀"}get bombColor(){return this.bombElement.style.fill}set bombColor(t){this.bombElement.style.fill=t}removeDecoration(){[this.decorationElement,this.decorationBackgroundElement].forEach(t=>{t.textContent="",t.getAnimations().forEach(n=>n.cancel())})}}const V=e=>P(e+.5,m.SIZE)-.5,Z=(e,t)=>{const n=[e],o=[0];if(Math.abs(e-t)>m.SIZE/2){const r=(s,i)=>{n.push(s,i);const a=Math.abs(e-s),l=Math.abs(i-t),h=a+l,c=a/h;o.push(c,c)};t>e?r(-.5,m.SIZE-.5):r(m.SIZE-.5,-.5)}return n.push(t),o.push(1),{position:n,offset:o}},L=b("piece",HTMLTemplateElement).content.querySelector(".bomb"),Gt=b("main",SVGSVGElement);class $t{initializeBoard(t){$.innerHTML="",this.#t.clear(),t.forEach(n=>this.#t.set(n,new k(n)))}async updateBoard(t){this.#t.forEach((c,d)=>{c.bombVisible=d.bomb}),S=Math.pow(.75,t.counter-1)*.9+.1,t.flingBomb.length>1&&(S=Math.max(.5,Math.min(1,S*2)));const n=2e3*S,o=t.flingBomb.map(c=>c.map(({source:d,destination:f})=>{const p=this.#t.get(d);if(p===void 0)throw new Error("wtf");return{logicalSource:d,logicalDestination:f,guiSource:p}})),r=Promise.all(t.remove.map(c=>{const d=this.#t.get(c).remove(n);return this.#t.delete(c),d}));setTimeout(()=>this.#t.forEach(c=>c.removeDecoration()),n);const s=1e3*S;t.add.forEach(({initialRow:c,piece:d})=>{const f=new k(d);this.#t.set(d,f),f.updateFinalPosition({columnIndex:d.columnIndex,rowIndex:c})});let i=0;const a=[];this.#t.forEach((c,d)=>{const f=c.columnIndex,p=c.rowIndex,g=d.columnIndex,E=d.rowIndex,C=Math.hypot(E-p,g-f),v=et(C),R={duration:v,delay:n+s,fill:"backwards"};a.push(()=>c.slideDirectlyTo(d,R)),i=Math.max(i,v)});const l=Promise.all(o.flatMap(c=>{const d=n+s+i;return c.map((f,p)=>{const g=Math.min(n,d/2)/(c.length+1)*(p+1),E=d-g;return this.flingBomb(f,g,E)})})),h=Promise.all(a.map(c=>c()));await Promise.all([r,h,l])}async flingBomb(t,n,o){const{logicalSource:r,logicalDestination:s,guiSource:i}=t,a=this.#t.get(s),l=s.color,h=a.bombColor;i.bombColor=h,i.bombVisible=!0;const c=(()=>{const f=N(L.cloneNode(!0),SVGPathElement),p=N(L.cloneNode(!0),SVGPathElement);p.style.strokeWidth="75",f.style.fill=h,p.style.stroke=l;const g=document.createElementNS("http://www.w3.org/2000/svg","g");return g.appendChild(p),g.appendChild(f),g.style.offsetRotate="0deg",g})(),d=(()=>{const f={x:r.columnIndex,y:r.rowIndex},p={x:s.columnIndex,y:s.rowIndex};if(Math.random()<.3333333)return Bt(f,p,.5+Math.random()*2+Math.random()*2);{const g=Math.random()*2*Math.PI,E=(Math.random()*2|0)*2-1,C=g+E*(.5+Math.random()*2)*2*Math.PI,v=.5+Math.random()*2,R=Nt(f,p,Rt(v,g,C));return J(R,{numberOfSegments:20})}})();await H(n),i.bombVisible=!1,Gt.appendChild(c),c.style.offsetPath=`path('${d}')`,await c.animate({offsetDistance:["0%","100%"]},{duration:o,iterations:1,easing:"ease-in",fill:"both"}).finished,c.remove(),a.bombVisible=!0}#t=new Map;drawPreview(t,n,o){n.forEach(r=>{const s=this.#t.get(r);let{rowIndex:i,columnIndex:a}=r;t=="vertical"?i=V(i+o):a=V(a+o),s.updateFinalPosition({rowIndex:i,columnIndex:a})})}async rotateTo(t,n){const o=n.map(r=>this.#t.get(r).rotateTo(r,t));await Promise.all(o)}assignGroupDecorations(t){if(t.length==0)return{addToScore(){},highlightGroups(){z()}};{const n=[...G],o=t.map(r=>{const s=r[0].color,i=M(tt.get(s)),a=Y(n);return{guiPieces:r.map(h=>{const c=this.#t.get(h);if(c==null)throw new Error("wtf");return c}),decorationColor:i,decorationText:a,backgroundColor:s}});return{addToScore(r,s){if(o.forEach(({guiPieces:i})=>{const h=[{opacity:Math.random()*.2+.05},{opacity:1}],c={direction:M(["alternate","alternate-reverse","normal","reverse"]),duration:(550+Math.random()*150)*S,easing:M(["linear","ease-in","ease-out","ease-in-out"]),iterationStart:Math.random(),iterations:1/0};i.forEach(d=>{d.decorationElement.animate(h,c),d.decorationBackgroundElement.animate(h,c)})}),r<2?O.innerHTML="":O.innerText=`Chain Bonus: ⨉ ${r}`,T.innerHTML="",o.forEach(({guiPieces:i,decorationColor:a,decorationText:l,backgroundColor:h},c)=>{c>0&&T.append(" + ");const d=document.createElement("span");d.innerText=`${l} ${i.length}`,d.style.color=a,d.style.borderColor=d.style.backgroundColor=h,d.classList.add("individualScore"),T.appendChild(d)}),s>0){o.length>0&&T.append(" + ");const i=document.createElementNS("http://www.w3.org/2000/svg","svg");i.setAttribute("viewBox","0.25 0.25 0.5 0.5");const a=L.cloneNode(!0);i.appendChild(a),i.style.width="1em",i.style.height="1em",i.style.fill="white";const l=document.createElement("span");l.innerHTML=`&nbsp;${s}`,l.style.color="white",l.style.borderColor=l.style.backgroundColor="black",l.classList.add("individualScore"),l.prepend(i),T.appendChild(l)}},highlightGroups(){z(),o.forEach(({guiPieces:r,decorationColor:s,decorationText:i})=>{r.forEach(a=>{const l=a.decorationElement;l.textContent=i,l.style.fill=s,a.decorationBackgroundElement.textContent=i})})}}}}}const Ot=new $t,zt=b("decorationTester",HTMLDivElement);G.forEach(e=>{const t=document.createElement("div");t.innerText=`${e} u+${e.codePointAt(0).toString(16)}`,zt.appendChild(t)});const Vt=""+new URL("cursor-2110db60.svg",import.meta.url).href;function Zt(e){const t=b("main",SVGSVGElement);function n(r){const s=t.getBoundingClientRect(),i=x(s.top,0,s.bottom,m.SIZE),a=x(s.left,0,s.right,m.SIZE);return{row:i(r.clientY),column:a(r.clientX)}}let o={state:"none"};t.addEventListener("pointerdown",r=>{if(o.state=="none"){r.stopPropagation(),t.setPointerCapture(r.pointerId);const s=n(r);t.style.cursor="move",o={state:"started",startRow:s.row,startColumn:s.column}}}),t.addEventListener("pointermove",r=>{if(o.state=="none"||o.state=="animation")return;r.stopPropagation();const s=n(r);if(o.state=="started"){const i=Math.abs(s.row-o.startRow),a=Math.abs(s.column-o.startColumn);if(Math.max(i,a)<.05)return;if(i>a){const l="vertical",h=Math.floor(o.startColumn),c=o.startRow,d=p=>{const{row:g}=n(p);return g-c},f=e.startVerticalMove(h);o={state:l,fixedIndex:h,startIndex:c,relevantMouseMove:d,actions:f},t.style.cursor="ns-resize"}else if(a>i){const l="horizontal",h=Math.floor(o.startRow),c=o.startColumn,d=p=>{const{column:g}=n(p);return g-c},f=e.startHorizontalMove(h);o={state:l,fixedIndex:h,startIndex:c,relevantMouseMove:d,actions:f},t.style.cursor="ew-resize"}else return}o.actions.preview(o.relevantMouseMove(r))}),t.addEventListener("lostpointercapture",async r=>{switch(o.state){case"started":break;case"horizontal":case"vertical":{t.style.cursor=`url("${Vt}"),none`;const s=o;o={state:"animation"},await s.actions.release(s.relevantMouseMove(r));break}default:throw new Error("wtf")}o={state:"none"},t.style.cursor="grab"})}{{const[e,t]=b("background",SVGGElement).querySelectorAll("circle");e.animate([{transform:"rotate(720deg)"},{transform:"rotate(0deg)"}],{duration:67973,easing:"ease",iterations:1/0}),t.animate([{transform:"rotate(0deg)"},{transform:"rotate(360deg)"}],{duration:19701,easing:"cubic-bezier(0.42, 0, 0.32, 1.83)",iterations:1/0})}b("thinPatternLine",SVGLineElement).animate(y.flatMap((e,t)=>[{stroke:"black",offset:t/y.length},{stroke:e,offset:(t+.25)/y.length},{stroke:e,offset:(t+.75)/y.length},{stroke:"black",offset:(t+1)/y.length}]),{duration:4e3*y.length,iterations:1/0}),b("thickPatternLine",SVGLineElement).animate(y.flatMap((e,t)=>[{stroke:"white",offset:t/y.length},{stroke:e,offset:(t+.25)/y.length},{stroke:e,offset:(t+.75)/y.length},{stroke:"white",offset:(t+1)/y.length}]),{duration:4321*y.length,iterations:1/0}),b("main",SVGSVGElement).animate({backgroundColor:["#202020","#e0e0e0","#202020"]},{duration:97531,direction:"alternate",iterations:1/0})}Zt(new m(Ot));