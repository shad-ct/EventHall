import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../lib/api';
import { updateUserProfile, updateUserInterests } from '../lib/firestore';
import { EventCategory } from '../types';
import { auth } from '../lib/firebase';

export const CompleteProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [collegeName, setCollegeName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setIsStudent(user.isStudent);
      setCollegeName(user.collegeName || '');
      setSelectedInterests(user.interests?.map(i => i.category.id) || []);
    }
  }, [user]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await authAPI.getCategories();
        setCategories(data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const toggleInterest = (categoryId: string) => {
    setSelectedInterests(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    if (isStudent && !collegeName.trim()) {
      setError('Please enter your college name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');

      // Get selected category objects
      const selectedCategories = categories.filter(cat =>
        selectedInterests.includes(cat.id)
      );

      // Update user profile in Firestore
      await updateUserProfile(uid, {
        fullName: fullName.trim(),
        isStudent,
        collegeName: isStudent ? collegeName.trim() : null,
      });

      // Update interests in Firestore
      await updateUserInterests(uid, selectedCategories);

      await refreshUser();
      navigate('/home');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Tell us about yourself to get personalized event recommendations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Role *
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsStudent(true)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      isStudent
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStudent(false)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      !isStudent
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    Professional
                  </button>
                </div>
              </div>

              {isStudent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College / Institution Name *
                  </label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g., NIT Calicut"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={isStudent}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Event Interests *</h2>
            <p className="text-sm text-gray-600 mb-4">Select the types of events you're interested in</p>
            
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleInterest(category.id)}
                  className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                    selectedInterests.includes(category.id)
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {selectedInterests.length > 0 && (
              <p className="mt-3 text-sm text-green-600">
                {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};
