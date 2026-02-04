(function(a,n){typeof exports=="object"&&typeof module<"u"?module.exports=n():typeof define=="function"&&define.amd?define(n):(a=typeof globalThis<"u"?globalThis:a||self,a.Sika=n())})(this,(function(){"use strict";const a=`
.sika-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
  opacity: 0;
  transition: opacity 0.2s ease-out;
}

.sika-overlay.sika-visible {
  opacity: 1;
}

.sika-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
`;let n=!1;function c(){if(n)return;const t=document.createElement("style");t.id="sika-modal-styles",t.textContent=a,document.head.appendChild(t),n=!0}function l(){c();const t=document.createElement("div");return t.className="sika-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.setAttribute("aria-label","Sika Checkout"),t}function h(t){const e=document.createElement("iframe");return e.className="sika-iframe",e.src=t,e.setAttribute("allow","payment"),e.setAttribute("title","Sika Checkout"),e.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups"),e}function d(t){document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>{t.classList.add("sika-visible")})}function u(t){return new Promise(e=>{t.classList.remove("sika-visible");const s=()=>{t.removeEventListener("transitionend",s),t.parentNode&&t.parentNode.removeChild(t),document.body.style.overflow="",e()};t.addEventListener("transitionend",s),setTimeout(s,300)})}function k(t,e){t.style.height=`${e}px`}const f="https://pay.withsika.com";class m{_publicKey;checkoutUrl;activeCheckout=null;messageHandler=null;constructor(e,s){if(!e)throw new Error("Sika: publicKey is required");!e.startsWith("sika_test_pk_")&&!e.startsWith("sika_live_pk_")&&console.warn('Sika: publicKey should start with "sika_test_pk_" or "sika_live_pk_". Make sure you are using a public key, not a secret key.'),this._publicKey=e,this.checkoutUrl=s?.checkoutUrl||f}checkout(e){if(!e.reference&&(!e.email||!e.amount))throw new Error('Sika: Either "reference" or both "email" and "amount" must be provided');if(this.activeCheckout&&this.close(),!e.reference)throw new Error("Sika: Inline checkout initialization is not yet supported. Please create a checkout on your server and pass the reference.");const s=e.reference,i=l(),p=`${this.checkoutUrl}/${s}`,r=h(p);i.appendChild(r);const o=v=>{v.key==="Escape"&&this.handleCancel()};document.addEventListener("keydown",o),this.activeCheckout={reference:s,options:e,iframe:r,overlay:i},this.setupMessageListener(),d(i),i._keydownHandler=o}close(){if(!this.activeCheckout)return;const{overlay:e}=this.activeCheckout,s=e._keydownHandler;s&&document.removeEventListener("keydown",s),this.messageHandler&&(window.removeEventListener("message",this.messageHandler),this.messageHandler=null),u(e),this.activeCheckout=null}setupMessageListener(){this.messageHandler&&window.removeEventListener("message",this.messageHandler),this.messageHandler=e=>{if(!e.origin.includes(new URL(this.checkoutUrl).hostname))return;const s=e.data;!s||typeof s!="object"||!s.type?.startsWith("sika:")||this.handleMessage(s)},window.addEventListener("message",this.messageHandler)}handleMessage(e){if(!this.activeCheckout)return;const{options:s,iframe:i}=this.activeCheckout;switch(e.type){case"sika:ready":s.onLoad?.();break;case"sika:resize":e.height&&k(i,e.height);break;case"sika:success":this.handleSuccess(e);break;case"sika:error":this.handleError(e);break;case"sika:close":this.handleCancel();break}}handleSuccess(e){if(!this.activeCheckout)return;const{options:s}=this.activeCheckout,i={reference:e.reference||this.activeCheckout.reference,status:"succeeded"};s.onSuccess?.(i),this.close()}handleError(e){if(!this.activeCheckout)return;const{options:s}=this.activeCheckout,i={reference:e.reference||this.activeCheckout.reference,status:"failed",message:e.message||"Payment failed"};s.onError?.(i)}handleCancel(){if(!this.activeCheckout)return;const{options:e}=this.activeCheckout;e.onCancel?.(),this.close()}}return m}));
//# sourceMappingURL=sika.umd.cjs.map
