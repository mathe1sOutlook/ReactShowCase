import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import {StyleSheet, View} from 'react-native';
import {Colors} from '../theme';
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
type TabRouteKey = keyof RootTabParamList;

const TAB_ICON_BY_ROUTE: Record<TabRouteKey, IconName> = {
  HomeTab: 'home',
  ComponentsTab: 'grid',
  AboutTab: 'info',
};

function TabIcon({
  iconName,
  color,
  focused,
}: {
  iconName: IconName;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabIcon}>
      <View style={[styles.tabGlyphWrap, focused && styles.tabGlyphWrapFocused]}>
        <IconSymbol
          name={iconName}
          size={19}
          color={focused ? Colors.primary : color}
        />
      </View>
    </View>
  );
}

function getTabNavigatorOptions(): BottomTabNavigationOptions {
  return {
    headerShown: false,
    freezeOnBlur: true,
    lazy: true,
    tabBarStyle: styles.tabBar,
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.textMuted,
    tabBarLabelStyle: styles.tabLabel,
  };
}

function createTabOptions(
  routeKey: TabRouteKey,
  label: string,
  accessibilityLabel: string,
): BottomTabNavigationOptions {
  return {
    tabBarLabel: label,
    tabBarAccessibilityLabel: accessibilityLabel,
    tabBarIcon: ({color, focused}) => (
      <TabIcon
        iconName={TAB_ICON_BY_ROUTE[routeKey]}
        color={color}
        focused={focused}
      />
    ),
  };
}

const HOME_TAB_OPTIONS = createTabOptions(
  'HomeTab',
  'Explore',
  'Explore showcase screens',
);
const COMPONENTS_TAB_OPTIONS = createTabOptions(
  'ComponentsTab',
  'Components',
  'Open component showcase',
);
const ABOUT_TAB_OPTIONS = createTabOptions(
  'AboutTab',
  'About',
  'Open about screen',
);

export default function AppNavigator() {
  return (
    <Tab.Navigator
      detachInactiveScreens
      screenOptions={getTabNavigatorOptions()}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={HOME_TAB_OPTIONS}
      />
      <Tab.Screen
        name="ComponentsTab"
        component={ComponentsScreenMonitored}
        options={COMPONENTS_TAB_OPTIONS}
      />
      <Tab.Screen
        name="AboutTab"
        component={AboutScreenMonitored}
        options={ABOUT_TAB_OPTIONS}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgLight,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
    paddingTop: 4,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGlyphWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGlyphWrapFocused: {
    backgroundColor: `${Colors.primary}18`,
  },
});
