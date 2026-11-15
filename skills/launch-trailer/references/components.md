# Component kit (framework/src/components)

Use these to build new scenes. Every size is in **layout units** (px at
1080p on the short side; `useLayout().u` converts), so a component looks the
same in every format. Every delay is in **seconds from the start of the scene**.
Import from `framework/src/lib.ts`.

| component | props | what it is |
|---|---|---|
| `Background` | `variant?` | glow gradient plus optional grid/dots; the trailer draws it once behind all scenes |
| `Stage` | `gap?`, `style?` | centred column with safe margins per format; most scenes start with it |
| `KineticText` | `text, size=110, weight, delay, stagger=0.08, accentWords[], align` | word-by-word slide-up reveal |
| `RiseText` | `children, size=44, weight, delay, muted, color, align` | a line that fades up |
| `Pill` | `children, delay, size, solid` | badge: NEW / v2.4 / Before |
| `Logo` | `size=160, delay, withName` | brand logo from `brand.logo`, or a lettermark |
| `Button` | `children, delay, size` | CTA button with a shine sweep |
| `Counter` | `value, prefix, suffix, decimals, delay, duration, size` | counts up |
| `KeyCaps` | `keys[], delay, stagger, size` | keys drop in, then all press together |
| `FeatureCard` | `icon, title, text, delay, width` | glass card |
| `DeviceFrame` | `frame, width(px), aspect, url, title` | browser / window / phone / none chrome around children |
| `Media` | `src, label` | image or video from public/; draws a wireframe placeholder when missing |
| `ZoomPan` | `keys[]`, children `(scale) => …` | camera over the media; children use media coordinates |
| `Callout` | spec fields + `scale` | highlight ring and label; put it inside ZoomPan |
| `Cursor` | `path[]`, `scale` | animated pointer with click ripples; put it inside ZoomPan |

Helpers: `useEnter(delay, 'soft'|'snappy'|'bouncy')` gives a 0→1 spring,
`rise(p)` and `pop(p)` turn it into styles, `useTime()` gives seconds,
`keyframes(keys, t, field)`, `useTheme()`, `useBrand()`, `useLayout()`
(`{u, width, height, portrait, square}`), `alpha(hex, a)`.
Scene helpers: `fitDevice(frame, aspect, boxW, boxH)` and
`frameHeight(...)` (in `scenes/Screen.tsx`).

## A new scene in 20 lines

```tsx
// framework/src/scenes/Pricing.tsx
import React from 'react';
import {FeatureCard, KineticText, Stage} from '../components';
import type {PricingScene} from '../spec';

export const Pricing: React.FC<PricingScene> = ({title, plans}) => (
  <Stage gap={50}>
    <KineticText text={title} size={90} />
    <div style={{display: 'flex', gap: 30}}>
      {plans.map((p, i) => <FeatureCard key={i} icon={p.price} title={p.name} text={p.text} delay={0.4 + i * 0.15} />)}
    </div>
  </Stage>
);
```

Then add `PricingScene` to the `Scene` union and `DEFAULT_DURATION` in
`spec.ts`, register it in `scenes/index.ts`, add the required fields to
`REQUIRED` in `scripts/check-spec.mjs`, and add a row to `spec.md`. Finish with
`npm test`.
