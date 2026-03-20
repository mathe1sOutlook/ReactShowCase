import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Colors, Radius, Spacing, fluentShadow} from '../theme';

type ScreenErrorBoundaryProps = {
  children: React.ReactNode;
  screenName: string;
};

type ScreenErrorBoundaryState = {
  error: Error | null;
  resetKey: number;
};

export default class ScreenErrorBoundary extends React.Component<
  ScreenErrorBoundaryProps,
  ScreenErrorBoundaryState
> {
  state: ScreenErrorBoundaryState = {
    error: null,
    resetKey: 0,
  };

  static getDerivedStateFromError(error: Error) {
    return {error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[ScreenErrorBoundary:${this.props.screenName}]`,
      error,
      errorInfo.componentStack,
    );
  }

  private handleRetry = () => {
    this.setState(current => ({
      error: null,
      resetKey: current.resetKey + 1,
    }));
  };

  render() {
    if (this.state.error) {
      return (
        <View
          style={styles.root}
          accessibilityRole="alert"
          testID="screen-error-boundary">
          <View style={styles.card}>
            <Text style={styles.eyebrow}>Screen Recovery</Text>
            <Text style={styles.title}>
              {this.props.screenName} crashed during render
            </Text>
            <Text style={styles.description}>
              The error boundary isolated this route so the shell stays usable.
              Retry remounts only the failing screen.
            </Text>
            {__DEV__ ? (
              <Text style={styles.debugMessage} numberOfLines={4}>
                {this.state.error.message}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Retry ${this.props.screenName}`}
              accessibilityHint="Remounts the current screen after an error"
              onPress={this.handleRetry}
              style={({pressed}) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              testID="screen-error-retry">
              <Text style={styles.buttonLabel}>Retry screen</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <React.Fragment key={this.state.resetKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.bg,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    ...fluentShadow('md'),
  },
  eyebrow: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  debugMessage: {
    color: Colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonLabel: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

