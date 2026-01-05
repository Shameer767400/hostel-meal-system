import React, { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';

const MenuSelectionModal = ({ menu, existingSelection, onClose }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingSelection) {
      setSelectedItems(existingSelection.selectedItems.map(si => ({
        item: si.item._id,
        quantity: si.quantity
      })));
    }
  }, [existingSelection]);

  const handleToggleItem = (itemId) => {
    const exists = selectedItems.find(si => si.item === itemId);
    if (exists) {
      setSelectedItems(selectedItems.filter(si => si.item !== itemId));
    } else {
      setSelectedItems([...selectedItems, { item: itemId, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (itemId, quantity) => {
    setSelectedItems(selectedItems.map(si =>
      si.item === itemId ? { ...si, quantity: Math.max(1, Math.min(5, quantity)) } : si
    ));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await menuService.createSelection({
        menuId: menu._id,
        selectedItems
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save selection');
    } finally {
      setLoading(false);
    }
  };

  const categoryItems = menu.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select Your Meal</h2>
              <p className="text-gray-600 mt-1">Choose items for {menu.mealType}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {Object.entries(categoryItems).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">{category}</h3>
              <div className="space-y-2">
                {items.map(item => {
                  const selected = selectedItems.find(si => si.item === item._id);
                  return (
                    <div
                      key={item._id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition cursor-pointer ${
                        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleItem(item._id)}
                    >
                      <div className="flex items-center flex-1">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                          selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                          {selected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </div>
                      </div>
                      {selected && (
                        <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleQuantityChange(item._id, selected.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{selected.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, selected.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedItems.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Confirm Selection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuSelectionModal;
