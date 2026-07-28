/**
 * Lightweight user-agent parsing — enough to label visitors by browser / OS / device
 * without pulling in a parsing dependency. Best-effort; unknowns fall back to "Unknown".
 */
export function parseUserAgent(ua: string | null | undefined): {
  browser: string;
  os: string;
  deviceType: string;
} {
  const s = ua || "";

  // Order matters: check the more specific brands before the generic engines.
  let browser = "Unknown";
  if (/Edg\//i.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(s)) browser = "Opera";
  else if (/SamsungBrowser/i.test(s)) browser = "Samsung Internet";
  else if (/Chrome\//i.test(s) && !/Chromium/i.test(s)) browser = "Chrome";
  else if (/CriOS/i.test(s)) browser = "Chrome";
  else if (/Firefox\/|FxiOS/i.test(s)) browser = "Firefox";
  else if (/Safari\//i.test(s) && /Version\//i.test(s)) browser = "Safari";
  else if (/MSIE|Trident/i.test(s)) browser = "Internet Explorer";

  let os = "Unknown";
  if (/Windows NT/i.test(s)) os = "Windows";
  else if (/iPhone|iPad|iPod/i.test(s)) os = "iOS";
  else if (/Mac OS X/i.test(s)) os = "macOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/Linux/i.test(s)) os = "Linux";
  else if (/CrOS/i.test(s)) os = "ChromeOS";

  let deviceType = "desktop";
  if (/iPad|Tablet/i.test(s) || (/Android/i.test(s) && !/Mobile/i.test(s))) deviceType = "tablet";
  else if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(s)) deviceType = "mobile";

  return { browser, os, deviceType };
}
