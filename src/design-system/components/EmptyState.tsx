// src/design-system/components/EmptyState.tsx
// EmptyState / LoadingState / ErrorState — token styles.
import { View, Text } from 'react-native';
import { Type, TextColour } from '@/design-system/tokens/typography';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, message, actionLabel, onAction }: EmptyStateProps) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 }}>
    <Text style={{ ...Type.heading, textAlign: 'center', color: TextColour.ink }}>{title}</Text>
    {message ? (
      <Text style={{ ...Type.body, fontSize: 14, textAlign: 'center', color: TextColour.muted, marginTop: 8 }}>{message}</Text>
    ) : null}
    {actionLabel && onAction ? (
      <View style={{ marginTop: 24 }}>
        <Button label={actionLabel} onPress={onAction} variant="primary" />
      </View>
    ) : null}
  </View>
);

export const LoadingState = ({ message = 'Loading...' }: { message?: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ ...Type.body, fontSize: 14, color: TextColour.muted }}>{message}</Text>
  </View>
);

export const ErrorState = ({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }) => (
  <EmptyState title="Something went wrong" message={message} actionLabel={onRetry ? 'Try again' : undefined} onAction={onRetry} />
);
