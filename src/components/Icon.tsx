import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

type Shape =
  | { d: string }
  | { circle: [number, number, number] }
  | { ellipse: [number, number, number, number] };

/** Small stroke icon set (24×24, 2px strokes), drawn with react-native-svg so it renders identically on every platform. */
const ICONS = {
  shieldCheck: [{ d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }, { d: 'm9 12 2 2 4-4' }],
  check: [{ d: 'M20 6 9 17l-5-5' }],
  x: [{ d: 'M18 6 6 18' }, { d: 'm6 6 12 12' }],
  mail: [
    { d: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
    { d: 'm22 6-10 7L2 6' },
  ],
  key: [
    { circle: [7.5, 15.5, 5.5] },
    { d: 'm21 2-9.6 9.6' },
    { d: 'm15.5 7.5 3 3L22 7l-3-3' },
  ],
  clock: [{ circle: [12, 12, 10] }, { d: 'M12 6v6l4 2' }],
  logOut: [
    { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' },
    { d: 'm16 17 5-5-5-5' },
    { d: 'M21 12H9' },
  ],
  users: [
    { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' },
    { circle: [9, 7, 4] },
    { d: 'M22 21v-2a4 4 0 0 0-3-3.87' },
    { d: 'M16 3.13a4 4 0 0 1 0 7.75' },
  ],
  user: [{ d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }, { circle: [12, 7, 4] }],
  lock: [
    { d: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z' },
    { d: 'M7 11V7a5 5 0 0 1 10 0v4' },
  ],
  globe: [
    { circle: [12, 12, 10] },
    { d: 'M2 12h20' },
    { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
  ],
  sparkles: [
    { d: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z' },
    { d: 'M19 3v4' },
    { d: 'M21 5h-4' },
  ],
  arrowRight: [{ d: 'M5 12h14' }, { d: 'm12 5 7 7-7 7' }],
  refresh: [{ d: 'M21 12a9 9 0 1 1-3-6.7L21 8' }, { d: 'M21 3v5h-5' }],
  search: [{ circle: [11, 11, 8] }, { d: 'm21 21-4.3-4.3' }],
  crown: [{ d: 'M3 7l5 4 4-7 4 7 5-4-2 12H5z' }, { d: 'M5 21h14' }],
  activity: [{ d: 'M22 12h-4l-3 9L9 3l-3 9H2' }],
  database: [
    { ellipse: [12, 5, 9, 3] },
    { d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' },
    { d: 'M3 12c0 1.66 4 3 9 3s9-1.34 9-3' },
  ],
  grid: [{ d: 'M3 3h7v9H3z' }, { d: 'M14 3h7v5h-7z' }, { d: 'M14 12h7v9h-7z' }, { d: 'M3 16h7v5H3z' }],
  alert: [{ circle: [12, 12, 10] }, { d: 'M12 8v4' }, { d: 'M12 16h.01' }],
  zap: [{ d: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z' }],
  calendar: [
    { d: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
    { d: 'M16 2v4' },
    { d: 'M8 2v4' },
    { d: 'M3 10h18' },
  ],
  fingerprint: [
    { d: 'M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4' },
    { d: 'M14 13.12c0 2.38 0 6.38-1 8.88' },
    { d: 'M17.29 21.02c.12-.6.43-2.3.5-3.02' },
    { d: 'M2 12a10 10 0 0 1 18-6' },
    { d: 'M2 16h.01' },
    { d: 'M21.8 16c.2-2 .13-5.35 0-6' },
    { d: 'M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2' },
    { d: 'M8.65 22c.21-.66.45-1.32.57-2' },
    { d: 'M9 6.8a6 6 0 0 1 9 5.2v2' },
  ],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 18,
  color = 'currentColor',
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const shapes: Shape[] = ICONS[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {shapes.map((s, i) =>
        'd' in s ? (
          <Path key={i} d={s.d} />
        ) : 'circle' in s ? (
          <Circle key={i} cx={s.circle[0]} cy={s.circle[1]} r={s.circle[2]} />
        ) : (
          <Ellipse key={i} cx={s.ellipse[0]} cy={s.ellipse[1]} rx={s.ellipse[2]} ry={s.ellipse[3]} />
        ),
      )}
    </Svg>
  );
}
