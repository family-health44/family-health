// src/features/family/components/PersonTabBar.tsx
// Horizontal scrolling tab bar for the person detail screen.
// Themed with the person's colour set. No business logic.

import { useRef } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';

import { PERSON_TABS } from '../types/person.types';

import type { PersonTab } from '../types/person.types';
import type { PersonColourSet } from '@/design-system/tokens/colours';

interface PersonTabBarProps {
  activeTab: PersonTab;
  colourSet: PersonColourSet;
  onTabPress: (tab: PersonTab) => void;
}

export const PersonTabBar = ({ activeTab, colourSet, onTabPress }: PersonTabBarProps) => {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: colourSet.border,
        backgroundColor: colourSet.bg,
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}
      >
        {PERSON_TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 2,
                borderBottomColor: isActive ? colourSet.dot : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? colourSet.dot : colourSet.text,
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
