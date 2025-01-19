import { useLayout } from '@/src/context/ApplicationLayoutProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    const { lockLandscape, lockPortrait } = useLayout()
    return (
        <Tabs
            screenListeners={{
                tabPress: (e) => {
                    const target = e.target?.split("-")[0];
                    switch (target) {
                        case "profile":
                            lockPortrait();
                            break;
                        default:
                            lockLandscape();
                            break;
                    }
                }
            }}
            screenOptions={{
                tabBarActiveTintColor: '#00f',
                headerStyle: {
                    backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
                tabBarStyle: {
                    backgroundColor: '#fff',
                },
                tabBarShowLabel: false, // Hides the labels
            }}


        >
            <Tabs.Screen

                name="home"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <FontAwesome name="home" size={24} color={color} />),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => {

                        return <MaterialIcons name="history-edu" size={24} color={color} />
                    },
                }}
            />
            <Tabs.Screen
                name="trend"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name="stats-chart" size={24} color={color} />),
                }}
            />
            <Tabs.Screen
                name="podcast"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIcons name="headphones" size={24} color="black" />),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => {

                        return <FontAwesome name="user-circle" size={24} color={color} />
                    },

                }}
            />
        </Tabs>
    );
}
