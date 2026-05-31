import { useState } from 'react';
import { X, Edit, Trash2, Camera, Upload, Star } from 'lucide-react';
import Stars from './Stars';
import KosherBadge from './KosherBadge';
import DifficultyBadge from './DifficultyBadge';
import { recipesApi } from '../api';
import toast from 'react-hot-toast';

export default function RecipeDetail({ recipe, onClose, onEdit, onDelete, onUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [showCookModal, setShowCookModal] = useState(false);
  const [cookNote, setCookNote] = useState('');
  const [cookRating, setCookRating] = useState(0);

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await recipesApi.uploadImage(recipe._id, formData);
      onUpdated(res.data);
      toast.success('התמונה הועלתה בהצלחה');
    } catch {
      toast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (publicId) => {
    if (!confirm('למחוק את התמונה?')) return;
    try {
      const res = await recipesApi.deleteImage(recipe._id, publicId);
      onUpdated(res.data);
      toast.success('התמונה נמחקה');
    } catch {
      toast.error('שגיאה במחיקת התמונה');
    }
  };

  const handleMarkCooked = async () => {
    try {
      const res = await recipesApi.markCooked(recipe._id, { note: cookNote, rating: cookRating || undefined });
      onUpdated(res.data);
      toast.success('✅ רשמנו שהכנת את המתכון!');
      setShowCookModal(false);
      setCookNote('');
      setCookRating(0);
    } catch {
      toast.error('שגיאה');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>{recipe.name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <KosherBadge type={recipe.kosherType} />
              <span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>{recipe.category}</span>
              {recipe.style !== 'אחר' && <span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>{recipe.style}</span>}
              {recipe.source === 'ai' && <span className="badge" style={{ background: '#ede9fe', color: '#5b21b6' }}>✨ הוצע ע"י AI</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-ghost" onClick={() => onEdit(recipe)} title="עריכה"><Edit size={18} /></button>
            <button className="btn-ghost" onClick={() => onDelete(recipe._id)} title="מחיקה" style={{ color: '#dc2626' }}><Trash2 size={18} /></button>
            <button className="btn-ghost" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {/* Images */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {recipe.images?.map((img, i) => (
              <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                <img src={img.url} alt="" style={{ height: 120, width: 160, objectFit: 'cover', borderRadius: '0.5rem' }} />
                <button
                  onClick={() => handleDeleteImage(img.publicId)}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={12} color="white" />
                </button>
              </div>
            ))}
            <label style={{ flexShrink: 0, width: 160, height: 120, border: '2px dashed #d1d5db', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4, color: 'var(--color-muted)', fontSize: '0.8rem' }}>
              {uploading ? '⏳ מעלה...' : <><Camera size={24} /><span>הוסף תמונה שלך</span></>}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          {recipe.source === 'ai' && recipe.images?.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: '#92400e', background: '#fef3c7', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', marginTop: '0.5rem' }}>
              📸 מתכון זה הוצע ע"י AI. כדי להוסיף תמונה — הכן אותו ותצלם תמונה שלך.
            </p>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            ['⏱', 'זמן הכנה', `${recipe.prepTime} דק'`],
            ['🍳', 'זמן בישול', recipe.cookTime > 0 ? `${recipe.cookTime} דק'` : '—'],
            ['👥', 'מנות', recipe.servings],
            ['🔄', 'הוכן', `${recipe.timesCooked} פעמים`],
          ].map(([icon, label, val]) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '0.75rem' }}>
              <div style={{ fontSize: '1.2rem' }}>{icon}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{label}</div>
              <div style={{ fontWeight: 700 }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <DifficultyBadge level={recipe.difficulty} />
          <Stars value={recipe.rating} size={16} />
          {recipe.ratingCount > 0 && <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>({recipe.ratingCount} דירוגים)</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <h4 className="section-header">מרכיבים</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} style={{ padding: '0.35rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{ing.name}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{ing.amount} {ing.unit}</span>
                </li>
              ))}
            </ul>
            {recipe.tools?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 className="section-header">כלים</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {recipe.tools.map((t, i) => <span key={i} className="tag">🔧 {t}</span>)}
                </div>
              </div>
            )}
          </div>
          <div>
            <h4 className="section-header">הכנה</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-line', color: '#374151' }}>{recipe.instructions}</p>
          </div>
        </div>

        {recipe.notes && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fffbeb', borderRadius: '0.5rem', borderRight: '3px solid #f59e0b' }}>
            <strong>📝 הערות:</strong> <span style={{ fontSize: '0.9rem' }}>{recipe.notes}</span>
          </div>
        )}

        {recipe.tags?.length > 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {recipe.tags.map((t, i) => <span key={i} className="tag">#{t}</span>)}
          </div>
        )}

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => setShowCookModal(true)}>
            ✅ סמן כהוכן עכשיו
          </button>
        </div>

        {showCookModal && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
            <h4 style={{ margin: '0 0 0.75rem' }}>רשום כמה הלך</h4>
            <div style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">דירוג</label>
              <Stars value={cookRating} interactive onChange={setCookRating} size={24} />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">הערה</label>
              <textarea className="form-input" rows={2} value={cookNote} onChange={(e) => setCookNote(e.target.value)} placeholder="מה שינית? מה עבד טוב?" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setShowCookModal(false)}>ביטול</button>
              <button className="btn-secondary" onClick={handleMarkCooked}>שמור</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
