import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import RecipesPage from './pages/RecipesPage';
import MealPlannerPage from './pages/MealPlannerPage';
import ShoppingPage from './pages/ShoppingPage';
import PreparationPage from './pages/PreparationPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/recipes" replace />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/planner" element={<MealPlannerPage />} />
        <Route path="/shopping" element={<ShoppingPage />} />
        <Route path="/preparation" element={<PreparationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
