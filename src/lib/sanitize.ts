import sanitizeHtml from 'sanitize-html'

export function sanitizeContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'a', 'img', 'iframe',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'div', 'span',
    ],
    allowedAttributes: {
      'a':      ['href', 'target', 'rel', 'class'],
      'img':    ['src', 'alt', 'class', 'width', 'height'],
      'iframe': ['src', 'width', 'height', 'allowfullscreen', 'frameborder', 'class', 'allow'],
      '*':      ['class', 'id', 'style', 'data-youtube-video'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
    allowedStyles: {
      '*': {
        'text-align': [/^left$/, /^center$/, /^right$/, /^justify$/],
      },
    },
  })
}
