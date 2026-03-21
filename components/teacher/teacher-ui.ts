// components/teacher/teacher-ui.ts
import { Platform } from "react-native";

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 1024,
  desktopWide: 1360,
} as const;

export const spacing = (value: number) => value * 4;

export type Ui = {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideDesktop: boolean;
  contentMaxWidth: number;
  pagePaddingX: number;
  pagePaddingY: number;
  shellRadius: number;
  sidebarWidth: number;
  railWidth: number;
  rightPanelWidth: number;
  metricColumns: 1 | 2 | 3;
  quickActionColumns: 1 | 2;
  showDesktopSidebar: boolean;
  showRightPanelBesideContent: boolean;
  tableMinWidth: number;
};

export function buildTeacherTheme(colorScheme: "light" | "dark") {
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: {
      pageBg: isDark ? "#08111F" : "#EEF4FA",
      shellBg: isDark ? "#0B1527" : "#F6FAFD",
      shellBorder: isDark ? "rgba(129, 202, 224, 0.12)" : "rgba(11, 18, 32, 0.08)",
      surface: isDark ? "#101C31" : "#FFFFFF",
      surfaceStrong: isDark ? "#14233D" : "#F9FCFF",
      surfaceRaised: isDark ? "#162845" : "#FFFFFF",
      sidebarBg: isDark ? "#09101D" : "#EAF3F8",
      sidebarItem: isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.92)",
      primary: "#69C7D8",
      primaryStrong: "#47AAC0",
      primarySoft: isDark ? "rgba(105,199,216,0.14)" : "rgba(105,199,216,0.14)",
      accent: "#93E1EB",
      accentStrong: "#B8EEF3",
      text: isDark ? "#F5FAFF" : "#0E1A2B",
      textMuted: isDark ? "rgba(245,250,255,0.74)" : "rgba(14,26,43,0.68)",
      textSoft: isDark ? "rgba(245,250,255,0.52)" : "rgba(14,26,43,0.48)",
      divider: isDark ? "rgba(255,255,255,0.10)" : "rgba(14,26,43,0.10)",
      dividerSoft: isDark ? "rgba(255,255,255,0.06)" : "rgba(14,26,43,0.07)",
      overlay: "rgba(2, 8, 23, 0.72)",
      successBg: isDark ? "rgba(61, 191, 126, 0.18)" : "rgba(61, 191, 126, 0.10)",
      successBorder: isDark ? "rgba(61, 191, 126, 0.34)" : "rgba(61, 191, 126, 0.22)",
      warningBg: isDark ? "rgba(255, 185, 44, 0.18)" : "rgba(255, 185, 44, 0.10)",
      warningBorder: isDark ? "rgba(255, 185, 44, 0.36)" : "rgba(255, 185, 44, 0.22)",
      dangerBg: isDark ? "rgba(235, 95, 95, 0.18)" : "rgba(235, 95, 95, 0.10)",
      dangerBorder: isDark ? "rgba(235, 95, 95, 0.34)" : "rgba(235, 95, 95, 0.22)",
      dangerText: isDark ? "#FFB6B6" : "#B93E3E",
      infoBg: isDark ? "rgba(147, 225, 235, 0.16)" : "rgba(147, 225, 235, 0.18)",
      infoBorder: isDark ? "rgba(147, 225, 235, 0.28)" : "rgba(71,170,192,0.22)",
      focusRing: isDark ? "rgba(147,225,235,0.50)" : "rgba(71,170,192,0.32)",
      inputBg: isDark ? "rgba(255,255,255,0.04)" : "#F7FBFF",
      tableHeaderBg: isDark ? "rgba(147,225,235,0.08)" : "rgba(147,225,235,0.18)",
      accentCardText: "#07323A",
      cardGlow: isDark ? "rgba(105,199,216,0.10)" : "rgba(71,170,192,0.06)",
    },
    radius: {
      xs: 10,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 30,
      pill: 999,
    },
    type: {
      hero: { fontSize: 34, lineHeight: 40, fontWeight: "900" as const, letterSpacing: -0.5 },
      h1: { fontSize: 28, lineHeight: 34, fontWeight: "900" as const, letterSpacing: -0.3 },
      h2: { fontSize: 22, lineHeight: 28, fontWeight: "900" as const, letterSpacing: -0.15 },
      h3: { fontSize: 17, lineHeight: 22, fontWeight: "900" as const, letterSpacing: 0.1 },
      body: { fontSize: 15, lineHeight: 22, fontWeight: "700" as const },
      bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: "900" as const },
      meta: { fontSize: 13, lineHeight: 18, fontWeight: "800" as const },
      caption: { fontSize: 12, lineHeight: 16, fontWeight: "800" as const },
      tinyCaps: {
        fontSize: 11.5,
        lineHeight: 16,
        fontWeight: "900" as const,
        letterSpacing: 0.9,
        textTransform: "uppercase" as const,
      },
    },
    shadow: Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOpacity: isDark ? 0.28 : 0.1,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: isDark ? 8 : 4,
      },
      web: {
        shadowColor: "#000000",
        shadowOpacity: 0.14,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
      },
      default: {},
    }),
  };
}

export type TeacherTheme = ReturnType<typeof buildTeacherTheme>;

export function getTeacherUi(width: number, height: number): Ui {
  const isMobile = width < BREAKPOINTS.mobile;
  const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.tablet;
  const isWideDesktop = width >= BREAKPOINTS.desktopWide;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWideDesktop,
    contentMaxWidth: isWideDesktop ? 1480 : isDesktop ? 1340 : isTablet ? 1120 : width,
    pagePaddingX: isWideDesktop ? spacing(8) : isDesktop ? spacing(6) : isTablet ? spacing(5) : spacing(4),
    pagePaddingY: isWideDesktop ? spacing(7) : isDesktop ? spacing(6) : isTablet ? spacing(5) : spacing(4),
    shellRadius: isDesktop ? 34 : isTablet ? 28 : 0,
    sidebarWidth: isWideDesktop ? 262 : isDesktop ? 238 : 0,
    railWidth: isTablet ? 88 : 0,
    rightPanelWidth: isWideDesktop ? 320 : 0,
    metricColumns: isDesktop ? 3 : isTablet ? 2 : 1,
    quickActionColumns: isDesktop ? 2 : 1,
    showDesktopSidebar: isDesktop,
    showRightPanelBesideContent: width >= 1500,
    tableMinWidth: isWideDesktop ? 900 : isDesktop ? 800 : 720,
  };
}