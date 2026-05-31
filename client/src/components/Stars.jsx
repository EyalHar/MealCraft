import { Star } from 'lucide-react';

export default function Stars({ value, max = 5, size = 16, interactive = false, onChange }) {
  return (
    <div className="stars" style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < Math.round(value) ? '#f59e0b' : 'none'}
          color={i < Math.round(value) ? '#f59e0b' : '#d1d5db'}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onClick={() => interactive && onChange && onChange(i + 1)}
        />
      ))}
    </div>
  );
}
