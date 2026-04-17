import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

const CategoryForm = ({ initial, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Pre-fill form when editing an existing category
  useEffect(() => {
    if (initial) {
      reset({
        name:         initial.name        || '',
        description:  initial.description || '',
        displayOrder: initial.displayOrder ?? 0,
      });
    } else {
      reset({ name: '', description: '', displayOrder: 0 });
    }
  }, [initial, reset]);

  return (
    <div className="space-y-4">
      <Input
        label="Category name"
        placeholder="e.g. Burgers"
        error={errors.name?.message}
        {...register('name', {
          required:  'Name is required',
          maxLength: { value: 50, message: 'Max 50 characters' },
        })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={2}
          placeholder="Short description shown to customers"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     text-sm placeholder-gray-400 focus:outline-none
                     focus:ring-2 focus:ring-brand-500 resize-none"
          {...register('description', {
            maxLength: { value: 200, message: 'Max 200 characters' },
          })}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <Input
        label="Display order"
        type="number"
        placeholder="0"
        error={errors.displayOrder?.message}
        {...register('displayOrder', {
          valueAsNumber: true,
          min: { value: 0, message: 'Must be 0 or higher' },
        })}
      />

      <Button
        className="w-full"
        loading={loading}
        onClick={handleSubmit(onSubmit)}
      >
        {initial ? 'Update Category' : 'Create Category'}
      </Button>
    </div>
  );
};

export default CategoryForm;