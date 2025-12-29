import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventAPI, adminAPI } from '../lib/api';
import { Event } from '../types';
import { ArrowLeft, Edit, Users, CheckCircle, XCircle, Clock, Mail, Phone, Calendar, MapPin, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { DesktopNav } from '../components/DesktopNav';

interface Registration {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  responses?: Array<{
    questionText: string;
    answer: string;
  }>;
}

export const EventManagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations'>('overview');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventData();
    }
  }, [id]);

  const fetchEventData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const eventData = await eventAPI.getEvent(id);
      setEvent(eventData.event);

      // Fetch registrations if event uses form registration
      if (eventData.event.registrationMethod === 'FORM') {
        try {
          const regData = await eventAPI.getEventRegistrations(id);
          console.log('Registration data:', regData);
          // Transform the data to match our interface
          const transformedRegistrations = regData.registrations.map((reg: any) => ({
            id: reg.id,
            userId: reg.userId,
            userName: reg.userName || 'Unknown User',
            userEmail: reg.userEmail || '',
            registeredAt: reg.registeredAt || reg.createdAt,
            status: reg.status || 'PENDING',
            responses: reg.formResponses?.map((fr: any) => ({
              questionText: fr.questionText,
              answer: fr.answer,
            })) || [],
          }));
          console.log('Transformed registrations:', transformedRegistrations);
          setRegistrations(transformedRegistrations);
        } catch (error) {
          console.error('Failed to fetch registrations:', error);
          setRegistrations([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    try {
      await eventAPI.updateRegistrationStatus(registrationId, 'APPROVED');
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId ? { ...reg, status: 'APPROVED' } : reg
        )
      );
    } catch (error) {
      console.error('Failed to approve registration:', error);
      alert('Failed to approve registration');
    }
  };

  const handleReject = async (registrationId: string) => {
    try {
      await eventAPI.updateRegistrationStatus(registrationId, 'REJECTED');
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId ? { ...reg, status: 'REJECTED' } : reg
        )
      );
    } catch (error) {
      console.error('Failed to reject registration:', error);
      alert('Failed to reject registration');
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations to export');
      return;
    }

    // Collect all unique question texts
    const allQuestions = new Set<string>();
    registrations.forEach(reg => {
      reg.responses?.forEach(resp => allQuestions.add(resp.questionText));
    });
    const questionHeaders = Array.from(allQuestions);

    // Create CSV header
    const headers = ['Name', 'Email', 'Status', 'Registered Date', ...questionHeaders];
    
    // Create CSV rows
    const rows = registrations.map(reg => {
      const responseMap = new Map(
        reg.responses?.map(r => [r.questionText, r.answer]) || []
      );
      
      return [
        reg.userName,
        reg.userEmail,
        reg.status,
        new Date(reg.registeredAt).toLocaleDateString(),
        ...questionHeaders.map(q => responseMap.get(q) || '')
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${event?.title || 'event'}_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteEvent = async () => {
    if (!id) return;
    const confirmed = window.confirm('Are you sure you want to permanently delete this event? This cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(true);
      await adminAPI.deleteEvent(id);
      navigate('/host/events');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      APPROVED: 'bg-green-100 text-green-700 border-green-300',
      REJECTED: 'bg-red-100 text-red-700 border-red-300',
    };

    return (
      <span className={`text-xs px-3 py-1 rounded-full font-medium border ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const registrationStats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'PENDING').length,
    approved: registrations.filter(r => r.status === 'APPROVED').length,
    rejected: registrations.filter(r => r.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
          <button
            onClick={() => navigate('/host/events')}
            className="text-blue-600 hover:underline"
          >
            Go back to events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      <DesktopNav />

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center flex-1">
              <button
                onClick={() => navigate('/host/events')}
                className="p-2 hover:bg-gray-100 rounded-lg mr-3"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold truncate">{event.title}</h1>
                <p className="text-sm text-gray-600">Manage your event</p>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              {registrations.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  title="Export registrations to CSV"
                >
                  <Download className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </button>
              )}
              <button
                onClick={() => navigate(`/host/events/edit/${id}`)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Edit Event</span>
                <span className="sm:hidden">Edit</span>
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={deleting}
                className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                title="Delete event permanently"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Delete Event'}</span>
                <span className="sm:hidden">Del</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'registrations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Registrations
              {registrationStats.pending > 0 && (
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {registrationStats.pending}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{registrationStats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{registrationStats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{registrationStats.approved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{registrationStats.rejected}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Event Details</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium text-gray-900">{event.date} at {event.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{event.location}</p>
                    <p className="text-sm text-gray-600">{event.district}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium text-gray-900">{event.contactEmail}</p>
                  </div>
                </div>
                {event.contactPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{event.contactPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {registrations.length === 0 ? (
              <div className="bg-white p-12 rounded-lg border text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No registrations yet</h3>
                <p className="text-gray-600">Registrations will appear here once users sign up</p>
              </div>
            ) : (
              registrations.map((registration) => (
                <div key={registration.id} className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{registration.userName}</h3>
                      <p className="text-sm text-gray-600">{registration.userEmail}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Registered on {new Date(registration.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(registration.status)}
                    </div>
                  </div>

                  {/* Form Responses */}
                  {registration.responses && registration.responses.length > 0 && (
                    <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 border-b border-blue-700">
                        <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4" />
                          Registration Form Responses
                        </h4>
                      </div>
                      <div className="bg-white">
                        {registration.responses.map((response, idx) => (
                          <div key={idx} className="border-b border-gray-100 last:border-0">
                            <div className="px-4 py-2 bg-gray-50">
                              <div className="flex items-start gap-2">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                  Question:
                                </p>
                              </div>
                              <p className="text-sm text-gray-900 font-medium ml-3.5 mt-1">
                                {response.questionText}
                              </p>
                            </div>
                            <div className="px-4 py-3 bg-white">
                              <div className="flex items-start gap-2">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0"></div>
                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                  Answer:
                                </p>
                              </div>
                              <p className="text-base text-gray-900 ml-3.5 mt-1 break-words">
                                {response.answer || <span className="text-gray-400 italic">No answer provided</span>}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {registration.status === 'PENDING' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(registration.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(registration.id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};
