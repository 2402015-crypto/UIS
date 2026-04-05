import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '../../styles/colors';
import AAvisosScreen from './alumno/AAvisosScreen';
import ACalificacionesScreen from './alumno/ACalificacionesScreen';
import AHorariosScreen from './alumno/AHorariosScreen';
import AInicioScreen from './alumno/AInicioScreen';
import APracticasScreen from './alumno/APracticasScreen';

const Tab = createBottomTabNavigator();

export default function AlumnoNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textPlaceholder,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Horarios') iconName = 'calendar';
          else if (route.name === 'Calificaciones') iconName = 'file-document-outline';
          else if (route.name === 'Prácticas') iconName = 'briefcase-outline';
          else if (route.name === 'Avisos') iconName = 'bullhorn-outline';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={AInicioScreen} />
      <Tab.Screen name="Horarios" component={AHorariosScreen} />
      <Tab.Screen name="Calificaciones" component={ACalificacionesScreen} />
      <Tab.Screen name="Prácticas" component={APracticasScreen} />
      <Tab.Screen
        name="Avisos"
        component={AAvisosScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}