import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
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

function TabIcon({
  label,
  color,
  focused,
}: {
  label: string;
  color: string;
  focused: boolean;
}) {
  const icons: Record<string, IconName> = {
    HomeTab: 'home',
    ComponentsTab: 'grid',
    AboutTab: 'info',
  };

  return (
    <View style={styles.tabIcon}>
      <View style={[styles.tabGlyphWrap, focused && styles.tabGlyphWrapFocused]}>
        <IconSymbol
          name={icons[label] || 'grid'}
          size={19}
          color={focused ? Colors.primary : color}
        />
      </View>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      detachInactiveScreens
      screenOptions={({route}) => ({
        headerShown: false,
        freezeOnBlur: true,
        lazy: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({color, focused}) => (
          <TabIcon label={route.name} color={color} focused={focused} />
        ),
      })}>
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
