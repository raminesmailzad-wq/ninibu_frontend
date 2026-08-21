import { ninibuColors, ninibuRadius, ninibuSpacing } from '@ninibu/design';

export const colors = {
  ...ninibuColors,
  page: '#F1EFF6',
  elevated: '#FFFFFF',
  inkSoft: '#625B6E',
  lineStrong: '#D9D2E3',
  purpleGlow: '#E8E3FB',
  pinkGlow: '#FBE3EC',
};
export const radius = ninibuRadius;
export const space = ninibuSpacing;
export const shadow = {
  shadowColor: '#3E306A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 24, elevation: 4,
};
export const typography = { regular: undefined, medium: undefined, bold: undefined } as const;
