import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { WarningCircle, ArrowClockwise } from 'phosphor-react-native';
import { useTheme } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function DefaultErrorFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isDark
                ? 'rgba(196, 77, 106, 0.16)'
                : 'rgba(138, 21, 56, 0.10)',
            },
          ]}
        >
          <WarningCircle size={44} weight="duotone" color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Something went wrong
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          An unexpected issue occurred while rendering this screen.
        </Text>

        {__DEV__ && error?.message ? (
          <View
            style={[
              styles.devErrorBox,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.04)',
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.devErrorText, { color: colors.error }]} numberOfLines={4}>
              {error.message}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Reload screen"
          style={({ pressed }) => [
            styles.restartBtn,
            { backgroundColor: colors.primary },
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
        >
          <ArrowClockwise size={18} weight="bold" color={colors.onPrimary} />
          <Text style={[styles.restartBtnText, { color: colors.onPrimary }]}>
            Reload Screen
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const crashReport = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    };

    console.error('[Loop ErrorBoundary Caught Exception]:', crashReport);

    if (Platform.OS === 'web' && typeof fetch !== 'undefined') {
      try {
        fetch('/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(crashReport),
        }).catch(() => {});
      } catch {}
    }
  }

  private handleRestart = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleRestart}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  devErrorBox: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  devErrorText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    width: '100%',
  },
  restartBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
