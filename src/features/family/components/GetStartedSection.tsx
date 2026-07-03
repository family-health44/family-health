// src/features/family/components/GetStartedSection.tsx
// Slim, dismissible "Get started" nudges shown above the family list on the
// Family home screen. Renders nothing when there are no rows to show.
//
// Person-scoped nudges (medications, doctors) resolve a target person before
// navigating, because those items live under a person, not at family level:
//   - 0 people  -> shouldn't happen on this screen; guard by no-op.
//   - 1 person  -> go straight to that person's tab with the Add modal open.
//   - 2+ people -> show a "Who is this for?" picker, then navigate.
// Visits are family-level and have their own tab, so that row navigates directly.

import { useState } from 'react';
import { View, Text, Modal } from 'react-native';
import { router } from 'expo-router';

import { PressableBase } from '@/design-system/components/PressableBase';
import { useFamilyHomeQuery } from '../queries/family.queries';
import { useGetStarted, type GetStartedKey } from '../hooks/useGetStarted';
import type { Person } from '../types/family.types';

type Scope = 'person' | 'family';

interface RowConfig {
  emoji: string;
  iconBg: string;
  title: string;
  subtitle: string;
  scope: Scope;
  // For person-scoped rows: builds the destination for a chosen person.
  personHref?: (personId: string) => string;
  // For family-scoped rows: a fixed destination.
  familyHref?: string;
}

const ROW_CONFIG: Record<GetStartedKey, RowConfig> = {
  medications: {
    emoji: '💊',
    iconBg: '#F5E8EB',
    title: 'No medications yet',
    subtitle: 'Track dosages & repeats',
    scope: 'person',
    personHref: (id) => `/(app)/family/${id}/medications?add=1`,
  },
  doctors: {
    emoji: '👨‍⚕️',
    iconBg: '#E8EFF8',
    title: 'No doctors yet',
    subtitle: 'GP or specialist',
    scope: 'person',
    personHref: (id) => `/(app)/family/${id}/doctors?add=1`,
  },
  appointments: {
    emoji: '📅',
    iconBg: '#F5EBE0',
    title: 'No visits yet',
    subtitle: 'Upcoming visits',
    scope: 'family',
    familyHref: '/(app)/visits?add=1',
  },
};

export interface GetStartedSectionProps {
  /** Opens the Add person modal — used when a person-scoped nudge is tapped with no people yet. */
  onRequestAddPerson: () => void;
}

export const GetStartedSection = ({ onRequestAddPerson }: GetStartedSectionProps) => {
  const { rows, hydrated, dismiss, dismissAll } = useGetStarted();
  const { data } = useFamilyHomeQuery();
  const people = data?.people ?? [];

  // Picker state: which nudge is choosing a person (null = closed).
  const [pickerFor, setPickerFor] = useState<GetStartedKey | null>(null);

  const goToPerson = (key: GetStartedKey, personId: string) => {
    const href = ROW_CONFIG[key].personHref?.(personId);
    if (href) router.navigate(href as never);
  };

  const handleAdd = (key: GetStartedKey) => {
    const cfg = ROW_CONFIG[key];
    if (cfg.scope === 'family') {
      if (cfg.familyHref) router.navigate(cfg.familyHref as never);
      return;
    }
    // person-scoped
    if (people.length === 0) {
      // Medications/doctors live under a person — get one created first.
      onRequestAddPerson();
      return;
    }
    if (people.length === 1) {
      goToPerson(key, people[0]!.id);
      return;
    }
    setPickerFor(key); // 2+ people — ask who
  };

  const handlePick = (person: Person) => {
    const key = pickerFor;
    setPickerFor(null);
    if (key) goToPerson(key, person.id);
  };

  if (!hydrated || rows.length === 0) return null;

  return (
    <View style={{ marginBottom: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#6B7570',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Get started
        </Text>
        <PressableBase
          onPress={dismissAll}
          accessibilityRole="button"
          accessibilityLabel="Dismiss all get started suggestions"
          hitSlop={8}
        >
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7570' }}>Dismiss all</Text>
        </PressableBase>
      </View>

      {rows.map(({ key }) => {
        const cfg = ROW_CONFIG[key];
        return (
          <View
            key={key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E4E0D6',
              borderRadius: 13,
              paddingVertical: 11,
              paddingHorizontal: 12,
              marginBottom: 9,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: cfg.iconBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 17 }}>{cfg.emoji}</Text>
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '600', color: '#1A2420' }}>
                {cfg.title}
              </Text>
              <Text style={{ fontSize: 11, color: '#6B7570', marginTop: 1 }}>{cfg.subtitle}</Text>
            </View>

            <PressableBase
              onPress={() => handleAdd(key)}
              accessibilityRole="button"
              accessibilityLabel={`${cfg.title} — add`}
              hitSlop={6}
            >
              <Text style={{ fontSize: 12.5, fontWeight: '600', color: '#2A6049' }}>Add</Text>
            </PressableBase>

            <PressableBase
              onPress={() => dismiss(key)}
              accessibilityRole="button"
              accessibilityLabel={`Dismiss ${cfg.title}`}
              hitSlop={8}
              style={() => ({
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: '#F2EFE8',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Text style={{ fontSize: 13, color: '#B7B1A4', lineHeight: 15 }}>✕</Text>
            </PressableBase>
          </View>
        );
      })}

      <PersonPickerModal
        visible={pickerFor !== null}
        people={people}
        onPick={handlePick}
        onDismiss={() => setPickerFor(null)}
      />
    </View>
  );
};

interface PersonPickerModalProps {
  visible: boolean;
  people: Person[];
  onPick: (person: Person) => void;
  onDismiss: () => void;
}

const PersonPickerModal = ({ visible, people, onPick, onDismiss }: PersonPickerModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
    <PressableBase
      onPress={onDismiss}
      accessibilityRole="button"
      accessibilityLabel="Close"
      style={() => ({
        flex: 1,
        backgroundColor: 'rgba(26,36,32,0.35)',
        justifyContent: 'flex-end',
      })}
    >
      <View
        style={{
          backgroundColor: '#F7F5F0',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 34,
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#1A2420', marginBottom: 4 }}>
          Who is this for?
        </Text>
        <Text style={{ fontSize: 13, color: '#6B7570', marginBottom: 14 }}>
          Choose a family member to add to.
        </Text>

        {people.map((p) => (
          <PressableBase
            key={p.id}
            onPress={() => onPick(p)}
            accessibilityRole="button"
            accessibilityLabel={p.name}
            style={(pressed) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: pressed ? '#EEEAE1' : '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E4E0D6',
              borderRadius: 13,
              padding: 12,
              marginBottom: 9,
            })}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: p.colourSet.bg,
                borderWidth: 1,
                borderColor: p.colourSet.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: p.colourSet.text }}>
                {p.initials}
              </Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1A2420' }}>{p.name}</Text>
          </PressableBase>
        ))}
      </View>
    </PressableBase>
  </Modal>
);
