export function formatDate(isoDateString) {
  const date = new Date(isoDateString);

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear()).slice(-2);
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const formattedHours = hours % 12 || 12;
  const ampm = hours < 12 ? 'am' : 'pm';

  return `${day}/${month}/${year} ${formattedHours}:${minutes}${ampm}`;
}
