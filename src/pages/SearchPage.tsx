import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { eventAPI } from '../lib/api';
import { getCategories } from '../lib/firestore';
import { Event, EventCategory } from '../types';
import { EventCard } from '../components/EventCard';
import { BottomNav } from '../components/BottomNav';
import { CategoryBrowser } from '../components/CategoryBrowser';
import { FilterModal } from '../components/FilterModal';
import { Search, Filter } from 'lucide-react';


export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categorySlug } = useParams<{ categorySlug?: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]); // All events fetched once
  const [loading, setLoading] = useState(true);
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);



  // Fetch categories on mount (lightweight)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catData = await getCategories();
        setCategories(catData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Handle category URL changes and fetch events only when needed
  useEffect(() => {
    const handleCategoryChange = async () => {
      // Check for category in URL path (e.g., /search/music)
      if (categorySlug) {
        // Find category by slug
        const matchedCategory = categories.find(c => c.slug === categorySlug);
        if (matchedCategory) {
          setSelectedCategory(matchedCategory.id);
          setSelectedCategories([matchedCategory.id]);
        } else if (categorySlug === 'other') {
          // Handle 'other' category
          setSelectedCategory('other');
          setSelectedCategories(['other']);
        }
      } else {
        // No category in URL, clear category selection
        setSelectedCategory('');
        setSelectedCategories([]);
      }

      // Also check for category param in query string (backwards compatibility)
      const categoryParam = searchParams.get('category');
      if (categoryParam && !categorySlug) {
        setSelectedCategory(categoryParam);
        setSelectedCategories([categoryParam]);
      }
    };

    if (categories.length > 0) {
      handleCategoryChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, categories]);

  // Fetch events only when there's a reason to show them
  useEffect(() => {
    const shouldFetchEvents = categorySlug || searchQuery.trim();
    
    if (!shouldFetchEvents) {
      // Don't fetch events on main /search page, just show categories
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventData = await eventAPI.getEvents({});
        setAllEvents(eventData.events);

        // Fetch interactions for all events
        if (eventData.events.length > 0) {
          const eventIds = eventData.events.map((e: Event) => e.id);
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

    fetchEvents();
  }, [categorySlug, searchQuery]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // No fetch, just update searchQuery (already handled by state)
  };

  const handleSortChange = (newSort: 'date' | 'popularity' | 'free') => {
    setSortBy(newSort);
  };

  const handleCategoryClick = (categoryId: string) => {
    // Find the category slug
    let slug = categoryId;
    if (categoryId !== 'other') {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        slug = category.slug;
      }
    }
    // Navigate to the new URL with category in the path
    navigate(`/search/${slug}`);
  };

  const handleBackToAllCategories = () => {
    // Clear category selection and navigate to main search
    setSelectedCategory('');
    setSelectedCategories([]);
    navigate('/search');
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
  };

  const handleDateFromChange = (date: string) => {
    setDateFrom(date);
  };

  const handleDateToChange = (date: string) => {
    setDateTo(date);
  };

  const handleFreeChange = (isFreeValue: boolean | null) => {
    setIsFree(isFreeValue);
  };


  const handleApplyFilters = () => {
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedCategories([]);
    setSelectedDistrict('');
    setDateFrom('');
    setDateTo('');
    setIsFree(null);
    setSortBy('date');
    setShowFilters(false);
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  // Helper function to get all category IDs from an event (primary + additional)
  const getEventCategoryIds = (event: Event): string[] => {
    const ids: string[] = [];
    
    // Add primary category ID
    const primaryCatId = (event as any).primaryCategoryId || event.primaryCategory?.id;
    if (primaryCatId) {
      ids.push(primaryCatId);
    }
    
    // Add additional category IDs
    const additionalCatIds = (event as any).additionalCategoryIds || [];
    if (Array.isArray(additionalCatIds)) {
      ids.push(...additionalCatIds);
    } else if (Array.isArray(event.additionalCategories)) {
      // If additionalCategories is an array of objects with category property
      event.additionalCategories.forEach(ac => {
        if (ac.category?.id) {
          ids.push(ac.category.id);
        }
      });
    }
    
    // If no categories found, mark as 'other'
    if (ids.length === 0) {
      ids.push('other');
    }
    
    return ids;
  };

  // Memoized filtered and sorted events
  const events = useMemo(() => {
    let filtered = [...allEvents];

    // Category filter (multiple) - if no categories selected, show all (default behavior)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(e => {
        const eventCatIds = getEventCategoryIds(e);
        return eventCatIds.some(catId => selectedCategories.includes(catId));
      });
    } else if (selectedCategory) {
      filtered = filtered.filter(e => {
        const eventCatIds = getEventCategoryIds(e);
        return eventCatIds.includes(selectedCategory);
      });
    }
    // If both are empty, no category filter is applied (show all events)

    // District filter
    if (selectedDistrict) {
      filtered = filtered.filter(e => e.district === selectedDistrict);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(e => new Date(e.date) <= new Date(dateTo));
    }

    // Entry fee filter
    if (isFree !== null) {
      filtered = filtered.filter(e => e.isFree === isFree);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'popularity') {
      // Sort by likes + registrations count (most popular first)
      filtered.sort((a, b) => {
        const aLikes = a._count?.likes || 0;
        const bLikes = b._count?.likes || 0;
        const aRegs = a._count?.registrations || 0;
        const bRegs = b._count?.registrations || 0;
        const aTotal = aLikes + aRegs;
        const bTotal = bLikes + bRegs;
        
        // Sort descending (most popular first)
        if (bTotal !== aTotal) {
          return bTotal - aTotal;
        }
        // If same popularity, sort by date (earliest first)
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    } else if (sortBy === 'free') {
      // Sort free events first, then paid events
      filtered.sort((a, b) => {
        const aIsFree = a.isFree === true;
        const bIsFree = b.isFree === true;
        if (aIsFree === bIsFree) {
          // If both have same free status, sort by date
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        // Free events come first
        return aIsFree ? -1 : 1;
      });
    }

    return filtered;
  }, [allEvents, selectedCategories, selectedCategory, selectedDistrict, dateFrom, dateTo, isFree, searchQuery, sortBy]);

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
                onChange={(e) => setSearchQuery(e.target.value)}
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
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        show={showFilters}
        categories={categories}
        selectedCategories={selectedCategories}
        selectedDistrict={selectedDistrict}
        dateFrom={dateFrom}
        dateTo={dateTo}
        isFree={isFree}
        sortBy={sortBy}
        onClose={() => setShowFilters(false)}
        onToggleCategory={toggleCategory}
        onClearAllCategories={() => {
          setSelectedCategories([]);
          setSelectedCategory('');
        }}
        onDistrictChange={handleDistrictChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onFreeChange={handleFreeChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        onApplyFilters={handleApplyFilters}
      />

      <div className="max-w-6xl mx-auto p-4">
        {/* Category Page Header - Show when a category is selected */}
        {!loading && selectedCategory && (
          <div className="mb-6">
            <button
              onClick={handleBackToAllCategories}
              className="text-blue-600 hover:text-blue-700 font-medium mb-3 flex items-center gap-1"
            >
              ← Back to all categories
            </button>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {selectedCategory === 'other' 
                ? 'Other Events' 
                : categories.find(c => c.id === selectedCategory)?.name || 'Events'}
            </h1>
            {events.length > 0 && (
              <p className="text-gray-600 mt-1">
                {events.length} event{events.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        )}

        {/* Category Tiles - Show only on main search page */}
        {!searchQuery && !selectedCategory && !loading && (
          <CategoryBrowser
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />
        )}

        {/* Events Grid - Only show when there's a filter/search/category selected */}
        {(searchQuery || selectedCategory) && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No events found matching your criteria</p>
              </div>
            ) : (
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
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};
