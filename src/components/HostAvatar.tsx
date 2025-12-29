import React, { useState } from 'react';

type Props = {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  className?: string;
};

const gradients: [string, string][] = [
  ['#ff7eb3', '#ff758c'],
  ['#7afcff', '#4facfe'],
  ['#f6d365', '#fda085'],
  ['#a18cd1', '#fbc2eb'],
  ['#f093fb', '#f5576c'],
  ['#5ee7df', '#b490ca'],
];

function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export const HostAvatar: React.FC<Props> = ({ name, imageUrl, size = 40, className = '' }) => {
  const s = `${size}px`;
  const [imgError, setImgError] = useState(false);

  // Don't attempt to render transient blob URLs (they may be invalid across navigations)
  const isBlob = typeof imageUrl === 'string' && imageUrl.startsWith('blob:');
  if (imageUrl && !isBlob && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name ? `${name} logo` : 'host logo'}
        className={`rounded-full object-cover ${className}`}
        style={{ width: s, height: s }}
        onError={() => setImgError(true)}
      />
    );
  }

  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0].toUpperCase())
        .slice(0, 2)
        .join('')
    : '?';

  const idx = name ? hashString(name) % gradients.length : 0;
  const [c1, c2] = gradients[idx];

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{ width: s, height: s, background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      <span>{initials}</span>
    </div>
  );
};

export default HostAvatar;
