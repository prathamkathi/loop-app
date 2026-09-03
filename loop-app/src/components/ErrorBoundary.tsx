import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { typography, radii, spacing, lightColors as colors } from '../theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
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
    console.error('Uncaught error:', error, errorInfo);
    // TODO (T-08/Q5): Send to Crashlytics / Sentry once configured
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry, but the app encountered an unexpected error. Our team has been notified.
            </Text>
            <View style={styles.errorBox}>
              <Text style={styles.errorText} numberOfLines={4}>
                {this.state.error?.toString()}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={this.handleReset}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.displayMd,
    color: colors.foreground,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMd,
    color: colors.foregroundSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.error,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
  },
  buttonText: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
});
