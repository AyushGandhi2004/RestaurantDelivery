import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { RESTAURANT } from '../utils/constants.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await registerUser({
        name:     data.name,
        email:    data.email,
        password: data.password,
        phone:    data.phone ? data.phone : undefined,
      });
      navigate('/menu', { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center
                    justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center
                          w-14 h-14 bg-brand-100 rounded-2xl mb-4">
            <ChefHat size={28} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Join {RESTAURANT.name} today
          </p>
        </div>

        <div className="card p-6 space-y-4">
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg
                            p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <Input
            label="Full name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Enter a valid email',
              },
            })}
          />

          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="9876543210"
            error={errors.phone?.message}
            {...register('phone', {
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: 'Enter a valid 10-digit mobile number',
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min 6 chars, 1 uppercase, 1 number"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'At least 6 characters' },
              pattern: {
                value: /^(?=.*[A-Z])(?=.*[0-9])/,
                message: 'Must include an uppercase letter and a number',
              },
            })}
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) =>
                val === watch('password') || 'Passwords do not match',
            })}
          />

          <Button
            className="w-full"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Create Account
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login"
            className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;