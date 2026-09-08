"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// How often to check for new notifications while the dashboard is open.
const POLL_INTERVAL_MS = 60 * 1000;

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/notifications", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silently ignore: a failed poll should never disrupt the dashboard.
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // Close the panel when clicking outside it.
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    try {
      await fetch("/api/admin/notifications/read-all", { method: "PATCH" });
      setNotifications([]);
      setUnreadCount(0);
      router.refresh();
    } catch {
      // Leave the list as-is if this fails; the next poll will correct it.
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative p-2 rounded-lg hover:bg-surface transition-colors"
      >
        <svg
          className="w-5 h-5 text-navy"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="font-semibold text-navy text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">
                Nothing new right now.
              </p>
            ) : (
              notifications.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 border-b border-border last:border-0 hover:bg-surface transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-[10px] text-text-muted whitespace-nowrap shrink-0">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      item.type === "contact"
                        ? "bg-primary/10 text-primary"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.type === "contact" ? "Enquiry" : "Application"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
