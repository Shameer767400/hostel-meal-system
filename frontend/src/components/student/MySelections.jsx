// src/components/student/MySelections.jsx
import React, { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';
import { formatDate, formatDateTime, getMealTypeLabel } from '../../utils/formatters';

const MySelections = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSelections();
  }, []);

  const loadSelections = async () => {
    try {
      setLoading(true);
      const res = await menuService.getMySelections();
      setSelections(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load selections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your selections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (selections.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-900">No selections yet</p>
        <p className="mt-2 text-gray-600">Select items from available menus to see them here</p>
      </div>
    );
  }

  const mealTypeColors = {
    breakfast: 'bg-yellow-100 text-yellow-800',
    lunch: 'bg-green-100 text-green-800',
    dinner: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="space-y-6">
      {selections.map(selection => (
        <div key={selection._id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${mealTypeColors[selection.menu.mealType]}`}>
                  {getMealTypeLabel(selection.menu.mealType)}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mt-2">
                  {formatDate(selection.menu.date)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Selected on {formatDateTime(selection.selectionDate)}
                </p>
              </div>
              {selection.isLocked && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Locked
                </span>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Your Selected Items:</h4>
              <div className="space-y-2">
                {selection.selectedItems.map((si, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{si.item.name}</p>
                      {si.item.description && (
                        <p className="text-sm text-gray-600">{si.item.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full">
                      Qty: {si.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Total: {selection.selectedItems.length} item{selection.selectedItems.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MySelections;