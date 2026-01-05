import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    rollNumber: '',
    hostelBlock: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const hostelBlocks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const user = await register(registerData);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700 font-sans p-4">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h1>
            <p className="text-primary-100">Join the hostel meal system today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-primary-200 uppercase tracking-wider mb-2 pl-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-primary-200 uppercase tracking-wider mb-2 pl-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
                  placeholder="you@hostel.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-primary-200 uppercase tracking-wider mb-2 pl-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all appearance-none"
                style={{ colorScheme: 'dark' }}
              >
                <option value="student" className="bg-primary-900">Student</option>
                <option value="admin" className="bg-primary-900">Admin</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <div>
                  <label className="block text-xs font-medium text-primary-200 uppercase tracking-wider mb-2 pl-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required={formData.role === 'student'}
                    className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
                    placeholder="2021CS001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-primary-200 uppercase tracking-wider mb-2 pl-1">
                    Hostel Block
                  </label>
                  <select
                    name="hostelBlock"
                    value={formData.hostelBlock}
                    onChange={handleChange}
                    required={formData.role === 'student'}
                    className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all appearance-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-primary-900">Select Block</option>
                    {hostelBlocks.map(block => (
                      <option key={block} value={block} className="bg-primary-900">Block {block}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-primary-200 uppercase tracking-wider mb-2 pl-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-primary-200 uppercase tracking-wider mb-2 pl-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-900/20 text-sm font-semibold text-white bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-400 hover:to-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-primary-100 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-white hover:text-secondary-300 transition-colors underline decoration-2 decoration-transparent hover:decoration-secondary-300">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;