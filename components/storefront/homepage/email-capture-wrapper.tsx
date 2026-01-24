"use client";

import { EmailCapture } from "./email-capture";

export function EmailCaptureWrapper() {
  const handleEmailSubmit = async (email: string) => {
    // TODO: This will be implemented in task 13 (email subscription API route)
    // For now, we'll make a placeholder API call
    const response = await fetch("/api/email-subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, source: "homepage" }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to subscribe");
    }
  };

  return <EmailCapture onSubmit={handleEmailSubmit} />;
}
