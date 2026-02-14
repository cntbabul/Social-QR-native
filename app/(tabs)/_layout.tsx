import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from "expo-router";
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabLayout = () => {
    const insets = useSafeAreaInsets();
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#FFFFFF",
                tabBarInactiveTintColor: "#8E8EA0",
                tabBarStyle: {
                    backgroundColor: "#0F0C29",
                    borderTopWidth: 0,
                    height: 60 + insets.bottom,
                    paddingTop: 8,
                    paddingBottom: insets.bottom + 8,
                    elevation: 0,
                    shadowOpacity: 0,
                    position: 'absolute',
                },
                tabBarBackground: () => (
                    <LinearGradient
                        colors={['#1A1A2E', '#16213E', '#0F0C29']}
                        style={StyleSheet.absoluteFill}
                    />
                ),
                tabBarLabelStyle: {
                    fontWeight: "700",
                    fontSize: 11,
                    letterSpacing: 0.5,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Social",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : undefined}>
                            <MaterialCommunityIcons name="whatsapp" size={size} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="generator"
                options={{
                    title: "Generator",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : undefined}>
                            <MaterialCommunityIcons name="qrcode-plus" size={size} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="scanner"
                options={{
                    title: "Scanner",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : undefined}>
                            <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    )
}

const styles = StyleSheet.create({
    activeIconContainer: {
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        padding: 8,
        borderRadius: 12,
    },
});

export default TabLayout