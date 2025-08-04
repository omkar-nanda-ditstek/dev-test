"use client";

import dynamic from "next/dynamic";

// Dynamically import client-only component
const SSETest = dynamic(() => import("@/components/SSETest"), { ssr: false });

export default function SSEWrapper() {
  return <SSETest />;
}
