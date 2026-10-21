import { useEffect, useId, useState } from 'react';
import { productsApi } from '../api';

function Highlight({ text, query }) {
  const idx = text.indexOf(query.trim());
  if (!query.trim() || idx === -1) return text;
  const end = idx + query.trim().length;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, end)}</mark>
      {text.slice(end)}
    </>
  );
}

export default function ProductAutocomplete({ value, onChange, onSelect, onKeyDown, className = '', ...inputProps }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();

  useEffect(() => {
    const q = value.trim();
    if (!q || !open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await productsApi.search(q, { signal: controller.signal });
        setResults(res.data);
        setActive(-1);
      } catch {
        // aborted or failed: keep free-text input working without suggestions
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, open]);

  const select = (product) => {
    onSelect(product);
    setOpen(false);
    setResults([]);
  };

  const showList = open && value.trim() !== '' && results.length > 0;

  const handleKeyDown = (e) => {
    const visible = showList;
    if (visible && e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (visible && e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (visible && e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      select(results[active]);
    } else if (visible && e.key === 'Escape') {
      setOpen(false);
    } else {
      onKeyDown?.(e);
    }
  };

  return (
    <div className="autocomplete">
      <input
        {...inputProps}
        className={`form-input ${className}`}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
      />
      {showList && (
        <ul className="autocomplete-list" id={listId} role="listbox">
          {results.map((p, i) => (
            <li
              key={p._id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`autocomplete-item${i === active ? ' active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); select(p); }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="autocomplete-name"><Highlight text={p.name} query={value} /></span>
              <span className="autocomplete-category">{p.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
