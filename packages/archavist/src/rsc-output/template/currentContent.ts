import type { Content } from '../../core/Content';

let currentContent: Content | null = null;

/**
 * Sets the current content being rendered.
 * Called internally by the render function before rendering each page.
 */
export function setCurrentContent(content: Content): void {
  currentContent = content;
}

/**
 * Gets the current content being rendered.
 * Can be called from any component within a template to access the current page's content.
 *
 * @throws {Error} If called outside of a render context
 */
export function getCurrentContent(): Content {
  if (currentContent === null) {
    throw new Error('getCurrentContent() called outside of render context');
  }
  return currentContent;
}