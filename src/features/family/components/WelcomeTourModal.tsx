// src/features/family/components/WelcomeTourModal.tsx
// First-run welcome tour, shown once after family creation (flag set by
// useOnboarding, cleared here on finish/skip). Full-screen modal so it works
// inside the tab navigator without layout/guard changes.
//
// Pages: 3 value screens, then a final page prompting the user to add their
// first family member (opens the existing AddPersonModal via onAddPerson).

import { useState } from 'react';
import { View, Text, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableBase } from '@/design-system/components/PressableBase';
import { Fonts } from '@/design-system/tokens/fonts';

interface TourPage {
  emoji: string;
  title: string;
  body: string;
}

const PAGES: readonly TourPage[] = [
  {
    emoji: '👨‍👩‍👧',
    title: 'Everyone in one place',
    body: "Keep every family member's health together — no scattered notes, no forgotten details.",
  },
  {
    emoji: '💊',
    title: 'Never miss a repeat',
    body: 'Track medications, dosages and repeats for everyone you look after.',
  },
  {
    emoji: '📅',
    title: 'Visits, sorted',
    body: 'Doctors, visits and important dates — all in one place you actually check.',
  },
  {
    emoji: '👤',
    title: 'Add your first family member',
    body: 'Start with yourself or whoever you care for most. Everything in the app is organised around your family members.',
  },
];

interface WelcomeTourModalProps {
  visible: boolean;
  /** Called when the user finishes or skips the tour (clears the first-run flag). */
  onClose: () => void;
  /** Called from the final page — close the tour AND open the Add person modal. */
  onAddPerson: () => void;
}

export const WelcomeTourModal = ({ visible, onClose, onAddPerson }: WelcomeTourModalProps) => {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);

  const isLast = page === PAGES.length - 1;
  const current = PAGES[page] ?? PAGES[0]!;

  const next = () => {
    if (isLast) return;
    setPage((p) => Math.min(p + 1, PAGES.length - 1));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#F7F5F0',
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 28,
        }}
      >
        {/* Skip */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <PressableBase
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Skip welcome tour"
            hitSlop={10}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#6B7570' }}>Skip</Text>
          </PressableBase>
        </View>

        {/* Progress */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i <= page ? '#2A6049' : '#D9D4C8',
              }}
            />
          ))}
        </View>

        {/* Content */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 60, marginBottom: 10 }}>{current.emoji}</Text>
          <Text
            style={{
              fontFamily: Fonts.serif,
              fontSize: 32,
              fontWeight: '600',
              color: '#1A2420',
              lineHeight: 38,
            }}
          >
            {current.title}
          </Text>
          <Text style={{ fontSize: 14.5, color: '#6B7570', lineHeight: 22, marginTop: 12 }}>
            {current.body}
          </Text>
        </View>

        {/* Actions */}
        {isLast ? (
          <View>
            <PressableBase
              onPress={onAddPerson}
              accessibilityRole="button"
              accessibilityLabel="Add family member"
              style={(pressed) => ({
                backgroundColor: pressed ? '#1F4A38' : '#2A6049',
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: 'center',
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                Add family member
              </Text>
            </PressableBase>
            <PressableBase
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Skip for now"
              style={() => ({ paddingVertical: 14, alignItems: 'center' })}
            >
              <Text style={{ color: '#2A6049', fontSize: 14, fontWeight: '600' }}>
                Skip for now
              </Text>
            </PressableBase>
          </View>
        ) : (
          <PressableBase
            onPress={next}
            accessibilityRole="button"
            accessibilityLabel="Continue"
            style={(pressed) => ({
              backgroundColor: pressed ? '#1F4A38' : '#2A6049',
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: 'center',
            })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Continue</Text>
          </PressableBase>
        )}
      </View>
    </Modal>
  );
};
