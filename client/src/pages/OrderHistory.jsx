import { useEffect, useState, useCallback } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import orderService from '../services/order.service.js';
import reviewService from '../services/review.service.js';
import OrderCard from '../components/order/OrderCard.jsx';
import Modal from '../components/ui/Modal.jsx';
import StarRating from '../components/ui/StarRating.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const ReviewModal = ({ order, onClose, onSubmitted }) => {
  const [rating,    setRating]    = useState(5);
  const [comment,   setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await reviewService.createReview({
        orderId: order._id,
        rating,
        comment,
      });
      toast.success('Review submitted — thank you!');
      onSubmitted(order._id);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Order summary */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-400 font-mono mb-1">
          #{order._id.slice(-8).toUpperCase()}
        </p>
        <p className="text-sm text-gray-700 truncate">
          {order.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
        </p>
      </div>

      {/* Star picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your rating
        </label>
        <StarRating value={rating} onChange={setRating} size={28} />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comment (optional)
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          placeholder="How was your experience?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     text-sm placeholder-gray-400 focus:outline-none
                     focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <p className="text-right text-xs text-gray-400 mt-0.5">
          {comment.length}/500
        </p>
      </div>

      <Button className="w-full" loading={submitting} onClick={handleSubmit}>
        Submit Review
      </Button>
    </div>
  );
};

const OrderHistory = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [reviewedIds,  setReviewedIds]  = useState(new Set());
  const [reviewOrder,  setReviewOrder]  = useState(null); // order being reviewed

  useEffect(() => {
    orderService.getMyOrders()
      .then(async (data) => {
        const fetched = data.orders;
        setOrders(fetched);

        // Check which delivered orders already have reviews
        const deliveredIds = fetched
          .filter((o) => o.status === 'delivered')
          .map((o) => o._id);

        const checks = await Promise.allSettled(
          deliveredIds.map((id) => reviewService.getOrderReview(id))
        );

        const alreadyReviewed = new Set();
        checks.forEach((result, i) => {
          if (result.status === 'fulfilled' && result.value.review) {
            alreadyReviewed.add(deliveredIds[i]);
          }
        });
        setReviewedIds(alreadyReviewed);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleReviewSubmitted = useCallback((orderId) => {
    setReviewedIds((prev) => new Set([...prev, orderId]));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl
                        p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-16">
          <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Your order history will appear here
          </p>
          <Link to="/menu"
            className="bg-brand-600 text-white px-6 py-2 rounded-xl
                       text-sm font-medium hover:bg-brand-700 transition-colors">
            Browse Menu
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id}>
              <OrderCard order={order} />

              {/* Review button — only for delivered, un-reviewed orders */}
              {order.status === 'delivered' &&
               !reviewedIds.has(order._id) && (
                <div className="mt-1 ml-1">
                  <button
                    onClick={() => setReviewOrder(order)}
                    className="text-xs text-brand-600 hover:underline
                               font-medium"
                  >
                    Leave a review
                  </button>
                </div>
              )}

              {order.status === 'delivered' &&
               reviewedIds.has(order._id) && (
                <p className="mt-1 ml-1 text-xs text-gray-400">
                  ✓ Reviewed
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      <Modal
        isOpen={!!reviewOrder}
        onClose={() => setReviewOrder(null)}
        title="Leave a Review"
      >
        {reviewOrder && (
          <ReviewModal
            order={reviewOrder}
            onClose={() => setReviewOrder(null)}
            onSubmitted={handleReviewSubmitted}
          />
        )}
      </Modal>
    </div>
  );
};

export default OrderHistory;