import { Check, CheckCheck } from 'lucide-react';
import { formatMessageTime } from '../utils/dateFormat';

interface ChatBubbleProps {
  message: string;
  isSender: boolean;
  timestamp: Date | string;
  status?: 'sent' | 'delivered' | 'seen';
  deliveredAt?: Date | string;
  seenAt?: Date | string;
}

export const ChatBubble = ({ message, isSender, timestamp, status, deliveredAt, seenAt }: ChatBubbleProps) => {
  const getStatusTooltip = () => {
    if (!isSender || !status) return '';

    switch (status) {
      case 'sent':
        return 'Sent';
      case 'delivered':
        return deliveredAt ? `Delivered at ${formatMessageTime(deliveredAt)}` : 'Delivered';
      case 'seen':
        return seenAt ? `Seen at ${formatMessageTime(seenAt)}` : 'Seen';
      default:
        return '';
    }
  };

  const renderStatusIcon = () => {
    if (!isSender || !status) return null;

    const tooltip = getStatusTooltip();

    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-white/70" title={tooltip} />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-white/70" title={tooltip} />;
      case 'seen':
        return <CheckCheck className="w-3 h-3 text-blue-300" title={tooltip} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
          isSender
            ? 'bg-[#1E3A8A] text-white rounded-br-sm'
            : 'bg-[#1E293B] text-gray-100 rounded-bl-sm'
        } transition-all hover:shadow-md`}
      >
        <p className="text-sm leading-relaxed break-words">{message}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] opacity-70">{formatMessageTime(timestamp)}</span>
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
};
