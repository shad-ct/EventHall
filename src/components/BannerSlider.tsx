import { useState, useEffect, useCallback } from 'react';
import { Event } from '../types';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';

interface BannerSliderProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ events, onEventClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
      <div className="h-[22vh] mt-9 mb-3 mx-3 bg-gray-200 flex items-center justify-center text-gray-500 font-semibold rounded-lg">
        No featured events
      </div>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <div className="relative h-[22vh] mt-9 mb-3 mx-3 overflow-hidden rounded-lg shadow-lg group">
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
      <div className="absolute inset-0 flex flex-col justify-end p-6 cursor-pointer" onClick={() => onEventClick(currentEvent.id)}>
        <h3 className="text-white text-2xl font-bold mb-2 line-clamp-2 drop-shadow-lg">
          {currentEvent.title}
        </h3>
        <div className="flex items-center gap-4 text-white/90 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(currentEvent.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{currentEvent.location}</span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {events.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
              setIsAutoPlaying(false);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
              setIsAutoPlaying(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

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
