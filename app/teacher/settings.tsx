// app/teacher/settings.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
  Modal,
  Switch,
  Alert,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TeacherLayout from "../../components/teacher/TeacherLayout";
import {
  buildTeacherTheme,
  getTeacherUi,
  spacing,
  type TeacherTheme,
  type Ui,
} from "../../components/teacher/teacher-ui";

/* ============================================================================
   Data (stub)
============================================================================ */

const SCHOOL_NAME = "Botswana Accountancy College";
const TEACHER_NAME = "Ms. D. Kgomotso";
const TEACHER_EMAIL = "teacher@school.ac.bw";

/* ============================================================================
   Screen
============================================================================ */

export default function TeacherSettingsScreen() {
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();

  const theme = useMemo(
    () => buildTeacherTheme(colorScheme === "dark" ? "dark" : "light"),
    [colorScheme]
  );
  const ui = useMemo(() => getTeacherUi(width, height), [width, height]);
  const styles = useMemo(() => createStyles(theme, ui), [theme, ui]);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [defaultClassView, setDefaultClassView] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  function openPlaceholder(title: string) {
    Alert.alert(title, "This is a frontend placeholder. Wire it to backend later.");
  }

  return (
    <TeacherLayout activeKey="settings">
      <View style={styles.screen}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTextBlock}>
              <View style={styles.eyebrowBadge}>
                <Ionicons name="settings-outline" size={14} color={theme.colors.accentCardText} />
                <Text style={styles.eyebrowBadgeText}>Teacher preferences</Text>
              </View>

              <Text style={styles.pageTitle}>Settings</Text>
              <Text style={styles.pageSubtitle}>
                Manage account preferences, notifications, support options, and teacher-specific defaults
                for your UniPathway workspace.
              </Text>
            </View>

            <View style={styles.heroActionWrap}>
              <Pressable
                onPress={() => setProfileModalOpen(true)}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Open quick profile panel"
              >
                <Ionicons name="person-circle-outline" size={18} color={theme.colors.accentCardText} />
                <Text style={styles.primaryButtonText}>Profile</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <InfoPill theme={theme} icon="school-outline" text={SCHOOL_NAME} />
            <InfoPill theme={theme} icon="person-outline" text={TEACHER_NAME} />
            <InfoPill theme={theme} icon="mail-outline" text={TEACHER_EMAIL} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentGrid}>
          <View style={styles.column}>
            <SectionHeader
              theme={theme}
              styles={styles}
              title="Account"
              subtitle="Core teacher account information and access settings."
            />

            <Card theme={theme} styles={styles}>
              <View style={styles.accountRow}>
                <View style={styles.accountContent}>
                  <Text style={styles.fieldLabel}>Name</Text>
                  <Text style={styles.fieldValue}>{TEACHER_NAME}</Text>
                </View>

                <Pressable
                  onPress={() => openPlaceholder("Edit name")}
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Edit name"
                >
                  <Ionicons name="pencil-outline" size={16} color={theme.colors.text} />
                  <Text style={styles.secondaryButtonText}>Edit</Text>
                </Pressable>
              </View>

              <Divider theme={theme} styles={styles} />

              <View style={styles.accountRow}>
                <View style={styles.accountContent}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <Text style={styles.fieldValue}>{TEACHER_EMAIL}</Text>
                </View>

                <View style={styles.readOnlyPill}>
                  <Ionicons name="lock-closed-outline" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.readOnlyPillText}>Read-only</Text>
                </View>
              </View>

              <Divider theme={theme} styles={styles} />

              <ActionRow
                theme={theme}
                styles={styles}
                icon="key-outline"
                title="Change password"
                subtitle="Update your login credentials"
                onPress={() => openPlaceholder("Change password")}
              />
            </Card>

            <SectionHeader
              theme={theme}
              styles={styles}
              title="Privacy & support"
              subtitle="Documents, policies, and help channels."
            />

            <Card theme={theme} styles={styles}>
              <ActionRow
                theme={theme}
                styles={styles}
                icon="document-text-outline"
                title="Terms & Conditions"
                subtitle="Read platform terms and usage details"
                onPress={() => openPlaceholder("Terms & Conditions")}
              />
              <Divider theme={theme} styles={styles} />
              <ActionRow
                theme={theme}
                styles={styles}
                icon="shield-checkmark-outline"
                title="Privacy Policy"
                subtitle="Understand how platform data is handled"
                onPress={() => openPlaceholder("Privacy Policy")}
              />
              <Divider theme={theme} styles={styles} />
              <ActionRow
                theme={theme}
                styles={styles}
                icon="mail-outline"
                title="Contact support"
                subtitle="Get help from the UniPathway team"
                onPress={() => openPlaceholder("Contact support")}
              />
            </Card>
          </View>

          <View style={styles.column}>
            <SectionHeader
              theme={theme}
              styles={styles}
              title="Notifications"
              subtitle="Control which updates and reminders reach you."
            />

            <Card theme={theme} styles={styles}>
              <ToggleRow
                theme={theme}
                styles={styles}
                title="Push notifications"
                subtitle="App alerts for key events and important changes"
                value={pushEnabled}
                onValueChange={setPushEnabled}
              />
              <Divider theme={theme} styles={styles} />
              <ToggleRow
                theme={theme}
                styles={styles}
                title="Email notifications"
                subtitle="Weekly summaries and platform updates"
                value={emailEnabled}
                onValueChange={setEmailEnabled}
              />
              <Divider theme={theme} styles={styles} />
              <ToggleRow
                theme={theme}
                styles={styles}
                title="Deadline alerts"
                subtitle="Reminders for sponsorship and application deadlines"
                value={deadlineAlerts}
                onValueChange={setDeadlineAlerts}
              />
            </Card>

            <SectionHeader
              theme={theme}
              styles={styles}
              title="Teacher preferences"
              subtitle="Customize your preferred classroom workflow."
            />

            <Card theme={theme} styles={styles}>
              <ToggleRow
                theme={theme}
                styles={styles}
                title="Default class view"
                subtitle="Open the last used class filter by default"
                value={defaultClassView}
                onValueChange={setDefaultClassView}
              />
              <Divider theme={theme} styles={styles} />
              <ActionRow
                theme={theme}
                styles={styles}
                icon="options-outline"
                title="Set default class"
                subtitle="Choose which class or stream opens first"
                onPress={() => openPlaceholder("Default class")}
              />
            </Card>

            <SectionHeader
              theme={theme}
              styles={styles}
              title="Danger zone"
              subtitle="Sensitive actions that affect current access."
            />

            <Card theme={theme} styles={styles}>
              <DangerRow
                theme={theme}
                styles={styles}
                title="Logout"
                subtitle="Return to the login screen"
                onPress={() => openPlaceholder("Logout")}
              />
            </Card>
          </View>
        </View>

        {/* Profile modal */}
        <Modal
          visible={profileModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setProfileModalOpen(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setProfileModalOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <View style={styles.profileAvatar}>
                <Ionicons name="person-outline" size={28} color={theme.colors.primaryStrong} />
              </View>

              <Text style={styles.modalTitle}>{TEACHER_NAME}</Text>
              <Text style={styles.modalSubtitle}>{TEACHER_EMAIL}</Text>

              <View style={styles.profileMetaList}>
                <ProfileMetaRow theme={theme} styles={styles} icon="school-outline" label="School" value={SCHOOL_NAME} />
                <ProfileMetaRow theme={theme} styles={styles} icon="shield-checkmark-outline" label="Role" value="Teacher portal access" />
                <ProfileMetaRow theme={theme} styles={styles} icon="notifications-outline" label="Alerts" value={pushEnabled ? "Push enabled" : "Push disabled"} />
              </View>

              <Pressable
                onPress={() => setProfileModalOpen(false)}
                style={({ pressed }) => [styles.primaryButton, styles.modalButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Close profile panel"
              >
                <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.accentCardText} />
                <Text style={styles.primaryButtonText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </TeacherLayout>
  );
}

/* ============================================================================
   Components
============================================================================ */

function SectionHeader({
  theme,
  styles,
  title,
  subtitle,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEyebrow}>Settings</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function Card({
  theme,
  styles,
  children,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  children: React.ReactNode;
}) {
  return <View style={styles.card}>{children}</View>;
}

function Divider({
  theme,
  styles,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
}) {
  return <View style={styles.divider} />;
}

function ActionRow({
  theme,
  styles,
  icon,
  title,
  subtitle,
  onPress,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.primaryStrong} />
      </View>

      <View style={styles.actionTextWrap}>
        <Text style={styles.actionTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.actionSub} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.colors.textSoft} />
    </Pressable>
  );
}

function DangerRow({
  theme,
  styles,
  title,
  subtitle,
  onPress,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, styles.dangerRow, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.dangerIcon}>
        <Ionicons name="log-out-outline" size={18} color={theme.colors.dangerText} />
      </View>

      <View style={styles.actionTextWrap}>
        <Text style={styles.dangerTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.actionSub} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.colors.dangerText} />
    </Pressable>
  );
}

function ToggleRow({
  theme,
  styles,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.actionTextWrap}>
        <Text style={styles.actionTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.actionSub} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.divider,
          true: theme.colors.primary,
        }}
        thumbColor={value ? theme.colors.surface : theme.colors.surfaceRaised}
      />
    </View>
  );
}

function InfoPill({
  theme,
  icon,
  text,
}: {
  theme: TeacherTheme;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  const local = createInlinePillStyles(theme);

  return (
    <View style={local.pill}>
      <Ionicons name={icon} size={14} color={theme.colors.text} />
      <Text style={local.pillText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function ProfileMetaRow({
  theme,
  styles,
  icon,
  label,
  value,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.profileMetaRow}>
      <View style={styles.profileMetaIcon}>
        <Ionicons name={icon} size={16} color={theme.colors.primaryStrong} />
      </View>

      <View style={styles.profileMetaTextWrap}>
        <Text style={styles.profileMetaLabel}>{label}</Text>
        <Text style={styles.profileMetaValue}>{value}</Text>
      </View>
    </View>
  );
}

/* ============================================================================
   Styles
============================================================================ */

function createStyles(theme: TeacherTheme, ui: Ui) {
  return StyleSheet.create({
    screen: {
      gap: spacing(6),
    },

    heroCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: ui.isDesktop ? spacing(6) : spacing(4),
      gap: spacing(4),
      ...theme.shadow,
    },
    heroHeaderRow: {
      flexDirection: ui.isDesktop ? "row" : "column",
      alignItems: ui.isDesktop ? "center" : "flex-start",
      justifyContent: "space-between",
      gap: spacing(4),
    },
    heroTextBlock: {
      flex: 1,
      minWidth: 0,
      gap: spacing(2),
    },
    eyebrowBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
    },
    eyebrowBadgeText: {
      ...theme.type.caption,
      color: theme.colors.accentCardText,
    },
    pageTitle: {
      ...(ui.isDesktop ? theme.type.h1 : theme.type.h2),
      color: theme.colors.text,
    },
    pageSubtitle: {
      ...theme.type.body,
      color: theme.colors.textMuted,
      maxWidth: 760,
    },
    heroActionWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2.5),
      flexWrap: "wrap",
    },
    heroMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(2.5),
    },

    contentGrid: {
      flexDirection: ui.isDesktop ? "row" : "column",
      gap: spacing(5),
      alignItems: "stretch",
    },
    column: {
      flex: 1,
      gap: spacing(5),
      minWidth: 0,
    },

    sectionHeader: {
      gap: spacing(1),
    },
    sectionEyebrow: {
      ...theme.type.tinyCaps,
      color: theme.colors.primaryStrong,
    },
    sectionTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
    },
    sectionSubtitle: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },

    card: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: spacing(4),
      ...theme.shadow,
    },

    accountRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    accountContent: {
      flex: 1,
      minWidth: 0,
    },
    fieldLabel: {
      ...theme.type.tinyCaps,
      color: theme.colors.textMuted,
    },
    fieldValue: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      marginTop: spacing(1),
    },

    readOnlyPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(1.5),
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
    },
    readOnlyPillText: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },

    divider: {
      height: 1,
      backgroundColor: theme.colors.dividerSoft,
      marginVertical: spacing(4),
    },

    actionRow: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    actionTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    actionTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    actionSub: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      marginTop: spacing(0.75),
    },

    toggleRow: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },

    dangerRow: {},
    dangerIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.dangerBg,
      borderWidth: 1,
      borderColor: theme.colors.dangerBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    dangerTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.dangerText,
    },

    primaryButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(2.5),
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.primaryStrong,
    },
    primaryButtonText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "900",
      color: theme.colors.accentCardText,
    },
    secondaryButton: {
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
      paddingHorizontal: spacing(3.5),
      paddingVertical: spacing(2),
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    secondaryButtonText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "900",
      color: theme.colors.text,
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing(4),
    },
    modalCard: {
      width: "100%",
      maxWidth: 440,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: spacing(5),
      alignItems: "center",
      ...theme.shadow,
    },
    modalHandle: {
      width: 56,
      height: 5,
      borderRadius: 999,
      backgroundColor: theme.colors.divider,
      marginBottom: spacing(4),
    },
    profileAvatar: {
      width: 74,
      height: 74,
      borderRadius: 999,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing(3),
    },
    modalTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
      textAlign: "center",
    },
    modalSubtitle: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      textAlign: "center",
      marginTop: spacing(1),
    },
    profileMetaList: {
      width: "100%",
      gap: spacing(3),
      marginTop: spacing(5),
    },
    profileMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
      width: "100%",
      padding: spacing(3),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
    },
    profileMetaIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    profileMetaTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    profileMetaLabel: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    profileMetaValue: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      marginTop: spacing(0.5),
    },
    modalButton: {
      marginTop: spacing(5),
      minWidth: 140,
    },

    pressed: {
      opacity: 0.95,
      transform: [{ scale: 0.985 }],
    },
  });
}

function createInlinePillStyles(theme: TeacherTheme) {
  return StyleSheet.create({
    pill: {
      maxWidth: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      borderRadius: theme.radius.pill,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.75),
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
    } as ViewStyle,
    pillText: {
      ...theme.type.caption,
      color: theme.colors.text,
      flexShrink: 1,
    } as TextStyle,
  });
}