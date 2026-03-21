// components/teacher/teacher-styles.ts
import { StyleSheet } from "react-native";
import { spacing, TeacherTheme, Ui } from "./teacher-ui";

export function createTeacherSharedStyles(theme: TeacherTheme, ui: Ui) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.pageBg,
    },
    pageGlowTop: {
      position: "absolute",
      top: -120,
      left: -80,
      width: 300,
      height: 300,
      borderRadius: 999,
      backgroundColor: theme.colors.cardGlow,
    },
    pageGlowRight: {
      position: "absolute",
      top: 120,
      right: -120,
      width: 340,
      height: 340,
      borderRadius: 999,
      backgroundColor: theme.colors.cardGlow,
    },
    pageCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      paddingHorizontal: ui.isDesktop ? spacing(5) : 0,
      paddingTop: ui.isDesktop ? spacing(4) : 0,
      paddingBottom: ui.isDesktop ? spacing(4) : 0,
    },
    shell: {
      overflow: "hidden",
      backgroundColor: theme.colors.shellBg,
      borderWidth: ui.isDesktop || ui.isTablet ? 1 : 0,
      borderColor: theme.colors.shellBorder,
      ...theme.shadow,
    },
    safe: {
      flex: 1,
    },
    appRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "stretch",
    },
    main: {
      flex: 1,
      minWidth: 0,
    },
    scrollContent: {
      paddingHorizontal: ui.isDesktop ? spacing(4) : ui.pagePaddingX,
      paddingTop: ui.isDesktop ? spacing(4) : ui.pagePaddingY,
      paddingBottom: spacing(6),
      flexGrow: 1,
    },
  });
}