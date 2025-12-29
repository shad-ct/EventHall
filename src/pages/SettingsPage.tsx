import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, updateUserInterests } from '../lib/firestore';
import { getCategories, getUser } from '../lib/api-client';
import { adminAPI } from '../lib/api';
import { EventCategory } from '../types';
import { ArrowLeft, LogOut, Shield, User as UserIcon, Heart } from 'lucide-react';
import { uploadFile } from '../lib/file-storage';

export const SettingsPage: React.FC = () => {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile edit states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [collegeName, setCollegeName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  // Role selection and host fields (mirror CompleteProfilePage)
  const [role, setRole] = useState<'Host' | 'Student' | 'Professional'>('Student');
  const [hostProgramName, setHostProgramName] = useState('');
  const [hostDescription, setHostDescription] = useState('');
  const [hostCollegeName, setHostCollegeName] = useState('');
  const [hostLocation, setHostLocation] = useState('');
  const [hostDistrict, setHostDistrict] = useState('');
  const [hostCategories, setHostCategories] = useState<string[]>([]);
  const [newCustomHostCategory, setNewCustomHostCategory] = useState('');
  const [customHostCategories, setCustomHostCategories] = useState<string[]>([]);
  const [hostMob, setHostMob] = useState('');
  const [hostDateFrom, setHostDateFrom] = useState('');
  const [hostDateTo, setHostDateTo] = useState('');
  const [hostLogo, setHostLogo] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [fetchedUser, setFetchedUser] = useState<any | null>(null);

  // Event host application states
  const [motivationText, setMotivationText] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email || '');
      setPhone(user.contactPhone || user.phone || '');
      setPhotoUrl(user.photoUrl || '');
      setIsStudent(user.isStudent ?? true);
      setCollegeName(user.collegeName || '');
      setSelectedInterests(user.interests?.map(i => i.category.id) || []);

      // Prefill host-related fields if present on user
      const looksLikeHost = Boolean((user as any).programName || (user as any).hostMob || (user as any).logoUrl || (user.role && user.role.toString().toLowerCase().includes('host')));
      if (looksLikeHost) {
        setRole('Host');
      } else if (user.isStudent ?? true) {
        setRole('Student');
      } else {
        setRole('Professional');
      }

      setHostProgramName((user as any).programName || '');
      setHostDescription((user as any).description || '');
      setHostCollegeName((user as any).collegeName || '');
      setHostLocation((user as any).location || '');
      setHostDistrict((user as any).district || '');
      setHostCategories((user as any).hostCategories || []);
      setCustomHostCategories((user as any).customHostCategories || []);
      setHostMob((user as any).hostMob || '');
      setHostDateFrom((user as any).dateFrom || '');
      setHostDateTo((user as any).dateTo || '');
      const initialLogo = (user as any).logoUrl || (user as any).programLogo || '';
      setHostLogo(initialLogo);
      setFetchedUser(user as any);
    }
  }, [user]);

  const toggleHostCategory = (categoryId: string) => {
    setHostCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadFile(file, 'host-logos');
      setHostLogo(url);
    } catch (err) {
      console.error('Logo upload failed', err);
      alert('Logo upload failed. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
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
      if (!user) throw new Error('Not authenticated');

      // Update profile
      // Validate email
      if (!email.match(/^\S+@\S+\.\S+$/)) {
        alert('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      // Validate phone (10 digits)
      if (!/^\d{10}$/.test(phone)) {
        alert('Please enter a valid 10-digit phone number.');
        setLoading(false);
        return;
      }
      // Build profile payload based on role
      const profilePayload: any = {
        fullName: fullName.trim(),
        email: email.trim(),
        contactPhone: phone.trim(),
        photoUrl: photoUrl.trim(),
        isStudent: role === 'Student',
        collegeName: role === 'Student' ? collegeName.trim() : null,
      };

      if (role === 'Host') {
        // Validate required host fields
        if (!hostProgramName.trim() || !hostDescription.trim() || !hostLocation.trim() || !hostDistrict.trim() || !hostMob.trim() || !hostDateFrom.trim() || !hostDateTo.trim()) {
          alert('Please fill all required Host fields before saving.');
          setLoading(false);
          return;
        }
        if (!/^[0-9]{10}$/.test(hostMob.trim())) {
          alert('Host mobile must be a 10-digit number');
          setLoading(false);
          return;
        }

        profilePayload.programName = hostProgramName.trim();
        profilePayload.description = hostDescription.trim();
        profilePayload.collegeName = hostCollegeName.trim();
        profilePayload.location = hostLocation.trim();
        profilePayload.district = hostDistrict.trim();
        profilePayload.hostMob = hostMob.trim();
        profilePayload.dateFrom = hostDateFrom;
        profilePayload.dateTo = hostDateTo;
        profilePayload.logoUrl = hostLogo || null;
        profilePayload.hostCategories = hostCategories;
        profilePayload.customHostCategories = customHostCategories;
      }

      await updateUserProfile(user.id, profilePayload);

      // Update interests
      const selectedCategories = categories.filter(cat => selectedInterests.includes(cat.id));
      await updateUserInterests(user.id, selectedCategories);

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
            onClick={async () => {
              if (user) {
                try {
                  const full = await getUser(user.id);
                  if (full) {
                    setFullName(full.fullName || '');
                    setEmail(full.email || '');
                    setPhone(full.contactPhone || full.phone || '');
                    setPhotoUrl(full.photoUrl || '');
                    setIsStudent(full.isStudent ?? true);
                    setCollegeName(full.collegeName || '');
                    setSelectedInterests(full.interests?.map((i: any) => i.category.id) || []);

                    // host fields
                    const looksLikeHost = Boolean(full.programName || full.hostMob || full.logoUrl || (full.role && full.role.toString().toLowerCase().includes('host')));
                    if (looksLikeHost) setRole('Host');
                    else if (full.isStudent ?? true) setRole('Student');
                    else setRole('Professional');

                    setHostProgramName(full.programName || '');
                    setHostDescription(full.description || '');
                    setHostCollegeName(full.collegeName || '');
                    setHostLocation(full.location || '');
                    setHostDistrict(full.district || '');
                    setHostCategories(full.hostCategories || []);
                    setCustomHostCategories(full.customHostCategories || []);
                    setHostMob(full.hostMob || '');
                    setHostDateFrom(full.dateFrom || '');
                    setHostDateTo(full.dateTo || '');
                    setHostLogo(full.logoUrl || full.programLogo || '');
                    setFetchedUser(full);
                  }
                } catch (err) {
                  console.error('Failed to fetch full user profile', err);
                }
              }
              setShowEditProfile(true);
            }}
            className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors"
          >
            <UserIcon className="w-5 h-5 text-gray-600 mr-3" />
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Edit Profile</p>
              <p className="text-sm text-gray-500">Update your name, role, and college</p>
            </div>
          </button>
          <button
            onClick={async () => {
              if (user) {
                try {
                  const full = await getUser(user.id);
                  if (full) {
                    setFullName(full.fullName || '');
                    setEmail(full.email || '');
                    setPhone(full.contactPhone || full.phone || '');
                    setPhotoUrl(full.photoUrl || '');
                    setIsStudent(full.isStudent ?? true);
                    setCollegeName(full.collegeName || '');
                    setSelectedInterests(full.interests?.map((i: any) => i.category.id) || []);

                    const looksLikeHost = Boolean(full.programName || full.hostMob || full.logoUrl || (full.role && full.role.toString().toLowerCase().includes('host')));
                    if (looksLikeHost) setRole('Host');
                    else if (full.isStudent ?? true) setRole('Student');
                    else setRole('Professional');

                    setHostProgramName(full.programName || '');
                    setHostDescription(full.description || '');
                    setHostCollegeName(full.collegeName || '');
                    setHostLocation(full.location || '');
                    setHostDistrict(full.district || '');
                    setHostCategories(full.hostCategories || []);
                    setCustomHostCategories(full.customHostCategories || []);
                    setHostMob(full.hostMob || '');
                    setHostDateFrom(full.dateFrom || '');
                    setHostDateTo(full.dateTo || '');
                    setHostLogo(full.logoUrl || full.programLogo || '');
                  }
                } catch (err) {
                  console.error('Failed to fetch full user profile', err);
                }
              }
              setShowEditProfile(true);
            }}
            className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors border-t"
          >
            <Heart className="w-5 h-5 text-gray-600 mr-3" />
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Edit Interests</p>
              <p className="text-sm text-gray-500">Manage your event preferences</p>
            </div>
          </button>
        </div>

        {/* Event Host Section */}
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
                <p className="font-medium text-gray-900">Apply to Be an Event Host</p>
                <p className="text-sm text-gray-500">Create and manage your own events</p>
              </div>
            </button>
          </div>
        )}

        {(user?.role === 'EVENT_ADMIN' || user?.role === 'ADMIN') && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Event Host Panel</h2>
            </div>
            <button
              onClick={() => navigate('/host/events')}
              className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-5 h-5 text-blue-600 mr-3" />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">My Events</p>
                <p className="text-sm text-gray-500">Create and manage your events</p>
              </div>
            </button>
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/host/dashboard')}
                className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors border-t"
              >
                <Shield className="w-5 h-5 text-purple-600 mr-3" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Ultimate Admin Dashboard</p>
                  <p className="text-sm text-gray-500">Oversee all events and host applications</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone (10 digits) *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo URL</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
                {photoUrl && (
                  <img src={photoUrl} alt="Profile Preview" className="mt-2 w-20 h-20 rounded-full object-cover border" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Role *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => { setRole('Host'); setIsStudent(false); }}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      role === 'Host' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300'
                    }`}
                  >
                    Host
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('Student'); setIsStudent(true); }}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      role === 'Student' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('Professional'); setIsStudent(false); }}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      role === 'Professional' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300'
                    }`}
                  >
                    Professional
                  </button>
                </div>
              </div>

              {role === 'Student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">College Name *</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={role === 'Student'}
                  />
                </div>
              )}

              {role === 'Host' && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">Host Details</h4>
                      {fetchedUser && (
                        <div className="mb-3 bg-white p-3 rounded border">
                          <p className="text-sm font-medium text-gray-700">Current saved Host data</p>
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            {fetchedUser.programName && <div><strong>Program:</strong> {fetchedUser.programName}</div>}
                            {fetchedUser.description && <div><strong>Description:</strong> {fetchedUser.description}</div>}
                            {fetchedUser.location && <div><strong>Location:</strong> {fetchedUser.location}</div>}
                            {fetchedUser.district && <div><strong>District:</strong> {fetchedUser.district}</div>}
                            {fetchedUser.hostMob && <div><strong>Mobile:</strong> {fetchedUser.hostMob}</div>}
                            {(fetchedUser.dateFrom || fetchedUser.dateTo) && <div><strong>Dates:</strong> {fetchedUser.dateFrom || '-'} to {fetchedUser.dateTo || '-'}</div>}
                            {fetchedUser.logoUrl && (
                              <div className="mt-2">
                                <img src={fetchedUser.logoUrl} alt="Current logo" className="w-24 h-24 object-cover rounded border" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program Name *</label>
                      <input
                        type="text"
                        value={hostProgramName}
                        onChange={(e) => setHostProgramName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required={role === 'Host'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        value={hostDescription}
                        onChange={(e) => setHostDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required={role === 'Host'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">College Name *</label>
                      <input
                        type="text"
                        value={hostCollegeName}
                        onChange={(e) => setHostCollegeName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                        <input
                          type="text"
                          value={hostLocation}
                          onChange={(e) => setHostLocation(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                        <input
                          type="text"
                          value={hostDistrict}
                          onChange={(e) => setHostDistrict(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categories of Events *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => toggleHostCategory(category.id)}
                            className={`py-2 px-3 rounded-lg border-2 text-sm transition-colors ${
                              hostCategories.includes(category.id) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCustomHostCategory}
                            onChange={(e) => setNewCustomHostCategory(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Add other category (custom)"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const name = newCustomHostCategory.trim();
                              if (!name) return;
                              if (customHostCategories.includes(name)) {
                                alert('Category already added');
                                return;
                              }
                              setCustomHostCategories(prev => [...prev, name]);
                              setNewCustomHostCategory('');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                        {customHostCategories.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {customHostCategories.map((c) => (
                              <span key={c} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-2">
                                <span className="text-sm">{c}</span>
                                <button type="button" onClick={() => setCustomHostCategories(prev => prev.filter(x => x !== c))} className="text-red-600 text-xs">Remove</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Host Mobile *</label>
                      <input
                        type="tel"
                        value={hostMob}
                        onChange={(e) => setHostMob(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date From *</label>
                        <input
                          type="date"
                          value={hostDateFrom}
                          onChange={(e) => setHostDateFrom(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date To *</label>
                        <input
                          type="date"
                          value={hostDateTo}
                          onChange={(e) => setHostDateTo(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo <span className="text-gray-400">(optional)</span></label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="text-sm"
                        />
                        {uploadingLogo && (
                          <span className="text-sm text-gray-500">Uploading...</span>
                        )}
                        {hostLogo && !uploadingLogo && (
                          <div className="flex items-center gap-2">
                            <img src={hostLogo} alt="Logo preview" className="w-16 h-16 object-cover rounded-md border" />
                            <button
                              type="button"
                              onClick={() => setHostLogo('')}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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

      {/* Apply to Be an Event Host Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Apply to Be an Event Host</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-600">✕</button>
            </div>

            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Fill out the form below to request event host privileges for creating and managing events.
              </p>

              <form onSubmit={handleApplyForAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to become an event host? *
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
