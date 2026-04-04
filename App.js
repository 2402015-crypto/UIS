import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

import { AuthContext, AuthProvider } from './app/components/context/AuthContext';
import HomeScreen from './app/screens/home/HomeScreen';
import LoginScreen from './app/screens/login/LoginScreen';
import RegAlumnoScreen from './app/screens/registros/RegAlumnoScreen';
import RegMaestroScreen from './app/screens/registros/RegMaestroScreen';
import { colors } from './styles/colors';

const Stack = createStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
  },
};

function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RegAlumno" component={RegAlumnoScreen} />
          <Stack.Screen name="RegMaestro" component={RegMaestroScreen} />
        </>
      ) : (
        <Stack.Screen name="Home" component={HomeScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <NavigationContainer theme={navTheme}>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}
