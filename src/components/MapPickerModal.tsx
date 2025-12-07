import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Navigation, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: { address: string; coordinates: { lat: number; lng: number } }) => void;
}

interface SearchResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
}

export function MapPickerModal({ isOpen, onClose, onSelect }: MapPickerModalProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressName, setAddressName] = useState('');
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Default coordinates (center of India)
  const DEFAULT_LAT = 20.5937;
  const DEFAULT_LNG = 78.9629;

  useEffect(() => {
    if (!isOpen || !mapContainer) return;

    // Initialize map only once
    if (mapRef.current) return;

    try {
      const map = L.map(mapContainer).setView([DEFAULT_LAT, DEFAULT_LNG], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add marker on map click
      const onMapClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setSelectedCoords({ lat, lng });

        // Remove old marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker
        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            shadowSize: [41, 41],
            iconAnchor: [12, 41],
            shadowAnchor: [12, 41],
            popupAnchor: [1, -34],
          }),
        })
          .bindPopup(`<div class="text-sm font-medium">📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>`)
          .addTo(map)
          .openPopup();

        markerRef.current = marker;

        // Fetch address from coordinates
        reverseGeocode(lat, lng);
      };

      map.on('click', onMapClick);
      mapRef.current = map;

      // Cleanup on unmount
      return () => {
        map.off('click', onMapClick);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [isOpen, mapContainer]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setAddressName(data.address?.city || data.address?.town || data.address?.county || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } catch (error) {
      console.error('Failed to fetch address:', error);
      setAddressName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPlace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`
      );
      const data = await response.json();
      const results: SearchResult[] = data.map((item: any) => ({
        id: item.osm_id,
        name: item.name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.display_name,
      }));
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    const coords = { lat: result.lat, lng: result.lon };
    setSelectedCoords(coords);
    setAddressName(result.name);
    setSearchQuery('');
    setShowSearchResults(false);

    if (mapRef.current) {
      mapRef.current.setView([result.lat, result.lon], 16);

      // Remove old marker
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }

      // Add new marker
      const marker = L.marker([result.lat, result.lon], {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          shadowSize: [41, 41],
          iconAnchor: [12, 41],
          shadowAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
      })
        .bindPopup(`<div class="text-sm font-medium">📍 ${result.name}</div>`)
        .addTo(mapRef.current)
        .openPopup();

      markerRef.current = marker;
    }
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          setSelectedCoords(coords);

          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 16);

            // Remove old marker
            if (markerRef.current) {
              mapRef.current.removeLayer(markerRef.current);
            }

            // Add new marker
            const marker = L.marker([latitude, longitude], {
              icon: L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                shadowSize: [41, 41],
                iconAnchor: [12, 41],
                shadowAnchor: [12, 41],
                popupAnchor: [1, -34],
              }),
            })
              .bindPopup(`<div class="text-sm font-medium">📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>`)
              .addTo(mapRef.current)
              .openPopup();

            markerRef.current = marker;
          }

          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to access your location. Please enable location services.');
        }
      );
    }
  };

  const handleSelectLocation = () => {
    if (!selectedCoords) {
      alert('Please select a location on the map');
      return;
    }

    const address = addressName || `${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)}`;
    onSelect({
      address,
      coordinates: selectedCoords,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Select Event Location</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-white relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchPlace}
              placeholder="Search for a place... (e.g., 'Taj Mahal', 'Central Park', etc.)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchLoading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <p className="font-medium text-gray-900">{result.name}</p>
                  <p className="text-xs text-gray-600 truncate">{result.address}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Map Container */}
          <div
            ref={setMapContainer}
            className="flex-1 w-full min-h-96 bg-gray-100"
            id="map-container"
          />

          {/* Info and Controls */}
          <div className="p-6 border-t border-gray-200 space-y-4 bg-gray-50">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">
                    {selectedCoords
                      ? `📍 ${addressName || 'Loading address...'}`
                      : 'Click on the map to pin your event location'}
                  </p>
                  {selectedCoords && (
                    <p className="text-sm text-blue-700 mt-1">
                      Coordinates: {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Use My Location
              </button>
              <button
                type="button"
                onClick={handleSelectLocation}
                disabled={!selectedCoords}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'Loading...' : 'Confirm Location'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
