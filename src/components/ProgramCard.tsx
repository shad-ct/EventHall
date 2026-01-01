import React from 'react';
import { useNavigate } from 'react-router-dom';
import HostAvatar from './HostAvatar';
import { getHostImage } from '../lib/image';
import { ChevronRight } from 'lucide-react';

interface ProgramCardProps {
  program: any;
  hostProfile?: any;
  onClick?: () => void;
  className?: string;
  imageSize?: number;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, hostProfile, onClick, className = 'w-[320px] snap-start', imageSize = 56 }) => {
  const navigate = useNavigate();
  const imageUrl = getHostImage(hostProfile || program) || program.host?.logoUrl || program.logoUrl || '';
  const title = program.programName || program.name || program.title || 'Untitled Program';
  const dateLabel = program.date || program.startDate || program.dateFrom || '';
  const description = program.description || '';

  const handleClick = () => {
    if (onClick) return onClick();
    if (program.programName) return navigate(`/programs/${encodeURIComponent(program.programName)}`);
    if (program.id) return navigate(`/programs/${encodeURIComponent(program.id)}`);
  };

  return (
    <div className={`flex-shrink-0 ${className}`}>
      <div
        onClick={handleClick}
        className="bg-white rounded-lg p-4 shadow hover:shadow-md cursor-pointer h-full flex flex-col justify-between"
      >
        <div className="flex items-start gap-3">
          <HostAvatar name={title} imageUrl={imageUrl} size={imageSize} />
          <div className="flex-1">
            <div className="text-md font-semibold text-gray-900 truncate">{title}</div>
            {dateLabel && <div className="text-sm text-gray-500 mt-1">{dateLabel}</div>}
            {description && (
              <div className="mt-2">
                <div
                  className="text-sm text-gray-600 line-clamp-2 md:line-clamp-3"
                  title={description}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.5em',
                    maxHeight: '3.2em',
                    wordBreak: 'break-word',
                  }}
                >
                  {description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <div className="px-0 py-3 mt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Host</div>
            <div className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
              {program.host?.fullName || program.host?.full_name || program.host?.name || 'Unknown'}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div> */}
      </div>
    </div>
  );
};

export default ProgramCard;
