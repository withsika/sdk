const l = `
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
  background: transparent;
}
`;
let n = !1;
function h() {
  if (n) return;
  const t = document.createElement("style");
  t.id = "sika-modal-styles", t.textContent = l, document.head.appendChild(t), n = !0;
}
function d() {
  h();
  const t = document.createElement("div");
  return t.className = "sika-overlay", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-label", "Sika Checkout"), t;
}
function u(t) {
  const e = document.createElement("iframe");
  return e.className = "sika-iframe", e.src = t, e.setAttribute("allow", "payment"), e.setAttribute("title", "Sika Checkout"), e.setAttribute("allowtransparency", "true"), e.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups"), e;
}
function k(t) {
  document.body.appendChild(t), document.body.style.overflow = "hidden", requestAnimationFrame(() => {
    t.classList.add("sika-visible");
  });
}
function f(t) {
  return new Promise((e) => {
    t.classList.remove("sika-visible");
    const s = () => {
      t.removeEventListener("transitionend", s), t.parentNode && t.parentNode.removeChild(t), document.body.style.overflow = "", e();
    };
    t.addEventListener("transitionend", s), setTimeout(s, 300);
  });
}
function m(t, e) {
  t.style.height = `${e}px`;
}
const p = "https://pay.withsika.com";
class v {
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
  constructor(e, s) {
    if (!e)
      throw new Error("Sika: publicKey is required");
    !e.startsWith("sika_test_pk_") && !e.startsWith("sika_live_pk_") && console.warn(
      'Sika: publicKey should start with "sika_test_pk_" or "sika_live_pk_". Make sure you are using a public key, not a secret key.'
    ), this._publicKey = e, this.checkoutUrl = s?.checkoutUrl || p;
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
    const s = e.reference, i = d(), o = `${this.checkoutUrl}/${s}`, a = u(o);
    i.appendChild(a);
    const r = (c) => {
      c.key === "Escape" && this.handleCancel();
    };
    document.addEventListener("keydown", r), this.activeCheckout = {
      reference: s,
      options: e,
      iframe: a,
      overlay: i
    }, this.setupMessageListener(), k(i), i._keydownHandler = r;
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
    const { overlay: e } = this.activeCheckout, s = e._keydownHandler;
    s && document.removeEventListener("keydown", s), this.messageHandler && (window.removeEventListener("message", this.messageHandler), this.messageHandler = null), f(e), this.activeCheckout = null;
  }
  /**
   * Sets up the postMessage listener for iframe communication
   */
  setupMessageListener() {
    this.messageHandler && window.removeEventListener("message", this.messageHandler), this.messageHandler = (e) => {
      if (!e.origin.includes(new URL(this.checkoutUrl).hostname))
        return;
      const s = e.data;
      !s || typeof s != "object" || !s.type?.startsWith("sika:") || this.handleMessage(s);
    }, window.addEventListener("message", this.messageHandler);
  }
  /**
   * Handles messages from the checkout iframe
   */
  handleMessage(e) {
    if (!this.activeCheckout) return;
    const { options: s, iframe: i } = this.activeCheckout;
    switch (e.type) {
      case "sika:ready":
        s.onLoad?.();
        break;
      case "sika:resize":
        e.height && m(i, e.height);
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
    const { options: s } = this.activeCheckout, i = {
      reference: e.reference || this.activeCheckout.reference,
      status: "succeeded"
    };
    s.onSuccess?.(i), this.close();
  }
  /**
   * Handles payment error
   */
  handleError(e) {
    if (!this.activeCheckout) return;
    const { options: s } = this.activeCheckout, i = {
      reference: e.reference || this.activeCheckout.reference,
      status: "failed",
      message: e.message || "Payment failed"
    };
    s.onError?.(i);
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
  v as Sika
};
//# sourceMappingURL=sika.js.map
