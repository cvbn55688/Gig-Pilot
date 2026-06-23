export function getDateKey(value) {
  return value.slice(0, 10);
}

export function formatDateLabel(dateKey) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    weekday: "narrow",
  }).format(new Date(`${dateKey}T00:00:00+08:00`));
}

export function formatTime(value) {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
