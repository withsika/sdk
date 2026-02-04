# Sika JavaScript SDK

Embed Sika checkout directly on your website with a beautiful modal.

## Installation

### CDN (Recommended for quick start)

```html
<script src="https://js.withsika.com/v1/sika.js"></script>
```

### npm

```bash
npm install @sika/js
```

## Quick Start

### 1. Create a checkout on your server

First, create a checkout session on your server using the Sika API:

```javascript
// Server-side (Node.js example)
const response = await fetch('https://api.withsika.com/checkout/initialize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SIKA_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'customer@example.com',
    amount: 10000, // GHS 100.00 in pesewas
    description: 'Order #123',
  }),
});

const { reference, checkout_url } = await response.json();
// Return `reference` to your frontend
```

### 2. Open checkout on your frontend

```html
<button id="pay-button">Pay Now</button>

<script src="https://js.withsika.com/v1/sika.js"></script>
<script>
  const sika = new Sika('sika_test_pk_your_public_key');

  document.getElementById('pay-button').addEventListener('click', async () => {
    // Get reference from your server
    const response = await fetch('/api/create-checkout', { method: 'POST' });
    const { reference } = await response.json();

    // Open checkout modal
    sika.checkout({
      reference: reference,
      onSuccess: (result) => {
        console.log('Payment successful!', result.reference);
        // Redirect to success page or update UI
        window.location.href = '/order-complete';
      },
      onCancel: () => {
        console.log('Payment cancelled');
      },
      onError: (error) => {
        console.error('Payment failed:', error.message);
      },
    });
  });
</script>
```

### Using ES Modules

```javascript
import { Sika } from '@sika/js';

const sika = new Sika('sika_test_pk_your_public_key');

sika.checkout({
  reference: 'checkout_reference_from_server',
  onSuccess: (result) => {
    console.log('Payment successful!', result.reference);
  },
  onCancel: () => {
    console.log('Payment cancelled');
  },
  onError: (error) => {
    console.error('Payment failed:', error.message);
  },
});
```

## API Reference

### `new Sika(publicKey, config?)`

Creates a new Sika SDK instance.

| Parameter | Type | Description |
|-----------|------|-------------|
| `publicKey` | `string` | Your Sika public key (starts with `sika_test_pk_` or `sika_live_pk_`) |
| `config.checkoutUrl` | `string` | (Optional) Custom checkout URL. Defaults to `https://pay.withsika.com` |

### `sika.checkout(options)`

Opens the checkout modal.

| Option | Type | Description |
|--------|------|-------------|
| `reference` | `string` | Checkout reference from `/checkout/initialize` |
| `onSuccess` | `function` | Called when payment succeeds. Receives `{ reference, status }` |
| `onCancel` | `function` | Called when user closes the modal without paying |
| `onError` | `function` | Called when payment fails. Receives `{ reference, status, message }` |
| `onLoad` | `function` | Called when the checkout iframe has loaded |

### `sika.close()`

Programmatically closes the checkout modal.

## TypeScript Support

The SDK includes TypeScript definitions:

```typescript
import { Sika, CheckoutOptions, CheckoutSuccessResult } from '@sika/js';

const sika = new Sika('sika_test_pk_xxx');

const options: CheckoutOptions = {
  reference: 'abc123',
  onSuccess: (result: CheckoutSuccessResult) => {
    console.log(result.reference);
  },
};

sika.checkout(options);
```

## Browser Support

The SDK supports all modern browsers:
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

MIT
