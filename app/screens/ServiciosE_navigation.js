import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '../../styles/colors';
import SAvisosScreen from './ServiciosE/SAvisosScreen';
import SGruposScreen from './ServiciosE/SGruposScreen';
import SInicioScreen from './ServiciosE/SInicioScreen';
import SPracticasScreen from './ServiciosE/SPracticasScreen';
import SUsuariosScreen from './ServiciosE/SUsuariosScreen';

const Tab = createBottomTabNavigator();

export default function ServiciosENavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#152C47',
          borderTopColor: '#1F4C7A',
          borderTopWidth: 1,
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textPlaceholder,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'home-outline';
          if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Usuarios') iconName = focused ? 'account-group' : 'account-group-outline';
          else if (route.name === 'Practicas') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'Avisos') iconName = focused ? 'bell' : 'bell-outline';
          else if (route.name === 'Grupos') iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={SInicioScreen} />
      <Tab.Screen name="Usuarios" component={SUsuariosScreen} />
      <Tab.Screen name="Practicas" component={SPracticasScreen} />
      <Tab.Screen name="Avisos" component={SAvisosScreen} />
      <Tab.Screen
        name="Grupos"
        component={SGruposScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}
