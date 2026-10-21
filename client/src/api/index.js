import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const recipesApi = {
  getAll: (params) => api.get('/recipes', { params }),
  getById: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
  uploadImage: (id, formData) => api.post(`/recipes/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (id, publicId) => api.delete(`/recipes/${id}/images/${encodeURIComponent(publicId)}`),
  markCooked: (id, data) => api.patch(`/recipes/${id}/cooked`, data),
  searchByIngredients: (params) => api.get('/recipes/search/by-ingredients', { params }),
};

export const mealsApi = {
  getAll: () => api.get('/meals'),
  getById: (id) => api.get(`/meals/${id}`),
  create: (data) => api.post('/meals', data),
  update: (id, data) => api.put(`/meals/${id}`, data),
  delete: (id) => api.delete(`/meals/${id}`),
  generateShoppingList: (id) => api.post(`/meals/${id}/shopping-list`),
  updateRecipeStatus: (mealId, recipeId, data) => api.patch(`/meals/${mealId}/recipes/${recipeId}/status`, data),
};

export const shoppingApi = {
  getAll: () => api.get('/shopping'),
  getById: (id) => api.get(`/shopping/${id}`),
  create: (data) => api.post('/shopping', data),
  update: (id, data) => api.put(`/shopping/${id}`, data),
  delete: (id) => api.delete(`/shopping/${id}`),
  toggleItem: (listId, itemId) => api.patch(`/shopping/${listId}/items/${itemId}/toggle`),
  addItem: (listId, item) => api.post(`/shopping/${listId}/items`, item),
  deleteItem: (listId, itemId) => api.delete(`/shopping/${listId}/items/${itemId}`),
  updateItem: (listId, itemId, data) => api.put(`/shopping/${listId}/items/${itemId}`, data),
};

export const productsApi = {
  search: (q, config) => api.get('/products', { params: { q }, ...config }),
};

export const aiApi = {
  suggestRecipes: (data) => api.post('/ai/suggest-recipes', data),
};
