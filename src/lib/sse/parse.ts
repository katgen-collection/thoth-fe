/**
 * Minimal SSE-over-POST reader.
 *
 * The chat stream arrives as the *response body of a POST*, so the browser's
 * `EventSource` (GET-only) can't be used. We read the `ReadableStream` directly,
 * decode `data:` frames per the SSE spec, and hand each parsed JSON object to a
 * callback. This is deliberately thin — the backend defines its own event union
 * (see `types/sse.ts`), so a custom parser is simpler and exact.
 */
import { isChatSseEvent, type ChatSseEvent } from "@/types/sse";

/**
 * Read an SSE response body, invoking `onEvent` for each well-formed chat frame.
 * Resolves when the stream closes; rejects if the body is missing or the read
 * aborts for a reason other than the provided `AbortSignal`.
 */
export async function readChatSse(
  response: Response,
  onEvent: (event: ChatSseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!response.body) {
    throw new Error("Response has no body to stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const flushFrame = (frame: string) => {
    // An SSE event may carry multiple `data:` lines; concatenate them.
    const dataLines: string[] = [];
    for (const rawLine of frame.split("\n")) {
      const line = rawLine.replace(/\r$/, "");
      if (line.startsWith(":")) continue; // comment / heartbeat
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).replace(/^ /, ""));
      }
    }
    if (dataLines.length === 0) return;
    const payload = dataLines.join("\n").trim();
    if (!payload || payload === "[DONE]") return;

    try {
      const parsed = JSON.parse(payload);
      if (isChatSseEvent(parsed)) onEvent(parsed);
    } catch {
      // Ignore malformed frames rather than tearing down the whole stream.
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Events are separated by a blank line (\n\n).
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        flushFrame(frame);
        boundary = buffer.indexOf("\n\n");
      }
    }
    // Flush any trailing frame without a closing blank line.
    if (buffer.trim()) flushFrame(buffer);
  } catch (err) {
    if (signal?.aborted) return; // user-initiated stop is not an error
    throw err;
  } finally {
    reader.releaseLock();
  }
}
