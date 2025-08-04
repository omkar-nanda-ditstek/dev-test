"use client";

import { useEffect, useState } from "react";

export default function SSETest() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const eventSource = new EventSource("/api/sse?userId=test-user");

    eventSource.addEventListener("notification", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setMessage(data.message);
    });

    eventSource.onerror = (e) => {
      console.error("SSE error:", e);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const sendTest = async () => {
    await fetch("/api/test-event");
  };

  return (
    <div className="rounded border bg-white p-4 text-black shadow">
      <h2 className="mb-2 font-semibold">SSE Test</h2>
      <p>Latest message: {message || "Waiting for new notification..."}</p>
      <button
        onClick={sendTest}
        className="mt-2 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Send Test Notification
      </button>
    </div>
  );
}
