// src/features/visits/components/WeekCalendarView.tsx
// Week calendar — Mon to Sun, today highlighted, visits shown as compact cards.
// Navigation arrows move to previous/next week.

import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { buildWeekCalendar, WEEK_DAY_LABELS } from '../domain/visits.domain';
import { VisitCard } from './VisitCard';

import type { Visit } from '../types/visits.types';

interface WeekCalendarViewProps {
  visits: Visit[];
  onVisitPress: (visitId: string) => void;
}

export const WeekCalendarView = ({ visits, onVisitPress }: WeekCalendarViewProps) => {
  const [centerDate, setCenterDate] = useState(new Date());
  const week = buildWeekCalendar(centerDate, visits);

  const goToPrevWeek = () => {
    const d = new Date(centerDate);
    d.setDate(d.getDate() - 7);
    setCenterDate(d);
  };

  const goToNextWeek = () => {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + 7);
    setCenterDate(d);
  };

  const goToToday = () => setCenterDate(new Date());

  // Week range label e.g. "12–18 May 2025"
  const firstDay = week.days[0];
  const lastDay = week.days[6];
  const weekLabel = firstDay && lastDay
    ? `${firstDay.dayNumber}–${lastDay.dayNumber} ${centerDate.toLocaleString('en-AU', { month: 'long', year: 'numeric' })}`
    : '';

  return (
    <View style={{ flex: 1 }}>
      {/* Navigation header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
      }}>
        <PressableBase
          onPress={goToPrevWeek}
          accessibilityLabel="Previous week"
          style={(pressed) => ({ padding: 8, opacity: pressed ? 0.5 : 1 })}
        >
          <Text style={{ fontSize: 20, color: '#2A6049' }}>‹</Text>
        </PressableBase>

        <PressableBase onPress={goToToday} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1A1A1A' }}>
            {weekLabel}
          </Text>
        </PressableBase>

        <PressableBase
          onPress={goToNextWeek}
          accessibilityLabel="Next week"
          style={(pressed) => ({ padding: 8, opacity: pressed ? 0.5 : 1 })}
        >
          <Text style={{ fontSize: 20, color: '#2A6049' }}>›</Text>
        </PressableBase>
      </View>

      {/* Day columns */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 8, marginBottom: 8 }}>
        {week.days.map((day, i) => (
          <View key={day.date} style={{ flex: 1, alignItems: 'center' }}>
            {/* Day label */}
            <Text style={{ fontSize: 11, color: '#6B6866', marginBottom: 4 }}>
              {WEEK_DAY_LABELS[i]}
            </Text>
            {/* Day number */}
            <View style={{
              width: 30, height: 30,
              borderRadius: 15,
              backgroundColor: day.isToday ? '#2A6049' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: day.isToday ? '700' : '400',
                color: day.isToday ? '#FFFFFF' : '#1A1A1A',
              }}>
                {day.dayNumber}
              </Text>
            </View>
            {/* Visit dot indicator */}
            {day.visits.length > 0 && (
              <View style={{
                width: 5, height: 5, borderRadius: 3,
                backgroundColor: '#2A6049', marginTop: 3,
              }} />
            )}
          </View>
        ))}
      </View>

      {/* Visit list for the week */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {week.days.flatMap((day) => day.visits).length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 24 }}>
            <Text style={{ fontSize: 14, color: '#6B6866' }}>No visits this week</Text>
          </View>
        ) : (
          week.days.map((day) =>
            day.visits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} onPress={onVisitPress} />
            )),
          )
        )}
      </ScrollView>
    </View>
  );
};
