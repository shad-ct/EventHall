import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  onFilterClick,
  showFilterButton = false,
}) => {
  return (
    <form onSubmit={onSearch} className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events..."
          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {showFilterButton && (
        <button
          type="button"
          onClick={onFilterClick}
          className="p-2 sm:p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
          title="Filter events"
        >
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
      )}
    </form>
  );
};
