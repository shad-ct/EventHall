import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventAPI } from '../lib/api';
import { mockCategories } from '../lib/firestore';
import { Event, RegistrationFormQuestion } from '../types';
import { RegistrationFormModal } from '../components/RegistrationFormModal';
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
  Maximize2,
  X,
  Share2,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id, program, event: eventParam } = useParams<{ id?: string; program?: string; event?: string }>();
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);
  useEffect(() => {
    // Show back button if history length > 1 (user navigated from anywhere, including this site)
    setCanGoBack(window.history.length > 1);
  }, []);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [posterIndex, setPosterIndex] = useState(0);
  const [showFullPoster, setShowFullPoster] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationFormQuestions, setRegistrationFormQuestions] = useState<RegistrationFormQuestion[]>([]);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      const useId = id || eventParam;
      try {
        let data: any = null;
        if (program && eventParam) {
          // Fetch event by program + event id
          data = await eventAPI.getProgramEvent(decodeURIComponent(program), decodeURIComponent(eventParam));
        } else if (useId) {
          data = await eventAPI.getEvent(useId as string);
        } else {
          setLoading(false);
          return;
        }

        setEvent(data.event);

        // Check interactions
        const interactions = await eventAPI.checkInteractions([data.event.id]);
        setIsLiked(interactions.likedEventIds.includes(data.event.id));
        setIsRegistered(interactions.registeredEventIds.includes(data.event.id));

        // If event uses form method, fetch registration form questions
        if (data.event?.registrationMethod === 'FORM') {
          try {
            const formData = await eventAPI.getRegistrationForm(data.event.id);
            setRegistrationFormQuestions(formData.questions || []);
          } catch (error) {
            console.error('Failed to fetch registration form:', error);
          }
        }
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

  const updateRegistrationCount = (delta: number) => {
    setEvent((prev) => {
      if (!prev) return prev;
      const counts = prev._count || { likes: 0, registrations: 0 };
      return {
        ...prev,
        _count: {
          ...counts,
          registrations: Math.max(0, counts.registrations + delta),
        },
      };
    });
  };

  const handleRegistrationSubmit = async (responses: any[]) => {
    if (!id) return;

    setRegistrationLoading(true);
    try {
      await eventAPI.registerEventWithForm(id, responses);
      setIsRegistered(true);
      updateRegistrationCount(1);
      setShowRegistrationForm(false);
      alert('Successfully registered for the event!');
    } catch (error) {
      console.error('Failed to register:', error);
      alert('Failed to register. Please try again.');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!id) return;
    try {
      if (!isRegistered) {
        // If event uses form method and we haven't loaded form questions, fetch them
        if (event?.registrationMethod === 'FORM') {
          if (registrationFormQuestions.length === 0) {
            try {
              const formData = await eventAPI.getRegistrationForm(id);
              setRegistrationFormQuestions(formData.questions || []);
            } catch (error) {
              console.error('Failed to fetch registration form:', error);
            }
          }
          setShowRegistrationForm(true);
        } else if (event?.externalRegistrationLink) {
          // External registration - open link but DON'T track in profile
          window.open(event.externalRegistrationLink, '_blank');
          alert('Opening external registration link. Please complete registration on the external form.');
        } else {
          // No registration method specified, just do basic registration
          await eventAPI.registerEvent(id);
          setIsRegistered(true);
          updateRegistrationCount(1);
          alert('Successfully registered for the event!');
        }
      } else {
        await eventAPI.unregisterEvent(id);
        setIsRegistered(false);
        updateRegistrationCount(-1);
        alert('You have been unregistered from the event.');
      }
    } catch (error: any) {
      console.error('Failed to update registration:', error);
      alert(error.response?.data?.error || 'Failed to update registration');
    }
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr + 'T' + timeStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
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
    // Filter out any falsy values (null/undefined)
    return [primary, ...additional, ...legacyAdditional].filter(cat => cat && cat.name);
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
            onClick={() => navigate("/")}
            className="text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: event?.title || 'Event',
      text: `Check out this event: ${event?.title}`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Event link copied to clipboard!');
      } catch (err) {
        alert('Failed to copy link.');
      }
    }
  };

  // Back button handler with fallback
  const handleBack = () => {
    const referrer = document.referrer;
    const isInternalReferrer = referrer && referrer.startsWith(window.location.origin);
    if (window.history.length > 1 && isInternalReferrer) {
      navigate(-1);
    } else {
      navigate('/'); // fallback to homepage
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      <div className="max-w-4xl mx-auto p-4">

        {/* Banner */}

        <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden mb-6">

          {canGoBack && (
            <button onClick={handleBack}
              className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-2 shadow border border-gray-200 transition-colors group"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={handleShare}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 shadow border border-gray-200 transition-colors group"
            title="Share event link"
            aria-label="Share event link"
          >
            <Share2 className="w-5 h-5 text-blue-600" />
            <span className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 mt-2 pointer-events-none transition-opacity z-50" style={{ top: '100%' }}>Share</span>
          </button>
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
            {categories.length === 0 && (!Array.isArray((event as any).customCategories) || (event as any).customCategories.length === 0) ? (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700">Event</span>
            ) : (
              <>
                {categories.map((cat, idx) => (
                  cat && cat.name ? (
                    <span
                      key={`${cat.id || cat.slug}-${idx}`}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${idx === 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {cat.name}
                    </span>
                  ) : null
                ))}
                {Array.isArray((event as any).customCategories) && (event as any).customCategories.map((catName: string, idx: number) => (
                  typeof catName === 'string' && catName.trim() !== '' ? (
                    <span key={`custom-${idx}`} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                      {catName}
                    </span>
                  ) : null
                ))}
              </>
            )}
            {/* Only render customCategories if it exists and is an array */}
            {Array.isArray((event as any).customCategories) && (event as any).customCategories.map((catName: string, idx: number) => (
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
                    download={file.name || `Brochure ${idx + 1}`}
                    className="flex items-center justify-between bg-blue-50 border border-blue-100 hover:border-blue-200 px-4 py-3 rounded-lg transition-colors cursor-pointer"
                    onClick={(e) => {
                      // Allow default download behavior
                      e.stopPropagation();
                    }}
                  >
                    <div className="flex items-center gap-2 text-blue-800 font-medium">
                      <Download className="w-4 h-4" />
                      <span className="truncate">{file.name || `Brochure ${idx + 1}`}</span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Download</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Posters */}
          {event.posterImages && event.posterImages.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Event Posters</h2>
              <div className="relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <img
                  src={event.posterImages[posterIndex]?.url}
                  alt={event.posterImages[posterIndex]?.name || `Poster ${posterIndex + 1}`}
                  className="w-full h-full object-contain bg-white"
                />

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <a
                    href={event.posterImages[posterIndex]?.url}
                    download={event.posterImages[posterIndex]?.name || `Poster ${posterIndex + 1}`}
                    className="bg-white/90 hover:bg-white rounded-full p-2 shadow transition-colors"
                    title="Download poster"
                  >
                    <Download className="w-5 h-5 text-gray-700" />
                  </a>
                  <button
                    onClick={() => setShowFullPoster(true)}
                    className="bg-white/90 hover:bg-white rounded-full p-2 shadow transition-colors"
                    title="View fullscreen"
                  >
                    <Maximize2 className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                {event.posterImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setPosterIndex((prev) => (prev - 1 + (event?.posterImages?.length || 1)) % (event?.posterImages?.length || 1))}
                      className="absolute top-1/2 -translate-y-1/2 left-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPosterIndex((prev) => (prev + 1) % (event?.posterImages?.length || 1))}
                      className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {event.posterImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {event.posterImages.map((poster, idx) => (
                    <button
                      key={poster.url || idx}
                      onClick={() => setPosterIndex(idx)}
                      className={`border-2 rounded-md overflow-hidden flex-shrink-0 transition-all ${idx === posterIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      style={{ width: '100px', height: '100px' }}
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
              Organized by{' '}
              {event.createdBy?.program?.programName ? (
                <a
                  href={`/programs/${encodeURIComponent(event.createdBy.program.programName)}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {event.createdBy.program.programName}
                </a>
              ) : (
                <a
                  href={`/programs/${encodeURIComponent(event.createdBy.fullName)}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {event.createdBy.fullName}
                </a>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Poster Modal */}
      {showFullPoster && event.posterImages && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullPoster(false)}
        >
          <button
            onClick={() => setShowFullPoster(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={event.posterImages[posterIndex]?.url}
            alt={event.posterImages[posterIndex]?.name || `Poster ${posterIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {event.posterImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPosterIndex((prev) => (prev - 1 + (event?.posterImages?.length || 1)) % (event?.posterImages?.length || 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPosterIndex((prev) => (prev + 1) % (event?.posterImages?.length || 1));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Action Buttons - Sticky at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="max-w-4xl mx-auto p-4 flex gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center justify-center px-6 py-3 rounded-lg border-2 transition-colors ${isLiked
              ? 'border-red-500 bg-red-50 text-red-600'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
          >
            <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-red-600' : ''}`} />
            {isLiked ? 'Liked' : 'Like'}
          </button>
          <button
            onClick={handleRegister}
            className={`flex-1 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center text-white ${isRegistered
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isRegistered ? (
              <>
                Unregister
              </>
            ) : (
              <>
                {event?.registrationMethod === 'FORM' ? 'Fill Registration Form' : 'Register Now'}
                {event?.externalRegistrationLink && <ExternalLink className="w-4 h-4 ml-2" />}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Registration Form Modal */}
      {event && (
        <RegistrationFormModal
          isOpen={showRegistrationForm}
          eventTitle={event.title}
          questions={registrationFormQuestions}
          onSubmit={handleRegistrationSubmit}
          onCancel={() => setShowRegistrationForm(false)}
          isLoading={registrationLoading}
        />
      )}
    </div>
  );
};
