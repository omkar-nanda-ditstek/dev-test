import { sseManager } from "./sseManager";

export const sendNotificationToUser = (userId: string, message: string) => {
  console.log(`[SSE] Sending to ${userId}:`, message);
  sseManager.sendToClient(userId, "notification", { message });
};
