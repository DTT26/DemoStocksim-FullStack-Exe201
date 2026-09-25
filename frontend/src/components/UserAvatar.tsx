import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: string; // Tailwind size classes, e.g. "w-8 h-8", "w-10 h-10", "w-24 h-24"
  className?: string;
  textClassName?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = '',
  size = 'w-8 h-8',
  className = '',
  textClassName = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if the src prop changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : 'U';

  if (!src || hasError) {
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 text-white font-bold flex items-center justify-center shrink-0 select-none shadow-sm ${className}`}
      >
        <span className={textClassName || 'text-sm font-semibold'}>{initial}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${size} rounded-full object-cover shrink-0 select-none ${className}`}
    />
  );
};
