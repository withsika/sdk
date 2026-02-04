/**
 * Browser entry point (UMD build)
 *
 * This file exports only the Sika class as default, so the UMD build
 * exposes it directly as `window.Sika`.
 *
 * @example
 * ```html
 * <script src="https://js.withsika.com/v1/sika.js"></script>
 * <script>
 *   const sika = new Sika('sika_test_pk_xxx');
 * </script>
 * ```
 */

import { Sika } from './sika'
export default Sika
