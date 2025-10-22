import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'em',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'u',
  'ul',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'style', 'src', 'alt'];

export function sanitizeHTML(value: string) {
  if (!value) {
    return '';
  }

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'iframe'],
  });
}
