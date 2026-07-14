import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { buildWeekCalendar, WEEK_DAY_LABELS } from '../domain/visits.domain';
import { getPersonColour } from '@/shared/utils/avatar';
import { formatTime, formatDate } from '@/shared/utils/dates';
import type { Visit } from '../types/visits.types';
import { Icon } from '@/design-system/components/Icon';

interface WeekCalendarViewProps {
  visits: Visit[];
  onVisitPress: (visitId: string) => void;
}

const WeekVisitCard = ({ visit, onPress, fixedWidth }: { visit: Visit; onPress: (id: string) => void; fixedWidth: boolean }) => {
  const c = getPersonColour(visit.personColourIndex);
  const time = visit.visitTime ? formatTime(visit.visitTime) : null;
  const dateTime = time ? `${formatDate(visit.visitDate)} · ${time}` : formatDate(visit.visitDate);
  return (
    <PressableBase
      onPress={() => onPress(visit.id)}
      accessibilityRole="button"
      accessibilityLabel={visit.title}
      style={(pressed) => ({
        flex: fixedWidth ? undefined : 1,
        width: fixedWidth ? 96 : undefined,
        minWidth: fixedWidth ? 96 : 60,
        backgroundColor: c.bg,
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 5,
        justifyContent: 'center',
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: '700', color: c.text }}>{visit.title}</Text>
      {visit.doctorName ? (
        <Text numberOfLines={1} style={{ fontSize: 9, fontWeight: '600', color: c.text, marginTop: 1 }}>{visit.doctorName}</Text>
      ) : null}
      <Text numberOfLines={1} style={{ fontSize: 9, color: c.dot, fontWeight: '500', marginTop: 1 }}>{dateTime}</Text>
      <Text numberOfLines={1} style={{ fontSize: 9, fontWeight: '600', color: c.text, marginTop: 1 }}>{visit.personName}</Text>
    </PressableBase>
  );
};

export const WeekCalendarView = ({ visits, onVisitPress }: WeekCalendarViewProps) => {
  const [centerDate, setCenterDate] = useState(new Date());
  const week = buildWeekCalendar(centerDate, visits);

  const goToPrevWeek = () => { const d = new Date(centerDate); d.setDate(d.getDate() - 7); setCenterDate(d); };
  const goToNextWeek = () => { const d = new Date(centerDate); d.setDate(d.getDate() + 7); setCenterDate(d); };
  const goToToday = () => setCenterDate(new Date());

  const firstDay = week.days[0];
  const lastDay = week.days[6];
  const startMonth = centerDate.toLocaleString('en-AU', { month: 'short' });
  const endDate = new Date(centerDate);
  endDate.setDate(endDate.getDate() + 6);
  const endMonth = endDate.toLocaleString('en-AU', { month: 'short' });
  const weekLabel = firstDay && lastDay
    ? `${firstDay.dayNumber} ${startMonth} – ${lastDay.dayNumber} ${endMonth}`
    : '';

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8, gap: 6 }}>
        <PressableBase onPress={goToPrevWeek} accessibilityLabel="Previous week" style={(pressed) => ({ backgroundColor: '#ECEBE5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, opacity: pressed ? 0.6 : 1 })}>
          <Icon name="chevron.left" size={14} color="#17211C" />
        </PressableBase>
        <PressableBase onPress={goToNextWeek} accessibilityLabel="Next week" style={(pressed) => ({ backgroundColor: '#ECEBE5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, opacity: pressed ? 0.6 : 1 })}>
          <Icon name="chevron.right" size={14} color="#17211C" />
        </PressableBase>
        <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#17211C', textAlign: 'center' }}>{weekLabel}</Text>
        <PressableBase onPress={goToToday} style={(pressed) => ({ backgroundColor: pressed ? '#BFD4C8' : '#E4EFE9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 })}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#1F5C41' }}>Today</Text>
        </PressableBase>
      </View>

      <View style={{ flex: 1 }}>
        {week.days.map((day, i) => {
          const scrolls = day.visits.length > 3;
          return (
            <View key={day.date} style={{ flex: 1, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E3E2DB' }}>
              <View style={{ width: 48, borderRightWidth: 1, borderRightColor: '#E3E2DB', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, flexShrink: 0 }}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: day.isToday ? '#1F5C41' : 'rgba(23,33,28,0.55)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {WEEK_DAY_LABELS[i]}
                </Text>
                {day.isToday ? (
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#1F5C41', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: 'white' }}>{day.dayNumber}</Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 14, color: '#17211C', marginTop: 2 }}>{day.dayNumber}</Text>
                )}
              </View>
              {scrolls ? (
                <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ padding: 4, gap: 4, alignItems: 'stretch' }} style={{ flex: 1 }}>
                  {day.visits.map((visit) => (
                    <WeekVisitCard key={visit.id} visit={visit} onPress={onVisitPress} fixedWidth />
                  ))}
                </ScrollView>
              ) : (
                <View style={{ flex: 1, flexDirection: 'row', padding: 4, gap: 4, alignItems: 'stretch' }}>
                  {day.visits.map((visit) => (
                    <WeekVisitCard key={visit.id} visit={visit} onPress={onVisitPress} fixedWidth={false} />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};
