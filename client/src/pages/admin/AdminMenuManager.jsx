import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, ChevronDown,
  ChevronRight, UtensilsCrossed,
} from 'lucide-react';
import adminService from '../../services/admin.service.js';
import CategoryForm from '../../components/admin/CategoryForm.jsx';
import MenuItemForm from '../../components/admin/MenuItemForm.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { formatPrice } from '../../utils/formatters.js';
import toast from 'react-hot-toast';

// ── Small sub-component: one category row with its items ──────
const CategoryRow = ({
  category,
  allCategories,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="card overflow-hidden mb-4">
      {/* Category header */}
      <div className="flex items-center justify-between px-4 py-3
                      bg-gray-50 border-b border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 font-semibold text-gray-900
                     text-sm hover:text-brand-600 transition-colors"
        >
          {expanded
            ? <ChevronDown size={16} />
            : <ChevronRight size={16} />
          }
          {category.name}
          <span className="text-xs font-normal text-gray-400 ml-1">
            ({category.items?.length || 0} items)
          </span>
          {!category.isActive && (
            <span className="badge bg-red-100 text-red-600 ml-1">
              Inactive
            </span>
          )}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddItem(category)}
            className="flex items-center gap-1 text-xs text-brand-600
                       hover:bg-brand-50 px-2 py-1.5 rounded-lg
                       transition-colors font-medium"
          >
            <Plus size={13} />
            Add item
          </button>
          <button
            onClick={() => onEditCategory(category)}
            className="p-1.5 text-gray-400 hover:text-brand-600
                       hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDeleteCategory(category)}
            className="p-1.5 text-gray-400 hover:text-red-600
                       hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Items list */}
      {expanded && (
        <div>
          {!category.items || category.items.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">
              No items yet —{' '}
              <button
                onClick={() => onAddItem(category)}
                className="text-brand-600 hover:underline"
              >
                add the first one
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-2 px-4 font-medium
                                 text-gray-400 text-xs">Item</th>
                  <th className="text-left py-2 px-4 font-medium
                                 text-gray-400 text-xs">Price</th>
                  <th className="text-left py-2 px-4 font-medium
                                 text-gray-400 text-xs">Status</th>
                  <th className="text-left py-2 px-4 font-medium
                                 text-gray-400 text-xs">Offer</th>
                  <th className="py-2 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {category.items.map((item) => (
                  <tr key={item._id}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-lg bg-gray-100
                                        overflow-hidden shrink-0">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name}
                                 className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center
                                            justify-center text-lg">🍽️</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-400 truncate
                                          max-w-xs">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price)}
                      </p>
                      {item.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatPrice(item.originalPrice)}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`badge ${
                        item.isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {item.isSpecial && item.offerLabel && (
                        <span className="badge bg-amber-100 text-amber-700">
                          {item.offerLabel}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => onEditItem(item, category)}
                          className="p-1.5 text-gray-400 hover:text-brand-600
                                     hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600
                                     hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────
const AdminMenuManager = () => {
  // categories with their items nested inside
  const [categories,    setCategories]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [formLoading,   setFormLoading]   = useState(false);

  // Modal state
  const [catModal,      setCatModal]      = useState(false);
  const [itemModal,     setItemModal]     = useState(false);
  const [editingCat,    setEditingCat]    = useState(null);
  const [editingItem,   setEditingItem]   = useState(null);
  // Which category the "add item" modal is opened for
  const [targetCat,     setTargetCat]     = useState(null);

  // ── Fetch all categories + items ───────────────────────────
  const fetchMenuData = useCallback(async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        adminService.getAllCategories(),
        adminService.getAllMenuItems(),
      ]);

      // Nest items inside their category for easy rendering
      const itemsByCat = {};
      itemRes.items.forEach((item) => {
        const catId = item.categoryId?._id || item.categoryId;
        if (!itemsByCat[catId]) itemsByCat[catId] = [];
        itemsByCat[catId].push(item);
      });

      const nested = catRes.categories.map((cat) => ({
        ...cat,
        items: itemsByCat[cat._id] || [],
      }));

      setCategories(nested);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenuData(); }, [fetchMenuData]);

  // ── Category handlers ──────────────────────────────────────
  const openAddCategory = () => {
    setEditingCat(null);
    setCatModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCat(cat);
    setCatModal(true);
  };

  const handleCategorySubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingCat) {
        await adminService.updateCategory(editingCat._id, data);
        toast.success('Category updated');
      } else {
        await adminService.createCategory(data);
        toast.success('Category created');
      }
      setCatModal(false);
      fetchMenuData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(
      `Delete "${cat.name}"? All its items will be marked unavailable.`
    )) return;
    try {
      await adminService.deleteCategory(cat._id);
      toast.success('Category deleted');
      fetchMenuData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Menu item handlers ─────────────────────────────────────
  const openAddItem = (category) => {
    setEditingItem(null);
    setTargetCat(category);
    setItemModal(true);
  };

  const openEditItem = (item, category) => {
    setEditingItem(item);
    setTargetCat(category);
    setItemModal(true);
  };

  const handleItemSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingItem) {
        await adminService.updateMenuItem(editingItem._id, formData);
        toast.success('Item updated');
      } else {
        await adminService.createMenuItem(formData);
        toast.success('Item created');
      }
      setItemModal(false);
      fetchMenuData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Mark "${item.name}" as unavailable?`)) return;
    try {
      await adminService.deleteMenuItem(item._id);
      toast.success('Item removed from menu');
      fetchMenuData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Flat categories list for the item form's select ───────
  const flatCategories = categories.map(({ _id, name }) => ({ _id, name }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Menu Manager</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {categories.length} categories ·{' '}
            {categories.reduce((s, c) => s + (c.items?.length || 0), 0)} items
          </p>
        </div>
        <button
          onClick={openAddCategory}
          className="flex items-center gap-2 bg-brand-600 text-white
                     px-4 py-2 rounded-lg text-sm font-medium
                     hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Categories */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <UtensilsCrossed size={40} className="mx-auto mb-4 text-gray-200" />
          <p className="font-medium">No categories yet</p>
          <p className="text-sm mt-1 mb-4">
            Create your first category to start building the menu
          </p>
          <button
            onClick={openAddCategory}
            className="bg-brand-600 text-white px-5 py-2 rounded-lg
                       text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Create Category
          </button>
        </div>
      ) : (
        categories.map((cat) => (
          <CategoryRow
            key={cat._id}
            category={cat}
            allCategories={flatCategories}
            onEditCategory={openEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddItem={openAddItem}
            onEditItem={openEditItem}
            onDeleteItem={handleDeleteItem}
          />
        ))
      )}

      {/* Category modal */}
      <Modal
        isOpen={catModal}
        onClose={() => setCatModal(false)}
        title={editingCat ? 'Edit Category' : 'New Category'}
      >
        <CategoryForm
          initial={editingCat}
          onSubmit={handleCategorySubmit}
          loading={formLoading}
        />
      </Modal>

      {/* Menu item modal */}
      <Modal
        isOpen={itemModal}
        onClose={() => setItemModal(false)}
        title={editingItem ? 'Edit Menu Item' : `Add Item to ${targetCat?.name}`}
        size="lg"
      >
        <MenuItemForm
          initial={editingItem
            ? { ...editingItem, categoryId: targetCat }
            : { categoryId: targetCat }
          }
          categories={flatCategories}
          onSubmit={handleItemSubmit}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default AdminMenuManager;