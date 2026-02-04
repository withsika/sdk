/**
 * Sika SDK Types
 *
 * These types define the public API for the Sika JavaScript SDK.
 */

/**
 * Payment status returned in checkout results
 */
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed'

/**
 * Result returned to onSuccess callback
 */
export interface CheckoutSuccessResult {
  /** The checkout reference */
  reference: string
  /** Payment status (always 'succeeded' for success callback) */
  status: 'succeeded'
}

/**
 * Result returned to onError callback
 */
export interface CheckoutErrorResult {
  /** The checkout reference */
  reference: string
  /** Payment status */
  status: 'failed'
  /** Error message describing what went wrong */
  message: string
}

/**
 * Options for opening a checkout
 */
export interface CheckoutOptions {
  /**
   * Checkout reference from a server-side /checkout/initialize call.
   * Either `reference` or (`email` + `amount`) must be provided.
   */
  reference?: string

  /**
   * Customer email address (for inline initialization).
   * Requires `amount` to also be provided.
   * Note: Inline initialization requires additional API support.
   */
  email?: string

  /**
   * Amount in smallest currency unit (for inline initialization).
   * Requires `email` to also be provided.
   */
  amount?: number

  /**
   * Called when payment succeeds.
   * In embed mode, the modal will remain open until you close it or
   * the user clicks the close button.
   */
  onSuccess?: (result: CheckoutSuccessResult) => void

  /**
   * Called when the user closes the checkout without completing payment.
   */
  onCancel?: () => void

  /**
   * Called when payment fails.
   * The modal will remain open showing the error state.
   */
  onError?: (result: CheckoutErrorResult) => void

  /**
   * Called when the checkout iframe has loaded and is ready.
   */
  onLoad?: () => void
}

/**
 * Configuration options for the Sika SDK
 */
export interface SikaConfig {
  /**
   * Your Sika public key (starts with sika_test_pk_ or sika_live_pk_)
   */
  publicKey: string

  /**
   * Base URL for the checkout widget.
   * Defaults to https://pay.withsika.com
   */
  checkoutUrl?: string
}

/**
 * Messages sent from the checkout iframe to the parent window
 */
export interface EmbedMessage {
  type: 'sika:ready' | 'sika:resize' | 'sika:success' | 'sika:error' | 'sika:close'
  reference?: string
  status?: string
  message?: string
  height?: number
}

/**
 * Internal state for tracking active checkout
 */
export interface CheckoutState {
  reference: string
  options: CheckoutOptions
  iframe: HTMLIFrameElement
  backdrop: HTMLDivElement
}
