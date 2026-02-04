/**
 * Modal/Overlay Management
 *
 * Creates and manages the modal overlay that contains the checkout iframe.
 */

// CSS styles injected into the page
const MODAL_STYLES = `
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
 * Creates the fullscreen overlay element
 */
export function createOverlay(): HTMLDivElement {
  injectStyles()

  const overlay = document.createElement('div')
  overlay.className = 'sika-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', 'Sika Checkout')

  return overlay
}

/**
 * Creates the checkout iframe
 */
export function createIframe(src: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.className = 'sika-iframe'
  iframe.src = src
  iframe.setAttribute('allow', 'payment')
  iframe.setAttribute('title', 'Sika Checkout')
  // Security: prevent iframe from navigating the parent
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups')

  return iframe
}

/**
 * Shows the modal with animation
 */
export function showModal(overlay: HTMLDivElement): void {
  document.body.appendChild(overlay)
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden'

  // Trigger animation on next frame
  requestAnimationFrame(() => {
    overlay.classList.add('sika-visible')
  })
}

/**
 * Hides and removes the modal with animation
 */
export function hideModal(overlay: HTMLDivElement): Promise<void> {
  return new Promise((resolve) => {
    overlay.classList.remove('sika-visible')

    // Wait for animation to complete
    const onTransitionEnd = () => {
      overlay.removeEventListener('transitionend', onTransitionEnd)
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay)
      }
      document.body.style.overflow = ''
      resolve()
    }

    overlay.addEventListener('transitionend', onTransitionEnd)

    // Fallback in case transition doesn't fire
    setTimeout(onTransitionEnd, 300)
  })
}

/**
 * Updates iframe height (for dynamic content)
 */
export function resizeIframe(iframe: HTMLIFrameElement, height: number): void {
  // Set the iframe height to exactly match the content
  iframe.style.height = `${height}px`
}
