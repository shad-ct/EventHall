import { EventCategory } from '../types';

interface CategoryBrowserProps {
  categories: EventCategory[];
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  categories,
  onCategoryClick,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            className="py-4 px-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center font-medium text-gray-700 hover:text-blue-700"
          >
            {category.name}
          </button>
        ))}
        <button
          key="other"
          onClick={() => onCategoryClick('other')}
          className="py-4 px-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center font-medium text-gray-700 hover:text-blue-700"
        >
          Other
        </button>
      </div>
    </div>
  );
};
