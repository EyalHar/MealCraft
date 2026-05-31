import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Edit2, X, ShoppingCart } from 'lucide-react';
import { shoppingApi, mealsApi } from '../api';
import toast from 'react-hot-toast';

const CATEGORIES = ['כללי','ירקות ופירות','בשר ודגים','מוצרי חלב','מאפים','שימורים','תבלינים','קפואים','אחר'];

export default function ShoppingPage() {
  const [lists, setLists] = useState([]);
  const [activeList, setActiveList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', amount: '', unit: '', category: 'כללי' });
  const [editingItem, setEditingItem] = useState(null);
  const [showNewList, setShowNewList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const load = async () => {
    try {
      const res = await shoppingApi.getAll();
      setLists(res.data);
      if (res.data.length > 0 && !activeList) setActiveList(res.data[0]);
    } catch {
      toast.error('שגיאה בטעינת רשימות הקניות');
    } finally {
      setLoading(false);
    }
  };

  const refreshActive = async (id) => {
    const res = await shoppingApi.getById(id || activeList._id);
    const updated = res.data;
    setActiveList(updated);
    setLists((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
  };

  useEffect(() => { load(); }, []);

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;
    try {
      const res = await shoppingApi.create({ title: newListTitle, items: [] });
      setLists((prev) => [res.data, ...prev]);
      setActiveList(res.data);
      setShowNewList(false);
      setNewListTitle('');
    } catch {
      toast.error('שגיאה ביצירת רשימה');
    }
  };

  const handleDeleteList = async (id) => {
    if (!confirm('למחוק את הרשימה?')) return;
    await shoppingApi.delete(id);
    const remaining = lists.filter((l) => l._id !== id);
    setLists(remaining);
    setActiveList(remaining[0] || null);
    toast.success('הרשימה נמחקה');
  };

  const handleToggle = async (itemId) => {
    await shoppingApi.toggleItem(activeList._id, itemId);
    refreshActive();
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    try {
      await shoppingApi.addItem(activeList._id, newItem);
      setNewItem({ name: '', amount: '', unit: '', category: 'כללי' });
      refreshActive();
    } catch {
      toast.error('שגיאה בהוספת פריט');
    }
  };

  const handleDeleteItem = async (itemId) => {
    await shoppingApi.deleteItem(activeList._id, itemId);
    refreshActive();
    toast.success('פריט נמחק');
  };

  const handleSaveEdit = async () => {
    await shoppingApi.updateItem(activeList._id, editingItem._id, editingItem);
    setEditingItem(null);
    refreshActive();
  };

  const checkedCount = activeList?.items?.filter((i) => i.checked).length || 0;
  const totalCount = activeList?.items?.length || 0;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const grouped = activeList?.items?.reduce((acc, item) => {
    const cat = item.category || 'כללי';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 className="page-header">🛒 רשימת קניות</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Lists sidebar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 className="section-header" style={{ margin: 0 }}>הרשימות שלי</h3>
            <button className="btn-primary" onClick={() => setShowNewList(true)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
              <Plus size={14} style={{ display: 'inline' }} /> חדש
            </button>
          </div>

          {showNewList && (
            <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <input className="form-input" value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="שם הרשימה" onKeyDown={(e) => e.key === 'Enter' && handleCreateList()} autoFocus />
              <button className="btn-ghost" onClick={handleCreateList}>✓</button>
              <button className="btn-ghost" onClick={() => setShowNewList(false)}>✕</button>
            </div>
          )}

          {loading ? <p style={{ color: 'var(--color-muted)' }}>טוען...</p> : lists.map((list) => (
            <div
              key={list._id}
              onClick={() => setActiveList(list)}
              style={{
                padding: '0.6rem 0.75rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                marginBottom: '0.375rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: activeList?._id === list._id ? 'rgba(212,98,42,0.1)' : 'white',
                border: activeList?._id === list._id ? '2px solid var(--color-primary)' : '1px solid #e5e7eb',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{list.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{list.items?.length || 0} פריטים</div>
              </div>
              <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); handleDeleteList(list._id); }} style={{ padding: '0.2rem' }}>
                <Trash2 size={14} style={{ color: '#dc2626' }} />
              </button>
            </div>
          ))}

          {lists.length === 0 && !loading && (
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>אין רשימות עדיין</p>
          )}
        </div>

        {/* Active list */}
        {activeList ? (
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{activeList.title}</h2>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>{checkedCount}/{totalCount} פריטים</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Add item form */}
            <form onSubmit={handleAddItem} className="card" style={{ marginBottom: '1rem' }}>
              <h4 className="section-header">הוסף פריט</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input className="form-input" value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))} placeholder="שם הפריט *" style={{ flex: 3, minWidth: 140 }} required />
                <input className="form-input" value={newItem.amount} onChange={(e) => setNewItem((p) => ({ ...p, amount: e.target.value }))} placeholder="כמות" style={{ flex: 1, minWidth: 80 }} />
                <input className="form-input" value={newItem.unit} onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))} placeholder="יח'" style={{ flex: 1, minWidth: 60 }} />
                <select className="form-input" value={newItem.category} onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))} style={{ flex: 2, minWidth: 120 }}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <button type="submit" className="btn-primary">הוסף</button>
              </div>
            </form>

            {/* Items grouped by category */}
            {grouped && Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="card" style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--color-muted)', fontWeight: 700 }}>{cat}</h4>
                {items.map((item) => (
                  <div key={item._id}>
                    {editingItem?._id === item._id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input className="form-input" value={editingItem.name} onChange={(e) => setEditingItem((p) => ({ ...p, name: e.target.value }))} style={{ flex: 3 }} />
                        <input className="form-input" value={editingItem.amount} onChange={(e) => setEditingItem((p) => ({ ...p, amount: e.target.value }))} style={{ flex: 1 }} />
                        <input className="form-input" value={editingItem.unit} onChange={(e) => setEditingItem((p) => ({ ...p, unit: e.target.value }))} style={{ flex: 1 }} />
                        <button className="btn-ghost" onClick={handleSaveEdit} style={{ color: 'var(--color-secondary)' }}>✓</button>
                        <button className="btn-ghost" onClick={() => setEditingItem(null)}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f9fafb', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleToggle(item._id)}
                          style={{ width: 22, height: 22, borderRadius: 4, border: `2px solid ${item.checked ? 'var(--color-secondary)' : '#d1d5db'}`, background: item.checked ? 'var(--color-secondary)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                          {item.checked && <Check size={13} color="white" />}
                        </button>
                        <span style={{ flex: 1, textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--color-muted)' : 'inherit', fontSize: '0.95rem' }}>{item.name}</span>
                        {(item.amount || item.unit) && <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>{item.amount} {item.unit}</span>}
                        {item.fromRecipe && <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>({item.fromRecipe})</span>}
                        <button className="btn-ghost" onClick={() => setEditingItem({ ...item })} style={{ padding: '0.2rem' }}><Edit2 size={14} /></button>
                        <button className="btn-ghost" onClick={() => handleDeleteItem(item._id)} style={{ padding: '0.2rem', color: '#dc2626' }}><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {totalCount === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
                <ShoppingCart size={40} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.4 }} />
                <p>הרשימה ריקה. הוסף פריטים!</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
            <ShoppingCart size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
            <p>בחר רשימה קיימת או צור חדשה</p>
          </div>
        )}
      </div>
    </div>
  );
}
