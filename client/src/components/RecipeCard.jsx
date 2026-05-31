import { Clock, Users, ChefHat } from 'lucide-react';
import Stars from './Stars';
import KosherBadge from './KosherBadge';
import DifficultyBadge from './DifficultyBadge';

export default function RecipeCard({ recipe, onClick, matchCount }) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const mainImage = recipe.images?.[0];

  return (
    <div className="recipe-card" onClick={onClick}>
      {mainImage ? (
        <img src={mainImage.url} alt={recipe.name} className="recipe-img" />
      ) : (
        <div className="recipe-img-placeholder">🍳</div>
      )}
      <div style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>{recipe.name}</h3>
          {recipe.source === 'ai' && (
            <span className="badge" style={{ background: '#ede9fe', color: '#5b21b6', fontSize: '0.7rem', whiteSpace: 'nowrap', marginRight: 4 }}>✨ AI</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <KosherBadge type={recipe.kosherType} />
          <span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>{recipe.category}</span>
          {recipe.style !== 'אחר' && <span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>{recipe.style}</span>}
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
          <span><Clock size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {totalTime} דק'</span>
          <span><Users size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {recipe.servings}</span>
          <span><ChefHat size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {'★'.repeat(recipe.difficulty)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stars value={recipe.rating} size={14} />
          {recipe.timesCooked > 0 && (
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>הוכן {recipe.timesCooked}×</span>
          )}
        </div>

        {matchCount > 0 && (
          <div style={{ marginTop: '0.5rem', padding: '0.3rem 0.5rem', background: '#d1fae5', borderRadius: '0.375rem', fontSize: '0.78rem', color: '#065f46' }}>
            ✓ {matchCount} מרכיבים תואמים
          </div>
        )}
      </div>
    </div>
  );
}
