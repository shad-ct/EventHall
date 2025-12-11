import { useState, useEffect, useCallback, useRef } from 'react';
import { Event } from '../types';
import { Calendar, MapPin } from 'lucide-react';

interface BannerSliderProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ events, onEventClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  }, [events.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe(e.targetTouches.length === 0);
  };

  const handleSwipe = (isEnd: boolean) => {
    if (!isEnd || events.length <= 1) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
      setIsAutoPlaying(false);
    }
    if (isRightSwipe) {
      goToPrevious();
      setIsAutoPlaying(false);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || events.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, events.length]);

  if (events.length === 0) {
    return (
      <div className="h-[22vh] lg:h-80 mt-9 mb-3 mx-3 bg-gray-200 flex items-center justify-center text-gray-500 font-semibold rounded-lg">
        No featured events
      </div>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <div 
      className="relative h-[22vh] lg:h-80 mt-2 mb-3 mx-3 overflow-hidden rounded-lg shadow-lg group cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Image/Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: currentEvent.bannerUrl
            ? `url(${currentEvent.bannerUrl})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-8 sm:pb-6 p-3 sm:p-6 cursor-pointer" onClick={() => onEventClick(currentEvent.id)}>
        <h3 className="text-white text-lg sm:text-2xl font-bold mb-1 sm:mb-2 line-clamp-2 drop-shadow-lg">
          {currentEvent.title}
        </h3>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 text-white/90 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="line-clamp-1">{new Date(currentEvent.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="line-clamp-1 truncate">{currentEvent.location}</span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Removed, using swipe instead */}

      {/* Dots Indicator */}
      {events.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
