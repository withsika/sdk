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
  display: flex;
  align-items: center;
  justify-content: center;
}

.sika-backdrop.sika-visible {
  opacity: 1;
}

.sika-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: sika-spin 0.8s linear infinite;
}

@keyframes sika-spin {
  to { transform: rotate(360deg); }
}

.sika-backdrop.sika-ready .sika-spinner {
  display: none;
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
  transition: opacity 0.2s ease-out;
}

.sika-iframe.sika-visible {
  opacity: 1;
}
`;let a=!1;function o(){if(a)return;const t=document.createElement("style");t.id="sika-modal-styles",t.textContent=n,document.head.appendChild(t),a=!0}function l(){o();const t=document.createElement("div");t.className="sika-backdrop",t.setAttribute("data-sika","backdrop");const e=document.createElement("div");return e.className="sika-spinner",t.appendChild(e),t}function h(t){o();const e=document.createElement("iframe");return e.className="sika-iframe",e.src=t,e.setAttribute("allow","payment"),e.setAttribute("title","Sika Checkout"),e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.setAttribute("aria-label","Sika Checkout"),e.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups"),e}function u(t,e){document.body.appendChild(t),document.body.appendChild(e),document.body.style.overflow="hidden",requestAnimationFrame(()=>{t.classList.add("sika-visible")})}function k(t,e){t.classList.add("sika-ready"),e.classList.add("sika-visible")}function f(t,e){return new Promise(i=>{t.classList.remove("sika-visible"),e.classList.remove("sika-visible");const s=()=>{e.removeEventListener("transitionend",s),t.parentNode&&t.parentNode.removeChild(t),e.parentNode&&e.parentNode.removeChild(e),document.body.style.overflow="",i()};e.addEventListener("transitionend",s),setTimeout(s,400)})}function p(t,e){t.style.height=`${e}px`}const m="https://pay.withsika.com";class y{_publicKey;checkoutUrl;activeCheckout=null;messageHandler=null;constructor(e,i){if(!e)throw new Error("Sika: publicKey is required");!e.startsWith("sika_test_pk_")&&!e.startsWith("sika_live_pk_")&&console.warn('Sika: publicKey should start with "sika_test_pk_" or "sika_live_pk_". Make sure you are using a public key, not a secret key.'),this._publicKey=e,this.checkoutUrl=i?.checkoutUrl||m}checkout(e){if(!e.reference&&(!e.email||!e.amount))throw new Error('Sika: Either "reference" or both "email" and "amount" must be provided');if(this.activeCheckout&&this.close(),!e.reference)throw new Error("Sika: Inline checkout initialization is not yet supported. Please create a checkout on your server and pass the reference.");const i=e.reference,s=l(),r=`${this.checkoutUrl}/${i}`,c=h(r),d=v=>{v.key==="Escape"&&this.handleCancel()};document.addEventListener("keydown",d),this.activeCheckout={reference:i,options:e,iframe:c,backdrop:s},this.setupMessageListener(),u(s,c),s._keydownHandler=d}close(){if(!this.activeCheckout)return;const{backdrop:e,iframe:i}=this.activeCheckout,s=e._keydownHandler;s&&document.removeEventListener("keydown",s),this.messageHandler&&(window.removeEventListener("message",this.messageHandler),this.messageHandler=null),f(e,i),this.activeCheckout=null}setupMessageListener(){this.messageHandler&&window.removeEventListener("message",this.messageHandler),this.messageHandler=e=>{if(!e.origin.includes(new URL(this.checkoutUrl).hostname))return;const i=e.data;!i||typeof i!="object"||!i.type?.startsWith("sika:")||this.handleMessage(i)},window.addEventListener("message",this.messageHandler)}handleMessage(e){if(!this.activeCheckout)return;const{options:i,iframe:s,backdrop:r}=this.activeCheckout;switch(e.type){case"sika:ready":k(r,s),i.onLoad?.();break;case"sika:resize":e.height&&p(s,e.height);break;case"sika:success":this.handleSuccess(e);break;case"sika:error":this.handleError(e);break;case"sika:close":this.handleCancel();break}}handleSuccess(e){if(!this.activeCheckout)return;const{options:i}=this.activeCheckout,s={reference:e.reference||this.activeCheckout.reference,status:"succeeded"};i.onSuccess?.(s),this.close()}handleError(e){if(!this.activeCheckout)return;const{options:i}=this.activeCheckout,s={reference:e.reference||this.activeCheckout.reference,status:"failed",message:e.message||"Payment failed"};i.onError?.(s)}handleCancel(){if(!this.activeCheckout)return;const{options:e}=this.activeCheckout;e.onCancel?.(),this.close()}}return y}));
//# sourceMappingURL=sika.umd.cjs.map
