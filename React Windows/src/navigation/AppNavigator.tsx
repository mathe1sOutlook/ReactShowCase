import React, {useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {Colors, fluentShadow} from '../theme';
import type {RootTabParamList} from './types';

import HomeStack from './HomeStack';
import ComponentsScreen from '../screens/ComponentsScreen';
import AboutScreen from '../screens/AboutScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ITEMS: {
  key: keyof RootTabParamList;
  label: string;
  icon: string;
}[] = [
  {key: 'HomeTab', label: 'Explore', icon: '\u{1F3E0}'},
  {key: 'ComponentsTab', label: 'Components', icon: '\u{1F9E9}'},
  {key: 'AboutTab', label: 'About', icon: '\u{2139}\uFE0F'},
];

function SideNavigationRail({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <View style={styles.railContainer}>
      {/* App Logo / Name */}
      <View style={styles.railHeader}>
        <Text style={styles.railLogo}>⊞</Text>
        <Text style={styles.railAppName}>Showcase</Text>
      </View>

      {/* Nav Items */}
      <View style={styles.railItems}>
        {state.routes.map((route: any, index: number) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;
          const tabItem = TAB_ITEMS.find(t => t.key === route.name);
          const label = tabItem?.label || options.tabBarLabel || route.name;
          const icon = tabItem?.icon || '●';
          const isHovered = hoveredIndex === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onHoverIn={() => setHoveredIndex(index)}
              onHoverOut={() => setHoveredIndex(null)}
              style={[
                styles.railItem,
                isHovered && !isFocused && styles.railItemHovered,
              ]}
              accessibilityRole="tab"
              accessibilityState={{selected: isFocused}}
              accessibilityLabel={label}>
              {/* Active indicator bar */}
              <View
                style={[
                  styles.activeIndicator,
                  isFocused && styles.activeIndicatorVisible,
                ]}
              />

              <Text
                style={[
                  styles.railIcon,
                  isFocused && styles.railIconActive,
                ]}>
                {icon}
              </Text>
              <Text
                style={[
                  styles.railLabel,
                  isFocused
                    ? styles.railLabelActive
                    : styles.railLabelInactive,
                ]}
                numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <View style={styles.appContainer}>
      <Tab.Navigator
        tabBar={props => <SideNavigationRail {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{tabBarLabel: 'Explore'}}
        />
        <Tab.Screen
          name="ComponentsTab"
          component={ComponentsScreen}
          options={{tabBarLabel: 'Components'}}
        />
        <Tab.Screen
          name="AboutTab"
          component={AboutScreen}
          options={{tabBarLabel: 'About'}}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  railContainer: {
    width: 72,
    backgroundColor: Colors.bgCard,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingTop: 12,
    alignItems: 'center',
    ...fluentShadow('sm'),
  },
  railHeader: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  railLogo: {
    fontSize: 20,
    color: Colors.primary,
  },
  railAppName: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  railItems: {
    width: '100%',
    alignItems: 'center',
  },
  railItem: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    position: 'relative',
    marginBottom: 2,
  },
  railItemHovered: {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'transparent',
  },
  activeIndicatorVisible: {
    backgroundColor: Colors.primary,
  },
  railIcon: {
    fontSize: 20,
    marginBottom: 3,
  },
  railIconActive: {
    transform: [{scale: 1.1}],
  },
  railLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  railLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  railLabelInactive: {
    color: Colors.textMuted,
  },
});
