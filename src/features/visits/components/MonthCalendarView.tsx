// src/features/visits/components/MonthCalendarView.tsx
// Month calendar — full grid Mon–Sun, today highlighted.
// Two layouts (toggle in the nav row):
//   compact  — dot markers + tap-a-day to reveal its visits below
//   detailed — each cell shows visit chips inline (cap 2 + "+N")

import { PressableBase } from '@/design-system/components/PressableBase';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';

import { buildMonthGrid, WEEK_DAY_LABELS, MONTH_NAMES, todayISO } from '../domain/visits.domain';
import { VisitCard } from './VisitCard';
import { getPersonColour } from '@/shared/utils/avatar';

import type { Visit, CalendarDay } from '../types/visits.types';

const MAX_CHIPS = 4;

interface MonthCalendarViewProps {
  visits: Visit[];
  onVisitPress: (visitId: string) => void;
  initialSelectedDate?: string | null;
}

export const MonthCalendarView = ({ visits, onVisitPress, initialSelectedDate }: MonthCalendarViewProps) => {
  const today = new Date();
  const seed = initialSelectedDate ? new Date(initialSelectedDate + 'T00:00:00') : today;
  const [year, setYear] = useState(seed.getFullYear());
  const [month, setMonth] = useState(seed.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(initialSelectedDate ?? todayISO());
  const [detailed, setDetailed] = useState(false);

  useEffect(() => {
    if (!initialSelectedDate) return;
    const d = new Date(initialSelectedDate + 'T00:00:00');
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelectedDate(initialSelectedDate);
  }, [initialSelectedDate]);

  const days = buildMonthGrid(year, month, visits);
  const selectedDay = selectedDate ? days.find((d) => d.date === selectedDate) ?? null : null;

  const goToPrevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const handleDayPress = (day: CalendarDay) => {
    setSelectedDate(prev => prev === day.date ? null : day.date);
  };

  const todayStr = todayISO();

  return (
    <View style={{ flex: 1 }}>
      {/* Month navigation + view toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12 }}>
        <PressableBase onPress={goToPrevMonth} accessibilityLabel="Previous month" style={(pressed) => ({ padding: 8, opacity: pressed ? 0.5 : 1 })}>
          <Text style={{ fontSize: 20, color: '#2A6049' }}>‹</Text>
        </PressableBase>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', color: '#1A1A1A' }}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <PressableBase onPress={goToNextMonth} accessibilityLabel="Next month" style={(pressed) => ({ padding: 8, opacity: pressed ? 0.5 : 1 })}>
          <Text style={{ fontSize: 20, color: '#2A6049' }}>›</Text>
        </PressableBase>
        <PressableBase
          onPress={() => setDetailed(d => !d)}
          accessibilityRole="button"
          accessibilityLabel={detailed ? 'Switch to compact view' : 'Switch to detailed view'}
          style={(pressed) => ({
            marginLeft: 6,
            backgroundColor: detailed ? '#2A6049' : 'white',
            borderWidth: 1,
            borderColor: detailed ? '#2A6049' : '#C0D8CA',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: detailed ? 'white' : '#2A6049' }}>
            {detailed ? 'Compact' : 'Detailed'}
          </Text>
        </PressableBase>
      </View>

      {/* Day-of-week headers */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 8, marginBottom: 4 }}>
        {WEEK_DAY_LABELS.map((label) => (
          <Text key={label} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#6B6866' }}>
            {label}
          </Text>
        ))}
      </View>

      {detailed ? (
        /* ── Detailed grid: inline chips ── */
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
          {days.map((day) => {
            const isToday = day.date === todayStr;
            const extra = day.visits.length - MAX_CHIPS;
            const rows = Math.ceil(days.length / 7);
            return (
              <View
                key={day.date}
                style={{
                  width: '14.28%',
                  height: `${100 / rows}%`,
                  borderTopWidth: 1,
                  borderTopColor: '#E3DDD5',
                  paddingHorizontal: 2,
                  paddingTop: 2,
                  overflow: 'hidden',
                  backgroundColor: isToday ? '#E6F0EC' : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 10,
                  textAlign: 'right',
                  fontWeight: isToday ? '700' : '400',
                  color: isToday ? '#2A6049' : !day.isCurrentMonth ? '#C8C4BC' : '#1A1A1A',
                }}>
                  {day.dayNumber}
                </Text>
                {day.visits.slice(0, MAX_CHIPS).map((visit) => {
                  const c = getPersonColour(visit.personColourIndex);
                  return (
                    <PressableBase
                      key={visit.id}
                      onPress={() => onVisitPress(visit.id)}
                      accessibilityRole="button"
                      accessibilityLabel={visit.title}
                      style={(pressed) => ({
                        backgroundColor: c.bg,
                        borderRadius: 3,
                        paddingHorizontal: 3,
                        paddingVertical: 1,
                        marginTop: 1,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text numberOfLines={1} style={{ fontSize: 8, fontWeight: '600', color: c.text }}>
                        {visit.title}
                      </Text>
                    </PressableBase>
                  );
                })}
                {extra > 0 && (
                  <Text style={{ fontSize: 8, fontWeight: '700', color: '#6B6866', marginTop: 1, paddingHorizontal: 3 }}>
                    +{extra}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        /* ── Compact grid: dot markers + tap-to-reveal ── */
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
            {days.map((day) => {
              const isSelected = selectedDate === day.date;
              const isToday = day.date === todayStr;
              const hasVisits = day.visits.length > 0;

              return (
                <PressableBase
                  key={day.date}
                  onPress={() => handleDayPress(day)}
                  accessibilityRole="button"
                  accessibilityLabel={`${day.date}${hasVisits ? `, ${day.visits.length} visit${day.visits.length > 1 ? 's' : ''}` : ''}`}
                  style={{ width: '14.28%', height: 46, alignItems: 'center', justifyContent: 'center' }}
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
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isSelected ? '#FFFFFF' : '#2F80ED', marginTop: 3 }} />
                  )}
                </PressableBase>
              );
            })}
          </View>

          {/* Selected day visits — region always reserved so the grid never shifts */}
          <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: '#E3DDD5', marginTop: 8 }}>
            {selectedDay && (
              <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator
                indicatorStyle="black"
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B6866', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                  {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
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
        </>
      )}
    </View>
  );
};
