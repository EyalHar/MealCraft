import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import ProductAutocomplete from './ProductAutocomplete';

const STYLES = ['אשכנזי','ספרדי','מזרחי','ים תיכוני','אסייתי','אמריקאי','מודרני','אחר'];
const CATEGORIES = ['מנה ראשונה','מרק','סלט','מנה עיקרית','תוספת','קינוח','מאפה','שתייה'];
const KOSHER = ['בשרי','חלבי','פרווה'];

const empty = {
  name: '', style: 'אחר', category: 'מנה עיקרית', kosherType: 'פרווה',
  ingredients: [{ name: '', amount: '', unit: '' }],
  instructions: '', difficulty: 3, prepTime: 30, cookTime: 0, servings: 4,
  tools: [], notes: '', tags: [],
};

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function RecipeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || empty);
  const [toolInput, setToolInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setIngredient = (i, field, value) => {
    const ing = [...form.ingredients];
    ing[i] = { ...ing[i], [field]: value };
    set('ingredients', ing);
  };
  const selectProduct = (i, product) => {
    const ing = [...form.ingredients];
    ing[i] = { ...ing[i], name: product.name, unit: ing[i].unit || product.defaultUnit };
    set('ingredients', ing);
  };
  const addIngredient = () => set('ingredients', [...form.ingredients, { name: '', amount: '', unit: '' }]);
  const removeIngredient = (i) => set('ingredients', form.ingredients.filter((_, idx) => idx !== i));

  const addTool = () => { if (toolInput.trim()) { set('tools', [...form.tools, toolInput.trim()]); setToolInput(''); } };
  const removeTool = (i) => set('tools', form.tools.filter((_, idx) => idx !== i));

  const addTag = () => { if (tagInput.trim()) { set('tags', [...form.tags, tagInput.trim()]); setTagInput(''); } };
  const removeTag = (i) => set('tags', form.tags.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormField label="שם המתכון *">
          <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="שם המתכון" />
        </FormField>
        <FormField label="סגנון">
          <select className="form-input" value={form.style} onChange={(e) => set('style', e.target.value)}>
            {STYLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="קטגוריה *">
          <select className="form-input" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="סוג כשרות *">
          <select className="form-input" value={form.kosherType} onChange={(e) => set('kosherType', e.target.value)}>
            {KOSHER.map((k) => <option key={k}>{k}</option>)}
          </select>
        </FormField>
        <FormField label="זמן הכנה (דקות) *">
          <input className="form-input" type="number" min={0} value={form.prepTime} onChange={(e) => set('prepTime', +e.target.value)} required />
        </FormField>
        <FormField label="זמן בישול (דקות)">
          <input className="form-input" type="number" min={0} value={form.cookTime} onChange={(e) => set('cookTime', +e.target.value)} />
        </FormField>
        <FormField label="מספר מנות *">
          <input className="form-input" type="number" min={1} value={form.servings} onChange={(e) => set('servings', +e.target.value)} required />
        </FormField>
        <FormField label={`רמת קושי: ${form.difficulty}/5`}>
          <input type="range" min={1} max={5} value={form.difficulty} onChange={(e) => set('difficulty', +e.target.value)} style={{ width: '100%' }} />
        </FormField>
      </div>

      <FormField label="מרכיבים *">
        {form.ingredients.map((ing, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <div style={{ flex: 3 }}>
              <ProductAutocomplete
                value={ing.name}
                onChange={(v) => setIngredient(i, 'name', v)}
                onSelect={(p) => selectProduct(i, p)}
                placeholder="התחל להקליד שם מוצר..."
                required
              />
            </div>
            <input className="form-input" value={ing.amount} onChange={(e) => setIngredient(i, 'amount', e.target.value)} placeholder="כמות" style={{ flex: 1 }} required />
            <input className="form-input" value={ing.unit} onChange={(e) => setIngredient(i, 'unit', e.target.value)} placeholder="יחידה" style={{ flex: 1 }} />
            {form.ingredients.length > 1 && (
              <button type="button" className="btn-ghost" onClick={() => removeIngredient(i)}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn-outline" onClick={addIngredient} style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>
          <Plus size={14} style={{ display: 'inline', marginLeft: 4 }} /> הוסף מרכיב
        </button>
      </FormField>

      <FormField label="אופן הכנה *">
        <textarea
          className="form-input"
          rows={5}
          value={form.instructions}
          onChange={(e) => set('instructions', e.target.value)}
          required
          placeholder="תאר את שלבי ההכנה..."
          style={{ resize: 'vertical' }}
        />
      </FormField>

      <FormField label="כלים ואביזרים">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input className="form-input" value={toolInput} onChange={(e) => setToolInput(e.target.value)} placeholder="הוסף כלי..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())} />
          <button type="button" className="btn-outline" onClick={addTool} style={{ whiteSpace: 'nowrap' }}>הוסף</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {form.tools.map((t, i) => (
            <span key={i} className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {t} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeTool(i)} />
            </span>
          ))}
        </div>
      </FormField>

      <FormField label="תגיות">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input className="form-input" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="הוסף תגית..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
          <button type="button" className="btn-outline" onClick={addTag} style={{ whiteSpace: 'nowrap' }}>הוסף</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {form.tags.map((t, i) => (
            <span key={i} className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              #{t} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeTag(i)} />
            </span>
          ))}
        </div>
      </FormField>

      <FormField label="הערות">
        <textarea className="form-input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="הערות, טיפים, וריאציות..." style={{ resize: 'vertical' }} />
      </FormField>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel} style={{ padding: '0.5rem 1rem' }}>ביטול</button>}
        <button type="submit" className="btn-primary">שמור מתכון</button>
      </div>
    </form>
  );
}
