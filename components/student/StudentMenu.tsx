import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';

const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const radii = {
  md: spacing(3),
  lg: spacing(4),
  xl: spacing(5),
  pill: 9999,
};

type MenuAction = 'home' | 'profile' | 'settings' | 'notifications' | 'logout';

type StudentMenuContextValue = {
  openMenu: () => void;
  closeMenu: () => void;
  isOpen: boolean;
};

const StudentMenuContext = createContext<StudentMenuContextValue | null>(null);

export function StudentMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { width } = useWindowDimensions();

  const rawScheme = useColorScheme();
  const scheme: 'light' | 'dark' = rawScheme === 'dark' ? 'dark' : 'light';

  const isMobile = width < 480;
  const isTablet = width >= 480 && width <= 1024;

  const colors = useMemo(
    () => ({
      overlay: 'rgba(0,0,0,0.55)',
      text: scheme === 'light' ? '#0B0F12' : '#EAF2F8',
      muted: scheme === 'light' ? 'rgba(11,15,18,0.55)' : 'rgba(234,242,248,0.60)',
      card: scheme === 'light' ? '#F7FBFC' : '#18222C',
      cardBorder: scheme === 'light' ? 'rgba(11,15,18,0.08)' : 'rgba(234,242,248,0.12)',
      section: scheme === 'light' ? '#FFFFFF' : '#111A22',
      sectionBorder: scheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(234,242,248,0.10)',
      tealSoft: scheme === 'light' ? 'rgba(87,175,194,0.14)' : 'rgba(87,175,194,0.22)',
      tealBorder: scheme === 'light' ? 'rgba(87,175,194,0.35)' : 'rgba(87,175,194,0.30)',
      danger: '#B22222',
      dangerSoft: scheme === 'light' ? 'rgba(178,34,34,0.10)' : 'rgba(178,34,34,0.18)',
      dangerBorder: scheme === 'light' ? 'rgba(178,34,34,0.18)' : 'rgba(178,34,34,0.24)',
      closeBg: scheme === 'light' ? '#FFFFFF' : '#101820',
      closeBorder: scheme === 'light' ? 'rgba(0,0,0,0.10)' : 'rgba(234,242,248,0.10)',
      divider: scheme === 'light' ? 'rgba(0,0,0,0.10)' : 'rgba(234,242,248,0.10)',
      dividerSoft: scheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(234,242,248,0.08)',
    }),
    [scheme]
  );

  const value = useMemo<StudentMenuContextValue>(
    () => ({
      isOpen,
      openMenu: () => setIsOpen(true),
      closeMenu: () => setIsOpen(false),
    }),
    [isOpen]
  );

  const homeHref: Href = { pathname: '/student/dashboard' as any };
  const profileHref: Href = { pathname: '/student/profile' as any };
  const settingsHref: Href = { pathname: '/student/settings' as any };
  const notificationsHref: Href = { pathname: '/student/notifications' as any };

  function runAction(action: MenuAction) {
    setIsOpen(false);

    if (action === 'home') router.push(homeHref);
    if (action === 'profile') router.push(profileHref);
    if (action === 'settings') router.push(settingsHref);
    if (action === 'notifications') router.push(notificationsHref);

    if (action === 'logout') {
      router.replace('/login');
    }
  }

  const cardWidth = isMobile ? Math.min(width - spacing(8), 380) : isTablet ? 380 : 400;

  return (
    <StudentMenuContext.Provider value={value}>
      {children}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={[styles.backdrop, { backgroundColor: colors.overlay }]}
            onPress={() => setIsOpen(false)}
            accessibilityLabel="Close menu overlay"
          />

          <View style={styles.centerLayer} pointerEvents="box-none">
            <View
              style={[
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  alignSelf: isMobile ? 'stretch' : 'center',
                },
                isMobile ? styles.cardMobile : styles.cardDesktop,
              ]}
            >
              <View style={styles.headerRow}>
                <View style={{ width: 34 }} />
                <Text style={[styles.title, { color: colors.text }]}>Menu</Text>

                <Pressable
                  onPress={() => setIsOpen(false)}
                  style={({ pressed }) => [
                    styles.closeBtn,
                    {
                      backgroundColor: colors.closeBg,
                      borderColor: colors.closeBorder,
                    },
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Close menu"
                >
                  <Ionicons name="close" size={18} color={colors.text} />
                </Pressable>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <MenuItem
                icon="home-outline"
                label="Home"
                onPress={() => runAction('home')}
                textColor={colors.text}
                mutedColor={colors.muted}
                tintBg={colors.tealSoft}
                tintBorder={colors.tealBorder}
                itemBg={colors.section}
                itemBorder={colors.sectionBorder}
              />

              <MenuItem
                icon="person-outline"
                label="Profile"
                onPress={() => runAction('profile')}
                textColor={colors.text}
                mutedColor={colors.muted}
                tintBg={colors.tealSoft}
                tintBorder={colors.tealBorder}
                itemBg={colors.section}
                itemBorder={colors.sectionBorder}
              />

              <MenuItem
                icon="settings-outline"
                label="Settings"
                onPress={() => runAction('settings')}
                textColor={colors.text}
                mutedColor={colors.muted}
                tintBg={colors.tealSoft}
                tintBorder={colors.tealBorder}
                itemBg={colors.section}
                itemBorder={colors.sectionBorder}
              />

              <MenuItem
                icon="notifications-outline"
                label="Notifications"
                onPress={() => runAction('notifications')}
                textColor={colors.text}
                mutedColor={colors.muted}
                tintBg={colors.tealSoft}
                tintBorder={colors.tealBorder}
                itemBg={colors.section}
                itemBorder={colors.sectionBorder}
              />

              <View style={[styles.dividerSoft, { backgroundColor: colors.dividerSoft }]} />

              <MenuItem
                icon="log-out-outline"
                label="Logout"
                danger
                onPress={() => runAction('logout')}
                textColor={colors.text}
                mutedColor={colors.muted}
                tintBg={colors.dangerSoft}
                tintBorder={colors.dangerBorder}
                itemBg={colors.section}
                itemBorder={colors.sectionBorder}
                dangerColor={colors.danger}
              />
            </View>
          </View>
        </View>
      </Modal>
    </StudentMenuContext.Provider>
  );
}

export function useStudentMenu() {
  const ctx = useContext(StudentMenuContext);
  if (!ctx) {
    throw new Error('useStudentMenu must be used within <StudentMenuProvider />');
  }
  return ctx;
}

function MenuItem({
  icon,
  label,
  onPress,
  danger,
  textColor,
  mutedColor,
  tintBg,
  tintBorder,
  itemBg,
  itemBorder,
  dangerColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  textColor: string;
  mutedColor: string;
  tintBg: string;
  tintBorder: string;
  itemBg: string;
  itemBorder: string;
  dangerColor?: string;
}) {
  const activeTextColor = danger ? dangerColor || '#B22222' : textColor;
  const chevronColor = danger ? dangerColor || '#B22222' : mutedColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: itemBg,
          borderColor: itemBorder,
        },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.itemIconWrap,
          {
            backgroundColor: tintBg,
            borderColor: tintBorder,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={activeTextColor} />
      </View>

      <Text style={[styles.itemText, { color: activeTextColor }]}>{label}</Text>

      <Ionicons name="chevron-forward" size={18} color={chevronColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  centerLayer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(5),
  },

  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing(4),
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0 : 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },

  cardMobile: {
    marginTop: 'auto',
    width: '100%',
  },

  cardDesktop: {
    alignSelf: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing(2),
  },

  title: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    marginBottom: spacing(3),
  },

  dividerSoft: {
    height: 1,
    marginTop: spacing(1),
    marginBottom: spacing(3),
  },

  item: {
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    marginBottom: spacing(3),
  },

  itemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },

  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
});