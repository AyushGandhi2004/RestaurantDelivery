const CategoryTabs = ({ categories, activeId, onSelect }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide
                  border-b border-gray-100 mb-6">
    <button
      onClick={() => onSelect('all')}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  transition-colors whitespace-nowrap
                  ${activeId === 'all'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
    >
      All
    </button>
    {categories.map((cat) => (
      <button
        key={cat._id}
        onClick={() => onSelect(cat._id)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium
                    transition-colors whitespace-nowrap
                    ${activeId === cat._id
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
      >
        {cat.name}
      </button>
    ))}
  </div>
);

export default CategoryTabs;