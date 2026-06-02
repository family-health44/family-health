// src/features/visits/components/MonthCalendarView.tsx
// Month calendar — full grid Mon–Sun, today highlighted, visits shown as dots.
// Tapping a day with visits shows them below the grid.

import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { buildMonthGrid, WEEK_DAY_LABELS, MONTH_NAMES, todayISO } from '../domain/visits.domain';
import { VisitCard } from './VisitCard';

import type { Visit, CalendarDay } from '../types/visits.types';

interface MonthCalendarViewProps {
  visits: Visit[];
  onVisitPress: (visitId: string) => void;
}

export const MonthCalendarView = ({ visits, onVisitPress }: MonthCalendarViewProps) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const days = buildMonthGrid(year, month, visits);

  const goToPrevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const handleDayPress = (day: CalendarDay) => {
    setSelectedDay(prev => prev?.date === day.date ? null : day);
  };

  const todayStr = todayISO();

  return (
    <View style={{ flex: 1 }}>
      {/* Month navigation */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingBottom: 12,
      }}>
        <Pressable
          onPress={goToPrevMonth}
          accessibilityLabel="Previous month"
          style={({ pressed }) => ({ padding: 8, opacity: pressed ? 0.5 : 1 })}
        >
          <Text style={{ fontSize: 20, color: '#2A6049' }}>‹</Text>
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', color: '#1A1A1A' }}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <Pressable
          onPress={goToNextMonth}
          accessibilityLabel="Next month"
          style={({ pressed }) => ({ padding: 8, opacity: pressed ? 0.5 : 1 })}
        >
          <Text style={{ fontSize: 20, color: '#2A6049' }}>›</Text>
        </Pressable>
      </View>

      {/* Day-of-week headers */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 8, marginBottom: 4 }}>
        {WEEK_DAY_LABELS.map((label) => (
          <Text key={label} style={{
            flex: 1, textAlign: 'center',
            fontSize: 11, fontWeight: '600', color: '#6B6866',
          }}>
            {label}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
        {days.map((day) => {
          const isSelected = selectedDay?.date === day.date;
          const isToday = day.date === todayStr;
          const hasVisits = day.visits.length > 0;

          return (
            <Pressable
              key={day.date}
              onPress={() => handleDayPress(day)}
              accessibilityRole="button"
              accessibilityLabel={`${day.date}${hasVisits ? `, ${day.visits.length} visit${day.visits.length > 1 ? 's' : ''}` : ''}`}
              style={{
                width: '14.28%',
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: isSelected ? '#2A6049' : isToday ? '#E6F0EC' : 'transparent',
                borderWidth: isToday && !isSelected ? 1 : 0,
                borderColor: '#2A6049',
              }}>
                <Text style={{
                  fontSize: 13,
                  fontWeight: isToday || isSelected ? '700' : '400',
                  color: isSelected ? '#FFFFFF' : !day.isCurrentMonth ? '#C8C4BC' : '#1A1A1A',
                }}>
                  {day.dayNumber}
                </Text>
              </View>
              {hasVisits && (
                <View style={{
                  width: 4, height: 4, borderRadius: 2,
                  backgroundColor: isSelected ? '#2A6049' : '#2C5282',
                  marginTop: 1,
                }} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Selected day visits */}
      {selectedDay && (
        <ScrollView
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{
            fontSize: 13, fontWeight: '600', color: '#6B6866',
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
          }}>
            {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('en-AU', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </Text>
          {selectedDay.visits.length === 0 ? (
            <Text style={{ fontSize: 14, color: '#6B6866' }}>No visits on this day</Text>
          ) : (
            selectedDay.visits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} onPress={onVisitPress} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};
