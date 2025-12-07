import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { AdminApplication, Event } from '../types';
import { ArrowLeft, Check, X, Calendar } from 'lucide-react';

export const UltimateAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'applications' | 'events'>('applications');
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsData, eventsData] = await Promise.all([
        adminAPI.getApplications('PENDING'),
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
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-4 font-medium transition-colors relative ${
                activeTab === 'applications' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              Applications ({applications.length})
              {activeTab === 'applications' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-4 font-medium transition-colors relative ${
                activeTab === 'events' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              Pending Events ({pendingEvents.length})
              {activeTab === 'events' && (
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
            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending applications</p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {app.user?.fullName}
                          </h3>
                          <p className="text-sm text-gray-600">{app.user?.email}</p>
                          {app.user?.collegeName && (
                            <p className="text-sm text-gray-500">{app.user?.collegeName}</p>
                          )}
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                          Pending
                        </span>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Motivation:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {app.motivationText}
                        </p>
                      </div>

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
                    </div>
                  ))
                )}
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
          </>
        )}
      </div>
    </div>
  );
};
