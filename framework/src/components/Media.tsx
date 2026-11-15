import React from 'react';
import {getStaticFiles, Img, OffthreadVideo, staticFile} from 'remotion';
import {alpha, useLayout, useTheme} from '../theme';

const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

/** True when `name` exists in the trailer's public/ folder. */
export const hasFile = (name?: string) => {
  if (!name) return false;
  try {
    return getStaticFiles().some((f) => f.name === name.replace(/^\/+/, ''));
  } catch {
    return true; // outside the studio/renderer: assume present
  }
};

/**
 * A screenshot or screen recording from public/, cover-fitted to its box.
 * Missing or unset media renders a labelled wireframe so drafts still render.
 */
export const Media: React.FC<{src?: string; label?: string; style?: React.CSSProperties; startFrom?: number}> = ({src, label, style, startFrom}) => {
  const fill: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block', ...style};
  if (src && hasFile(src)) {
    return VIDEO.test(src) ? <OffthreadVideo src={staticFile(src)} style={fill} muted startFrom={startFrom} /> : <Img src={staticFile(src)} style={fill} />;
  }
  return <Placeholder label={label ?? (src ? `missing: public/${src}` : 'screenshot goes here')} />;
};

const Placeholder: React.FC<{label: string}> = ({label}) => {
  const theme = useTheme();
  const {u} = useLayout();
  const bar = (w: string, h = 18, o = 0.12): React.CSSProperties => ({width: w, height: h * u, borderRadius: 6 * u, background: alpha(theme.fg, o)});
  return (
    <div style={{width: '100%', height: '100%', background: theme.surface, display: 'flex', fontFamily: theme.fontFamily, position: 'relative'}}>
      <div style={{width: '18%', borderRight: `1px solid ${alpha(theme.fg, 0.08)}`, padding: 24 * u, display: 'flex', flexDirection: 'column', gap: 16 * u}}>
        {[70, 55, 80, 60, 45].map((w, i) => (
          <div key={i} style={bar(`${w}%`, 14, i === 1 ? 0.3 : 0.1)} />
        ))}
      </div>
      <div style={{flex: 1, padding: 32 * u, display: 'flex', flexDirection: 'column', gap: 20 * u}}>
        <div style={bar('40%', 28, 0.18)} />
        <div style={{display: 'flex', gap: 20 * u, flex: 1}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{flex: 1, borderRadius: 12 * u, background: alpha(i === 0 ? theme.accent : theme.fg, i === 0 ? 0.16 : 0.06)}} />
          ))}
        </div>
        <div style={bar('85%', 14)} />
        <div style={bar('65%', 14)} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          padding: `${10 * u}px ${20 * u}px`,
          borderRadius: 999,
          background: alpha(theme.bg, 0.85),
          color: theme.muted,
          fontSize: 22 * u,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </div>
  );
};
