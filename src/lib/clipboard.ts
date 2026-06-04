/**
 * Copy text to the clipboard with a graceful fallback.
 *
 * `navigator.clipboard` is only available in a *secure context* (HTTPS or
 * localhost). When the app is reached over plain HTTP (e.g. via the VPS IP) the
 * API is `undefined` and a naive `navigator.clipboard.writeText` throws — which
 * is why the copy buttons silently failed. This falls back to the legacy
 * `execCommand('copy')` path in that case.
 *
 * Returns true on success, false if every strategy failed.
 */
export async function copyText(text: string): Promise<boolean> {
  // Preferred path — async Clipboard API in a secure context.
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }

  // Legacy fallback — a hidden textarea + document.execCommand('copy').
  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
