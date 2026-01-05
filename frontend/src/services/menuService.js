import api from './api';

export const menuService = {
  // Menu operations
  createMenu: (data) => api.post('/menus', data),
  getActiveMenus: () => api.get('/menus/active'),
  getAllMenus: (params) => api.get('/menus', { params }),
  getMenu: (id) => api.get(`/menus/${id}`),
  updateMenu: (id, data) => api.put(`/menus/${id}`, data),
  deleteMenu: (id) => api.delete(`/menus/${id}`),

  // Menu items
  createMenuItem: (data) => api.post('/menu-items', data),
  getMenuItems: (params) => api.get('/menu-items', { params }),
  updateMenuItem: (id, data) => api.put(`/menu-items/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/menu-items/${id}`),

  // Selections
  createSelection: (data) => api.post('/selections', data),
  getMySelections: () => api.get('/selections/my-selections'),
  getSelectionForMenu: (menuId) => api.get(`/selections/menu/${menuId}`),

  // Analytics
  getMenuAnalytics: (menuId) => api.get(`/analytics/menu/${menuId}`),
  getOverviewAnalytics: (params) => api.get('/analytics/overview', { params })
};
