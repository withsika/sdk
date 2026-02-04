const l = `
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
`;
let o = !1;
function c() {
  if (o) return;
  const t = document.createElement("style");
  t.id = "sika-modal-styles", t.textContent = l, document.head.appendChild(t), o = !0;
}
function h() {
  c();
  const t = document.createElement("div");
  t.className = "sika-backdrop", t.setAttribute("data-sika", "backdrop");
  const e = document.createElement("div");
  return e.className = "sika-spinner", t.appendChild(e), t;
}
function u(t) {
  c();
  const e = document.createElement("iframe");
  return e.className = "sika-iframe", e.src = t, e.setAttribute("allow", "payment"), e.setAttribute("title", "Sika Checkout"), e.setAttribute("role", "dialog"), e.setAttribute("aria-modal", "true"), e.setAttribute("aria-label", "Sika Checkout"), e.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups"), e;
}
function k(t, e) {
  document.body.appendChild(t), document.body.appendChild(e), document.body.style.overflow = "hidden", requestAnimationFrame(() => {
    t.classList.add("sika-visible");
  });
}
function p(t, e) {
  t.classList.add("sika-ready"), e.classList.add("sika-visible");
}
function f(t, e) {
  return new Promise((i) => {
    t.classList.remove("sika-visible"), e.classList.remove("sika-visible");
    const s = () => {
      e.removeEventListener("transitionend", s), t.parentNode && t.parentNode.removeChild(t), e.parentNode && e.parentNode.removeChild(e), document.body.style.overflow = "", i();
    };
    e.addEventListener("transitionend", s), setTimeout(s, 400);
  });
}
function m(t, e) {
  t.style.height = `${e}px`;
}
const v = "https://pay.withsika.com";
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
    ), this._publicKey = e, this.checkoutUrl = i?.checkoutUrl || v;
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
    const i = e.reference, s = h(), a = `${this.checkoutUrl}/${i}`, n = u(a), r = (d) => {
      d.key === "Escape" && this.handleCancel();
    };
    document.addEventListener("keydown", r), this.activeCheckout = {
      reference: i,
      options: e,
      iframe: n,
      backdrop: s
    }, this.setupMessageListener(), k(s, n), s._keydownHandler = r;
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
    const { backdrop: e, iframe: i } = this.activeCheckout, s = e._keydownHandler;
    s && document.removeEventListener("keydown", s), this.messageHandler && (window.removeEventListener("message", this.messageHandler), this.messageHandler = null), f(e, i), this.activeCheckout = null;
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
    const { options: i, iframe: s, backdrop: a } = this.activeCheckout;
    switch (e.type) {
      case "sika:ready":
        p(a, s), i.onLoad?.();
        break;
      case "sika:resize":
        e.height && m(s, e.height);
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
    const { options: i } = this.activeCheckout, s = {
      reference: e.reference || this.activeCheckout.reference,
      status: "succeeded"
    };
    i.onSuccess?.(s), this.close();
  }
  /**
   * Handles payment error
   */
  handleError(e) {
    if (!this.activeCheckout) return;
    const { options: i } = this.activeCheckout, s = {
      reference: e.reference || this.activeCheckout.reference,
      status: "failed",
      message: e.message || "Payment failed"
    };
    i.onError?.(s);
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
