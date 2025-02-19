import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
    return (
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#ffd33d',
            tabBarShowLabel: false,
            tabBarStyle: { backgroundColor: '#1e1e1e' },
        }}
        >
            <Tabs.Screen 
                    name="home" 
                    
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={28} />
                        ),
                    }} 
                />
                <Tabs.Screen 
                    name="profile" 
                   
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={28} />
                        ),
                    }} 
                />
        </Tabs>
    );
}
