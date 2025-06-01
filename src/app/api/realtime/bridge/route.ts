// =============================================================================
// app/api/realtime/bridge/route.ts
// Node.js runtime – bridges Postgres NOTIFY → Server-Sent Events
// =============================================================================

export const runtime = "nodejs";

import { createClient } from "@vercel/postgres";
import { NextResponse } from "next/server";

const client = createClient();
let isListening = false;

async function ensureListening() {
  if (isListening) return;
  await client.connect();
  await client.query("LISTEN task_claimed");
  isListening = true;
}

// GET /api/realtime/bridge
export async function GET() {
  await ensureListening();

  const encoder = new TextEncoder();

  let cleanup: (() => Promise<void>) | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      /* ---------- PG NOTIFY → SSE frame ---------- */
      const onNotify = (msg: { payload?: string }) => {
        if (msg.payload) {
          controller.enqueue(encoder.encode(`data: ${msg.payload}\n\n`));
        }
      };
      client.on("notification", onNotify);

      /* ---------- 30-second keepalive “comment” ---------- */
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(":\n\n")); // SSE comment
      }, 30_000);

      /* ---------- Save cleanup for cancel() ---------- */
      cleanup = async () => {
        clearInterval(keepAlive);
        client.off("notification", onNotify);
        await client.end();
        controller.close();
      };
    },

    /* ---------- Triggered when the client disconnects ---------- */
    async cancel() {
      if (cleanup) await cleanup();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
