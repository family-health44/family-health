// src/design-system/components/Icon.tsx
// Web-safe icon wrapper. Maps the app's SF Symbol names to lucide-react-native
// icons (RN + web via react-native-svg). rgba/#RGBA colours are flattened to
// opaque hex, composited against the page background.
import {
  Bell,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  FileText,
  IdCard,
  Pencil,
  Pill,
  Plus,
  Square,
  SquarePen,
  Stethoscope,
  StickyNote,
  type LucideIcon,
} from 'lucide-react-native';

export type SFSymbol = string;

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
    const blend = (ch: number, bg: number) => ch * a + bg * (1 - a);
    return `#${hex2(blend(r, BLEND_BG.r))}${hex2(blend(g, BLEND_BG.g))}${hex2(blend(b, BLEND_BG.b))}`;
  }
  if (/^#[0-9a-f]{3}$/i.test(c)) {
    return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
  }
  if (/^#[0-9a-f]{8}$/i.test(c)) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    const a = parseInt(c.slice(7, 9), 16) / 255;
    const blend = (ch: number, bg: number) => ch * a + bg * (1 - a);
    return `#${hex2(blend(r, BLEND_BG.r))}${hex2(blend(g, BLEND_BG.g))}${hex2(blend(b, BLEND_BG.b))}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;
  return '#000000';
}

const MAP: Record<string, LucideIcon> = {
  bell: Bell,
  calendar: Calendar,
  camera: Camera,
  checkmark: Check,
  'checkmark.circle': CheckCircle2,
  'chevron.left': ChevronLeft,
  'chevron.right': ChevronRight,
  circle: Circle,
  doc: FileText,
  'list.clipboard': ClipboardList,
  'note.text': StickyNote,
  'person.text.rectangle': IdCard,
  pencil: Pencil,
  pills: Pill,
  plus: Plus,
  square: Square,
  'square.and.pencil': SquarePen,
  stethoscope: Stethoscope,
};

interface IconProps {
  name: SFSymbol;
  size?: number;
  color?: string;
  weight?: string;
}

export const Icon = ({ name, size = 20, color = '#1F5C41' }: IconProps) => {
  const Cmp = MAP[name] ?? Circle;
  return <Cmp size={size} color={toOpaqueHex(color)} />;
};
