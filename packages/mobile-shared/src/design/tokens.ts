export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 32 } as const;
export const radii = { sm: 8, md: 10, lg: 12, xl: 16, group: 10, button: 12, pill: 999 } as const;
export const touchTarget = 44;

export const typography = {
  largeTitle: { fontSize: 34, fontWeight: "700" as const },
  title1: { fontSize: 28, fontWeight: "700" as const },
  title2: { fontSize: 22, fontWeight: "700" as const },
  title3: { fontSize: 20, fontWeight: "600" as const },
  headline: { fontSize: 17, fontWeight: "600" as const },
  body: { fontSize: 17, fontWeight: "400" as const },
  subhead: { fontSize: 15, fontWeight: "400" as const },
  footnote: { fontSize: 13, fontWeight: "400" as const },
  caption1: { fontSize: 12, fontWeight: "400" as const },
} as const;
