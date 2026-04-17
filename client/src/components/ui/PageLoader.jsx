import Spinner from './Spinner.jsx';
import { ChefHat } from 'lucide-react';

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center
                  justify-center gap-4 bg-gray-50">
    <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center
                    justify-center">
      <ChefHat size={32} className="text-brand-600" />
    </div>
    <Spinner size="lg" />
  </div>
);

export default PageLoader;