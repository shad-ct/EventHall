import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { AdminApplication, Event } from '../types';
import { ArrowLeft, Check, X, Calendar, Star } from 'lucide-react';

export const UltimateAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'adminRequests' | 'events' | 'allEvents' | 'featured'>('adminRequests');
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>('PENDING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'allEvents') {
      fetchAllEvents();
    } else if (activeTab === 'featured') {
      fetchFeaturedEvents();
    } else if (activeTab === 'adminRequests') {
      fetchApplications();
    }
  }, [activeTab, statusFilter, applicationStatusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsData, eventsData] = await Promise.all([
        adminAPI.getApplications(applicationStatusFilter || undefined),
        adminAPI.getPendingEvents(),
      ]);
      setApplications(appsData.applications);
      setPendingEvents(eventsData.events);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getApplications(applicationStatusFilter || undefined);
      setApplications(data.applications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllEvents(statusFilter || undefined);
      setAllEvents(data.events);
    } catch (error) {
      console.error('Failed to fetch all events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedEvents = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getFeaturedEvents();
      setFeaturedEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch featured events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adminAPI.reviewApplication(id, status);
      setApplications(prev => prev.filter(app => app.id !== id));
      alert(`Application ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Failed to review application:', error);
      alert('Failed to review application');
    }
  };

  const handleReviewEvent = async (id: string, status: 'PUBLISHED' | 'REJECTED') => {
    try {
      const reason = status === 'REJECTED' ? prompt('Enter rejection reason (optional):') : undefined;
      await adminAPI.updateEventStatus(id, status, reason || undefined);
      setPendingEvents(prev => prev.filter(event => event.id !== id));
      alert(`Event ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Failed to review event:', error);
      alert('Failed to review event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    try {
      await adminAPI.deleteEvent(id);
      setAllEvents(prev => prev.filter(event => event.id !== id));
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    }
  };

  const handleEditEvent = (id: string) => {
    navigate(`/admin/events/edit/${id}`);
  };

  const handleToggleFeatured = async (id: string, currentlyFeatured: boolean) => {
    try {
      await adminAPI.toggleEventFeatured(id, !currentlyFeatured);
      // Update the event in all relevant lists
      setAllEvents(prev => prev.map(event => 
        event.id === id ? { ...event, isFeatured: !currentlyFeatured } : event
      ));
      
      if (currentlyFeatured) {
        // Remove from featured list
        setFeaturedEvents(prev => prev.filter(event => event.id !== id));
      } else {
        // Refresh featured list to include the new event
        if (activeTab === 'featured') {
          fetchFeaturedEvents();
        }
      }
      
      alert(currentlyFeatured ? 'Event removed from banner' : 'Event added to banner');
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      alert('Failed to update featured status');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const isPublished = currentStatus === 'PUBLISHED';
    const action = isPublished ? 'unpublish' : 'publish';
    
    if (!confirm(`Are you sure you want to ${action} this event?`)) {
      return;
    }

    try {
      await adminAPI.toggleEventPublish(id, !isPublished);
      
      // Update the event in all relevant lists
      const newStatus = isPublished ? 'DRAFT' : 'PUBLISHED';
      setAllEvents(prev => prev.map(event => 
        event.id === id ? { ...event, status: newStatus } : event
      ));
      
      // If unpublishing a featured event, remove it from featured list
      if (isPublished) {
        setFeaturedEvents(prev => prev.filter(event => event.id !== id));
      }
      
      alert(`Event ${action}ed successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} event:`, error);
      alert(`Failed to ${action} event`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg mr-3"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Ultimate Admin Dashboard</h1>
          </div>
          <p className="text-purple-100">Manage applications and event approvals</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('adminRequests')}
              className={`flex-1 py-4 px-3 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'adminRequests' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              Admin Requests ({applications.length})
              {activeTab === 'adminRequests' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-4 px-3 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'events' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              Pending Events ({pendingEvents.length})
              {activeTab === 'events' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex-1 py-4 px-3 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'featured' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Star className={`w-4 h-4 ${activeTab === 'featured' ? 'fill-blue-600' : ''}`} />
                Banner ({featuredEvents.length})
              </div>
              {activeTab === 'featured' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('allEvents')}
              className={`flex-1 py-4 px-3 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'allEvents' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              All Events ({allEvents.length})
              {activeTab === 'allEvents' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Admin Requests Tab */}
            {activeTab === 'adminRequests' && (
              <div>
                {/* Status Filter */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={applicationStatusFilter}
                    onChange={(e) => setApplicationStatusFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {applications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No admin applications found</p>
                    </div>
                  ) : (
                    applications.map((app) => (
                      <div key={app.id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {app.user?.fullName}
                            </h3>
                            <p className="text-sm text-gray-600">{app.user?.email}</p>
                            {app.user?.isStudent && app.user?.collegeName && (
                              <p className="text-sm text-gray-500">
                                Student at {app.user?.collegeName}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Applied: {app.createdAt ? new Date(typeof app.createdAt === 'string' ? app.createdAt : (app.createdAt as any).seconds * 1000).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Motivation:</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                            {app.motivationText}
                          </p>
                        </div>

                        {app.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReviewApplication(app.id, 'APPROVED')}
                              className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                            >
                              <Check className="w-5 h-5 mr-2" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewApplication(app.id, 'REJECTED')}
                              className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5 mr-2" />
                              Reject
                            </button>
                          </div>
                        )}

                        {app.status !== 'PENDING' && app.reviewedAt && (
                          <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
                            Reviewed on: {new Date(typeof app.reviewedAt === 'string' ? app.reviewedAt : (app.reviewedAt as any).seconds * 1000).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                {pendingEvents.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending events</p>
                  </div>
                ) : (
                  pendingEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                              {event.primaryCategory.name}
                            </span>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                              Pending Approval
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            By {event.createdBy.fullName} ({event.createdBy.email})
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Location:</span> {event.location}, {event.district}
                        </p>
                        <p className="text-gray-700 line-clamp-3">{event.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:border-gray-400 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleReviewEvent(event.id, 'PUBLISHED')}
                          className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                        >
                          <Check className="w-5 h-5 mr-2" />
                          Publish
                        </button>
                        <button
                          onClick={() => handleReviewEvent(event.id, 'REJECTED')}
                          className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Featured Events Tab */}
            {activeTab === 'featured' && (
              <div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Banner Slider Management</h3>
                      <p className="text-sm text-gray-700">
                        These events are featured in the banner slider on the home page. They are displayed in an auto-rotating carousel with images. You can add or remove events from the banner using the Feature/Unfeature buttons.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {featuredEvents.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2 font-medium">No featured events</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Go to "All Events" tab and click "Feature" on published events to add them to the banner
                      </p>
                      <button
                        onClick={() => setActiveTab('allEvents')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Browse All Events
                      </button>
                    </div>
                  ) : (
                    featuredEvents.map((event: any, index: number) => (
                      <div key={event.id} className="bg-white rounded-lg shadow-sm p-6 border-2 border-yellow-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">
                                #{index + 1} in Banner
                              </span>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {event.title}
                              </h3>
                              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                {event.status}
                              </span>
                              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                {event.primaryCategory?.name || 'N/A'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              By {event.createdBy?.fullName || 'Unknown'} ({event.createdBy?.email || 'N/A'})
                            </p>
                          </div>
                        </div>

                        {event.bannerUrl && (
                          <div className="mb-4">
                            <img 
                              src={event.bannerUrl} 
                              alt={event.title}
                              className="w-full h-32 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="mb-4 space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Location:</span> {event.location}, {event.district}
                          </p>
                          <p className="text-gray-700 line-clamp-2">{event.description}</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => navigate(`/event/${event.id}`)}
                            className="flex-1 min-w-[120px] border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:border-gray-400 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleEditEvent(event.id)}
                            className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                          >
                            Edit Event
                          </button>
                          <button
                            onClick={() => handleTogglePublish(event.id, event.status)}
                            className="flex-1 min-w-[120px] bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors"
                          >
                            Unpublish
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(event.id, true)}
                            className="flex-1 min-w-[120px] bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remove from Banner
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* All Events Tab */}
            {activeTab === 'allEvents' && (
              <div>
                {/* Status Filter */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Statuses</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {allEvents.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No events found</p>
                    </div>
                  ) : (
                    allEvents.map((event: any) => (
                      <div key={event.id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {event.title}
                              </h3>
                              {event.isFeatured && (
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-3 py-1 rounded-full ${
                                event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                event.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-700' :
                                event.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                event.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {event.status}
                              </span>
                              {event.isFeatured && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                                  Featured in Banner
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              By {event.createdBy?.fullName || 'Unknown'} ({event.createdBy?.email || 'N/A'})
                            </p>
                          </div>
                        </div>

                        <div className="mb-4 space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Location:</span> {event.location}, {event.district}
                          </p>
                          <p className="text-gray-700 line-clamp-2">{event.description}</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => navigate(`/event/${event.id}`)}
                            className="flex-1 min-w-[100px] border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:border-gray-400 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditEvent(event.id)}
                            className="flex-1 min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          
                          {/* Publish/Unpublish Button */}
                          {(event.status === 'PUBLISHED' || event.status === 'DRAFT' || event.status === 'REJECTED') && (
                            <button
                              onClick={() => handleTogglePublish(event.id, event.status)}
                              className={`flex-1 min-w-[100px] ${
                                event.status === 'PUBLISHED'
                                  ? 'bg-orange-600 hover:bg-orange-700'
                                  : 'bg-green-600 hover:bg-green-700'
                              } text-white py-2 rounded-lg transition-colors`}
                            >
                              {event.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            </button>
                          )}
                          
                          {/* Feature/Unfeature Button */}
                          {event.status === 'PUBLISHED' && (
                            <button
                              onClick={() => handleToggleFeatured(event.id, event.isFeatured || false)}
                              className={`flex-1 min-w-[100px] ${
                                event.isFeatured 
                                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                                  : 'bg-purple-600 hover:bg-purple-700'
                              } text-white py-2 rounded-lg transition-colors flex items-center justify-center`}
                            >
                              <Star className={`w-4 h-4 mr-1 ${event.isFeatured ? 'fill-white' : ''}`} />
                              {event.isFeatured ? 'Unfeature' : 'Feature'}
                            </button>
                          )}
                          
                          {/* Approve/Reject for Pending */}
                          {event.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => handleReviewEvent(event.id, 'PUBLISHED')}
                                className="flex-1 min-w-[100px] bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReviewEvent(event.id, 'REJECTED')}
                                className="flex-1 min-w-[100px] bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="flex-1 min-w-[100px] bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
