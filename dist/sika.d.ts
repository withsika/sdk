/**
 * Result returned to onError callback
 */
declare interface CheckoutErrorResult {
    /** The checkout reference */
    reference: string;
    /** Payment status */
    status: 'failed';
    /** Error message describing what went wrong */
    message: string;
}

/**
 * Options for opening a checkout
 */
declare interface CheckoutOptions {
    /**
     * Checkout reference from a server-side /checkout/initialize call.
     * Either `reference` or (`email` + `amount`) must be provided.
     */
    reference?: string;
    /**
     * Customer email address (for inline initialization).
     * Requires `amount` to also be provided.
     * Note: Inline initialization requires additional API support.
     */
    email?: string;
    /**
     * Amount in smallest currency unit (for inline initialization).
     * Requires `email` to also be provided.
     */
    amount?: number;
    /**
     * Called when payment succeeds.
     * In embed mode, the modal will remain open until you close it or
     * the user clicks the close button.
     */
    onSuccess?: (result: CheckoutSuccessResult) => void;
    /**
     * Called when the user closes the checkout without completing payment.
     */
    onCancel?: () => void;
    /**
     * Called when payment fails.
     * The modal will remain open showing the error state.
     */
    onError?: (result: CheckoutErrorResult) => void;
    /**
     * Called when the checkout iframe has loaded and is ready.
     */
    onLoad?: () => void;
}

/**
 * Result returned to onSuccess callback
 */
declare interface CheckoutSuccessResult {
    /** The checkout reference */
    reference: string;
    /** Payment status (always 'succeeded' for success callback) */
    status: 'succeeded';
}

/**
 * Sika Payments SDK
 *
 * Provides methods for opening embedded checkout modals and handling payment results.
 */
export declare class Sika {
    private _publicKey;
    private checkoutUrl;
    private activeCheckout;
    private messageHandler;
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
    constructor(publicKey: string, config?: Partial<Omit<SikaConfig, 'publicKey'>>);
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
    checkout(options: CheckoutOptions): void;
    /**
     * Closes the current checkout modal.
     *
     * @example
     * ```javascript
     * sika.close();
     * ```
     */
    close(): void;
    /**
     * Sets up the postMessage listener for iframe communication
     */
    private setupMessageListener;
    /**
     * Handles messages from the checkout iframe
     */
    private handleMessage;
    /**
     * Handles successful payment
     */
    private handleSuccess;
    /**
     * Handles payment error
     */
    private handleError;
    /**
     * Handles checkout cancellation
     */
    private handleCancel;
}

/**
 * Configuration options for the Sika SDK
 */
declare interface SikaConfig {
    /**
     * Your Sika public key (starts with sika_test_pk_ or sika_live_pk_)
     */
    publicKey: string;
    /**
     * Base URL for the checkout widget.
     * Defaults to https://pay.withsika.com
     */
    checkoutUrl?: string;
}

export { }
