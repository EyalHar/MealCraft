import { useState } from 'react';
import { Plus, X, Sparkles, Search, CheckCircle, BookPlus } from 'lucide-react';
import { recipesApi, mealsApi, aiApi } from '../api';
import RecipeCard from '../components/RecipeCard';
import toast from 'react-hot-toast';

const STYLES = ['כל סגנון','אשכנזי','ספרדי','מזרחי','ים תיכוני','אסייתי','אמריקאי','מודרני','אחר'];

export default function MealPlannerPage() {
  const [form, setForm] = useState({
    guestCount: 8, style: 'כל סגנון', ingredients: [],
    availableTime: '', maxDifficulty: 3, freeText: '',
  });
  const [ingredientInput, setIngredientInput] = useState('');
  const [dbResults, setDbResults] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [mealTitle, setMealTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      set('ingredients', [...form.ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (i) => set('ingredients', form.ingredients.filter((_, idx) => idx !== i));

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params = {
        ingredients: form.ingredients.join(','),
        style: form.style !== 'כל סגנון' ? form.style : undefined,
        maxDifficulty: form.maxDifficulty,
        maxTime: form.availableTime || undefined,
        guestCount: form.guestCount,
      };
      const res = await recipesApi.searchByIngredients(params);
      setDbResults(res.data);
    } catch {
      toast.error('שגיאה בחיפוש');
    } finally {
      setLoading(false);
    }
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const res = await aiApi.suggestRecipes({
        ...form,
        style: form.style !== 'כל סגנון' ? form.style : undefined,
        existingRecipeNames: [...dbResults.map((r) => r.name), ...aiResults.map((r) => r.name)],
      });
      setAiResults(res.data.recipes || []);
      toast.success(`✨ ${res.data.recipes?.length} הצעות התקבלו מה-AI`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'שגיאה בהצעת AI');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleRecipe = (recipe) => {
    setSelectedRecipes((prev) =>
      prev.find((r) => r._id === recipe._id || r.name === recipe.name)
        ? prev.filter((r) => r._id !== recipe._id && r.name !== recipe.name)
        : [...prev, recipe]
    );
  };

  const isSelected = (recipe) => selectedRecipes.some((r) => r._id === recipe._id || r.name === recipe.name);

  const handleAddAiRecipeToDB = async (recipe) => {
    try {
      const { matchCount, matchRatio, ...recipeData } = recipe;
      const res = await recipesApi.create({ ...recipeData, source: 'ai' });
      toast.success('המתכון נוסף למאגר!');
      setAiResults((prev) => prev.map((r) => (r.name === recipe.name ? { ...res.data, saved: true } : r)));
    } catch {
      toast.error('שגיאה בהוספת המתכון');
    }
  };

  const handleCreateMeal = async () => {
    if (!mealTitle.trim()) { toast.error('יש להזין כותרת לארוחה'); return; }
    if (selectedRecipes.length === 0) { toast.error('יש לבחור לפחות מתכון אחד'); return; }
    try {
      const savedIds = await Promise.all(
        selectedRecipes.map(async (r) => {
          if (r._id) return r._id;
          const res = await recipesApi.create({ ...r, source: 'ai' });
          return res.data._id;
        })
      );
      await mealsApi.create({
        title: mealTitle,
        guestCount: form.guestCount,
        style: form.style !== 'כל סגנון' ? form.style : '',
        desiredIngredients: form.ingredients,
        availableTime: form.availableTime ? Number(form.availableTime) : undefined,
        maxDifficulty: form.maxDifficulty,
        freeText: form.freeText,
        recipes: savedIds.map((id, i) => ({ recipe: id, order: i })),
      });
      toast.success('🎉 הארוחה נשמרה!');
      setSelectedRecipes([]);
      setMealTitle('');
    } catch {
      toast.error('שגיאה ביצירת הארוחה');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 className="page-header">📅 תכנון ארוחה חגיגית</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Sidebar - form */}
        <div>
          <form onSubmit={handleSearch} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="section-header" style={{ margin: 0 }}>🔍 פרמטרי החיפוש</h3>

            <div>
              <label className="form-label">מספר סועדים</label>
              <input className="form-input" type="number" min={1} value={form.guestCount} onChange={(e) => set('guestCount', +e.target.value)} />
            </div>

            <div>
              <label className="form-label">סגנון רצוי</label>
              <select className="form-input" value={form.style} onChange={(e) => set('style', e.target.value)}>
                {STYLES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">מרכיבים עיקריים</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  placeholder="הוסף מרכיב..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                />
                <button type="button" className="btn-outline" onClick={addIngredient} style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.75rem' }}>הוסף</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                {form.ingredients.map((ing, i) => (
                  <span key={i} className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {ing} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeIngredient(i)} />
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">זמן זמין (דקות)</label>
              <input className="form-input" type="number" min={0} value={form.availableTime} onChange={(e) => set('availableTime', e.target.value)} placeholder="ללא הגבלה" />
            </div>

            <div>
              <label className="form-label">רמת קושי מקסימלית: {form.maxDifficulty}/5</label>
              <input type="range" min={1} max={5} value={form.maxDifficulty} onChange={(e) => set('maxDifficulty', +e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label className="form-label">כיוון חופשי</label>
              <textarea className="form-input" rows={3} value={form.freeText} onChange={(e) => set('freeText', e.target.value)} placeholder="לדוגמה: ארוחת ראש השנה, מנות קלות לחיוך..." style={{ resize: 'vertical' }} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <Search size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
              {loading ? 'מחפש...' : 'חפש במאגר'}
            </button>

            <button type="button" className="btn-secondary" onClick={handleAiSuggest} disabled={aiLoading}>
              <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
              {aiLoading ? '✨ ה-AI חושב...' : '✨ הצע מתכונים עם AI'}
            </button>
          </form>

          {/* Save meal */}
          {selectedRecipes.length > 0 && (
            <div className="card" style={{ marginTop: '1rem', border: '2px solid var(--color-secondary)' }}>
              <h4 className="section-header">🍽️ הארוחה שלי ({selectedRecipes.length} מתכונים)</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem' }}>
                {selectedRecipes.map((r, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' }}>
                    <span>{r.name}</span>
                    <button className="btn-ghost" onClick={() => toggleRecipe(r)} style={{ padding: '0.2rem' }}><X size={14} /></button>
                  </li>
                ))}
              </ul>
              <input className="form-input" value={mealTitle} onChange={(e) => setMealTitle(e.target.value)} placeholder="שם הארוחה (לדוגמה: ראש השנה 2025)" style={{ marginBottom: '0.75rem' }} />
              <button className="btn-secondary" onClick={handleCreateMeal} style={{ width: '100%' }}>
                ✅ שמור ארוחה
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {!searched && !aiLoading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔍</div>
              <p>הגדר פרמטרים ולחץ <strong>חפש במאגר</strong> או <strong>הצע עם AI</strong></p>
            </div>
          )}

          {dbResults.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 className="section-header">📚 מהמאגר שלך ({dbResults.length} תוצאות)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {dbResults.map((r) => (
                  <div key={r._id} style={{ position: 'relative' }}>
                    <RecipeCard recipe={r} onClick={() => toggleRecipe(r)} matchCount={r.matchCount} />
                    {isSelected(r) && (
                      <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--color-secondary)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={18} color="white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiLoading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
              <p>Gemini AI מחפש מתכונים מתאימים...</p>
            </div>
          )}

          {aiResults.length > 0 && (
            <div>
              <h3 className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: '#7c3aed' }} /> הצעות AI ({aiResults.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {aiResults.map((r, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <RecipeCard recipe={r} onClick={() => toggleRecipe(r)} />
                    {isSelected(r) && (
                      <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--color-secondary)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={18} color="white" />
                      </div>
                    )}
                    {!r.saved && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddAiRecipeToDB(r); }}
                        title="הוסף למאגר"
                        style={{ position: 'absolute', bottom: 8, left: 8, background: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.2rem 0.4rem', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <BookPlus size={13} /> שמור
                      </button>
                    )}
                    {r.saved && (
                      <span style={{ position: 'absolute', bottom: 8, left: 8, background: '#d1fae5', color: '#065f46', borderRadius: '0.375rem', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>✓ נשמר</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
