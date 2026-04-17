import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImagePlus } from 'lucide-react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

const MenuItemForm = ({ initial, categories, onSubmit, loading }) => {
  const [previewUrl, setPreviewUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const isSpecial = watch('isSpecial');

  useEffect(() => {
    if (initial) {
      reset({
        name:          initial.name          || '',
        description:   initial.description   || '',
        categoryId:    initial.categoryId?._id || initial.categoryId || '',
        price:         initial.price         || '',
        originalPrice: initial.originalPrice || '',
        prepTime:      initial.prepTime      || 20,
        isAvailable:   initial.isAvailable   ?? true,
        isSpecial:     initial.isSpecial     ?? false,
        offerLabel:    initial.offerLabel    || '',
      });
      setPreviewUrl(initial.images?.[0] || '');
    } else {
      reset({
        name: '', description: '', categoryId: '',
        price: '', originalPrice: '', prepTime: 20,
        isAvailable: true, isSpecial: false, offerLabel: '',
      });
      setPreviewUrl('');
    }
  }, [initial, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  // Build FormData so the image file is included in the request
  const handleFormSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Append image file if selected
    const fileInput = document.getElementById('item-image-input');
    if (fileInput?.files?.[0]) {
      formData.append('image', fileInput.files[0]);
    }

    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Item image
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden
                          border border-gray-200 shrink-0 flex items-center
                          justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="preview"
                   className="w-full h-full object-cover" />
            ) : (
              <ImagePlus size={24} className="text-gray-300" />
            )}
          </div>
          <div>
            <input
              id="item-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <label
              htmlFor="item-image-input"
              className="btn-secondary text-xs cursor-pointer px-3 py-1.5
                         rounded-lg border border-gray-300 inline-block"
            >
              Choose image
            </label>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG or WebP · max 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     text-sm focus:outline-none focus:ring-2
                     focus:ring-brand-500 bg-white"
          {...register('categoryId', { required: 'Category is required' })}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-600">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <Input
        label="Item name"
        placeholder="e.g. Classic Beef Burger"
        error={errors.name?.message}
        {...register('name', {
          required:  'Name is required',
          maxLength: { value: 100, message: 'Max 100 characters' },
        })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={2}
          placeholder="What's in this dish?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     text-sm placeholder-gray-400 focus:outline-none
                     focus:ring-2 focus:ring-brand-500 resize-none"
          {...register('description')}
        />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price (₹)"
          type="number"
          placeholder="199"
          error={errors.price?.message}
          {...register('price', {
            required: 'Price is required',
            min: { value: 0, message: 'Must be positive' },
          })}
        />
        <Input
          label="Original price (₹) — for strikethrough"
          type="number"
          placeholder="249"
          {...register('originalPrice', {
            min: { value: 0, message: 'Must be positive' },
          })}
        />
      </div>

      <Input
        label="Prep time (minutes)"
        type="number"
        placeholder="20"
        {...register('prepTime', {
          min: { value: 1, message: 'At least 1 minute' },
        })}
      />

      {/* Toggles row */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-brand-600"
            {...register('isAvailable')}
          />
          <span className="text-sm text-gray-700">Available</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-brand-600"
            {...register('isSpecial')}
          />
          <span className="text-sm text-gray-700">Special offer</span>
        </label>
      </div>

      {/* Offer label — only shown when isSpecial is checked */}
      {isSpecial && (
        <Input
          label="Offer label"
          placeholder="e.g. 20% off · Buy 1 Get 1"
          {...register('offerLabel')}
        />
      )}

      <Button
        className="w-full"
        loading={loading}
        onClick={handleSubmit(handleFormSubmit)}
      >
        {initial ? 'Update Item' : 'Create Item'}
      </Button>
    </div>
  );
};

export default MenuItemForm;