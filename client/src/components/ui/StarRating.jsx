import { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value, onChange, readonly = false, size = 20 }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-colors ${
              readonly ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <Star
              size={size}
              className={filled
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300'
              }
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;