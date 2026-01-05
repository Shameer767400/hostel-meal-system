import React, { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';
import { formatDate, getMealTypeLabel } from '../../utils/formatters';
import MenuSelectionModal from './MenuSelectionModal';

const MenuCard = ({ menu, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [existingSelection, setExistingSelection] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    loadExistingSelection();
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [menu]);

  const loadExistingSelection = async () => {
    try {
      const res = await menuService.getSelectionForMenu(menu._id);
      setExistingSelection(res.data.data);
    } catch (err) {
      setExistingSelection(null);
    }
  };

  const updateTimeRemaining = () => {
    const now = new Date();
    const end = new Date(menu.selectionWindowEnd);
    const diff = end - now;

    if (diff <= 0) {
      setTimeRemaining('Closed');
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m left`);
    } else {
      setTimeRemaining(`${minutes}m left`);
    }
  };

  // Modern gradients for meal types
  const mealTypeConfig = {
    breakfast: {
      gradient: 'from-orange-400 to-amber-500',
      shadow: 'shadow-orange-500/20',
      image: 'https://images.unsplash.com/photo-1533089862017-5614fa95e1c7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' // Pancakes/Breakfasty
    },
    lunch: {
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' // Healthy bowl
    },
    dinner: {
      gradient: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/20',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' // Rich meal
    }
  };

  const config = mealTypeConfig[menu.mealType];
  const isExpired = new Date() > new Date(menu.selectionWindowEnd);

  return (
    <>
      <div 
        className={`group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full transform hover:-translate-y-1 ${config.shadow}`}
      >
        {/* Card Image Header */}
        <div className="relative h-48 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10`} />
          <img 
            src={config.image} 
            alt={menu.mealType}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
          />
          <div className="absolute top-4 left-4 z-20">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider bg-gradient-to-r ${config.gradient} shadow-lg`}>
              {getMealTypeLabel(menu.mealType)}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 z-20 text-white">
            <p className="text-sm font-medium opacity-90">{new Date(menu.date).toLocaleDateString(undefined, { weekday: 'long' })}</p>
            <h3 className="text-2xl font-bold">{formatDate(menu.date)}</h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={isExpired ? "text-red-500 font-medium" : "text-emerald-600 font-medium"}>
                  {timeRemaining}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-gray-50 rounded-lg">
                   <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                   </svg>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-900">Menu Highlights</p>
                   <p className="text-sm text-gray-500 line-clamp-2">
                     {menu.items.slice(0, 3).map(i => i.name).join(', ')}
                     {menu.items.length > 3 && ` +${menu.items.length - 3} more`}
                   </p>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {existingSelection ? (
              <div className="bg-green-50 rounded-xl p-3 flex items-center justify-center text-green-700 text-sm font-medium border border-green-100">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Selection Confirmed ({existingSelection.selectedItems.length} items)
              </div>
            ) : null}

            <button
              onClick={() => setShowModal(true)}
              disabled={isExpired}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 ${
                isExpired
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : `bg-gradient-to-r ${config.gradient} text-white hover:opacity-90 hover:shadow-xl`
              }`}
            >
              {isExpired ? 'Window Closed' : existingSelection ? 'Modify Selection' : 'View Menu & Select'}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <MenuSelectionModal
          menu={menu}
          existingSelection={existingSelection}
          onClose={() => {
            setShowModal(false);
            loadExistingSelection();
            onUpdate();
          }}
        />
      )}
    </>
  );
};

export default MenuCard;