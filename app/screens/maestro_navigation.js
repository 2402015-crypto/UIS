import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '../../styles/colors';
import MAsistenciasScreen from './maestro/MAsistenciasScreen';
import MAvisosScreen from './maestro/MAvisosScreen';
import MCalificacionesScreen from './maestro/MCalificacionesScreen';
import MGruposScreen from './maestro/MGruposScreen';
import MInicioScreen from './maestro/MInicioScreen';

const Tab = createBottomTabNavigator();

export default function MaestroNavigation() {
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
          else if (route.name === 'Grupos') iconName = focused ? 'account-group' : 'account-group-outline';
          else if (route.name === 'Calificaciones') iconName = focused ? 'clipboard-text' : 'clipboard-text-outline';
          else if (route.name === 'Asistencias') iconName = focused ? 'file-document' : 'file-document-outline';

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={MInicioScreen} />
      <Tab.Screen name="Grupos" component={MGruposScreen} />
      <Tab.Screen name="Calificaciones" component={MCalificacionesScreen} />
      <Tab.Screen name="Asistencias" component={MAsistenciasScreen} />
      <Tab.Screen
        name="Avisos"
        component={MAvisosScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}