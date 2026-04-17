import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import menuService from '../services/menu.service.js';
import reviewService from '../services/review.service.js';
import ShopClosedBanner from '../components/ShopClosedBanner.jsx';
import StarRating from '../components/ui/StarRating.jsx';
import { RESTAURANT } from '../utils/constants.js';
import { formatDate } from '../utils/formatters.js';

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

const ReviewCard = ({ review }) => (
  <div className="card p-4 flex flex-col gap-2">
    <StarRating value={review.rating} readonly size={16} />
    {review.comment && (
      <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
    )}
    <div className="flex items-center justify-between mt-auto">
      <p className="text-xs font-medium text-gray-500">
        {review.userId?.name?.split(' ')[0] || 'Customer'}
      </p>
      <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
    </div>
  </div>
);

const Home = () => {
  const [settings, setSettings] = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [avgRating, setAvgRating] = useState(null);

  useEffect(() => {
    menuService.getShopSettings()
      .then((res) => setSettings(res.settings))
      .catch(() => {});

    reviewService.getReviews()
      .then((res) => {
        setReviews(res.reviews.slice(0, 6)); // show latest 6
        setAvgRating(res.avgRating);
      })
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
          {settings?.specialNotice && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl
                            px-4 py-2 text-amber-700 text-sm
                            inline-block mb-6 ml-2">
              {settings.specialNotice}
            </div>
          )}
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-brand-600
                         text-white font-semibold px-8 py-3 rounded-xl
                         hover:bg-brand-700 transition-colors text-base"
            >
              View Menu <ArrowRight size={18} />
            </Link>
            {avgRating && (
              <div className="flex items-center gap-1.5 text-sm
                              text-gray-600">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="font-semibold">{avgRating}</span>
                <span className="text-gray-400">
                  ({reviews.length} reviews)
                </span>
              </div>
            )}
          </div>
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

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="pb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                What our customers say
              </h2>
              {avgRating && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRating value={Math.round(avgRating)} readonly size={16} />
                  <span className="text-sm text-gray-500">
                    {avgRating} out of 5
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;