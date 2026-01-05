// src/components/admin/CreateMenuModal.jsx
import React, { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';
import { useTimeWindow } from '../../hooks/useTimeWindow';

const CreateMenuModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    mealType: 'lunch',
    date: new Date().toISOString().split('T')[0],
    itemIds: []
  });
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isInWindow, timeRemaining, windows } = useTimeWindow(formData.mealType);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const res = await menuService.getMenuItems({ isActive: true });
      setMenuItems(res.data.data);
    } catch (err) {
      setError('Failed to load menu items');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Removed client-side window check to allow anytime posting
    // if (!isInWindow) { ... }

    if (formData.itemIds.length === 0) {
      setError('Please select at least one item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await menuService.createMenu(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create menu');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      itemIds: prev.itemIds.includes(itemId)
        ? prev.itemIds.filter(id => id !== itemId)
        : [...prev.itemIds, itemId]
    }));
  };

  const categoryItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Menu</h2>
              {/* Removed window status indicator */}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Menu Items ({formData.itemIds.length} selected)
              </label>
              {Object.entries(categoryItems).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 capitalize">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map(item => (
                      <label
                        key={item._id}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
                          formData.itemIds.includes(item._id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.itemIds.includes(item._id)}
                          onChange={() => toggleItem(item._id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Menu...' : 'Create Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMenuModal;
  