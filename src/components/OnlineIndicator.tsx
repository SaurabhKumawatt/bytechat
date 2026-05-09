import { formatLastSeen } from '../utils/dateFormat';

interface OnlineIndicatorProps {
  isOnline: boolean;
  lastSeen?: Date | string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OnlineIndicator = ({
  isOnline,
  lastSeen,
  showText = true,
  size = 'md'
}: OnlineIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const dotSize = sizeClasses[size];

  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={`${dotSize} rounded-full bg-green-500 animate-pulse`}></div>
        {showText && <span className="text-xs text-sky-400 font-medium">online</span>}
      </div>
    );
  }

  if (!lastSeen) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={`${dotSize} rounded-full bg-gray-400`}></div>
        {showText && <span className="text-xs text-gray-400">offline</span>}
      </div>
    );
  }

  const lastSeenText = formatLastSeen(lastSeen);

  return (
    <div className="flex items-center gap-1.5">
      <div className={`${dotSize} rounded-full bg-gray-400`}></div>
      {showText && (
        <span className="text-xs text-gray-400">
          last seen {lastSeenText}
        </span>
      )}
    </div>
  );
};
