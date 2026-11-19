/**
 * Адрес для ссылки в тексте сообщения. Разрешены `http`, `https`, `mailto` и `tel`;
 * адрес без схемы (`example.com`) считается адресом сайта. Любая другая схема
 * (`javascript:`, `data:`) даёт `undefined`, и ссылка показывается обычным текстом.
 */
export function linkHref(url: string): string | undefined {
  const trimmed = url.trim()
  if (trimmed === '') return undefined
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed
  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed)) return undefined
  return `https://${trimmed}`
}
