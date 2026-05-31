import { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, CheckCircle, PlayCircle, Circle, ShoppingCart } from 'lucide-react';
import { mealsApi, shoppingApi, recipesApi } from '../api';
import Stars from '../components/Stars';
import KosherBadge from '../components/KosherBadge';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:     { label: 'ממתין',    color: '#6b7280', bg: '#f9fafb',   icon: Circle },
  in_progress: { label: 'בהכנה',   color: '#d97706', bg: '#fffbeb',   icon: PlayCircle },
  done:        { label: 'מוכן! ✓', color: '#059669', bg: '#ecfdf5',   icon: CheckCircle },
};

const MEAL_STATUS_ORDER = ['planning','shopping','cooking','done'];
const MEAL_STATUS_LABELS = { planning: '📝 תכנון', shopping: '🛒 קניות', cooking: '👨‍🍳 בישול', done: '✅ הסתיים' };

export default function PreparationPage() {
  const [meals, setMeals] = useState([]);
  const [activeMeal, setActiveMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteRating, setNoteRating] = useState(0);

  const load = async () => {
    try {
      const res = await mealsApi.getAll();
      setMeals(res.data);
      if (res.data.length > 0 && !activeMeal) setActiveMeal(res.data[0]);
    } catch {
      toast.error('שגיאה בטעינת הארוחות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const refreshActive = async () => {
    if (!activeMeal) return;
    const res = await mealsApi.getById(activeMeal._id);
    setActiveMeal(res.data);
    setMeals((prev) => prev.map((m) => (m._id === res.data._id ? res.data : m)));
  };

  const handleStatusChange = async (mealRecipeId, newStatus) => {
    if (newStatus === 'done') {
      setNoteModal({ mealRecipeId, newStatus });
      return;
    }
    try {
      await mealsApi.updateRecipeStatus(activeMeal._id, mealRecipeId, { status: newStatus });
      refreshActive();
    } catch {
      toast.error('שגיאה בעדכון הסטטוס');
    }
  };

  const handleDoneWithNote = async () => {
    try {
      await mealsApi.updateRecipeStatus(activeMeal._id, noteModal.mealRecipeId, {
        status: 'done',
        notes: noteText,
      });
      if (noteRating > 0) {
        const mr = activeMeal.recipes.find((r) => r._id === noteModal.mealRecipeId);
        if (mr?.recipe?._id) {
          await recipesApi.markCooked(mr.recipe._id, { note: noteText, rating: noteRating });
        }
      }
      toast.success('✅ מתכון סומן כמוכן!');
      setNoteModal(null);
      setNoteText('');
      setNoteRating(0);
      refreshActive();
    } catch {
      toast.error('שגיאה');
    }
  };

  const handleMealStatus = async (newStatus) => {
    try {
      const res = await mealsApi.update(activeMeal._id, { status: newStatus });
      setActiveMeal(res.data);
      setMeals((prev) => prev.map((m) => (m._id === res.data._id ? res.data : m)));
    } catch {
      toast.error('שגיאה בעדכון הארוחה');
    }
  };

  const handleGenerateShopping = async () => {
    try {
      await mealsApi.generateShoppingList(activeMeal._id);
      toast.success('🛒 רשימת קניות נוצרה! עבור לדף הקניות');
    } catch {
      toast.error('שגיאה ביצירת רשימת הקניות');
    }
  };

  const doneMeals = activeMeal?.recipes?.filter((r) => r.status === 'done').length || 0;
  const totalMeals = activeMeal?.recipes?.length || 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 className="page-header">👨‍🍳 הכנת הארוחה</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Meals sidebar */}
        <div>
          <h3 className="section-header">הארוחות שלי</h3>
          {loading ? <p style={{ color: 'var(--color-muted)' }}>טוען...</p> : meals.map((meal) => (
            <div
              key={meal._id}
              onClick={() => setActiveMeal(meal)}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                marginBottom: '0.375rem',
                background: activeMeal?._id === meal._id ? 'rgba(212,98,42,0.1)' : 'white',
                border: activeMeal?._id === meal._id ? '2px solid var(--color-primary)' : '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{meal.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 2 }}>
                {MEAL_STATUS_LABELS[meal.status]} · {meal.guestCount} סועדים
              </div>
            </div>
          ))}
          {meals.length === 0 && !loading && (
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
              אין ארוחות. תכנן ארוחה בדף <strong>תכנון ארוחה</strong>
            </p>
          )}
        </div>

        {/* Active meal */}
        {activeMeal ? (
          <div>
            {/* Meal header */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>{activeMeal.title}</h2>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    <span><Users size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {activeMeal.guestCount} סועדים</span>
                    {activeMeal.style && <span>🍽️ {activeMeal.style}</span>}
                    {activeMeal.availableTime && <span><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {activeMeal.availableTime} דק'</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {MEAL_STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleMealStatus(s)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '9999px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: activeMeal.status === s ? 'var(--color-primary)' : '#f3f4f6',
                        color: activeMeal.status === s ? 'white' : '#374151',
                      }}
                    >
                      {MEAL_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                  <span>התקדמות</span>
                  <span>{doneMeals}/{totalMeals} מתכונים מוכנים</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: totalMeals ? `${(doneMeals / totalMeals) * 100}%` : '0%' }} />
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn-outline" onClick={handleGenerateShopping} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                  <ShoppingCart size={14} style={{ display: 'inline', marginLeft: 4 }} /> צור רשימת קניות
                </button>
              </div>
            </div>

            {/* Recipe cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeMeal.recipes?.map((mr) => {
                const recipe = mr.recipe;
                if (!recipe) return null;
                const cfg = STATUS_CONFIG[mr.status];
                const Icon = cfg.icon;
                const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

                return (
                  <div key={mr._id} className="card" style={{ border: `2px solid ${mr.status === 'done' ? '#bbf7d0' : '#e5e7eb'}`, background: cfg.bg }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <Icon size={24} color={cfg.color} />
                          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{recipe.name}</h3>
                          <KosherBadge type={recipe.kosherType} />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--color-muted)', flexWrap: 'wrap' }}>
                          <span>⏱ {totalTime} דקות</span>
                          <span>🍽️ {recipe.category}</span>
                          <span>{'★'.repeat(recipe.difficulty)}</span>
                          {recipe.timesCooked > 0 && <span>🔄 הוכן {recipe.timesCooked}×</span>}
                        </div>

                        {mr.notes && (
                          <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: '#fffbeb', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                            📝 {mr.notes}
                          </div>
                        )}
                      </div>

                      {/* Status controls */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: 120 }}>
                        {['pending','in_progress','done'].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(mr._id, s)}
                            style={{
                              padding: '0.35rem 0.6rem',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: mr.status === s ? STATUS_CONFIG[s].color : '#f3f4f6',
                              color: mr.status === s ? 'white' : '#374151',
                              transition: 'all 0.2s',
                            }}
                          >
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
            <ChefHat size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
            <p>בחר ארוחה מהרשימה מצד ימין</p>
          </div>
        )}
      </div>

      {/* Note modal for done */}
      {noteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <h3 style={{ margin: '0 0 1rem' }}>✅ סמן כמוכן</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">דירוג</label>
              <Stars value={noteRating} interactive onChange={setNoteRating} size={28} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">הערות (אופציונלי)</label>
              <textarea className="form-input" rows={3} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="מה הלך טוב? מה שינית?" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => { setNoteModal(null); setNoteText(''); setNoteRating(0); }}>ביטול</button>
              <button className="btn-secondary" onClick={handleDoneWithNote}>שמור</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
