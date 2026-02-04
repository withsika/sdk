/**
 * Modal/Overlay Management
 *
 * Creates and manages the modal overlay that contains the checkout iframe.
 */

// CSS styles injected into the page
const MODAL_STYLES = `
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
}

.sika-backdrop.sika-visible {
  opacity: 1;
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
  transition: opacity 0.3s ease-out;
}

.sika-iframe.sika-visible {
  opacity: 1;
}
`

let stylesInjected = false

/**
 * Injects the modal CSS styles into the document head
 */
function injectStyles(): void {
  if (stylesInjected) return

  const style = document.createElement('style')
  style.id = 'sika-modal-styles'
  style.textContent = MODAL_STYLES
  document.head.appendChild(style)
  stylesInjected = true
}

/**
 * Creates the backdrop overlay element
 */
export function createBackdrop(): HTMLDivElement {
  injectStyles()

  const backdrop = document.createElement('div')
  backdrop.className = 'sika-backdrop'
  backdrop.setAttribute('data-sika', 'backdrop')

  return backdrop
}

/**
 * Creates the checkout iframe
 */
export function createIframe(src: string): HTMLIFrameElement {
  injectStyles()

  const iframe = document.createElement('iframe')
  iframe.className = 'sika-iframe'
  iframe.src = src
  iframe.setAttribute('allow', 'payment')
  iframe.setAttribute('title', 'Sika Checkout')
  iframe.setAttribute('role', 'dialog')
  iframe.setAttribute('aria-modal', 'true')
  iframe.setAttribute('aria-label', 'Sika Checkout')
  // Security: prevent iframe from navigating the parent
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups')

  return iframe
}

/**
 * Shows the modal with animation
 */
export function showModal(backdrop: HTMLDivElement, iframe: HTMLIFrameElement): void {
  document.body.appendChild(backdrop)
  document.body.appendChild(iframe)
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden'

  // Trigger animation on next frame
  requestAnimationFrame(() => {
    backdrop.classList.add('sika-visible')
    iframe.classList.add('sika-visible')
  })
}

/**
 * Hides and removes the modal with animation
 */
export function hideModal(backdrop: HTMLDivElement, iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve) => {
    backdrop.classList.remove('sika-visible')
    iframe.classList.remove('sika-visible')

    // Wait for animation to complete
    const onTransitionEnd = () => {
      iframe.removeEventListener('transitionend', onTransitionEnd)
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop)
      }
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
      document.body.style.overflow = ''
      resolve()
    }

    iframe.addEventListener('transitionend', onTransitionEnd)

    // Fallback in case transition doesn't fire
    setTimeout(onTransitionEnd, 400)
  })
}

/**
 * Updates iframe height (for dynamic content)
 */
export function resizeIframe(iframe: HTMLIFrameElement, height: number): void {
  // Set the iframe height to exactly match the content
  iframe.style.height = `${height}px`
}
