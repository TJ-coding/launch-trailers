import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {hasFile} from './Media';

/** Natural size of public/<src> (holds the render until known). */
export const useImageSize = (src?: string) => {
  const ok = hasFile(src);
  const [size, setSize] = useState<{w: number; h: number} | null>(null);
  const [handle] = useState(() => (ok ? delayRender(`Measuring ${src}`) : null));
  useEffect(() => {
    if (!ok || !src) return;
    const img = new Image();
    img.onload = () => {
      setSize({w: img.naturalWidth, h: img.naturalHeight});
      if (handle !== null) continueRender(handle);
    };
    img.onerror = () => cancelRender(new Error(`Could not load public/${src}`));
    img.src = staticFile(src);
  }, [src, ok, handle]);
  return ok ? size : {w: 16, h: 9};
};
