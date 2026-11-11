import { useEffect, useState } from 'react';
import { Scene } from './Scene';

/* A photo with a graceful illustrated fallback if the image fails to load. */
export function PropertyImage({
  src,
  alt,
  type = 'Land',
  seed = 1,
  variant = 0,
  className = '',
  eager = false,
}) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => setFailed(!src), [src]);
  if (failed)
    return (
      <Scene
        type={type}
        seed={seed}
        variant={variant}
        className={'h-full w-full object-cover ' + className}
      />
    );
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={'h-full w-full object-cover ' + className}
    />
  );
}
