/**
 * Sika SDK
 *
 * The main class for interacting with Sika Payments embedded checkout.
 *
 * @example
 * ```javascript
 * // Initialize with your public key
 * const sika = new Sika('sika_test_pk_xxx');
 *
 * // Open checkout with a pre-created reference
 * sika.checkout({
 *   reference: 'abc123def456',
 *   onSuccess: (result) => {
 *     console.log('Payment successful!', result.reference);
 *   },
 *   onCancel: () => {
 *     console.log('Payment cancelled');
 *   },
 *   onError: (error) => {
 *     console.error('Payment failed:', error.message);
 *   },
 * });
 * ```
 */

import {
  createBackdrop,
  createIframe,
  showModal,
  showIframe,
  hideModal,
  resizeIframe,
} from './modal'

import type {
  SikaConfig,
  CheckoutOptions,
  CheckoutState,
  EmbedMessage,
  CheckoutSuccessResult,
  CheckoutErrorResult,
} from './types'

// Default checkout URL
const DEFAULT_CHECKOUT_URL = 'https://pay.withsika.com'

/**
 * Sika Payments SDK
 *
 * Provides methods for opening embedded checkout modals and handling payment results.
 */
export class Sika {
  private _publicKey: string
  private checkoutUrl: string
  private activeCheckout: CheckoutState | null = null
  private messageHandler: ((event: MessageEvent) => void) | null = null

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
  constructor(publicKey: string, config?: Partial<Omit<SikaConfig, 'publicKey'>>) {
    if (!publicKey) {
      throw new Error('Sika: publicKey is required')
    }

    if (!publicKey.startsWith('sika_test_pk_') && !publicKey.startsWith('sika_live_pk_')) {
      console.warn(
        'Sika: publicKey should start with "sika_test_pk_" or "sika_live_pk_". ' +
        'Make sure you are using a public key, not a secret key.'
      )
    }

    this._publicKey = publicKey
    this.checkoutUrl = config?.checkoutUrl || DEFAULT_CHECKOUT_URL
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
  checkout(options: CheckoutOptions): void {
    // Validate options
    if (!options.reference && (!options.email || !options.amount)) {
      throw new Error(
        'Sika: Either "reference" or both "email" and "amount" must be provided'
      )
    }

    // Close any existing checkout
    if (this.activeCheckout) {
      this.close()
    }

    // For now, only support reference-based checkout
    // Inline initialization (email + amount) would require additional API work
    if (!options.reference) {
      throw new Error(
        'Sika: Inline checkout initialization is not yet supported. ' +
        'Please create a checkout on your server and pass the reference.'
      )
    }

    const reference = options.reference

    // Create backdrop and iframe separately (like Paystack)
    const backdrop = createBackdrop()
    const iframeSrc = `${this.checkoutUrl}/${reference}`
    const iframe = createIframe(iframeSrc)

    // Handle escape key to close
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.handleCancel()
      }
    }
    document.addEventListener('keydown', handleKeydown)

    // Store active checkout state
    this.activeCheckout = {
      reference,
      options,
      iframe,
      backdrop,
    }

    // Set up message listener
    this.setupMessageListener()

    // Show the modal (backdrop + iframe)
    showModal(backdrop, iframe)

    // Store keydown handler for cleanup
    ;(backdrop as HTMLDivElement & { _keydownHandler?: (e: KeyboardEvent) => void })._keydownHandler = handleKeydown
  }

  /**
   * Closes the current checkout modal.
   *
   * @example
   * ```javascript
   * sika.close();
   * ```
   */
  close(): void {
    if (!this.activeCheckout) return

    const { backdrop, iframe } = this.activeCheckout

    // Remove keydown listener
    const keydownHandler = (backdrop as HTMLDivElement & { _keydownHandler?: (e: KeyboardEvent) => void })._keydownHandler
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler)
    }

    // Remove message listener
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler)
      this.messageHandler = null
    }

    // Hide modal
    hideModal(backdrop, iframe)

    // Clear active checkout
    this.activeCheckout = null
  }

  /**
   * Sets up the postMessage listener for iframe communication
   */
  private setupMessageListener(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler)
    }

    this.messageHandler = (event: MessageEvent) => {
      // Validate origin - only accept messages from our checkout URL
      if (!event.origin.includes(new URL(this.checkoutUrl).hostname)) {
        return
      }

      // Validate message format
      const data = event.data as EmbedMessage
      if (!data || typeof data !== 'object' || !data.type?.startsWith('sika:')) {
        return
      }

      this.handleMessage(data)
    }

    window.addEventListener('message', this.messageHandler)
  }

  /**
   * Handles messages from the checkout iframe
   */
  private handleMessage(message: EmbedMessage): void {
    if (!this.activeCheckout) return

    const { options, iframe, backdrop } = this.activeCheckout

    switch (message.type) {
      case 'sika:ready':
        // Checkout is ready - show the iframe
        showIframe(backdrop, iframe)
        options.onLoad?.()
        break

      case 'sika:resize':
        // Resize iframe to fit content
        if (message.height) {
          resizeIframe(iframe, message.height)
        }
        break

      case 'sika:success':
        // Payment succeeded
        this.handleSuccess(message)
        break

      case 'sika:error':
        // Payment failed
        this.handleError(message)
        break

      case 'sika:close':
        // User wants to close
        this.handleCancel()
        break
    }
  }

  /**
   * Handles successful payment
   */
  private handleSuccess(message: EmbedMessage): void {
    if (!this.activeCheckout) return

    const { options } = this.activeCheckout
    const result: CheckoutSuccessResult = {
      reference: message.reference || this.activeCheckout.reference,
      status: 'succeeded',
    }

    // Call success callback
    options.onSuccess?.(result)

    // Close the modal
    this.close()
  }

  /**
   * Handles payment error
   */
  private handleError(message: EmbedMessage): void {
    if (!this.activeCheckout) return

    const { options } = this.activeCheckout
    const result: CheckoutErrorResult = {
      reference: message.reference || this.activeCheckout.reference,
      status: 'failed',
      message: message.message || 'Payment failed',
    }

    // Call error callback
    options.onError?.(result)

    // Note: We don't close the modal on error - the user can retry or close manually
  }

  /**
   * Handles checkout cancellation
   */
  private handleCancel(): void {
    if (!this.activeCheckout) return

    const { options } = this.activeCheckout

    // Call cancel callback
    options.onCancel?.()

    // Close the modal
    this.close()
  }
}
