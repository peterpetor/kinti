/**
 * Apró className-összefűző (clsx-lite) — külső függőség nélkül.
 * A hamis értékeket (false/null/undefined) kiszűri, a többit szóközzel fűzi.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
