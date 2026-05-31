const config = {
  'בשרי':  { cls: 'badge-meat',  emoji: '🥩' },
  'חלבי':  { cls: 'badge-dairy', emoji: '🥛' },
  'פרווה': { cls: 'badge-parve', emoji: '🥦' },
};

export default function KosherBadge({ type }) {
  const { cls, emoji } = config[type] || { cls: 'badge-parve', emoji: '🌿' };
  return <span className={`badge ${cls}`}>{emoji} {type}</span>;
}
