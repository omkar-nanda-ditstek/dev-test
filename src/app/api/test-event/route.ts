import { sendNotificationToUser } from "@/lib/sseEvents";

export async function GET() {
  sendNotificationToUser(
    "test-user",
    `Hello at ${new Date().toLocaleTimeString()}`,
  );

  return Response.json({ ok: true });
}
