const h = `
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
  max-height: calc(100vh - 32px);
  overflow: auto;
  transform: scale(0.95) translateY(10px);
  transition: transform 0.2s ease-out, max-height 0.15s ease-out;
}

.sika-overlay.sika-visible .sika-modal {
  transform: scale(1) translateY(0);
}

.sika-iframe {
  width: 100%;
  height: 600px;
  min-height: 300px;
  border: none;
  display: block;
  transition: height 0.15s ease-out;
}

@media (max-width: 480px) {
  .sika-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .sika-modal {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 16px 16px 0 0;
    transform: translateY(100%);
  }

  .sika-overlay.sika-visible .sika-modal {
    transform: translateY(0);
  }

  .sika-iframe {
    height: auto;
    min-height: 400px;
    max-height: calc(95vh - 32px);
  }
}
`;
let c = !1;
function d() {
  if (c) return;
  const t = document.createElement("style");
  t.id = "sika-modal-styles", t.textContent = h, document.head.appendChild(t), c = !0;
}
function u() {
  d();
  const t = document.createElement("div");
  return t.className = "sika-overlay", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-label", "Sika Checkout"), t;
}
function k() {
  const t = document.createElement("div");
  return t.className = "sika-modal", t;
}
function m(t) {
  const e = document.createElement("iframe");
  return e.className = "sika-iframe", e.src = t, e.setAttribute("allow", "payment"), e.setAttribute("title", "Sika Checkout"), e.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups"), e;
}
function f(t) {
  document.body.appendChild(t), document.body.style.overflow = "hidden", requestAnimationFrame(() => {
    t.classList.add("sika-visible");
  });
}
function p(t) {
  return new Promise((e) => {
    t.classList.remove("sika-visible");
    const i = () => {
      t.removeEventListener("transitionend", i), t.parentNode && t.parentNode.removeChild(t), document.body.style.overflow = "", e();
    };
    t.addEventListener("transitionend", i), setTimeout(i, 300);
  });
}
function v(t, e) {
  const a = Math.max(e, 300);
  t.style.height = `${a}px`;
}
const g = "https://pay.withsika.com";
class y {
  _publicKey;
  checkoutUrl;
  activeCheckout = null;
  messageHandler = null;
  /**
   * Creates a new Sika SDK instance.
   *
   * @param publicKey - Your Sika public key (sika_test_pk_* or sika_live_pk_*)
   * @param config - Optional configuration options
   *
   * @example
   * ```javascript
   * const sika = new Sika('sika_test_pk_xxx');
   * ```
   */
  constructor(e, i) {
    if (!e)
      throw new Error("Sika: publicKey is required");
    !e.startsWith("sika_test_pk_") && !e.startsWith("sika_live_pk_") && console.warn(
      'Sika: publicKey should start with "sika_test_pk_" or "sika_live_pk_". Make sure you are using a public key, not a secret key.'
    ), this._publicKey = e, this.checkoutUrl = i?.checkoutUrl || g;
  }
  /**
   * Opens a checkout modal for the given reference.
   *
   * @param options - Checkout configuration options
   *
   * @example
   * ```javascript
   * sika.checkout({
   *   reference: 'abc123def456',
   *   onSuccess: (result) => console.log('Success!', result),
   *   onCancel: () => console.log('Cancelled'),
   *   onError: (error) => console.error('Error:', error),
   * });
   * ```
   */
  checkout(e) {
    if (!e.reference && (!e.email || !e.amount))
      throw new Error(
        'Sika: Either "reference" or both "email" and "amount" must be provided'
      );
    if (this.activeCheckout && this.close(), !e.reference)
      throw new Error(
        "Sika: Inline checkout initialization is not yet supported. Please create a checkout on your server and pass the reference."
      );
    const i = e.reference, a = u(), n = k(), l = `${this.checkoutUrl}/${i}`, r = m(l);
    n.appendChild(r), a.appendChild(n), a.addEventListener("click", (s) => {
      s.target === a && this.handleCancel();
    });
    const o = (s) => {
      s.key === "Escape" && this.handleCancel();
    };
    document.addEventListener("keydown", o), this.activeCheckout = {
      reference: i,
      options: e,
      iframe: r,
      overlay: a
    }, this.setupMessageListener(), f(a), a._keydownHandler = o;
  }
  /**
   * Closes the current checkout modal.
   *
   * @example
   * ```javascript
   * sika.close();
   * ```
   */
  close() {
    if (!this.activeCheckout) return;
    const { overlay: e } = this.activeCheckout, i = e._keydownHandler;
    i && document.removeEventListener("keydown", i), this.messageHandler && (window.removeEventListener("message", this.messageHandler), this.messageHandler = null), p(e), this.activeCheckout = null;
  }
  /**
   * Sets up the postMessage listener for iframe communication
   */
  setupMessageListener() {
    this.messageHandler && window.removeEventListener("message", this.messageHandler), this.messageHandler = (e) => {
      if (!e.origin.includes(new URL(this.checkoutUrl).hostname))
        return;
      const i = e.data;
      !i || typeof i != "object" || !i.type?.startsWith("sika:") || this.handleMessage(i);
    }, window.addEventListener("message", this.messageHandler);
  }
  /**
   * Handles messages from the checkout iframe
   */
  handleMessage(e) {
    if (!this.activeCheckout) return;
    const { options: i, iframe: a } = this.activeCheckout;
    switch (e.type) {
      case "sika:ready":
        i.onLoad?.();
        break;
      case "sika:resize":
        e.height && v(a, e.height);
        break;
      case "sika:success":
        this.handleSuccess(e);
        break;
      case "sika:error":
        this.handleError(e);
        break;
      case "sika:close":
        this.handleCancel();
        break;
    }
  }
  /**
   * Handles successful payment
   */
  handleSuccess(e) {
    if (!this.activeCheckout) return;
    const { options: i } = this.activeCheckout, a = {
      reference: e.reference || this.activeCheckout.reference,
      status: "succeeded"
    };
    i.onSuccess?.(a), this.close();
  }
  /**
   * Handles payment error
   */
  handleError(e) {
    if (!this.activeCheckout) return;
    const { options: i } = this.activeCheckout, a = {
      reference: e.reference || this.activeCheckout.reference,
      status: "failed",
      message: e.message || "Payment failed"
    };
    i.onError?.(a);
  }
  /**
   * Handles checkout cancellation
   */
  handleCancel() {
    if (!this.activeCheckout) return;
    const { options: e } = this.activeCheckout;
    e.onCancel?.(), this.close();
  }
}
export {
  y as Sika
};
//# sourceMappingURL=sika.js.map
