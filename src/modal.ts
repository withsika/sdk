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
 * Creates the backdrop overlay element with loading spinner
 */
export function createBackdrop(): HTMLDivElement {
  injectStyles()

  const backdrop = document.createElement('div')
  backdrop.className = 'sika-backdrop'
  backdrop.setAttribute('data-sika', 'backdrop')

  // Add loading spinner
  const spinner = document.createElement('div')
  spinner.className = 'sika-spinner'
  backdrop.appendChild(spinner)

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
 * Shows the modal with animation (iframe stays hidden until ready)
 */
export function showModal(backdrop: HTMLDivElement, iframe: HTMLIFrameElement): void {
  document.body.appendChild(backdrop)
  document.body.appendChild(iframe)
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden'

  // Show backdrop with spinner immediately, iframe stays hidden
  requestAnimationFrame(() => {
    backdrop.classList.add('sika-visible')
  })
}

/**
 * Shows the iframe (called when checkout is ready)
 */
export function showIframe(backdrop: HTMLDivElement, iframe: HTMLIFrameElement): void {
  backdrop.classList.add('sika-ready')
  iframe.classList.add('sika-visible')
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
