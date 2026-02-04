# Sika SDK

Embed Sika checkout directly on your website with a beautiful modal. No redirects required.

[![npm version](https://img.shields.io/npm/v/@withsika/sdk.svg)](https://www.npmjs.com/package/@withsika/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Embedded Checkout** - Keep customers on your site with a modal checkout
- **No Redirects** - Better conversion rates with seamless payment experience
- **Mobile Optimized** - Responsive design that works on all devices
- **Event Callbacks** - Handle success, cancel, and error events
- **TypeScript Support** - Full type definitions included

## Installation

### CDN (Recommended for quick start)

```html
<script src="https://js.withsika.com/v1/sika.js"></script>
```

### npm

```bash
npm install @withsika/sdk
```

### yarn

```bash
yarn add @withsika/sdk
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

const { reference } = await response.json();
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

## Framework Examples

### React

```jsx
import { useCallback } from 'react';

// Load SDK via script tag in index.html or use useEffect to load dynamically

function CheckoutButton({ amount, email }) {
  const handleCheckout = useCallback(async () => {
    // Create checkout on your server
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, email }),
    });
    const { reference } = await response.json();

    // Open Sika checkout modal
    const sika = new window.Sika('sika_test_pk_xxx');
    sika.checkout({
      reference,
      onSuccess: (result) => {
        // Handle success - clear cart, show confirmation, etc.
        console.log('Payment successful!', result.reference);
      },
      onCancel: () => {
        console.log('Payment cancelled');
      },
      onError: (error) => {
        console.error('Payment failed:', error.message);
      },
    });
  }, [amount, email]);

  return (
    <button onClick={handleCheckout}>
      Pay Now
    </button>
  );
}
```

### Next.js

```tsx
'use client';

import Script from 'next/script';
import { useState } from 'react';

declare global {
  interface Window {
    Sika: new (publicKey: string) => {
      checkout: (options: {
        reference: string;
        onSuccess?: (result: { reference: string }) => void;
        onCancel?: () => void;
        onError?: (error: { message: string }) => void;
      }) => void;
    };
  }
}

export default function CheckoutPage() {
  const [sdkReady, setSdkReady] = useState(false);

  const handleCheckout = async () => {
    const response = await fetch('/api/checkout', { method: 'POST' });
    const { reference } = await response.json();

    const sika = new window.Sika('sika_test_pk_xxx');
    sika.checkout({
      reference,
      onSuccess: (result) => {
        window.location.href = `/success?ref=${result.reference}`;
      },
      onCancel: () => {
        console.log('Cancelled');
      },
    });
  };

  return (
    <>
      <Script
        src="https://js.withsika.com/v1/sika.js"
        onLoad={() => setSdkReady(true)}
      />
      <button onClick={handleCheckout} disabled={!sdkReady}>
        Pay with Sika
      </button>
    </>
  );
}
```

### Vue.js

```vue
<template>
  <button @click="handleCheckout" :disabled="!sdkLoaded">
    Pay Now
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const sdkLoaded = ref(false);

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://js.withsika.com/v1/sika.js';
  script.onload = () => { sdkLoaded.value = true; };
  document.head.appendChild(script);
});

const handleCheckout = async () => {
  const response = await fetch('/api/checkout', { method: 'POST' });
  const { reference } = await response.json();

  const sika = new window.Sika('sika_test_pk_xxx');
  sika.checkout({
    reference,
    onSuccess: (result) => {
      console.log('Success!', result.reference);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
  });
};
</script>
```

### ES Modules

```javascript
import { Sika } from '@withsika/sdk';

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
| `reference` | `string` | **Required.** Checkout reference from `/checkout/initialize` |
| `onSuccess` | `function` | Called when payment succeeds. Receives `{ reference, status }` |
| `onCancel` | `function` | Called when user closes the modal without paying |
| `onError` | `function` | Called when payment fails. Receives `{ reference, status, message }` |
| `onLoad` | `function` | Called when the checkout iframe has loaded |

### `sika.close()`

Programmatically closes the checkout modal.

```javascript
// Example: Close after timeout
const sika = new Sika('sika_test_pk_xxx');

sika.checkout({
  reference: 'abc123',
  onLoad: () => {
    // Auto-close after 5 minutes of inactivity
    setTimeout(() => sika.close(), 5 * 60 * 1000);
  },
});
```

## TypeScript Support

The SDK includes TypeScript definitions:

```typescript
import { Sika, CheckoutOptions, CheckoutSuccessResult, CheckoutErrorResult } from '@withsika/sdk';

const sika = new Sika('sika_test_pk_xxx');

const options: CheckoutOptions = {
  reference: 'abc123',
  onSuccess: (result: CheckoutSuccessResult) => {
    console.log('Reference:', result.reference);
    console.log('Status:', result.status); // 'succeeded'
  },
  onError: (error: CheckoutErrorResult) => {
    console.error('Error:', error.message);
  },
};

sika.checkout(options);
```

## Redirect vs Embedded Checkout

| Feature | Redirect | Embedded (SDK) |
|---------|----------|----------------|
| User stays on your site | No | Yes |
| Implementation complexity | Simple | Simple |
| Customization | Limited | Callbacks for full control |
| Mobile experience | Good | Excellent (slides up) |
| Conversion rate | Good | Better |

### When to use Redirect

- Simple integration with minimal code
- When you don't need real-time payment feedback
- Server-side rendered applications

### When to use Embedded (SDK)

- Better user experience with no page reload
- Real-time feedback on payment status
- Single-page applications (React, Vue, etc.)
- Higher conversion rates

## Browser Support

The SDK supports all modern browsers:

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Troubleshooting

### Modal doesn't open

Make sure the SDK is loaded before calling `checkout()`:

```javascript
// Wait for SDK to load
if (typeof window.Sika === 'undefined') {
  console.error('Sika SDK not loaded');
  return;
}
```

### CORS errors

The checkout reference must be created on your server using your secret key. Never expose your secret key in frontend code.

### Payment callbacks not firing

Ensure your checkout reference is valid and not expired. Checkout references expire after 30 minutes.

## Security

- Never expose your secret API key in frontend code
- Always create checkout sessions on your server
- Verify payment status on your server before fulfilling orders
- Use webhook notifications for reliable payment confirmation

## Support

- Documentation: https://docs.withsika.com
- Email: support@withsika.com
- GitHub Issues: https://github.com/withsika/sdk/issues

## License

MIT
