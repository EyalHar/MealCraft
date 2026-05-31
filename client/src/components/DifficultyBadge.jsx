const labels = { 1: 'קל מאוד', 2: 'קל', 3: 'בינוני', 4: 'קשה', 5: 'מאוד קשה' };
const colors = {
  1: '#d1fae5',2: '#d1fae5',3: '#fef3c7',4: '#fee2e2',5: '#fce7f3',
};
const textColors = {
  1: '#065f46',2: '#065f46',3: '#92400e',4: '#991b1b',5: '#9d174d',
};

export default function DifficultyBadge({ level }) {
  return (
    <span className="badge" style={{ background: colors[level], color: textColors[level] }}>
      {'★'.repeat(level)}{'☆'.repeat(5 - level)} {labels[level]}
    </span>
  );
}
