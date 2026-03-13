import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../theme';
import type {RootTabParamList} from './types';

import HomeStack from './HomeStack';
import ComponentsScreen from '../screens/ComponentsScreen';
import AboutScreen from '../screens/AboutScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabIcon({label, color, focused}: {label: string; color: string; focused: boolean}) {
  const icons: Record<string, string> = {
    HomeTab: '\u{1F3E0}',
    ComponentsTab: '\u{1F9E9}',
    AboutTab: '\u{2139}\uFE0F',
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && {transform: [{scale: 1.15}]}]}>
        {icons[label] || '\u25CF'}
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
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
  tabEmoji: {
    fontSize: 20,
  },
});
