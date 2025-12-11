import React, { useState, useEffect } from 'react';
import { eventAPI } from '../lib/api';
import { Download, Users, Search } from 'lucide-react';

interface RegistrationResponse {
  id: string;
  registrationId: string;
  eventId: string;
  userId: string;
  questionId: string;
  answer: string;
  questionText?: string;
}

interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registrationType: 'EXTERNAL' | 'FORM';
  userName: string;
  userEmail: string;
  createdAt: string;
  formResponses: RegistrationResponse[];
}

interface RegistrationManagementProps {
  eventId: string;
  eventTitle: string;
}

export const RegistrationManagement: React.FC<RegistrationManagementProps> = ({
  eventId,
  eventTitle,
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRegistration, setExpandedRegistration] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const data = await eventAPI.getEventRegistrations(eventId);
        setRegistrations(data.registrations || []);
      } catch (error) {
        console.error('Failed to fetch registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [eventId]);

  const filteredRegistrations = registrations.filter(
    reg =>
      reg.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formRegistrations = registrations.filter(r => r.registrationType === 'FORM');
  const externalRegistrations = registrations.filter(r => r.registrationType === 'EXTERNAL');

  const exportToCSV = () => {
    if (formRegistrations.length === 0) {
      alert('No form registrations to export');
      return;
    }

    // Collect all unique question IDs
    const allQuestionIds = new Set<string>();
    formRegistrations.forEach(reg => {
      reg.formResponses.forEach(resp => {
        allQuestionIds.add(resp.questionId);
      });
    });

    // Create CSV headers
    const headers = ['Name', 'Email', 'Registration Date', ...Array.from(allQuestionIds)];

    // Create CSV rows
    const rows = formRegistrations.map(reg => {
      const questionMap: Record<string, string> = {};
      reg.formResponses.forEach(resp => {
        questionMap[resp.questionId] = resp.answer || '';
      });

      return [
        reg.userName,
        reg.userEmail,
        new Date(reg.createdAt).toLocaleDateString(),
        ...Array.from(allQuestionIds).map(qid => questionMap[qid] || ''),
      ];
    });

    // Generate CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          const cellStr = String(cell);
          // Escape quotes and wrap in quotes if contains comma
          return cellStr.includes(',') || cellStr.includes('"')
            ? `"${cellStr.replace(/"/g, '""')}"`
            : cellStr;
        }).join(',')
      ),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle}-registrations.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Management</h2>
          <p className="text-gray-600 text-sm mt-1">{eventTitle}</p>
        </div>
        {formRegistrations.length > 0 && (
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Form Registrations</p>
              <p className="text-3xl font-bold text-blue-900">{formRegistrations.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">External Registrations</p>
              <p className="text-3xl font-bold text-purple-900">{externalRegistrations.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search */}
      {registrations.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {registrations.length === 0 ? 'No registrations yet' : 'No registrations matching your search'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRegistrations.map(registration => (
            <div
              key={registration.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() =>
                  setExpandedRegistration(
                    expandedRegistration === registration.id ? null : registration.id
                  )
                }
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{registration.userName}</p>
                  <p className="text-sm text-gray-600">{registration.userEmail}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Registered: {new Date(registration.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      registration.registrationType === 'FORM'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {registration.registrationType === 'FORM' ? 'Form' : 'External'}
                  </span>
                  <span className={`text-gray-500 transition-transform ${expandedRegistration === registration.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedRegistration === registration.id && registration.formResponses.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                  {registration.formResponses.map((response, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Question</p>
                      <p className="text-sm text-gray-700 mb-2">{response.questionText || `Question ${response.questionId}`}</p>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Answer</p>
                      <p className="text-sm text-gray-900">{response.answer || '-'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
