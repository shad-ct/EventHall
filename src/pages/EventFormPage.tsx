import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventAPI } from '../lib/api';
import { getCategories } from '../lib/firestore';
import { uploadFileToFirebase } from '../lib/firebase-storage';
import { MapPickerModal } from '../components/MapPickerModal';
import { EventCategory } from '../types';
import { ArrowLeft, X, MapPin, Download, Trash2 } from 'lucide-react';

export const EventFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [error, setError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [customCategoryTags, setCustomCategoryTags] = useState<string[]>([]);
  const [categoryTagInput, setCategoryTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [prizeDetails, setPrizeDetails] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [externalRegistrationLink, setExternalRegistrationLink] = useState('');
  const [howToRegisterLink, setHowToRegisterLink] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [brochureFiles, setBrochureFiles] = useState<{ name: string; url: string }[]>([]);
  const [posterImages, setPosterImages] = useState<{ name: string; url: string }[]>([]);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const districts = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
    'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
    'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catData = await getCategories();
        setCategories(catData);

        if (isEdit && id) {
          const eventData = await eventAPI.getEvent(id);
          const event = eventData.event;
          
          setTitle(event.title);
          setDescription(event.description);
          setDate(new Date(event.date).toISOString().split('T')[0]);
          setTime(event.time);
          setLocation(event.location);
          setDistrict(event.district);
          setGoogleMapsLink(event.googleMapsLink || '');
          setSelectedCategoryIds([event.primaryCategory.id, ...(event.additionalCategories?.map((ac: any) => ac.category.id) || [])]);
          setEntryFee(event.entryFee || '');
          setIsFree(event.isFree);
          setPrizeDetails(event.prizeDetails || '');
          setContactEmail(event.contactEmail);
          setContactPhone(event.contactPhone);
          setExternalRegistrationLink(event.externalRegistrationLink || '');
          setHowToRegisterLink(event.howToRegisterLink || '');
          setInstagramUrl(event.instagramUrl || '');
          setFacebookUrl(event.facebookUrl || '');
          setYoutubeUrl(event.youtubeUrl || '');
          setBannerUrl(event.bannerUrl || '');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const toggleAdditionalCategory = (catId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleAddCategoryTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && categoryTagInput.trim()) {
      e.preventDefault();
      const newTag = categoryTagInput.trim().toLowerCase();
      if (!customCategoryTags.includes(newTag)) {
        setCustomCategoryTags([...customCategoryTags, newTag]);
      }
      setCategoryTagInput('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 32MB for ImgBB)
    if (file.size > 32 * 1024 * 1024) {
      setError('Image size must be less than 32MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('expiration', '0'); // Never expire

      const response = await fetch('https://api.imgbb.com/1/upload?key=c31b5340081dec80f2fdc7b4c878a037', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setBannerUrl(data.data.url);
        alert('Image uploaded successfully!');
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only PDF
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('PDF size must be less than 50MB');
      return;
    }

    setUploadingBrochure(true);
    setError('');

    try {
      const url = await uploadFileToFirebase(file, 'brochures');
      setBrochureFiles([...brochureFiles, { name: file.name, url }]);
      alert('Brochure uploaded successfully!');
    } catch (error: any) {
      console.error('Failed to upload brochure:', error);
      setError('Failed to upload brochure. Please try again.');
    } finally {
      setUploadingBrochure(false);
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 32MB for ImgBB)
    if (file.size > 32 * 1024 * 1024) {
      setError('Image size must be less than 32MB');
      return;
    }

    setUploadingPoster(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('expiration', '0'); // Never expire

      const response = await fetch('https://api.imgbb.com/1/upload?key=c31b5340081dec80f2fdc7b4c878a037', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPosterImages([...posterImages, { name: file.name, url: data.data.url }]);
        alert('Poster uploaded successfully!');
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Failed to upload poster:', error);
      setError('Failed to upload poster. Please try again.');
    } finally {
      setUploadingPoster(false);
    }
  };

  const removeBrochure = (index: number) => {
    setBrochureFiles(brochureFiles.filter((_, i) => i !== index));
  };

  const removePoster = (index: number) => {
    setPosterImages(posterImages.filter((_, i) => i !== index));
  };

  const handleMapSelection = (location: { address: string; coordinates?: { lat: number; lng: number } }) => {
    setLocation(location.address);
    setShowMapModal(false);
  };

  const removeCustomCategory = (tag: string) => {
    setCustomCategoryTags(customCategoryTags.filter(t => t !== tag));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!customTags.includes(newTag)) {
        setCustomTags([...customTags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!title.trim()) {
        setError('Please enter event title');
        setLoading(false);
        return;
      }
      if (!description.trim()) {
        setError('Please enter event description');
        setLoading(false);
        return;
      }
      if (!date) {
        setError('Please select event date');
        setLoading(false);
        return;
      }
      if (!time) {
        setError('Please select event time');
        setLoading(false);
        return;
      }
      if (!location.trim()) {
        setError('Please enter event location');
        setLoading(false);
        return;
      }
      if (!district) {
        setError('Please select district');
        setLoading(false);
        return;
      }
      if (selectedCategoryIds.length === 0) {
        setError('Please select at least one category');
        setLoading(false);
        return;
      }
      if (!contactEmail.trim()) {
        setError('Please enter contact email');
        setLoading(false);
        return;
      }
      if (!contactPhone.trim()) {
        setError('Please enter contact phone');
        setLoading(false);
        return;
      }

      const eventData: any = {
        title,
        description,
        date,
        time,
        location,
        district,
        primaryCategoryId: selectedCategoryIds[0],
        contactEmail,
        contactPhone,
        isFree,
      };

      // Add optional fields only if they have values
      if (googleMapsLink?.trim()) eventData.googleMapsLink = googleMapsLink;
      if (selectedCategoryIds.length > 1) eventData.additionalCategoryIds = selectedCategoryIds.slice(1);
      if (customCategoryTags.length > 0) eventData.customCategories = customCategoryTags;
      if (!isFree && entryFee?.trim()) eventData.entryFee = entryFee;
      if (prizeDetails?.trim()) eventData.prizeDetails = prizeDetails;
      if (externalRegistrationLink?.trim()) eventData.externalRegistrationLink = externalRegistrationLink;
      if (howToRegisterLink?.trim()) eventData.howToRegisterLink = howToRegisterLink;
      if (instagramUrl?.trim()) eventData.instagramUrl = instagramUrl;
      if (facebookUrl?.trim()) eventData.facebookUrl = facebookUrl;
      if (youtubeUrl?.trim()) eventData.youtubeUrl = youtubeUrl;
      if (bannerUrl?.trim()) eventData.bannerUrl = bannerUrl;
      if (customTags.length > 0) eventData.customTags = customTags;
      if (brochureFiles.length > 0) eventData.brochureFiles = brochureFiles;
      if (posterImages.length > 0) eventData.posterImages = posterImages;

      if (isEdit && id) {
        await eventAPI.updateEvent(id, eventData);
      } else {
        const result = await eventAPI.createEvent(eventData);
        console.log('Event created:', result);
      }

      alert('Event saved successfully!');
      navigate('/admin/events');
    } catch (error: any) {
      console.error('Failed to save event:', error);
      setError(error.response?.data?.error || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto p-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 mb-6">
            Fill in the details to {isEdit ? 'update your' : 'create a new'} campus event
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tech Workshop 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe your event in detail..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Main Auditorium, NIT Calicut"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Map
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Click "Map" to select location from Google Maps or enter manually</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Maps Link
                  </label>
                  <input
                    type="url"
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Banner Image
                </label>
                
                {/* Image Preview */}
                {bannerUrl && (
                  <div className="mb-3 relative">
                    <img 
                      src={bannerUrl} 
                      alt="Banner preview" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setBannerUrl('')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-2 mb-2">
                  <label className="flex-1 cursor-pointer">
                    <div className={`w-full px-4 py-2 border-2 border-dashed rounded-lg text-center transition-colors ${
                      uploadingImage 
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100'
                    }`}>
                      {uploadingImage ? (
                        <span className="text-gray-600">Uploading...</span>
                      ) : (
                        <span className="text-blue-600 font-medium">📤 Upload Image</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* URL Input */}
                <div className="text-sm text-gray-500 text-center my-2">OR</div>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Paste image URL here"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={uploadingImage}
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 1200x600px, JPG or PNG (max 32MB)</p>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">Event Categories *</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select from Predefined Categories
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleAdditionalCategory(category.id)}
                      className={`py-1 px-2 rounded-lg border-2 text-xs transition-colors ${
                        selectedCategoryIds.includes(category.id)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Custom Categories
                </label>
                <input
                  type="text"
                  value={categoryTagInput}
                  onChange={(e) => setCategoryTagInput(e.target.value)}
                  onKeyDown={handleAddCategoryTag}
                  placeholder="Type a category and press Enter..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                />
                {customCategoryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customCategoryTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeCategoryTag(tag)}
                          className="hover:text-indigo-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Entry Fee & Prizes */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">Entry Fee & Prizes</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isFree" className="ml-2 text-sm font-medium text-gray-700">
                  Free Entry
                </label>
              </div>

              {!isFree && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entry Fee
                  </label>
                  <input
                    type="text"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    placeholder="₹100 per person"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prize Details (Optional)
                </label>
                <textarea
                  value={prizeDetails}
                  onChange={(e) => setPrizeDetails(e.target.value)}
                  rows={3}
                  placeholder="First: ₹10,000; Second: ₹5,000; Third: ₹2,000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone * (10 digits)
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setContactPhone(value);
                    }}
                    placeholder="1234567890"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter 10 digit phone number</p>
                </div>
              </div>
            </div>

            {/* Registration Links */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">Registration Links</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Registration Link
                </label>
                <input
                  type="url"
                  value={externalRegistrationLink}
                  onChange={(e) => setExternalRegistrationLink(e.target.value)}
                  placeholder="https://forms.google.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How to Register Link
                </label>
                <input
                  type="url"
                  value={howToRegisterLink}
                  onChange={(e) => setHowToRegisterLink(e.target.value)}
                  placeholder="https://example.com/registration-guide"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Marketing Materials */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">Marketing Materials (Optional)</h3>
              <p className="text-sm text-gray-600">Add brochures and posters to promote your event</p>
              
              {/* Brochures Section */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  📄 Event Brochures (PDF)
                </label>
                <p className="text-xs text-gray-600">Upload PDF brochures or documents about your event</p>
                
                {brochureFiles.length > 0 && (
                  <div className="space-y-2">
                    {brochureFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Download className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBrochure(index)}
                          className="ml-2 text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <div className={`w-full px-4 py-3 border-2 border-dashed rounded-lg text-center transition-colors ${
                    uploadingBrochure
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-blue-300 hover:border-blue-500 bg-white hover:bg-blue-50'
                  }`}>
                    {uploadingBrochure ? (
                      <span className="text-gray-600 text-sm">Uploading PDF...</span>
                    ) : (
                      <span className="text-blue-600 font-medium text-sm">+ Add PDF Brochure</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleBrochureUpload}
                    disabled={uploadingBrochure}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Posters Section */}
              <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  🎨 Event Posters (Images)
                </label>
                <p className="text-xs text-gray-600">Upload promotional poster images (JPG, PNG)</p>
                
                {posterImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {posterImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={file.url}
                          alt={`Poster ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-purple-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePoster(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <div className={`w-full px-4 py-3 border-2 border-dashed rounded-lg text-center transition-colors ${
                    uploadingPoster
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-purple-300 hover:border-purple-500 bg-white hover:bg-purple-50'
                  }`}>
                    {uploadingPoster ? (
                      <span className="text-gray-600 text-sm">Uploading poster...</span>
                    ) : (
                      <span className="text-purple-600 font-medium text-sm">+ Add Poster Image</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterUpload}
                    disabled={uploadingPoster}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Event' : 'Create Event')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSelect={handleMapSelection}
      />
    </div>
  );
};
