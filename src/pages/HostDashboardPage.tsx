import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Calendar, Settings, BarChart3 } from 'lucide-react';
import { RegistrationManagement } from '../components/RegistrationManagement';

interface AdminSession {
  username: string;
  role: string;
  loginTime: string;
}

const HostDashboardPage = () => {
  const [adminData, setAdminData] = useState<AdminSession | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'registrations' | 'settings'>('users');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const session = localStorage.getItem('adminSession');
    if (!session) {
      navigate('/host');
      return;
    }
    setAdminData(JSON.parse(session));
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      // You can add actual API calls here to fetch real stats
      // For now, using mock data
      setStats({
        totalUsers: 45,
        totalEvents: 23,
        activeEvents: 8,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/host');
  };

  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Event Host Dashboard</h1>
              <p className="text-purple-100">
                Welcome, <span className="font-semibold">{adminData.username}</span> • <span className="uppercase text-xs tracking-wide">{adminData.role}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 border border-white/30"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            color="from-purple-600 to-purple-400"
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            color="from-blue-600 to-blue-400"
            icon={<Calendar className="w-6 h-6" />}
          />
          <StatCard
            title="Active Events"
            value={stats.activeEvents}
            color="from-pink-600 to-pink-400"
            icon={<BarChart3 className="w-6 h-6" />}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b">
            {(['users', 'events', 'registrations', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 font-medium transition-colors relative flex items-center justify-center gap-2 ${
                  activeTab === tab ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'users' && <Users className="w-5 h-5" />}
                {tab === 'events' && <Calendar className="w-5 h-5" />}
                {tab === 'registrations' && <BarChart3 className="w-5 h-5" />}
                {tab === 'settings' && <Settings className="w-5 h-5" />}
                <span className="capitalize">{tab}</span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
                <p className="text-gray-600 mb-6">Total registered users: <span className="font-bold text-lg">{stats.totalUsers}</span></p>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">User management interface coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Management</h2>
                <p className="text-gray-600 mb-6">Total events: <span className="font-bold text-lg">{stats.totalEvents}</span> • Active: <span className="font-bold text-green-600">{stats.activeEvents}</span></p>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Event management interface coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'registrations' && (
              <div>
                {!selectedEventId ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">View Registrations</h2>
                    <p className="text-gray-600 mb-6">Select an event to view and manage its registrations</p>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center py-12">
                      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Events with registrations will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setSelectedEventId(null)}
                      className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      ← Back to Event Selection
                    </button>
                    <RegistrationManagement
                      eventId={selectedEventId}
                      eventTitle={'Event'}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Host Settings</h2>
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200 mb-6">
                  <div className="space-y-3">
                    <p className="text-gray-700"><span className="font-semibold">Host User:</span> {adminData.username}</p>
                    <p className="text-gray-700"><span className="font-semibold">Role:</span> <span className="inline-block px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">{adminData.role}</span></p>
                    <p className="text-gray-700"><span className="font-semibold">Login Time:</span> {new Date(adminData.loginTime).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  color: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, color, icon }: StatCardProps) => {
  return (
    <div className={`bg-gradient-to-br ${color} text-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <div className="text-white/40">{icon}</div>
      </div>
    </div>
  );
};

export default HostDashboardPage;
