import { EventCategory } from '../types';
import { X } from 'lucide-react';

interface FilterModalProps {
  show: boolean;
  categories: EventCategory[];
  selectedCategories: string[];
  selectedDistrict: string;
  dateFrom: string;
  dateTo: string;
  isFree: boolean | null;
  sortBy: 'date' | 'popularity' | 'free';
  onClose: () => void;
  onToggleCategory: (categoryId: string) => void;
  onClearAllCategories: () => void;
  onDistrictChange: (district: string) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onFreeChange: (isFree: boolean | null) => void;
  onSortChange: (sort: 'date' | 'popularity' | 'free') => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

const districts = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
  'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

export const FilterModal: React.FC<FilterModalProps> = ({
  show,
  categories,
  selectedCategories,
  selectedDistrict,
  dateFrom,
  dateTo,
  isFree,
  sortBy,
  onClose,
  onToggleCategory,
  onClearAllCategories,
  onDistrictChange,
  onDateFromChange,
  onDateToChange,
  onFreeChange,
  onSortChange,
  onClearFilters,
  onApplyFilters,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">Filters & Sorting</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-6 pb-24">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">Categories (Select Multiple)</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              <button
                onClick={onClearAllCategories}
                className={`py-1.5 px-2 rounded text-xs font-medium transition-colors border-2 ${
                  selectedCategories.length === 0
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onToggleCategory(cat.id)}
                  className={`py-1.5 px-2 rounded text-xs font-medium transition-colors border-2 ${
                    selectedCategories.includes(cat.id)
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => onToggleCategory('other')}
                className={`py-1.5 px-2 rounded text-xs font-medium transition-colors border-2 ${
                  selectedCategories.includes('other')
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Other
              </button>
            </div>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            >
              <option value="">All Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">Date Range</label>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600 block mb-1">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Entry Fee Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">Entry Fee</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onFreeChange(null)}
                className={`py-2 px-3 rounded-lg border-2 transition-colors font-medium text-sm ${
                  isFree === null
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onFreeChange(true)}
                className={`py-2 px-3 rounded-lg border-2 transition-colors font-medium text-sm ${
                  isFree === true
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                💰 Free
              </button>
              <button
                type="button"
                onClick={() => onFreeChange(false)}
                className={`py-2 px-3 rounded-lg border-2 transition-colors font-medium text-sm ${
                  isFree === false
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                💵 Paid
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">Sort By</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onSortChange('date')}
                className={`w-full py-2 px-4 rounded-lg border-2 transition-colors text-left font-medium ${
                  sortBy === 'date'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                📅 Earliest Date First
              </button>
              <button
                type="button"
                onClick={() => onSortChange('popularity')}
                className={`w-full py-2 px-4 rounded-lg border-2 transition-colors text-left font-medium ${
                  sortBy === 'popularity'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                ⭐ Most Popular
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-8 sticky bottom-0 bg-white border-t-2 border-gray-200 -mx-4 px-4 py-4">
            <button
              onClick={onClearFilters}
              className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                onApplyFilters();
                onClose();
              }}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
