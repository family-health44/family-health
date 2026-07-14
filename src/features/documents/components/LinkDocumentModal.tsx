// src/features/documents/components/LinkDocumentModal.tsx
// After a file is picked, optionally link it to a visit or a doctor.
// Linking is optional — the document always belongs to the person regardless.

import { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';

import { PressableBase } from '@/design-system/components/PressableBase';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';
import { formatDate } from '@/shared/utils/dates';

import type { Visit } from '@/features/visits/types/visits.types';
import type { Doctor } from '@/features/doctors/types/doctors.types';
import { Icon } from '@/design-system/components/Icon';

const GREEN = '#1F5C41';
const DIVIDER = 'rgba(23,33,28,0.07)';

export interface DocumentLink {
  visitId: string | null;
  doctorId: string | null;
}

interface LinkDocumentModalProps {
  visible: boolean;
  fileName: string;
  visits: Visit[];
  doctors: Doctor[];
  isSaving: boolean;
  onConfirm: (link: DocumentLink) => void;
  onDismiss: () => void;
}

type Tab = 'none' | 'visit' | 'doctor';

const DividerLine = () => (
  <View style={{ height: 1, backgroundColor: DIVIDER, marginHorizontal: 15 }} />
);

export const LinkDocumentModal = ({
  visible,
  fileName,
  visits,
  doctors,
  isSaving,
  onConfirm,
  onDismiss,
}: LinkDocumentModalProps) => {
  const [tab, setTab] = useState<Tab>('none');
  const [visitId, setVisitId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  const reset = () => {
    setTab('none');
    setVisitId(null);
    setDoctorId(null);
  };

  const handleConfirm = () => {
    onConfirm({
      visitId: tab === 'visit' ? visitId : null,
      doctorId: tab === 'doctor' ? doctorId : null,
    });
    reset();
  };

  const handleDismiss = () => {
    reset();
    onDismiss();
  };

  const canSave = tab === 'none' || (tab === 'visit' ? Boolean(visitId) : Boolean(doctorId));

  const TabButton = ({ value, label }: { value: Tab; label: string }) => {
    const on = tab === value;
    return (
      <PressableBase
        onPress={() => setTab(value)}
        accessibilityRole="button"
        style={{
          flex: 1,
          paddingVertical: 8,
          borderRadius: 8,
          alignItems: 'center',
          backgroundColor: on ? '#FFFFFF' : 'transparent',
          ...(on ? Shadow.resting : {}),
        }}
      >
        <Text
          style={{
            ...Type.label,
            fontWeight: on ? '600' : '400',
            color: on ? TextColour.ink : TextColour.muted,
          }}
        >
          {label}
        </Text>
      </PressableBase>
    );
  };

  const Row = ({
    label,
    sub,
    selected,
    onPress,
  }: {
    label: string;
    sub?: string | null;
    selected: boolean;
    onPress: () => void;
  }) => (
    <PressableBase
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={(pressed) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: pressed ? '#F7F7F4' : 'white',
      })}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ ...Type.label, fontWeight: '500', color: TextColour.ink }}>
          {label}
        </Text>
        {sub ? (
          <Text style={{ ...Type.caption, fontWeight: '400', color: TextColour.muted, marginTop: 2 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {selected ? <Icon name="checkmark" size={14} color={GREEN} weight="bold" /> : null}
    </PressableBase>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      {/* maxHeight lives on the Pressable — a percentage needs a parent with resolved height. */}
      <Pressable
        onPress={handleDismiss}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ maxHeight: '90%' }}
        >
          <View
            style={{
              flexShrink: 1,
              backgroundColor: '#F4F2EC',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              paddingBottom: 32,
              ...Shadow.modal,
            }}
          >
            <Text style={{ ...Type.title, color: TextColour.ink }}>Link document</Text>
            <Text
              numberOfLines={1}
              style={{ ...Type.body, fontSize: 14, color: TextColour.muted, marginTop: 2, marginBottom: 14 }}
            >
              {fileName}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                gap: 4,
                padding: 4,
                borderRadius: 10,
                backgroundColor: 'rgba(23,33,28,0.05)',
                marginBottom: 14,
              }}
            >
              <TabButton value="none" label="No link" />
              <TabButton value="visit" label="Visit" />
              <TabButton value="doctor" label="Doctor" />
            </View>

            {tab === 'none' ? (
              <Text
                style={{
                  ...Type.body,
                  fontSize: 14,
                  color: TextColour.secondary,
                  lineHeight: 20,
                  paddingVertical: 8,
                  paddingBottom: 18,
                }}
              >
                The document will be saved to this person only.
              </Text>
            ) : (
              <ScrollView
                style={{ flexGrow: 0, marginBottom: 14 }}
                contentContainerStyle={{ paddingBottom: 4 }}
              >
                <View style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', ...Shadow.resting }}>
                  {tab === 'visit' ? (
                    visits.length === 0 ? (
                      <Text style={{ ...Type.body, fontSize: 14, color: TextColour.muted, padding: 15 }}>
                        No visits for this person yet.
                      </Text>
                    ) : (
                      visits.map((v, i) => (
                        <View key={v.id}>
                          {i > 0 && <DividerLine />}
                          <Row
                            label={v.title}
                            sub={[formatDate(v.visitDate), v.doctorName].filter(Boolean).join(' · ')}
                            selected={visitId === v.id}
                            onPress={() => setVisitId(v.id)}
                          />
                        </View>
                      ))
                    )
                  ) : doctors.length === 0 ? (
                    <Text style={{ ...Type.body, fontSize: 14, color: TextColour.muted, padding: 15 }}>
                      No doctors for this person yet.
                    </Text>
                  ) : (
                    doctors.map((d, i) => (
                      <View key={d.id}>
                        {i > 0 && <DividerLine />}
                        <Row
                          label={d.name}
                          sub={d.type}
                          selected={doctorId === d.id}
                          onPress={() => setDoctorId(d.id)}
                        />
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            )}

            <PressableBase
              onPress={handleConfirm}
              disabled={!canSave || isSaving}
              accessibilityRole="button"
              style={(pressed) => ({
                backgroundColor: !canSave ? '#C8C4BC' : pressed ? '#17452F' : GREEN,
                borderRadius: 12,
                padding: 15,
                alignItems: 'center',
                opacity: isSaving ? 0.7 : 1,
              })}
            >
              <Text style={{ ...Type.heading, color: 'white' }}>
                {isSaving ? 'Adding…' : 'Add document'}
              </Text>
            </PressableBase>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
