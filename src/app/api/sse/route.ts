import { NextRequest } from "next/server";
import { sseManager } from "@/lib/sseManager";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || crypto.randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const write = (msg: string) => controller.enqueue(encoder.encode(msg));

      write("event: connected\ndata: connected\n\n");
      sseManager.addClient(userId, {
        write,
        end: () => controller.close(),
      });

      const heartbeat = setInterval(() => sseManager.heartbeat(), 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        sseManager.removeClient(userId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
