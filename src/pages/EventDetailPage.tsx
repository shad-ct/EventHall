import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventAPI } from '../lib/api';
import { mockCategories } from '../lib/firestore';
import { Event } from '../types';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Heart,
  ExternalLink,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Github,
  Globe,
  Link as LinkIcon,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [posterIndex, setPosterIndex] = useState(0);

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

  useEffect(() => {
    setPosterIndex(0);
  }, [event?.posterImages?.length]);

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

  const categories = useMemo(() => {
    if (!event) return [] as any[];

    const primary = event.primaryCategory
      ? event.primaryCategory
      : (event as any).primaryCategoryId
        ? mockCategories.find((c) => c.id === (event as any).primaryCategoryId)
        : null;

    const additional = event.additionalCategories?.map((ac) => ac.category) || [];
    const legacyAdditional = ((event as any).additionalCategoryIds || []).map((catId: string) =>
      mockCategories.find((c) => c.id === catId)
    );
    return [primary, ...additional, ...legacyAdditional].filter(Boolean);
  }, [event]);

  const parseSocialLink = (url?: string) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, '');
      const pathPart = parsed.pathname.replace(/^\//, '').split('/')[0] || host;

      let Icon = Globe;
      if (host.includes('instagram')) Icon = Instagram;
      else if (host.includes('facebook')) Icon = Facebook;
      else if (host.includes('youtube')) Icon = Youtube;
      else if (host.includes('linkedin')) Icon = Linkedin;
      else if (host.includes('github')) Icon = Github;

      return {
        url,
        domain: host,
        display: pathPart,
        Icon,
      };
    } catch (err) {
      return null;
    }
  };

  const socialLinks = useMemo(() => {
    const rawLinks = [
      event?.instagramUrl,
      event?.facebookUrl,
      event?.youtubeUrl,
      ...(event?.socialLinks?.map((l) => l.url) || []),
    ].filter(Boolean) as string[];

    const unique = Array.from(new Set(rawLinks));
    return unique
      .map((url) => parseSocialLink(url))
      .filter(Boolean) as Array<{ url: string; domain: string; display: string; Icon: any }>;
  }, [event]);

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
            {categories.length === 0 ? (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700">Event</span>
            ) : (
              categories.map((cat, idx) => (
                <span
                  key={`${cat.id || cat.slug}-${idx}`}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${idx === 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  {cat.name}
                </span>
              ))
            )}
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

          {/* Brochures */}
          {event.brochureFiles && event.brochureFiles.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Brochures</h2>
              <div className="space-y-2">
                {event.brochureFiles.map((file, idx) => (
                  <a
                    key={file.url || idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-blue-50 border border-blue-100 hover:border-blue-200 px-4 py-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2 text-blue-800 font-medium">
                      <Download className="w-4 h-4" />
                      <span className="truncate">{file.name || `Brochure ${idx + 1}`}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Posters */}
          {event.posterImages && event.posterImages.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Event Posters</h2>
              <div className="relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={event.posterImages[posterIndex]?.url}
                  alt={event.posterImages[posterIndex]?.name || `Poster ${posterIndex + 1}`}
                  className="w-full max-h-[360px] object-contain bg-white"
                />

                {event.posterImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setPosterIndex((prev) => (prev - 1 + event.posterImages.length) % event.posterImages.length)}
                      className="absolute top-1/2 -translate-y-1/2 left-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPosterIndex((prev) => (prev + 1) % event.posterImages.length)}
                      className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {event.posterImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {event.posterImages.map((poster, idx) => (
                    <button
                      key={poster.url || idx}
                      onClick={() => setPosterIndex(idx)}
                      className={`border rounded-md overflow-hidden w-20 h-16 flex-shrink-0 ${idx === posterIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-200'}`}
                    >
                      <img src={poster.url} alt={poster.name || `Poster ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
          {socialLinks.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Social Links</h2>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ url, domain, display, Icon }) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-blue-600" />
                    <div className="text-sm text-left">
                      <div className="font-semibold text-gray-900">{domain}</div>
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        <span className="truncate max-w-[160px]">{display}</span>
                      </div>
                    </div>
                  </a>
                ))}
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
