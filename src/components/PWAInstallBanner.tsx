import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { DownloadSimple, X, ShareNetwork, PlusSquare } from 'phosphor-react-native';
import { useTheme, radii, typography } from '../theme';

const DISMISSED_STORAGE_KEY = 'loop_pwa_dismissed_until';
const DISMISS_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export default function PWAInstallBanner() {
  const { colors, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  const slideAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Check if user dismissed the prompt recently
    try {
      const dismissedUntil = localStorage.getItem(DISMISSED_STORAGE_KEY);
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return;
      }
    } catch {}

    // 1. Android / Chrome / Edge beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      triggerShow();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. iOS Safari detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIOS && isSafari) {
      setIsIOSDevice(true);
      // Small delay on iOS to allow user to view page first
      const timer = setTimeout(() => {
        triggerShow();
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerShow = () => {
    setVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      try {
        const nextTime = Date.now() + DISMISS_DURATION_MS;
        localStorage.setItem(DISMISSED_STORAGE_KEY, nextTime.toString());
      } catch {}
    });
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        handleDismiss();
      }
      setDeferredPrompt(null);
    } else if (isIOSDevice) {
      setShowIOSTip((prev) => !prev);
    }
  };

  if (!visible || Platform.OS !== 'web') return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View
        style={[
          styles.banner,
          {
            backgroundColor: isDark ? 'rgba(18, 18, 22, 0.94)' : 'rgba(255, 255, 255, 0.96)',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.contentRow}>
          {/* App Logo */}
          <Image
            source={{ uri: '/icon.png' }}
            style={styles.logo}
            resizeMode="cover"
          />

          {/* Text Info */}
          <View style={styles.textColumn}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.foreground }]}>Install Loop App</Text>
              <View style={[styles.badge, { backgroundColor: colors.highlight }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>PWA</Text>
              </View>
            </View>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isIOSDevice
                ? "Add to your iPhone Home Screen"
                : '1-tap access to IITD events & notices'}
            </Text>
          </View>

          {/* Action Button */}
          <Pressable
            onPress={handleInstallClick}
            accessibilityRole="button"
            accessibilityLabel="Install Loop on device"
            style={({ pressed }) => [
              styles.installBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
          >
            <DownloadSimple size={15} color={colors.onPrimary} weight="bold" />
            <Text style={[styles.installBtnText, { color: colors.onPrimary }]}>
              {isIOSDevice ? 'Instructions' : 'Install'}
            </Text>
          </Pressable>

          {/* Close / Dismiss Button */}
          <Pressable
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss install banner"
            hitSlop={8}
            style={({ pressed }) => [
              styles.dismissBtn,
              pressed && { opacity: 0.6 },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
          >
            <X size={16} color={colors.muted} weight="bold" />
          </Pressable>
        </View>

        {/* iOS Step-by-Step Instructions Tip */}
        {showIOSTip && isIOSDevice && (
          <View style={[styles.iosTipBox, { borderTopColor: colors.borderSubtle }]}>
            <Text style={[styles.iosTipText, { color: colors.foreground }]}>
              1. Tap the <ShareNetwork size={14} color={colors.primary} weight="bold" />{' '}
              <Text style={{ fontWeight: '700' }}>Share</Text> button in Safari's bottom toolbar.
            </Text>
            <Text style={[styles.iosTipText, { color: colors.foreground, marginTop: 4 }]}>
              2. Scroll down and tap <PlusSquare size={14} color={colors.primary} weight="bold" />{' '}
              <Text style={{ fontWeight: '700' }}>Add to Home Screen</Text>.
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 84, // Positioned neatly above the floating tab bar
    left: 16,
    right: 16,
    zIndex: 999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  banner: {
    width: '100%',
    maxWidth: 520,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: '#0A0A0C',
  },
  textColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    ...typography.labelLg,
    fontWeight: '700',
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    ...typography.bodySm,
    fontSize: 12,
    marginTop: 2,
  },
  installBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: radii.full,
  },
  installBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dismissBtn: {
    padding: 6,
  },
  iosTipBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  iosTipText: {
    ...typography.bodySm,
    fontSize: 12,
    lineHeight: 18,
  },
});
