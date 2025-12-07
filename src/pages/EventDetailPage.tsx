import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventAPI } from '../lib/api';
import { mockCategories } from '../lib/firestore';
import { Event } from '../types';
import { ArrowLeft, MapPin, Calendar, Users, Heart, ExternalLink, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        const data = await eventAPI.getEvent(id);
        setEvent(data.event);

        // Check interactions
        const interactions = await eventAPI.checkInteractions([id]);
        setIsLiked(interactions.likedEventIds.includes(id));
        setIsRegistered(interactions.registeredEventIds.includes(id));
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    try {
      await eventAPI.likeEvent(id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to like event:', error);
    }
  };

  const handleRegister = async () => {
    if (!id) return;
    try {
      if (event?.externalRegistrationLink) {
        window.open(event.externalRegistrationLink, '_blank');
      }
      
      if (!isRegistered) {
        await eventAPI.registerEvent(id);
        setIsRegistered(true);
        alert('Successfully registered for the event!');
      }
    } catch (error: any) {
      console.error('Failed to register:', error);
      alert(error.response?.data?.error || 'Failed to register');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Event not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return `${date.toLocaleDateString('en-US', options)} at ${timeStr}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto p-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Event Details</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Banner */}
        <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden mb-6">
          {event.bannerUrl ? (
            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-white text-4xl font-bold">
              {event.title.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Category & Status */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
              {event.primaryCategory?.name || mockCategories.find(c => c.id === (event as any).primaryCategoryId)?.name || 'Event'}
            </span>
            {(event as any).additionalCategoryIds?.map((catId: string) => {
              const category = mockCategories.find(c => c.id === catId);
              return category ? (
                <span key={catId} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {category.name}
                </span>
              ) : null;
            })}
            {(event as any).customCategories?.map((catName: string, idx: number) => (
              <span key={`custom-${idx}`} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {catName}
              </span>
            ))}
            {event.isFree && (
              <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                Free Entry
              </span>
            )}
            {isRegistered && (
              <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-medium">
                Applied
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

          {/* Meta Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start text-gray-700">
              <Calendar className="w-5 h-5 mr-3 mt-0.5 text-blue-600" />
              <span>{formatDate(event.date, event.time)}</span>
            </div>
            <div className="flex items-start text-gray-700">
              <MapPin className="w-5 h-5 mr-3 mt-0.5 text-blue-600" />
              <div>
                <p>{event.location}</p>
                <p className="text-sm text-gray-500">{event.district}</p>
                {event.googleMapsLink && (
                  <a
                    href={event.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline inline-flex items-center mt-1"
                  >
                    View on Google Maps <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
            {event._count && (
              <div className="flex items-center text-gray-700">
                <Users className="w-5 h-5 mr-3 text-blue-600" />
                <span>{event._count.registrations} people registered</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>

          {/* Entry Fee */}
          {!event.isFree && event.entryFee && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Entry Fee</h2>
              <p className="text-gray-700">{event.entryFee}</p>
            </div>
          )}

          {/* Prizes */}
          {event.prizeDetails && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Prizes</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.prizeDetails}</p>
            </div>
          )}

          {/* Contact */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <Mail className="w-5 h-5 mr-3 text-blue-600" />
                <a href={`mailto:${event.contactEmail}`} className="hover:text-blue-600">
                  {event.contactEmail}
                </a>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-5 h-5 mr-3 text-blue-600" />
                <a href={`tel:${event.contactPhone}`} className="hover:text-blue-600">
                  {event.contactPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Social Media */}
          {(event.instagramUrl || event.facebookUrl || event.youtubeUrl) && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Follow Us</h2>
              <div className="flex gap-3">
                {event.instagramUrl && (
                  <a
                    href={event.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
                {event.facebookUrl && (
                  <a
                    href={event.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                )}
                {event.youtubeUrl && (
                  <a
                    href={event.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <Youtube className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Organizer */}
          <div className="pt-6 border-t">
            <p className="text-sm text-gray-600">
              Organized by <span className="font-medium text-gray-900">{event.createdBy.fullName}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center justify-center px-6 py-3 rounded-lg border-2 transition-colors ${
              isLiked
                ? 'border-red-500 bg-red-50 text-red-600'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-red-600' : ''}`} />
            {isLiked ? 'Liked' : 'Like'}
          </button>
          <button
            onClick={handleRegister}
            disabled={isRegistered && !event.externalRegistrationLink}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isRegistered ? 'Already Registered' : 'Register Now'}
            {event.externalRegistrationLink && <ExternalLink className="w-4 h-4 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
};
