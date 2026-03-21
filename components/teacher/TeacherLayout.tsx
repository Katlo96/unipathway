// components/teacher/TeacherLayout.tsx
import React, { useMemo, useState } from "react";
import { View, Modal, Pressable, ScrollView, KeyboardAvoidingView, Platform, useColorScheme, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { buildTeacherTheme, getTeacherUi } from "./teacher-ui";
import { createTeacherSharedStyles } from "./teacher-styles";

type TeacherLayoutProps = {
  activeKey: "dashboard" | "students" | "reports" | "settings";
  children: React.ReactNode;
};

export default function TeacherLayout({ activeKey, children }: TeacherLayoutProps) {
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();

  const theme = useMemo(
    () => buildTeacherTheme(colorScheme === "dark" ? "dark" : "light"),
    [colorScheme]
  );
  const ui = useMemo(() => getTeacherUi(width, height), [width, height]);
  const styles = useMemo(() => createTeacherSharedStyles(theme, ui), [theme, ui]);

  const [menuOpen, setMenuOpen] = useState(false);

  const navDashboardHref: Href = "/teacher/dashboard";
  const navStudentsHref: Href = "/teacher/students";
  const navReportsHref: Href = "/teacher/reports";
  const navSettingsHref: Href = "/teacher/settings";
  const navNotificationsHref: Href = "/student/notifications";
  const loginHref: Href = "/login";

  function go(path: Href) {
    if (!ui.isDesktop) setMenuOpen(false);
    requestAnimationFrame(() => router.push(path));
  }

  function logout() {
    if (!ui.isDesktop) setMenuOpen(false);
    requestAnimationFrame(() => router.replace(loginHref));
  }

  return (
    <View style={styles.page}>
      <View style={styles.pageGlowTop} />
      <View style={styles.pageGlowRight} />
      <View style={styles.pageCenter}>
        <View
          style={[
            styles.shell,
            ui.isDesktop || ui.isTablet
              ? {
                  width: "100%",
                  maxWidth: ui.contentMaxWidth,
                  borderRadius: ui.shellRadius,
                  flex: 1,
                  alignSelf: "center",
                }
              : { flex: 1, width: "100%" },
          ]}
        >
          <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <View style={styles.appRow}>
              {/* Replace with your extracted Sidebar / NavRail components */}
              {/* Sidebar */}
              {/* NavRail */}

              <View style={styles.main}>
                <KeyboardAvoidingView
                  style={styles.main}
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                  <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    {children}
                  </ScrollView>
                </KeyboardAvoidingView>
              </View>
            </View>
          </SafeAreaView>

          {ui.isMobile ? (
            <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
              <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)} />
            </Modal>
          ) : null}
        </View>
      </View>
    </View>
  );
}