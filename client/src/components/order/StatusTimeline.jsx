import { Check } from 'lucide-react';
import { STATUS_STEPS } from '../../utils/constants.js';

const StatusTimeline = ({ currentStatus }) => {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, index) => {
        const isDone    = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture  = index > currentIndex;
        const isLast    = index === STATUS_STEPS.length - 1;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Left — circle + line */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                border-2 transition-all duration-500 shrink-0
                ${isDone
                  ? 'bg-green-500 border-green-500'
                  : isCurrent
                    ? 'bg-brand-600 border-brand-600 animate-pulse'
                    : 'bg-white border-gray-200'
                }
              `}>
                {isDone ? (
                  <Check size={14} className="text-white" />
                ) : (
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    isCurrent ? 'bg-white' : 'bg-gray-300'
                  }`} />
                )}
              </div>
              {!isLast && (
                <div className={`w-0.5 h-10 mt-1 transition-all duration-500 ${
                  isDone ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </div>

            {/* Right — label */}
            <div className="pb-10 flex-1">
              <p className={`
                text-sm font-medium leading-8
                ${isCurrent
                  ? 'text-brand-600'
                  : isDone
                    ? 'text-green-600'
                    : 'text-gray-400'
                }
              `}>
                {step.label}
                {isCurrent && (
                  <span className="ml-2 text-xs font-normal text-brand-400">
                    — In progress
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;