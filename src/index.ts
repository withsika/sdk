/**
 * Sika Payments JavaScript SDK
 *
 * Embed Sika checkout directly on your website with a beautiful modal.
 *
 * @example ES Modules
 * ```javascript
 * import { Sika } from '@sika/js';
 * const sika = new Sika('sika_test_pk_xxx');
 * ```
 *
 * @example Browser (UMD)
 * ```html
 * <script src="https://js.withsika.com/v1/sika.js"></script>
 * <script>
 *   const sika = new Sika('sika_test_pk_xxx');
 * </script>
 * ```
 *
 * @packageDocumentation
 */

// Export the main Sika class (named export for ES modules)
export { Sika } from './sika'

// Export types for TypeScript users
export type {
  SikaConfig,
  CheckoutOptions,
  CheckoutSuccessResult,
  CheckoutErrorResult,
  PaymentStatus,
} from './types'
