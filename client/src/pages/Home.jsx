import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import menuService from '../services/menu.service.js';
import ShopClosedBanner from '../components/ShopClosedBanner.jsx';
import { RESTAURANT } from '../utils/constants.js';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center text-center p-6 card">
    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center
                    justify-center mb-3">
      <Icon size={22} className="text-brand-600" />
    </div>
    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

const Home = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    menuService.getShopSettings()
      .then((res) => setSettings(res.settings))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <ShopClosedBanner settings={settings} />
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900
                         leading-tight mb-4">
            Delicious food,{' '}
            <span className="text-brand-600">delivered fast</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Fresh ingredients, bold flavours — straight to your door from{' '}
            {RESTAURANT.name}.
          </p>
          {settings?.banner && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl
                            px-4 py-2 text-brand-700 text-sm font-medium
                            inline-block mb-6">
              {settings.banner}
            </div>
          )}
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-brand-600 text-white
                       font-semibold px-8 py-3 rounded-xl hover:bg-brand-700
                       transition-colors text-base"
          >
            View Menu <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <FeatureCard
          icon={Clock}
          title="Fast Delivery"
          desc="Hot food at your door in 30–45 minutes"
        />
        <FeatureCard
          icon={Star}
          title="Top Quality"
          desc="Fresh ingredients sourced daily"
        />
        <FeatureCard
          icon={Truck}
          title="Live Tracking"
          desc="Track your order in real-time"
        />
      </section>
    </div>
  );
};

export default Home;