// src/features/packs/screens/AppointmentPackScreen.tsx
// Appointment Pack — pick sections, add questions, generate a printable PDF.
//
// GUARDRAIL: records only. The PDF contains what the user entered, filtered and
// reordered. No synthesis, no trends, no flags, no recommendations.

import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { PressableBase } from '@/design-system/components/PressableBase';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';
import { renderPdfDocument, sharePdfFile } from '@/shared/utils/pdfShare';
import { mergeDocumentsIntoPack, replaceCoverPages, countPdfPages } from '../domain/packMerge';
import type { SkipReason } from '../domain/packMerge';
import { todayISO, formatDate, formatTime } from '@/shared/utils/dates';

import { usePackData } from '../hooks/usePackData';
import {
  buildPackDocument,
  buildPackPlainText,
  buildPackSections,
  PACK_FOOTER,
} from '../domain/packs.domain';
import { PACK_SECTIONS, DEFAULT_PACK_SELECTION } from '../types/packs.types';
import type { PackSectionKey, PackSelection } from '../types/packs.types';
import { Icon } from '@/design-system/components/Icon';

const PAGE = '#F4F2EC';
const GREEN = '#1F5C41';
const DIVIDER = 'rgba(23,33,28,0.07)';

const DividerLine = () => (
  <View style={{ height: 1, backgroundColor: DIVIDER, marginHorizontal: 15 }} />
);

const SectionLabel = ({ text }: { text: string }) => (
  <Text
    style={{
      ...Type.micro,
      textTransform: 'uppercase',
      color: TextColour.faint,
      marginBottom: 8,
    }}
  >
    {text}
  </Text>
);

export const AppointmentPackScreen = () => {
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  const id = visitId ?? '';

  const { isLoading, error, visit, input } = usePackData(id);

  const [selection, setSelection] = useState<PackSelection>(DEFAULT_PACK_SELECTION);
  const [questions, setQuestions] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const today = todayISO();

  const goBack = () => router.navigate(`/(app)/visits/${id}` as never);

  // Count of sections that will actually appear — empty ones are dropped.
  const includedCount = useMemo(() => {
    if (!input) return 0;
    return buildPackSections({ ...input, questions, todayIso: today }, selection).length;
  }, [input, selection, questions, today]);

  const toggle = (key: PackSectionKey) =>
    setSelection((s) => ({ ...s, [key]: !s[key] }));

  const SKIP_LABEL: Record<SkipReason, string> = {
    'too-large': 'Too large to attach',
    'total-limit': 'Not attached — size limit reached',
    'page-limit': 'Not attached — page limit reached',
    unsupported: 'Not attached — file type unsupported',
    failed: 'Could not be attached',
  };

  const handleGenerate = async () => {
    if (!input) return;
    setIsSharing(true);
    setProgress(null);
    try {
      const wantsDocs = selection.documents && input.documents.length > 0;

      // First pass: render without knowing what will fail to merge.
      let doc = buildPackDocument({ ...input, questions, todayIso: today }, selection);
      if (doc.sections.length === 0) {
        Alert.alert('Nothing to include', 'Select at least one section that has content.');
        return;
      }

      let uri = await renderPdfDocument(doc, PACK_FOOTER);
      const coverPageCount = wantsDocs ? await countPdfPages(uri) : 0;

      if (wantsDocs) {
        setProgress('Attaching documents…');
        const result = await mergeDocumentsIntoPack(uri, input.documents, {
          onProgress: (n, total) => setProgress(`Attaching document ${n} of ${total}…`),
        });

        // If anything was skipped, re-render so the index tells the truth.
        if (result.skipped.length > 0) {
          const skipMap = new Map(
            result.skipped.map((sk) => [sk.name, SKIP_LABEL[sk.reason]] as const),
          );
          doc = buildPackDocument(
            { ...input, questions, todayIso: today, skippedDocuments: skipMap },
            selection,
          );
          setProgress('Finalising…');
          const newCover = await renderPdfDocument(doc, PACK_FOOTER);
          uri = await replaceCoverPages(result.uri, newCover, coverPageCount);
        } else {
          uri = result.uri;
        }
      }

      setProgress(null);
      await sharePdfFile(uri, buildPackPlainText(doc));
      // Share sheet has closed (sent, saved, or dismissed) — the pack is done.
      goBack();
    } catch {
      Alert.alert('Could not create pack', 'Please try again.');
    } finally {
      setIsSharing(false);
      setProgress(null);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: PAGE }}>
        <LoadingState message="Loading..." />
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: PAGE }}>
        <ErrorState message={error.message} />
      </View>
    );
  }
  if (!visit || !input) {
    return (
      <View style={{ flex: 1, backgroundColor: PAGE }}>
        <ErrorState message="Visit not found." onRetry={goBack} />
      </View>
    );
  }

  const subtitle = `${visit.personName} · ${formatDate(visit.visitDate)}${
    visit.visitTime ? ` at ${formatTime(visit.visitTime)}` : ''
  }`;

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      <SubScreenHeader title="Appointment Pack" subtitle={subtitle} onBack={goBack} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Text
          style={{
            ...Type.body,
            fontSize: 14,
            color: TextColour.secondary,
            lineHeight: 20,
            marginBottom: 18,
          }}
        >
          Choose what to include, then print or send it. Empty sections are left out
          automatically.
        </Text>

        <SectionLabel text="Include" />
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 14,
            overflow: 'hidden',
            marginBottom: 18,
            ...Shadow.resting,
          }}
        >
          {PACK_SECTIONS.map((s, i) => {
            const on = selection[s.key];
            return (
              <View key={s.key}>
                {i > 0 && <DividerLine />}
                <PressableBase
                  onPress={() => toggle(s.key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={s.label}
                  style={(pressed) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 13,
                    paddingHorizontal: 15,
                    backgroundColor: pressed ? '#F7F7F4' : 'white',
                  })}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: on ? 0 : 1.5,
                      borderColor: '#D6D2CA',
                      backgroundColor: on ? GREEN : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {on ? (
                      <Icon name="checkmark" size={12} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ ...Type.label, fontWeight: '600', color: TextColour.ink }}>
                      {s.label}
                    </Text>
                    <Text
                      style={{
                        ...Type.caption,
                        fontWeight: '400',
                        color: TextColour.muted,
                        marginTop: 2,
                      }}
                    >
                      {s.hint}
                    </Text>
                  </View>
                </PressableBase>
              </View>
            );
          })}
        </View>

        {selection.questions ? (
          <>
            <SectionLabel text="Notes & Questions" />
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 14,
                padding: 15,
                marginBottom: 18,
                ...Shadow.resting,
              }}
            >
              <TextInput
                value={questions}
                onChangeText={setQuestions}
                placeholder={'One per line.\nWhat should we ask about the new medication?'}
                placeholderTextColor="#8B928E"
                multiline
                style={{
                  ...Type.body,
                  fontSize: 14,
                  color: TextColour.ink,
                  lineHeight: 20,
                  minHeight: 80,
                  padding: 0,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          </>
        ) : null}

        <Text style={{ ...Type.caption, fontWeight: '400', color: TextColour.faint, lineHeight: 17 }}>
          {PACK_FOOTER}
        </Text>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
        <PressableBase
          onPress={() => void handleGenerate()}
          disabled={isSharing || includedCount === 0}
          accessibilityRole="button"
          style={(pressed) => ({
            backgroundColor:
              includedCount === 0 ? '#C8C4BC' : pressed ? '#17452F' : GREEN,
            borderRadius: 24,
            padding: 16,
            alignItems: 'center',
            opacity: isSharing ? 0.7 : 1,
            ...Shadow.raised,
          })}
        >
          <Text style={{ ...Type.heading, color: 'white' }}>
            {isSharing
              ? (progress ?? 'Preparing…')
              : includedCount === 0
                ? 'Nothing to include'
                : `Create Pack · ${includedCount} section${includedCount === 1 ? '' : 's'}`}
          </Text>
        </PressableBase>
      </View>
    </View>
  );
};
