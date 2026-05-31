import { NavLink } from 'react-router-dom';
import { BookOpen, Calendar, ShoppingCart, ChefHat } from 'lucide-react';

const navItems = [
  { to: '/recipes', icon: BookOpen, label: 'מתכונים' },
  { to: '/planner', icon: Calendar, label: 'תכנון ארוחה' },
  { to: '/shopping', icon: ShoppingCart, label: 'קניות' },
  { to: '/preparation', icon: ChefHat, label: 'הכנת ארוחה' },
];

export default function Navbar() {
  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0' }}>
          <span style={{ fontSize: '1.5rem' }}>🍽️</span>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' }}>MealCraft</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
