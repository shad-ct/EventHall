
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, updateUserInterests } from '../lib/firestore';
import { getCategories } from '../lib/api-client';
import { createUserWithGoogle } from '../lib/google-auth';
import { EventCategory } from '../types';
import { uploadFile } from '../lib/file-storage';


export const CompleteProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isGoogleSignIn = Boolean(location.state && location.state.googleUser);

  // Common
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Host' | 'Student' | 'Professional'>('Student');
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vouchCode, setVouchCode] = useState('');

  // Host fields
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

  // Student fields
  const [studentCollegeName, setStudentCollegeName] = useState('');
  const [studentCourse, setStudentCourse] = useState('');
  const [studentYear, setStudentYear] = useState('');
  const [studentInterests, setStudentInterests] = useState<string[]>([]);
  const [studentLinkedIn, setStudentLinkedIn] = useState('');
  const [studentGitHub, setStudentGitHub] = useState('');

  // Professional fields
  const [professionalField, setProfessionalField] = useState('');
  const professionalFields = [
    'Engineering',
    'Medicine',
    'Education',
    'Business',
    'Arts',
    'Science',
    'Technology',
    'Other',
  ];

  // Google sign-in: collect username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setStudentCollegeName(user.collegeName || '');
      setStudentInterests(user.interests?.map(i => i.category.id) || []);
    }
  }, [user]);

  useEffect(() => {
    // Pre-fill host logo if available on user profile
    if (user && (user as any).programLogo) {
      setHostLogo((user as any).programLogo);
    }
  }, [user]);

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


  // Toggle helpers
  const toggleHostCategory = (categoryId: string) => {
    setHostCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  const toggleStudentInterest = (categoryId: string) => {
    setStudentInterests(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
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
      setError('Logo upload failed. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (isGoogleSignIn && (!username.trim() || !password.trim())) {
      setError('Please enter a username and password');
      return;
    }

    // Role-specific validation
    if (role === 'Host') {
      if (!hostProgramName.trim() || !hostDescription.trim() || !hostCollegeName.trim() || !hostLocation.trim() || !hostDistrict.trim() || !hostMob.trim() || !hostDateFrom.trim() || !hostDateTo.trim()) {
        setError('Please fill all required Host fields');
        return;
      }
      if (!/^[0-9]{10}$/.test(hostMob.trim())) {
        setError('Host mobile must be a 10-digit number');
        return;
      }
      if (hostCategories.length === 0 && customHostCategories.length === 0) {
        setError('Please select at least one event category or add a custom one');
        return;
      }
    } else if (role === 'Student') {
      if (!studentCollegeName.trim() || !studentCourse.trim() || !studentYear.trim()) {
        setError('Please fill all required Student fields');
        return;
      }
    } else if (role === 'Professional') {
      if (!professionalField.trim()) {
        setError('Please select your field of work');
        return;
      }
    }

    setLoading(true);
    try {
      let uid = user?.id;
      if (isGoogleSignIn && location.state.googleUser) {
        const created = await createUserWithGoogle({
          username: username.trim(),
          password: password.trim(),
          googleUser: location.state.googleUser,
        });
        uid = created.user?.id;
      }
      if (!uid) throw new Error('Not authenticated');

      // Prepare profile data
      let profileData: any = { fullName: fullName.trim(), role };
      let interests: EventCategory[] = [];

      if (role === 'Host') {
        profileData = {
          ...profileData,
          programName: hostProgramName.trim(),
          description: hostDescription.trim(),
          collegeName: hostCollegeName.trim(),
          location: hostLocation.trim(),
          district: hostDistrict.trim(),
          hostMob: hostMob.trim(),
          dateFrom: hostDateFrom,
          dateTo: hostDateTo,
          logoUrl: hostLogo || null,
        };

        // send host-side categories to backend for persistence
        profileData.hostCategories = hostCategories;
        profileData.customHostCategories = customHostCategories;

        interests = categories.filter(cat => hostCategories.includes(cat.id));
        if (customHostCategories.length > 0) {
          const customCats = customHostCategories.map((name) => ({ id: `custom-${name.replace(/\s+/g, '-').toLowerCase()}`, name, slug: 'custom', description: 'Custom category' }));
          interests = interests.concat(customCats as EventCategory[]);
        }
      } else if (role === 'Student') {
        profileData = {
          ...profileData,
          collegeName: studentCollegeName.trim(),
          course: studentCourse.trim(),
          year: studentYear.trim(),
          linkedIn: studentLinkedIn.trim(),
          github: studentGitHub.trim(),
        };
        interests = categories.filter(cat => studentInterests.includes(cat.id));
      } else if (role === 'Professional') {
        profileData = {
          ...profileData,
          fieldOfWork: professionalField.trim(),
        };
      }

      if (vouchCode.trim()) {
        profileData.vouchCode = vouchCode.trim();
      }

      await updateUserProfile(uid, profileData);
      if (role === 'Host' || role === 'Student') {
        await updateUserInterests(uid, interests);
      }

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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Please fill in your details to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Google sign-in: ask for username and password */}
          {isGoogleSignIn && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Set Username & Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            {/* Role Toggle */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">Role *</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole('Host')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    role === 'Host'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  Host
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Student')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    role === 'Student'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Professional')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    role === 'Professional'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  Professional
                </button>
              </div>
            </div>
          </div>

          {/* Host Form */}
          {role === 'Host' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Host Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Name *</label>
                  <input
                    type="text"
                    value={hostProgramName}
                    onChange={e => setHostProgramName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description about the program *</label>
                  <textarea
                    value={hostDescription}
                    onChange={e => setHostDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">College Name *</label>
                  <input
                    type="text"
                    value={hostCollegeName}
                    onChange={e => setHostCollegeName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={hostLocation}
                      onChange={e => setHostLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                    <input
                      type="text"
                      value={hostDistrict}
                      onChange={e => setHostDistrict(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categories of Events *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleHostCategory(category.id)}
                        className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                          hostCategories.includes(category.id)
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
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
                        onChange={e => setNewCustomHostCategory(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add other category (custom)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const name = newCustomHostCategory.trim();
                          if (!name) return;
                          if (customHostCategories.includes(name)) {
                            setError('Category already added');
                            setTimeout(() => setError(''), 2000);
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

                    {(hostCategories.length > 0 || customHostCategories.length > 0) && (
                      <p className="mt-2 text-sm text-green-600">
                        {hostCategories.length} categor{hostCategories.length !== 1 ? 'ies' : 'y'} selected{customHostCategories.length ? ` + ${customHostCategories.length} custom` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Host Mobile *</label>
                  <input
                    type="tel"
                    value={hostMob}
                    onChange={e => setHostMob(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date From *</label>
                    <input
                      type="date"
                      value={hostDateFrom}
                      onChange={e => setHostDateFrom(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date To *</label>
                    <input
                      type="date"
                      value={hostDateTo}
                      onChange={e => setHostDateTo(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors mt-4"
                >
                  {loading ? 'Applying...' : 'Apply for Host'}
                </button>
              </div>
            </div>
          )}

          {/* Student Form */}
          {role === 'Student' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">College Name *</label>
                  <input
                    type="text"
                    value={studentCollegeName}
                    onChange={e => setStudentCollegeName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                  <input
                    type="text"
                    value={studentCourse}
                    onChange={e => setStudentCourse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study *</label>
                  <input
                    type="text"
                    value={studentYear}
                    onChange={e => setStudentYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests (Categories) <span className="text-gray-400">(optional)</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleStudentInterest(category.id)}
                        className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                          studentInterests.includes(category.id)
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                  {studentInterests.length > 0 && (
                    <p className="mt-2 text-sm text-green-600">
                      {studentInterests.length} interest{studentInterests.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn <span className="text-gray-400">(optional)</span></label>
                  <input
                    type="url"
                    value={studentLinkedIn}
                    onChange={e => setStudentLinkedIn(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub <span className="text-gray-400">(optional)</span></label>
                  <input
                    type="url"
                    value={studentGitHub}
                    onChange={e => setStudentGitHub(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors mt-4"
                >
                  {loading ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Professional Form */}
          {role === 'Professional' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field of Work *</label>
                  <select
                    value={professionalField}
                    onChange={e => setProfessionalField(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select field</option>
                    {professionalFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors mt-4"
                >
                  {loading ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Vouch Code (all roles) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Vouch Code <span className="text-gray-400">(if any)</span></label>
            <input
              type="text"
              value={vouchCode}
              onChange={e => setVouchCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter vouch code if you have one"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
