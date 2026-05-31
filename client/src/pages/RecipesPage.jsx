import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { recipesApi } from '../api';
import RecipeCard from '../components/RecipeCard';
import RecipeDetail from '../components/RecipeDetail';
import RecipeForm from '../components/RecipeForm';
import toast from 'react-hot-toast';

const CATEGORIES = ['הכל','מנה ראשונה','מרק','סלט','מנה עיקרית','תוספת','קינוח','מאפה','שתייה'];
const KOSHER = ['הכל','בשרי','חלבי','פרווה'];
const SORTS = [
  { value: 'createdAt', label: 'חדש ביותר' },
  { value: 'rating', label: 'דירוג גבוה' },
  { value: 'timesCooked', label: 'הוכן הכי הרבה' },
  { value: 'difficulty', label: 'קל ביותר' },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('הכל');
  const [kosher, setKosher] = useState('הכל');
  const [sort, setSort] = useState('createdAt');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const params = { sort };
      if (category !== 'הכל') params.category = category;
      if (kosher !== 'הכל') params.kosherType = kosher;
      if (search.trim()) params.search = search.trim();
      const res = await recipesApi.getAll(params);
      setRecipes(res.data);
    } catch {
      toast.error('שגיאה בטעינת המתכונים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [category, kosher, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleSave = async (form) => {
    try {
      if (editing) {
        await recipesApi.update(editing._id, form);
        toast.success('המתכון עודכן');
      } else {
        await recipesApi.create(form);
        toast.success('המתכון נוסף!');
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch {
      toast.error('שגיאה בשמירת המתכון');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('למחוק את המתכון?')) return;
    try {
      await recipesApi.delete(id);
      toast.success('המתכון נמחק');
      setSelected(null);
      load();
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  const handleUpdated = (updated) => {
    setSelected(updated);
    setRecipes((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 className="page-header" style={{ margin: 0 }}>📖 מאגר המתכונים</h1>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
          מתכון חדש
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label className="form-label">חיפוש</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="שם, מרכיב, תגית..." />
              <Search size={16} style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">קטגוריה</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label className="form-label">כשרות</label>
            <select className="form-input" value={kosher} onChange={(e) => setKosher(e.target.value)}>
              {KOSHER.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">מיון</label>
            <select className="form-input" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary">חפש</button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>⏳ טוען מתכונים...</div>
      ) : recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🍽️</div>
          <p style={{ color: 'var(--color-muted)' }}>לא נמצאו מתכונים. הוסף את המתכון הראשון שלך!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {recipes.map((r) => (
            <RecipeCard key={r._id} recipe={r} onClick={() => setSelected(r)} />
          ))}
        </div>
      )}

      {selected && (
        <RecipeDetail
          recipe={selected}
          onClose={() => setSelected(null)}
          onEdit={(r) => { setEditing(r); setShowForm(true); setSelected(null); }}
          onDelete={handleDelete}
          onUpdated={handleUpdated}
        />
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 780 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>{editing ? 'עריכת מתכון' : 'מתכון חדש'}</h2>
              <button className="btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>✕</button>
            </div>
            <RecipeForm
              initial={editing}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
