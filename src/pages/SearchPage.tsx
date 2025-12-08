import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { eventAPI } from '../lib/api';
import { getCategories } from '../lib/firestore';
import { Event, EventCategory } from '../types';
import { EventCard } from '../components/EventCard';
import { BottomNav } from '../components/BottomNav';
import { Search, Filter, X } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [likedEventIds, setLikedEventIds] = useState<string[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isFree, setIsFree] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'free'>('date');

  const districts = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
    'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
    'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ];

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

    // Check for category param in URL
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      fetchEvents({ category: categoryParam });
    }
  }, [searchParams]);

  const fetchEvents = async (filters?: any) => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery || undefined,
        category: filters?.category || selectedCategory || undefined,
        district: filters?.district || selectedDistrict || undefined,
        dateFrom: filters?.dateFrom || dateFrom || undefined,
        dateTo: filters?.dateTo || dateTo || undefined,
        isFree: filters?.isFree !== undefined ? filters.isFree : (isFree !== null ? isFree : undefined),
      };

      const data = await eventAPI.getEvents(params);
      setEvents(data.events);

      // Fetch interactions
      if (data.events.length > 0) {
        const eventIds = data.events.map((e: Event) => e.id);
        const interactions = await eventAPI.checkInteractions(eventIds);
        setLikedEventIds(interactions.likedEventIds);
        setRegisteredEventIds(interactions.registeredEventIds);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleSortChange = (newSort: 'date' | 'popularity' | 'free') => {
    setSortBy(newSort);
    // Sort events based on selection
    let sorted = [...events];
    if (newSort === 'date') {
      sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (newSort === 'popularity') {
      // Sort by title alphabetically as a placeholder for popularity
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (newSort === 'free') {
      sorted.sort((a, b) => (a.isFree === b.isFree ? 0 : a.isFree ? -1 : 1));
    }
    setEvents(sorted);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    fetchEvents({ category: categoryId }).then(() => {
      setShowFilters(false);
    });
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setLoading(true);
    fetchEvents({ 
      district: district || undefined,
      category: selectedCategory || undefined,
    });
  };

  const handleDateFromChange = (date: string) => {
    setDateFrom(date);
    setLoading(true);
    fetchEvents({ 
      dateFrom: date || undefined,
      category: selectedCategory || undefined,
      district: selectedDistrict || undefined,
    });
  };

  const handleDateToChange = (date: string) => {
    setDateTo(date);
    setLoading(true);
    fetchEvents({ 
      dateTo: date || undefined,
      category: selectedCategory || undefined,
      district: selectedDistrict || undefined,
      dateFrom: dateFrom || undefined,
    });
  };

  const handleFreeChange = (isFreeValue: boolean | null) => {
    setIsFree(isFreeValue);
    setLoading(true);
    fetchEvents({ 
      isFree: isFreeValue !== null ? isFreeValue : undefined,
      category: selectedCategory || undefined,
      district: selectedDistrict || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchEvents({
      category: selectedCategory || undefined,
      district: selectedDistrict || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      isFree: isFree !== null ? isFree : undefined,
    }).then(() => {
      setShowFilters(false);
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedDistrict('');
    setDateFrom('');
    setDateTo('');
    setIsFree(null);
    setSortBy('date');
    fetchEvents({
      category: '',
      district: '',
      dateFrom: '',
      dateTo: '',
      isFree: null,
    });
    setShowFilters(false);
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto p-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Auto-search on input change
                  if (e.target.value.trim()) {
                    setTimeout(() => {
                      const newParams = {
                        search: e.target.value || undefined,
                        category: selectedCategory || undefined,
                        district: selectedDistrict || undefined,
                        dateFrom: dateFrom || undefined,
                        dateTo: dateTo || undefined,
                        isFree: isFree !== null ? isFree : undefined,
                      };
                      eventAPI.getEvents(newParams).then(data => {
                        setEvents(data.events);
                        if (data.events.length > 0) {
                          const eventIds = data.events.map((e: Event) => e.id);
                          eventAPI.checkInteractions(eventIds).then(interactions => {
                            setLikedEventIds(interactions.likedEventIds);
                            setRegisteredEventIds(interactions.registeredEventIds);
                          });
                        }
                      }).catch(err => console.error('Search failed:', err));
                    }, 300);
                  } else {
                    setEvents([]);
                  }
                }}
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Filter events"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </form>

          {/* Sort Options in Header */}
          {events.length > 0 && (
            <div className="flex gap-1">
              <button
                onClick={() => handleSortChange('date')}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  sortBy === 'date'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📅 Date
              </button>
              <button
                onClick={() => handleSortChange('popularity')}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  sortBy === 'popularity'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ❤️ Popular
              </button>
              <button
                onClick={() => handleSortChange('free')}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  sortBy === 'free'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                💰 Free
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleCategoryClick(selectedCategory)}
                  className="mt-2 w-full py-1.5 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                >
                  Apply Category Filter
                </button>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Free/Paid Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFreeChange(null)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      isFree === null
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFreeChange(true)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      isFree === true
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    Free
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFreeChange(false)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      isFree === false
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>

              {/* Sort Option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSortChange('date')}
                    className={`w-full py-2 px-4 rounded-lg border-2 transition-colors text-left ${
                      sortBy === 'date'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    📅 By Date (Earliest First)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSortChange('popularity')}
                    className={`w-full py-2 px-4 rounded-lg border-2 transition-colors text-left ${
                      sortBy === 'popularity'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    ❤️ By Popularity (Most Liked)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSortChange('free')}
                    className={`w-full py-2 px-4 rounded-lg border-2 transition-colors text-left ${
                      sortBy === 'free'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    💰 Free Events First
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4">
        {/* Category Tiles */}
        {!searchQuery && !selectedCategory && events.length === 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="py-4 px-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center font-medium text-gray-700 hover:text-blue-700"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 && (searchQuery || selectedCategory) ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No events found matching your criteria</p>
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {events.length} Event{events.length !== 1 ? 's' : ''} Found
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isLiked={likedEventIds.includes(event.id)}
                  isRegistered={registeredEventIds.includes(event.id)}
                  onClick={() => handleEventClick(event.id)}
                  onLikeToggle={() => {
                    setLikedEventIds(prev =>
                      prev.includes(event.id)
                        ? prev.filter(id => id !== event.id)
                        : [...prev, event.id]
                    );
                  }}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <BottomNav />
    </div>
  );
};
