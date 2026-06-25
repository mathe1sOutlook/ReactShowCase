import React, {useState} from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import {Colors, fluentShadow} from '../theme';
import type {RootTabParamList} from './types';
import {withScreenQuality} from '../quality/withScreenQuality';
import IconSymbol, {type IconName} from '../components/common/IconSymbol';

import HomeStack from './HomeStack';
import ComponentsScreen from '../screens/ComponentsScreen';
import AboutScreen from '../screens/AboutScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ComponentsScreenMonitored = withScreenQuality(
  'Components',
  ComponentsScreen,
);
const AboutScreenMonitored = withScreenQuality('About', AboutScreen);

const TAB_ITEMS: {
  key: keyof RootTabParamList;
  label: string;
  icon: IconName;
}[] = [
  {key: 'HomeTab', label: 'Explore', icon: 'home'},
  {key: 'ComponentsTab', label: 'Components', icon: 'grid'},
  {key: 'AboutTab', label: 'About', icon: 'info'},
];

function SideNavigationRail({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <View style={styles.railContainer}>
      {/* App Logo / Name */}
      <View style={styles.railHeader}>
        <View style={styles.railLogoWrap}>
          <IconSymbol name="spark" size={20} color={Colors.primary} />
        </View>
        <Text style={styles.railAppName}>Showcase</Text>
      </View>

      {/* Nav Items */}
      <View style={styles.railItems}>
        {state.routes.map((route: any, index: number) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;
          const tabItem = TAB_ITEMS.find(t => t.key === route.name);
          const label = tabItem?.label || options.tabBarLabel || route.name;
          const icon = tabItem?.icon || 'grid';
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
              accessibilityLabel={label}
              accessibilityHint={`Opens the ${label} tab`}>
              {/* Active indicator bar */}
              <View
                style={[
                  styles.activeIndicator,
                  isFocused && styles.activeIndicatorVisible,
                ]}
              />

              <View
                style={[
                  styles.railIcon,
                  isFocused && styles.railIconActive,
                ]}>
                <IconSymbol
                  name={icon}
                  size={20}
                  color={isFocused ? Colors.primary : Colors.textMuted}
                />
              </View>
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

function renderSideNavigationRail(props: BottomTabBarProps) {
  return <SideNavigationRail {...props} />;
}

export default function AppNavigator() {
  return (
    <View style={styles.appContainer}>
      <Tab.Navigator
        detachInactiveScreens
        tabBar={renderSideNavigationRail}
        screenOptions={{
          headerShown: false,
          freezeOnBlur: true,
          lazy: true,
        }}>
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: 'Explore',
            tabBarAccessibilityLabel: 'Explore showcase screens',
          }}
        />
        <Tab.Screen
          name="ComponentsTab"
          component={ComponentsScreenMonitored}
          options={{
            tabBarLabel: 'Components',
            tabBarAccessibilityLabel: 'Open component showcase',
          }}
        />
        <Tab.Screen
          name="AboutTab"
          component={AboutScreenMonitored}
          options={{
            tabBarLabel: 'About',
            tabBarAccessibilityLabel: 'Open about screen',
          }}
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
  railLogoWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 120, 212, 0.12)',
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
    marginBottom: 3,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
