import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Store, Clock, Bell } from 'lucide-react';
import adminService from '../../services/admin.service.js';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const AdminShopSettings = () => {
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [isOpen,   setIsOpen]   = useState(true);

  const { register, handleSubmit, reset,
          formState: { errors } } = useForm();

  useEffect(() => {
    adminService.getShopSettings()
      .then((res) => {
        const s = res.settings;
        setIsOpen(s.isOpen);
        reset({
          openTime:      s.openTime,
          closeTime:     s.closeTime,
          banner:        s.banner,
          specialNotice: s.specialNotice,
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(()  => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await adminService.updateShopSettings({ ...data, isOpen });
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleShop = async () => {
    const next = !isOpen;
    try {
      await adminService.updateShopSettings({ isOpen: next });
      setIsOpen(next);
      toast.success(`Shop is now ${next ? 'open' : 'closed'}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Shop Settings</h1>

      {/* Open/close toggle */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center
                             justify-center
                             ${isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
              <Store size={18}
                className={isOpen ? 'text-green-600' : 'text-red-600'} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Shop Status</p>
              <p className="text-sm text-gray-500">
                {isOpen ? 'Accepting orders' : 'Not accepting orders'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleShop}
            className={`
              relative w-12 h-6 rounded-full transition-colors duration-200
              ${isOpen ? 'bg-green-500' : 'bg-gray-300'}
            `}
          >
            <span className={`
              absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
              transition-transform duration-200
              ${isOpen ? 'translate-x-6' : 'translate-x-0.5'}
            `} />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="card p-5 space-y-5">
        {/* Hours */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-brand-600" />
            <h2 className="font-medium text-gray-900">Opening Hours</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Opens at"
              type="time"
              error={errors.openTime?.message}
              {...register('openTime', { required: 'Required' })}
            />
            <Input
              label="Closes at"
              type="time"
              error={errors.closeTime?.message}
              {...register('closeTime', { required: 'Required' })}
            />
          </div>
        </div>

        {/* Banner */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-brand-600" />
            <h2 className="font-medium text-gray-900">Announcements</h2>
          </div>
          <Input
            label="Banner text (shown on homepage)"
            placeholder="e.g. Free delivery on orders above ₹299"
            {...register('banner')}
          />
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special notice
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Closed on 15th August for Independence Day"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         text-sm placeholder-gray-400 focus:outline-none
                         focus:ring-2 focus:ring-brand-500 resize-none"
              {...register('specialNotice')}
            />
          </div>
        </div>

        <Button
          className="w-full"
          loading={saving}
          onClick={handleSubmit(onSubmit)}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminShopSettings;