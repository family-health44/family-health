// src/design-system/components/Icon.tsx
// Thin wrapper over expo-symbols. iOS-only (SF Symbols); renders nothing on
// Android until a fallback set is added.
//
// CRASH GUARD: SymbolView's native tintColor bridge throws an NSException on
// rgba() strings (native crash, invisible to Sentry). Every colour is flattened
// to an opaque hex here, compositing any alpha against the app's page colour.
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

export type SFSymbol = SymbolViewProps['name'];

// The colour rgba() alpha is composited against. Matches the app page bg.
const BLEND_BG = { r: 0xf4, g: 0xf2, b: 0xec };

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const hex2 = (n: number) => clamp(n).toString(16).padStart(2, '0');

function toOpaqueHex(colour: string): string {
  const c = colour.trim();

  const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(c);
  if (m) {
    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    const a = m[4] === undefined ? 1 : Number(m[4]);
    if ([r, g, b, a].some((n) => Number.isNaN(n))) return '#000000';
    // Composite over the page background so the icon reads the same as the old text glyph.
    const blend = (ch: number, bg: number) => ch * a + bg * (1 - a);
    return `#${hex2(blend(r, BLEND_BG.r))}${hex2(blend(g, BLEND_BG.g))}${hex2(blend(b, BLEND_BG.b))}`;
  }

  // #RGB -> #RRGGBB
  if (/^#[0-9a-f]{3}$/i.test(c)) {
    return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
  }

  // #RRGGBBAA -> composite the alpha out
  if (/^#[0-9a-f]{8}$/i.test(c)) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    const a = parseInt(c.slice(7, 9), 16) / 255;
    const blend = (ch: number, bg: number) => ch * a + bg * (1 - a);
    return `#${hex2(blend(r, BLEND_BG.r))}${hex2(blend(g, BLEND_BG.g))}${hex2(blend(b, BLEND_BG.b))}`;
  }

  if (/^#[0-9a-f]{6}$/i.test(c)) return c;

  // Named colours and anything unrecognised: don't risk the native bridge.
  return '#000000';
}

interface IconProps {
  name: SFSymbol;
  size?: number;
  color?: string;
  weight?: SymbolViewProps['weight'];
}

export const Icon = ({ name, size = 20, color = '#1F5C41', weight = 'regular' }: IconProps) => (
  <SymbolView
    name={name}
    size={size}
    tintColor={toOpaqueHex(color)}
    weight={weight}
    type="monochrome"
    resizeMode="scaleAspectFit"
    style={{ width: size, height: size }}
  />
);
