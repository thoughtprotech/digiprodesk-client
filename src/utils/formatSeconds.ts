function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0s";

  const days = Math.floor(seconds / 86400);
  seconds = Math.round(seconds % 86400);
  const hours = Math.floor(seconds / 3600);
  seconds = Math.round(seconds % 3600);
  const minutes = Math.floor(seconds / 60);
  seconds = Math.round(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

export default formatDuration;
