"use client";

/** Footer link that re-opens the cookie notice (dispatches the event CookieNotice listens for). */
export function CookieNoticeLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("exz:open-cookie-notice"))}
      className="hover:text-white"
    >
      Cookie notice
    </button>
  );
}
