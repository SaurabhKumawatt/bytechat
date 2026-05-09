export const formatLastSeen = (lastSeenDate: Date | string): string => {
  const now = new Date();
  const lastSeen = new Date(lastSeenDate);

  const isToday = lastSeen.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = lastSeen.toDateString() === yesterday.toDateString();

  const time = lastSeen.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (isToday) {
    return `today at ${time}`;
  } else if (isYesterday) {
    return `yesterday at ${time}`;
  } else {
    const date = lastSeen.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
    return `on ${date} at ${time}`;
  }
};

export const formatMessageTime = (date: Date | string): string => {
  const messageDate = new Date(date);
  const now = new Date();
  const isToday = messageDate.toDateString() === now.toDateString();

  if (isToday) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = messageDate.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return 'Yesterday';
  }

  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};
