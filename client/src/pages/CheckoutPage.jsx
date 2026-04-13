import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapPin, MessageSquare, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import paymentService from '../services/payment.service.js';
import { formatPrice } from '../utils/formatters.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
      <Icon size={16} className="text-brand-600" />
    </div>
    <h2 className="font-semibold text-gray-900">{title}</h2>
  </div>
);

const CheckoutPage = () => {
  const { cartItems, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [breakdown, setBreakdown] = useState({ subtotal, deliveryFee, total });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // Pre-fill from saved address if available
      line1:   user?.addresses?.[0]?.line1 || '',
      city:    user?.addresses?.[0]?.city  || '',
      pincode: user?.addresses?.[0]?.pincode || '',
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) navigate('/menu');
  }, [cartItems, navigate]);

  const openRazorpay = (orderData, formData) => {
    return new Promise((resolve, reject) => {
      const options = {
        key:      orderData.keyId,
        amount:   orderData.amount,
        currency: orderData.currency,
        name:     'The Restaurant',
        description: 'Food Order',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name:    user?.name  || '',
          email:   user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#ea580c' },
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        reject(new Error(response.error.description));
      });
      rzp.open();
    });
  };

  const onSubmit = async (formData) => {
    setPaying(true);

    try {
      // 1. Format cart for server
      const cartPayload = cartItems.map((item) => ({
        itemId: item._id,
        qty:    item.quantity,
      }));

      const deliveryAddress = {
        line1:   formData.line1,
        city:    formData.city,
        pincode: formData.pincode,
      };

      const chefInstructions = formData.chefInstructions || '';

      // 2. Create Razorpay order on server
      const orderRes = await paymentService.createOrder({
        cartItems:        cartPayload,
        deliveryAddress,
        chefInstructions,
      });

      // Update breakdown with server-calculated values
      setBreakdown(orderRes.breakdown);

      // 3. Open Razorpay modal — waits for success or dismiss
      const paymentResponse = await openRazorpay(orderRes, formData);

      // 4. Verify payment on server — this creates the Order document
      const verifyRes = await paymentService.verifyPayment({
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpayOrderId:   paymentResponse.razorpay_order_id,
        razorpaySignature: paymentResponse.razorpay_signature,
        cartItems:         cartPayload,
        deliveryAddress,
        chefInstructions,
      });

      // 5. Clear cart and navigate to tracking page
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${verifyRes.orderId}/track`);
    } catch (err) {
      if (err.message === 'Payment cancelled') {
        toast.error('Payment was cancelled');
      } else {
        toast.error(err.message || 'Payment failed. Please try again.');
      }
    } finally {
      setPaying(false);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — forms */}
        <div className="lg:col-span-2 space-y-6">

          {/* Delivery address */}
          <div className="card p-5">
            <SectionTitle icon={MapPin} title="Delivery Address" />
            <div className="space-y-3">
              <Input
                label="Street address"
                placeholder="House no., Street, Area"
                error={errors.line1?.message}
                {...register('line1', { required: 'Address is required' })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  placeholder="New Delhi"
                  error={errors.city?.message}
                  {...register('city', { required: 'City is required' })}
                />
                <Input
                  label="Pincode"
                  placeholder="110001"
                  error={errors.pincode?.message}
                  {...register('pincode', {
                    required: 'Pincode is required',
                    pattern: {
                      value:   /^\d{6}$/,
                      message: 'Enter a valid 6-digit pincode',
                    },
                  })}
                />
              </div>
            </div>
          </div>

          {/* Chef instructions */}
          <div className="card p-5">
            <SectionTitle icon={MessageSquare} title="Instructions for Chef" />
            <textarea
              placeholder="Any special requests? Allergies? Spice level preferences..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2
                         focus:ring-brand-500 focus:border-transparent resize-none
                         transition-all duration-200"
              {...register('chefInstructions')}
            />
          </div>
        </div>

        {/* Right — order summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <SectionTitle icon={ShoppingBag} title="Order Summary" />

            {/* Items list */}
            <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item._id}
                  className="flex justify-between text-sm text-gray-700">
                  <span className="truncate flex-1 pr-2">
                    {item.name}{' '}
                    <span className="text-gray-400">x{item.quantity}</span>
                  </span>
                  <span className="font-medium shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(breakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery fee</span>
                <span className={breakdown.deliveryFee === 0
                  ? 'text-green-600 font-medium' : ''}>
                  {breakdown.deliveryFee === 0
                    ? 'FREE'
                    : formatPrice(breakdown.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900
                              border-t border-gray-100 pt-2 text-base">
                <span>Total</span>
                <span>{formatPrice(breakdown.total)}</span>
              </div>
            </div>

            {/* Payment note */}
            <p className="text-xs text-gray-400 text-center mt-3 mb-4">
              Secured by Razorpay · Prepaid only
            </p>

            <Button
              className="w-full"
              size="lg"
              loading={paying}
              onClick={handleSubmit(onSubmit)}
            >
              Pay {formatPrice(breakdown.total)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;