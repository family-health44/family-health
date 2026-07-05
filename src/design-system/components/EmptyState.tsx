// src/design-system/components/EmptyState.tsx
// EmptyState — shown when a list has no items, or when an error occurs.
// Used consistently across all feature screens for loading, empty, and error states.

import { View, Text } from 'react-native';

import { Button } from './Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <View className="flex-1 items-center justify-center px-8 py-12">
    <Text className="text-center text-lg font-semibold text-[#3D3D3D]">
      {title}
    </Text>
    {message ? (
      <Text className="mt-2 text-center text-sm text-[#57605B]">
        {message}
      </Text>
    ) : null}
    {actionLabel && onAction ? (
      <View className="mt-6">
        <Button label={actionLabel} onPress={onAction} variant="primary" />
      </View>
    ) : null}
  </View>
);

// ─── Loading state ────────────────────────────────────────────────────────────

export const LoadingState = ({ message = 'Loading...' }: { message?: string }) => (
  <View className="flex-1 items-center justify-center">
    <Text className="text-sm text-[#57605B]">{message}</Text>
  </View>
);

// ─── Error state ──────────────────────────────────────────────────────────────

export const ErrorState = ({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <EmptyState
    title="Something went wrong"
    message={message}
    actionLabel={onRetry ? 'Try again' : undefined}
    onAction={onRetry}
  />
);
