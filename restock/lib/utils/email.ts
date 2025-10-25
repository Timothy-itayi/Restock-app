// Email utilities for consistent payloads and deliverability

export function htmlToPlainText(html: string): string {
  if (!html) return '';
  try {
    return html
      .replace(/\n+/g, '\n')
      .replace(/<br\s*\/?>(?=\s*<)/gi, '\n')
      .replace(/<br\s*\/?>(?!\n)/gi, '\n')
      .replace(/<\/(p|div|li|h\d)>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } catch {
    return html;
  }
}

export function defaultEmailHeaders(unsubscribeUrl?: string) {
  const listUnsub = unsubscribeUrl
    ? `<${unsubscribeUrl}>, <mailto:unsubscribe@restockapp.email?subject=unsubscribe>`
    : '<mailto:unsubscribe@restockapp.email?subject=unsubscribe>';
  return {
    'List-Unsubscribe': listUnsub,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    'X-Mailer': 'Restock App',
  } as Record<string, string>;
}

export function formatFromDisplay(): string {
  return 'Restock App <orders@restockapp.email>';
}


