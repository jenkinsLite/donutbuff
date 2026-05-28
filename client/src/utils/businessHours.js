const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

export const isClosedDate = (date, closedDates) => {
  for (const entry of closedDates) {
    if (typeof entry === 'string') {
      if (DAY_KEYS[date.getDay()] === entry.toLowerCase()) return true;
    } else if (Array.isArray(entry)) {
      const [month, day, year] = entry;
      const mIdx = MONTH_KEYS.indexOf(month.toLowerCase());
      if (
        mIdx !== -1 &&
        date.getMonth() === mIdx &&
        date.getDate() === parseInt(day, 10) &&
        date.getFullYear() === parseInt(year, 10)
      ) return true;
    }
  }
  return false;
};

export const getHoursForDate = (date, config) => {
  if (isClosedDate(date, config.closedDates)) return null;
  const h = config.hours[DAY_KEYS[date.getDay()]];
  if (!h || (h[0] === '00:00' && h[1] === '00:00')) return null;
  return h;
};

export const fmt12 = (t) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};
