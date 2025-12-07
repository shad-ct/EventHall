import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { authAPI, adminAPI } from '../lib/api';
import { EventCategory } from '../types';
import { ArrowLeft, LogOut, Shield, User as UserIcon, Heart } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile edit states
  const [fullName, setFullName] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [collegeName, setCollegeName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  // Admin application states
  const [motivationText, setMotivationText] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest');
      return;
    }

    setLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');

      await authAPI.updateProfile(idToken, {
        fullName: fullName.trim(),
        isStudent,
        collegeName: isStudent ? collegeName.trim() : null,
        interests: selectedInterests,
      });

      await refreshUser();
      setShowEditProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (motivationText.length < 50) {
      setApplyError('Motivation text must be at least 50 characters');
      return;
    }

    setLoading(true);
    setApplyError('');
    setApplySuccess(false);

    try {
      await adminAPI.applyForAdmin(motivationText);
      setApplySuccess(true);
      setMotivationText('');
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(false);
      }, 2000);
    } catch (error: any) {
      setApplyError(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (categoryId: string) => {
    setSelectedInterests(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto p-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Profile</h2>
          </div>
          <button
            onClick={() => setShowEditProfile(true)}
            className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors"
          >
            <UserIcon className="w-5 h-5 text-gray-600 mr-3" />
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Edit Profile</p>
              <p className="text-sm text-gray-500">Update your name, role, and college</p>
            </div>
          </button>
          <button
            onClick={() => setShowEditProfile(true)}
            className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors border-t"
          >
            <Heart className="w-5 h-5 text-gray-600 mr-3" />
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Edit Interests</p>
              <p className="text-sm text-gray-500">Manage your event preferences</p>
            </div>
          </button>
        </div>

        {/* Admin Section */}
        {user?.role === 'STANDARD_USER' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Event Management</h2>
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-5 h-5 text-blue-600 mr-3" />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Apply for Admin Role</p>
                <p className="text-sm text-gray-500">Create and manage your own events</p>
              </div>
            </button>
          </div>
        )}

        {(user?.role === 'EVENT_ADMIN' || user?.role === 'ULTIMATE_ADMIN') && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Admin Panel</h2>
            </div>
            <button
              onClick={() => navigate('/admin/events')}
              className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-5 h-5 text-blue-600 mr-3" />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">My Events</p>
                <p className="text-sm text-gray-500">Create and manage your events</p>
              </div>
            </button>
            {user?.role === 'ULTIMATE_ADMIN' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors border-t"
              >
                <Shield className="w-5 h-5 text-purple-600 mr-3" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Ultimate Admin Dashboard</p>
                  <p className="text-sm text-gray-500">Manage all events and applications</p>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Account */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Account</h2>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors text-red-600"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button onClick={() => setShowEditProfile(false)} className="text-gray-600">✕</button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Role *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsStudent(true)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      isStudent ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStudent(false)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      !isStudent ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300'
                    }`}
                  >
                    Professional
                  </button>
                </div>
              </div>

              {isStudent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">College Name *</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={isStudent}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Interests *</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleInterest(category.id)}
                      className={`py-2 px-3 rounded-lg border-2 text-sm transition-colors ${
                        selectedInterests.includes(category.id)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Apply for Admin Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Apply for Admin Role</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-600">✕</button>
            </div>

            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Fill out the form below to request admin privileges for creating and managing events.
              </p>

              <form onSubmit={handleApplyForAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to become an admin? *
                  </label>
                  <textarea
                    value={motivationText}
                    onChange={(e) => setMotivationText(e.target.value)}
                    rows={6}
                    placeholder="Explain your motivation (minimum 50 characters)..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {motivationText.length} / 50 characters minimum
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Responsibilities:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Create and publish campus events</li>
                    <li>• Update and manage your own events</li>
                    <li>• Ensure event information is accurate</li>
                    <li>• Respond to event-related queries</li>
                  </ul>
                </div>

                {applyError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {applyError}
                  </div>
                )}

                {applySuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    Application submitted successfully! We'll review it soon.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || applySuccess}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
