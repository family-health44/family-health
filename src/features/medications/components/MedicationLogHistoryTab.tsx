// src/features/medications/components/MedicationLogHistoryTab.tsx
// Log History tab body + the per-entry card (co-located, only used here).
import { View, Text } from 'react-native';

import { PressableBase } from '@/design-system/components/PressableBase';
import { EmptyState } from '@/design-system/components/EmptyState';
import { AiTeaser } from '@/design-system/components/AiTeaser';
import { formatDate, formatTime } from '@/shared/utils/dates';

import { FEELING_CONFIG, doseStatusLabel } from '@/features/medication-logs/domain/medication-logs.domain';
import type { MedicationLog } from '@/features/medication-logs/types/medication-logs.types';

export const MedicationLogHistoryTab = ({
  logs, isLoading, onAddLog, onEditLog,
}: {
  logs: MedicationLog[];
  isLoading: boolean;
  onAddLog: () => void;
  onEditLog: (log: MedicationLog) => void;
}) => (
  <View>
    <AiTeaser
      storageKey="med_ai_summary_dismissed_at"
      title="AI summary"
      body="Pattern detection, trends, and a plain-English summary of how this medication is working — across all your logs."
    />

    {isLoading ? (
      <Text style={{ fontSize: 13, color: '#A8A09A', textAlign: 'center', paddingVertical: 20 }}>Loading entries...</Text>
    ) : logs.length === 0 ? (
      <EmptyState title="No log entries yet" message="Tap Add log entry to record how this medication is going." />
    ) : (
      <View style={{ gap: 10, marginBottom: 16 }}>
        {logs.map((log) => (
          <PressableBase key={log.id} onPress={() => onEditLog(log)} accessibilityRole="button" style={(p) => ({ opacity: p ? 0.7 : 1 })}>
            <LogEntryCard log={log} />
          </PressableBase>
        ))}
      </View>
    )}

    <PressableBase
      onPress={onAddLog}
      accessibilityRole="button"
      style={(p) => ({ backgroundColor: p ? '#1F4D38' : '#2A6049', borderRadius: 12, paddingVertical: 14, alignItems: 'center' })}
    >
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>+ Add log entry</Text>
    </PressableBase>
  </View>
);

const LogEntryCard = ({ log }: { log: MedicationLog }) => {
  const feeling = log.feeling ? FEELING_CONFIG[log.feeling] : null;
  const when = `${formatDate(log.loggedDate)}${log.loggedTime ? ` · ${formatTime(log.loggedTime)}` : ''}`;
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={{ width: 10, alignItems: 'center', paddingTop: 16 }}>
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: feeling?.colour ?? '#D0CCC4' }} />
      </View>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 12, padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.6 }}>{when}</Text>
          {feeling ? <Text style={{ fontSize: 16 }}>{feeling.emoji}</Text> : null}
        </View>
        {log.note ? <Text style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 20 }}>{log.note}</Text> : null}
        {log.doseStatus ? (
          <Text style={{ fontSize: 12, color: '#6B6866', marginTop: 4 }}>{doseStatusLabel(log.doseStatus)}</Text>
        ) : null}
        {log.tags.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {log.tags.map((t) => (
              <View key={t} style={{ backgroundColor: '#F0EDE8', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text style={{ fontSize: 11, color: '#6B6866' }}>{t}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
};
