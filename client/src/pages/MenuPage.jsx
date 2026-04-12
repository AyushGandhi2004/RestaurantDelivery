import { useState, useEffect, useMemo } from 'react';
import menuService from '../services/menu.service.js';
import MenuCard from '../components/menu/MenuCard.jsx';
import CategoryTabs from '../components/menu/CategoryTabs.jsx';
import ShopClosedBanner from '../components/ShopClosedBanner.jsx';
import SkeletonCard from '../components/ui/SkeletonCard.jsx';

const MenuPage = () => {
  const [menu,      setMenu]      = useState([]);
  const [settings,  setSettings]  = useState(null);
  const [activeId,  setActiveId]  = useState('all');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, settingsRes] = await Promise.all([
          menuService.getFullMenu(),
          menuService.getShopSettings(),
        ]);
        setMenu(menuRes.menu || []);
        setSettings(settingsRes.settings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Flatten all items for "All" tab, or filter by category
  const displayedItems = useMemo(() => {
    if (activeId === 'all') {
      return menu.flatMap((cat) => cat.items || []);
    }
    const cat = menu.find((c) => c._id === activeId);
    return cat?.items || [];
  }, [menu, activeId]);

  const categories = menu.map(({ _id, name }) => ({ _id, name }));
  const shopOpen = settings?.isOpen ?? true;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Our Menu</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fresh ingredients, bold flavours
        </p>
      </div>

      <ShopClosedBanner settings={settings} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4
                        text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      {!loading && categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          activeId={activeId}
          onSelect={setActiveId}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                        xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No items available in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                        xl:grid-cols-4 gap-4">
          {displayedItems.map((item) => (
            <MenuCard key={item._id} item={item} shopOpen={shopOpen} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;