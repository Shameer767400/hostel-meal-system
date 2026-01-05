import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { menuService } from '../../services/menuService';
import MenuCard from './MenuCard';
import MySelections from './MySelections';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeMenus, setActiveMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    loadActiveMenus();
  }, []);

  const loadActiveMenus = async () => {
    try {
      setLoading(true);
      const res = await menuService.getActiveMenus();
      setActiveMenus(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sticky Glass Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Student Portal</h1>
                <p className="text-xs text-primary-600 font-medium">Hostel Meal System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.hostelBlock} Block • {user?.rollNumber}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Hello, {user?.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-lg text-gray-600 mt-2">What would you like to eat today?</p>
        </div>

        {/* Custom Tabs */}
        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 inline-flex mb-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              activeTab === 'available'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Available Menus
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            My Selections
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'available' && (
          <div className="animate-slideUp">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm h-80 animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : activeMenus.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No menus available right now</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Menus are usually posted a few hours before meal times. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {activeMenus.map(menu => (
                  <MenuCard key={menu._id} menu={menu} onUpdate={loadActiveMenus} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-slideUp">
            <MySelections />
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;