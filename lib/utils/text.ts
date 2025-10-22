export function truncateText(text: string, maxLength: number) {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function stripMarkdown(value: string) {
  if (!value) {
    return '';
  }

  return value.replace(/[#*_>`~\[\]\(\)]/g, '');
}

export function stripHtml(value: string) {
  if (!value) {
    return '';
  }

  return value.replace(/<[^>]*>/g, '');
}
