(function(n,a){typeof exports=="object"&&typeof module<"u"?module.exports=a():typeof define=="function"&&define.amd?define(a):(n=typeof globalThis<"u"?globalThis:n||self,n.Sika=a())})(this,(function(){"use strict";const n=`
.sika-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999998;
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.sika-backdrop.sika-visible {
  opacity: 1;
}

.sika-iframe {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  z-index: 999999;
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.sika-iframe.sika-visible {
  opacity: 1;
}
`;let a=!1;function o(){if(a)return;const t=document.createElement("style");t.id="sika-modal-styles",t.textContent=n,document.head.appendChild(t),a=!0}function d(){o();const t=document.createElement("div");return t.className="sika-backdrop",t.setAttribute("data-sika","backdrop"),t}function l(t){o();const e=document.createElement("iframe");return e.className="sika-iframe",e.src=t,e.setAttribute("allow","payment"),e.setAttribute("title","Sika Checkout"),e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.setAttribute("aria-label","Sika Checkout"),e.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups"),e}function h(t,e){document.body.appendChild(t),document.body.appendChild(e),document.body.style.overflow="hidden",requestAnimationFrame(()=>{t.classList.add("sika-visible"),e.classList.add("sika-visible")})}function u(t,e){return new Promise(i=>{t.classList.remove("sika-visible"),e.classList.remove("sika-visible");const s=()=>{e.removeEventListener("transitionend",s),t.parentNode&&t.parentNode.removeChild(t),e.parentNode&&e.parentNode.removeChild(e),document.body.style.overflow="",i()};e.addEventListener("transitionend",s),setTimeout(s,400)})}function k(t,e){t.style.height=`${e}px`}const f="https://pay.withsika.com";class m{_publicKey;checkoutUrl;activeCheckout=null;messageHandler=null;constructor(e,i){if(!e)throw new Error("Sika: publicKey is required");!e.startsWith("sika_test_pk_")&&!e.startsWith("sika_live_pk_")&&console.warn('Sika: publicKey should start with "sika_test_pk_" or "sika_live_pk_". Make sure you are using a public key, not a secret key.'),this._publicKey=e,this.checkoutUrl=i?.checkoutUrl||f}checkout(e){if(!e.reference&&(!e.email||!e.amount))throw new Error('Sika: Either "reference" or both "email" and "amount" must be provided');if(this.activeCheckout&&this.close(),!e.reference)throw new Error("Sika: Inline checkout initialization is not yet supported. Please create a checkout on your server and pass the reference.");const i=e.reference,s=d(),p=`${this.checkoutUrl}/${i}`,r=l(p),c=v=>{v.key==="Escape"&&this.handleCancel()};document.addEventListener("keydown",c),this.activeCheckout={reference:i,options:e,iframe:r,backdrop:s},this.setupMessageListener(),h(s,r),s._keydownHandler=c}close(){if(!this.activeCheckout)return;const{backdrop:e,iframe:i}=this.activeCheckout,s=e._keydownHandler;s&&document.removeEventListener("keydown",s),this.messageHandler&&(window.removeEventListener("message",this.messageHandler),this.messageHandler=null),u(e,i),this.activeCheckout=null}setupMessageListener(){this.messageHandler&&window.removeEventListener("message",this.messageHandler),this.messageHandler=e=>{if(!e.origin.includes(new URL(this.checkoutUrl).hostname))return;const i=e.data;!i||typeof i!="object"||!i.type?.startsWith("sika:")||this.handleMessage(i)},window.addEventListener("message",this.messageHandler)}handleMessage(e){if(!this.activeCheckout)return;const{options:i,iframe:s}=this.activeCheckout;switch(e.type){case"sika:ready":i.onLoad?.();break;case"sika:resize":e.height&&k(s,e.height);break;case"sika:success":this.handleSuccess(e);break;case"sika:error":this.handleError(e);break;case"sika:close":this.handleCancel();break}}handleSuccess(e){if(!this.activeCheckout)return;const{options:i}=this.activeCheckout,s={reference:e.reference||this.activeCheckout.reference,status:"succeeded"};i.onSuccess?.(s),this.close()}handleError(e){if(!this.activeCheckout)return;const{options:i}=this.activeCheckout,s={reference:e.reference||this.activeCheckout.reference,status:"failed",message:e.message||"Payment failed"};i.onError?.(s)}handleCancel(){if(!this.activeCheckout)return;const{options:e}=this.activeCheckout;e.onCancel?.(),this.close()}}return m}));
//# sourceMappingURL=sika.umd.cjs.map
