import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { RESTAURANT } from '../utils/constants.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { useState } from 'react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/menu';
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data);
      navigate(redirect, { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center
                    justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center
                          w-14 h-14 bg-brand-100 rounded-2xl mb-4">
            <ChefHat size={28} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to {RESTAURANT.name}
          </p>
        </div>

        {/* Form */}
        <div className="card p-6 space-y-4">
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg
                            p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

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
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
            })}
          />

          <Button
            className="w-full"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Sign In
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register"
            className="text-brand-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;