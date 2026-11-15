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

## Scenario kit

| component | props | what it is |
|---|---|---|
| `Headline` | `text` (`*accent*`), `size`, `delay`, `tone`, `align`, `maxWidth` | editorial display-font headline; words drift up out of a blur |
| `Notification` | `app, title, text, time, at, until, width` | glass push notification |
| `Bubble` | `from, text, at, until, speak, width` | transcript/chat bubble; words light up as spoken |
| `Toast` | `text, at, until` | ✓ confirmation pill |
| `Chip` | `text, at, until, tone` | typed-out monospace proof chip |
| `TimeStamp` | `time, label, tone, at` | "07:30 WAKE UP" |
| `quadMatrix(w, h, quad)` | | CSS `matrix3d` that warps a w×h box onto a 4-point quad (screen replacement) |
| `useImageSize(src)` | | natural size of a public/ image (holds the render until known) |

## 3D kit (opt-in; framework/src/three)

| export | what it is |
|---|---|
| `Stage3D` | full-frame transparent three.js canvas (`@remotion/three`) with theme lights; children are R3F elements |
| `CameraRig` | `position`, `target`, `fov`: sets the camera every frame |
| `fitDistance(w, h, aspect)` | camera distance that fits a w × h box |
| `Laptop` | `screen` texture, `open` 0..1, `color`, `brightness`; origin = bottom-centre of the base |
| `Phone` | `screen` texture, `color`; centred |
| `AppIcon` | `logo` texture, `size` |
| `Screen3D` | a rounded, cover-fitted textured plane |
| `useImageTextures(srcs, placeholder)` / `useImageTexture` | load public/ images **in the scene component, outside `<Stage3D>`**, and pass the textures in. The canvas only redraws on frame changes, so a texture loaded inside it never appears |
| `roundedPlane(w, h, r, crop)` | rounded-rect geometry with UVs mapped to a crop of the texture (used to cut widgets out of a screenshot) |
| `coverCrop`, `textureAspect`, `placeholderTexture`, `shadowTexture`, `keyboardTexture` | helpers |

Animate by computing values from `useCurrentFrame()` (never R3F's
`useFrame`), as the 3D scenes in `scenes/` do.

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
