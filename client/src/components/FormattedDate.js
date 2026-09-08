"use client";

import { useState, useEffect } from "react";

/**
 * Renders a timestamp in the viewer's own timezone.
 *
 * This has to be a client component: a server component formats using the
 * server's timezone (UTC on Railway), which is why dates previously appeared
 * several hours off for viewers in the Philippines.
 *
 * The server renders a placeholder and the real value appears once the
 * component mounts in the browser. suppressHydrationWarning is needed because
 * the server and browser output deliberately differ.
 */
export default function FormattedDate({ value, withTime = false }) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    if (!value) return;

    const options = withTime
      ? { dateStyle: "medium", timeStyle: "short" }
      : { dateStyle: "medium" };

    setFormatted(new Date(value).toLocaleString(undefined, options));
  }, [value, withTime]);

  if (!value) return <span>—</span>;

  return <span suppressHydrationWarning>{formatted}</span>;
}
