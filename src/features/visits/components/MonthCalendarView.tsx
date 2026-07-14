// src/features/visits/components/MonthCalendarView.tsx
// Month calendar — full grid Mon–Sun, today highlighted.
// Two layouts (toggle in the nav row):
//   compact  — dot markers + tap-a-day to reveal its visits below
//   detailed — each cell shows 3-line visit chips (person / doctor / time), cap 2 + "+N"
//
// Accent discipline: green marks ONE thing — the selected day. Today is a
// neutral ring; chevrons and the layout toggle are neutral chrome.

import { PressableBase } from '@/design-system/components/PressableBase';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';

import { Type, TextColour } from '@/design-system/tokens/typography';
import { buildMonthGrid, WEEK_DAY_LABELS, MONTH_NAMES, todayISO } from '../domain/visits.domain';
import { VisitCard } from './VisitCard';
import { getPersonColour } from '@/shared/utils/avatar';

import type { Visit, CalendarDay } from '../types/visits.types';
import { Icon } from '@/design-system/components/Icon';

const MAX_CHIPS = 2;

const GREEN = '#1F5C41';
const DIVIDER = 'rgba(23,33,28,0.07)';
const TRACK = '#ECEBE5';
const OUT_OF_MONTH = 'rgba(23,33,28,0.28)';
const DOT = '#2F80ED';
const TODAY_BG = '#E4EFE9';

/** '14:30' -> '2:30pm' ; '09:00' -> '9am' */
const formatTime = (t: string | null): string | null => {
  if (!t) return null;
  const [hRaw, mRaw] = t.split(':');
  const h = Number(hRaw);
  if (Number.isNaN(h)) return null;
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return mRaw && mRaw !== '00' ? `${h12}:${mRaw}${suffix}` : `${h12}${suffix}`;
};

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
      {/* Month navigation + layout toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12 }}>
        <PressableBase onPress={goToPrevMonth} accessibilityLabel="Previous month" style={(pressed) => ({ paddingHorizontal: 10, paddingVertical: 6, opacity: pressed ? 0.5 : 1 })}>
          <Icon name="chevron.left" size={17} color={TextColour.secondary} />
        </PressableBase>

        <Text style={{ flex: 1, textAlign: 'center', ...Type.heading, color: TextColour.ink }}>
          {MONTH_NAMES[month]} {year}
        </Text>

        <PressableBase onPress={goToNextMonth} accessibilityLabel="Next month" style={(pressed) => ({ paddingHorizontal: 10, paddingVertical: 6, opacity: pressed ? 0.5 : 1 })}>
          <Icon name="chevron.right" size={17} color={TextColour.secondary} />
        </PressableBase>

        {/* Segmented pill — matches VisitsViewToggle */}
        <View style={{ flexDirection: 'row', backgroundColor: TRACK, borderRadius: 9, padding: 3, marginLeft: 6 }}>
          {([false, true] as const).map((mode) => {
            const isActive = detailed === mode;
            return (
              <PressableBase
                key={String(mode)}
                onPress={() => setDetailed(mode)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={mode ? 'Detailed view' : 'Compact view'}
                style={(pressed) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 6,
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  shadowColor: isActive ? '#17211C' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isActive ? 0.08 : 0,
                  shadowRadius: 2,
                  elevation: isActive ? 1 : 0,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ ...Type.caption, fontWeight: isActive ? '700' : '600', color: isActive ? TextColour.ink : TextColour.muted }}>
                  {mode ? 'Detailed' : 'Compact'}
                </Text>
              </PressableBase>
            );
          })}
        </View>
      </View>

      {/* Day-of-week headers */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 8, marginBottom: 6 }}>
        {WEEK_DAY_LABELS.map((label) => (
          <Text key={label} style={{ flex: 1, textAlign: 'center', ...Type.micro, color: TextColour.faint }}>
            {label}
          </Text>
        ))}
      </View>

      {detailed ? (
        /* ── Detailed grid: 3-line chips (person / doctor / time) ── */
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
                  borderTopColor: DIVIDER,
                  paddingHorizontal: 2,
                  paddingTop: 2,
                  overflow: 'hidden',
                  backgroundColor: isToday ? TODAY_BG : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 10,
                  lineHeight: 12,
                  textAlign: 'right',
                  fontWeight: isToday ? '700' : '500',
                  color: isToday ? GREEN : !day.isCurrentMonth ? OUT_OF_MONTH : TextColour.secondary,
                }}>
                  {day.dayNumber}
                </Text>

                {day.visits.slice(0, MAX_CHIPS).map((visit) => {
                  const c = getPersonColour(visit.personColourIndex);
                  const time = formatTime(visit.visitTime);
                  return (
                    <PressableBase
                      key={visit.id}
                      onPress={() => onVisitPress(visit.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`${visit.personName}, ${visit.doctorName ?? visit.title}${time ? `, ${time}` : ''}`}
                      style={(pressed) => ({
                        backgroundColor: c.bg,
                        borderRadius: 3,
                        paddingHorizontal: 3,
                        paddingVertical: 2,
                        marginTop: 2,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text numberOfLines={1} style={{ fontSize: 8, lineHeight: 10, fontWeight: '700', color: c.text }}>
                        {visit.personName}
                      </Text>
                      <Text numberOfLines={1} style={{ fontSize: 8, lineHeight: 10, fontWeight: '500', color: c.text, opacity: 0.85 }}>
                        {visit.doctorName ?? visit.title}
                      </Text>
                      {time ? (
                        <Text numberOfLines={1} style={{ fontSize: 8, lineHeight: 10, fontWeight: '500', color: c.text, opacity: 0.7 }}>
                          {time}
                        </Text>
                      ) : null}
                    </PressableBase>
                  );
                })}

                {extra > 0 && (
                  <Text style={{ fontSize: 8, lineHeight: 10, fontWeight: '700', color: TextColour.faint, marginTop: 1, paddingHorizontal: 3 }}>
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
                    backgroundColor: isSelected ? GREEN : isToday ? TODAY_BG : 'transparent',
                    borderWidth: isToday && !isSelected ? 1 : 0,
                    borderColor: GREEN,
                  }}>
                    <Text style={{
                      ...Type.label,
                      fontWeight: isToday || isSelected ? '700' : '400',
                      color: isSelected ? '#FFFFFF' : !day.isCurrentMonth ? OUT_OF_MONTH : TextColour.ink,
                    }}>
                      {day.dayNumber}
                    </Text>
                  </View>
                  {hasVisits && (
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isSelected ? '#FFFFFF' : DOT, marginTop: 3 }} />
                  )}
                </PressableBase>
              );
            })}
          </View>

          {/* Selected day visits — region always reserved so the grid never shifts */}
          <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: DIVIDER, marginTop: 10 }}>
            {selectedDay && (
              <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator
                indicatorStyle="black"
              >
                <Text style={{ ...Type.micro, textTransform: 'uppercase', color: TextColour.faint, marginBottom: 10 }}>
                  {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
                {selectedDay.visits.length === 0 ? (
                  <Text style={{ ...Type.body, color: TextColour.muted }}>No visits on this day</Text>
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
