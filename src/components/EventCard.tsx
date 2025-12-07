import { Heart, MapPin, Calendar, Users } from 'lucide-react';
import { Event } from '../types';
import { eventAPI } from '../lib/api';
import { useState } from 'react';
import { mockCategories } from '../lib/firestore';

interface EventCardProps {
  event: Event;
  isLiked?: boolean;
  isRegistered?: boolean;
  onLikeToggle?: () => void;
  onClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isLiked = false,
  isRegistered = false,
  onLikeToggle,
  onClick,
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [liking, setLiking] = useState(false);

  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} • ${timeStr}`;
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (liking) return;
    
    setLiking(true);
    try {
      await eventAPI.likeEvent(event.id);
      setLiked(!liked);
      onLikeToggle?.();
    } catch (error) {
      console.error('Failed to like event:', error);
    } finally {
      setLiking(false);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow h-[420px] flex flex-col"
      onClick={onClick}
    >
      {/* Banner Image */}
      <div className="relative h-44 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden flex-shrink-0">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white text-xl font-bold">
            {event.title.substring(0, 2).toUpperCase()}
          </div>
        )}
        
        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          disabled={liking}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Applied Badge */}
        {isRegistered && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Applied
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Date & Time */}
        <div className="flex items-center text-xs text-gray-600 mb-2">
          <Calendar className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
          <span className="truncate">{formatDate(event.date, event.time)}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">{event.title}</h3>

        {/* Location */}
        <div className="flex items-start text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {/* Category & Stats */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium truncate max-w-[60%]">
            {event.primaryCategory?.name || mockCategories.find(c => c.id === (event as any).primaryCategoryId)?.name || 'Event'}
          </span>
          
          {event._count && (
            <div className="flex items-center text-xs text-gray-500">
              <Users className="w-3.5 h-3.5 mr-1" />
              {event._count.registrations}
            </div>
          )}
        </div>

        {/* Free/Paid Badge */}
        <div className="mt-auto">
          {event.isFree && (
            <span className="inline-block text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
              Free Entry
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
