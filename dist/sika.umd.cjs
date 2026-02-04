(function(n,a){typeof exports=="object"&&typeof module<"u"?module.exports=a():typeof define=="function"&&define.amd?define(a):(n=typeof globalThis<"u"?globalThis:n||self,n.Sika=a())})(this,(function(){"use strict";const n=`
.sika-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  opacity: 0;
  transition: opacity 0.2s ease-out;
  padding: 16px;
}

.sika-overlay.sika-visible {
  opacity: 1;
}

.sika-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 448px;
  overflow: hidden;
  transform: scale(0.95) translateY(10px);
  transition: transform 0.2s ease-out;
}

.sika-overlay.sika-visible .sika-modal {
  transform: scale(1) translateY(0);
}

.sika-iframe {
  width: 100%;
  height: 85vh;
  max-height: 700px;
  border: none;
  display: block;
}

@media (max-width: 480px) {
  .sika-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .sika-modal {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    transform: translateY(100%);
  }

  .sika-overlay.sika-visible .sika-modal {
    transform: translateY(0);
  }

  .sika-iframe {
    height: 90vh;
    max-height: none;
  }
}
`;let a=!1;function d(){if(a)return;const t=document.createElement("style");t.id="sika-modal-styles",t.textContent=n,document.head.appendChild(t),a=!0}function h(){d();const t=document.createElement("div");return t.className="sika-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.setAttribute("aria-label","Sika Checkout"),t}function u(){const t=document.createElement("div");return t.className="sika-modal",t}function k(t){const e=document.createElement("iframe");return e.className="sika-iframe",e.src=t,e.setAttribute("allow","payment"),e.setAttribute("title","Sika Checkout"),e.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-popups"),e}function m(t){document.body.appendChild(t),document.body.style.overflow="hidden",requestAnimationFrame(()=>{t.classList.add("sika-visible")})}function f(t){return new Promise(e=>{t.classList.remove("sika-visible");const i=()=>{t.removeEventListener("transitionend",i),t.parentNode&&t.parentNode.removeChild(t),document.body.style.overflow="",e()};t.addEventListener("transitionend",i),setTimeout(i,300)})}function p(t,e){t.style.height=`${e}px`}const v="https://pay.withsika.com";class y{_publicKey;checkoutUrl;activeCheckout=null;messageHandler=null;constructor(e,i){if(!e)throw new Error("Sika: publicKey is required");!e.startsWith("sika_test_pk_")&&!e.startsWith("sika_live_pk_")&&console.warn('Sika: publicKey should start with "sika_test_pk_" or "sika_live_pk_". Make sure you are using a public key, not a secret key.'),this._publicKey=e,this.checkoutUrl=i?.checkoutUrl||v}checkout(e){if(!e.reference&&(!e.email||!e.amount))throw new Error('Sika: Either "reference" or both "email" and "amount" must be provided');if(this.activeCheckout&&this.close(),!e.reference)throw new Error("Sika: Inline checkout initialization is not yet supported. Please create a checkout on your server and pass the reference.");const i=e.reference,s=h(),o=u(),w=`${this.checkoutUrl}/${i}`,c=k(w);o.appendChild(c),s.appendChild(o),s.addEventListener("click",r=>{r.target===s&&this.handleCancel()});const l=r=>{r.key==="Escape"&&this.handleCancel()};document.addEventListener("keydown",l),this.activeCheckout={reference:i,options:e,iframe:c,overlay:s},this.setupMessageListener(),m(s),s._keydownHandler=l}close(){if(!this.activeCheckout)return;const{overlay:e}=this.activeCheckout,i=e._keydownHandler;i&&document.removeEventListener("keydown",i),this.messageHandler&&(window.removeEventListener("message",this.messageHandler),this.messageHandler=null),f(e),this.activeCheckout=null}setupMessageListener(){this.messageHandler&&window.removeEventListener("message",this.messageHandler),this.messageHandler=e=>{if(!e.origin.includes(new URL(this.checkoutUrl).hostname))return;const i=e.data;!i||typeof i!="object"||!i.type?.startsWith("sika:")||this.handleMessage(i)},window.addEventListener("message",this.messageHandler)}handleMessage(e){if(!this.activeCheckout)return;const{options:i,iframe:s}=this.activeCheckout;switch(e.type){case"sika:ready":i.onLoad?.();break;case"sika:resize":e.height&&p(s,e.height);break;case"sika:success":this.handleSuccess(e);break;case"sika:error":this.handleError(e);break;case"sika:close":this.handleCancel();break}}handleSuccess(e){if(!this.activeCheckout)return;const{options:i}=this.activeCheckout,s={reference:e.reference||this.activeCheckout.reference,status:"succeeded"};i.onSuccess?.(s),this.close()}handleError(e){if(!this.activeCheckout)return;const{options:i}=this.activeCheckout,s={reference:e.reference||this.activeCheckout.reference,status:"failed",message:e.message||"Payment failed"};i.onError?.(s)}handleCancel(){if(!this.activeCheckout)return;const{options:e}=this.activeCheckout;e.onCancel?.(),this.close()}}return y}));
//# sourceMappingURL=sika.umd.cjs.map
