
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <Label>Play</Label>
        <Icon sf={{ default: 'circle.grid.2x2', selected: 'circle.grid.2x2.fill' }} drawable="bubble-chart" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Progress</Label>
        <Icon sf={{ default: 'star', selected: 'star.fill' }} drawable="star" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
