/**
 * Кладёт текст в буфер обмена. Возвращает `false`, если браузер не разрешил запись (нет разрешения
 * или страница открыта не по HTTPS): тогда текст нужно показать, чтобы его скопировали вручную.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // `clipboard` бывает не задан, поэтому проверка нужна, хотя типы считают его всегда заданным
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!navigator.clipboard) return false
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
