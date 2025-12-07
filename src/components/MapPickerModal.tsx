import { useState } from 'react';
import { X, MapPin } from 'lucide-react';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: { address: string; coordinates?: { lat: number; lng: number } }) => void;
  currentLink?: string;
}

export function MapPickerModal({ isOpen, onClose, onSelect, currentLink = '' }: MapPickerModalProps) {
  const [mapLink, setMapLink] = useState(currentLink);
  const [manualAddress, setManualAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'link' | 'address'>('link');

  if (!isOpen) return null;

  const handleSelectLink = () => {
    if (mapLink.trim()) {
      onSelect({ address: mapLink, coordinates: undefined });
      onClose();
    }
  };

  const handleSelectAddress = () => {
    if (manualAddress.trim()) {
      onSelect({ address: manualAddress, coordinates: undefined });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Select Location</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('link')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'link'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Google Maps Link
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'address'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Manual Address
            </button>
          </div>

          {/* Link Tab */}
          {activeTab === 'link' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Google Maps Link
                </label>
                <textarea
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  placeholder="Paste your Google Maps link here&#10;Example: https://maps.google.com/?q=venue+address"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1. Open Google Maps
                </p>
                <p className="text-xs text-gray-500">
                  2. Search for your venue
                </p>
                <p className="text-xs text-gray-500">
                  3. Click the location name at bottom to see full details
                </p>
                <p className="text-xs text-gray-500">
                  4. Copy the URL from address bar
                </p>
              </div>
              <button
                onClick={handleSelectLink}
                disabled={!mapLink.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Use This Location
              </button>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Address
                </label>
                <textarea
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Enter full event address&#10;Example: 123 Main Street, New York, NY 10001"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include street, city, state, and postal code for better clarity
                </p>
              </div>
              <button
                onClick={handleSelectAddress}
                disabled={!manualAddress.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Use This Address
              </button>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Tip:</strong> You can paste either a Google Maps link or type the complete address. Both will be saved for attendees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
