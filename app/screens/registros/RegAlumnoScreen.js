import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Portal, Snackbar, Text, TextInput } from 'react-native-paper';
import { colors } from '../../../styles/colors';
import { AuthContext } from '../../components/context/AuthContext';

export default function RegAlumnoScreen() {
  const navigation = useNavigation();
  const { registerUser, carreras } = useContext(AuthContext);

  // Estados para los campos
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [matricula, setMatricula] = useState('');
  const [grupo, setGrupo] = useState('');
  const [cuatrimestre, setCuatrimestre] = useState('');
  const [carrera, setCarrera] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const snackbarTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (snackbarTimer.current) {
        clearTimeout(snackbarTimer.current);
      }
    };
  }, []);

  const validate = () => {
    const e = {};
    if (!nombre) e.nombre = 'Ingresa tu nombre completo';
    if (!correo) e.correo = 'Ingresa tu correo';
    else if (!/^\S+@\S+\.\S+$/.test(correo)) e.correo = 'Correo inválido';
    if (!matricula) e.matricula = 'Ingresa tu matrícula';
    if (!grupo) e.grupo = 'Ingresa tu grupo';
    if (!cuatrimestre) e.cuatrimestre = 'Selecciona tu cuatrimestre';
    if (!carrera) e.carrera = 'Selecciona tu carrera';
    if (!password) e.password = 'Ingresa tu contraseña';
    if (password !== confirmar) e.confirmar = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const result = await registerUser({
      nombre,
      correo,
      matricula,
      grupo,
      cuatrimestre,
      carrera,
      password,
      role: 'alumno',
    });

    if (!result.ok) {
      setErrors({ correo: result.error });
      return;
    }

    setSnackbarVisible(false);
    if (snackbarTimer.current) {
      clearTimeout(snackbarTimer.current);
    }

    setSnackbarVisible(true);
    snackbarTimer.current = setTimeout(() => {
      setSnackbarVisible(false);
      navigation.replace('Login');
    }, 5000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Registro de Alumno</Text>
            <Text style={styles.subtitle}>Completa el formulario para crear tu cuenta</Text>

          </View>
          <View style={styles.card}>
        {/* Información Personal */}
        <Text style={styles.section}>INFORMACIÓN PERSONAL</Text>
        <TextInput
          label="Nombre Completo"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: colors.accent, background: colors.inputBackground, text: colors.textPrimary } }}
        />
        {errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}
        <TextInput
          label="Correo Institucional"
          value={correo}
          onChangeText={setCorreo}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          theme={{ colors: { primary: colors.accent, background: colors.inputBackground, text: colors.textPrimary } }}
        />
        {errors.correo && <Text style={styles.error}>{errors.correo}</Text>}
        <TextInput
          label="Matrícula"
          value={matricula}
          onChangeText={setMatricula}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: colors.accent, background: colors.inputBackground, text: colors.textPrimary } }}
        />
        {errors.matricula && <Text style={styles.error}>{errors.matricula}</Text>}

        {/* Información Académica */}
        <Text style={styles.section}>INFORMACIÓN ACADÉMICA</Text>
        <TextInput
          label="Grupo"
          value={grupo}
          onChangeText={setGrupo}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: colors.accent, background: colors.inputBackground, text: colors.textPrimary } }}
        />
        {errors.grupo && <Text style={styles.error}>{errors.grupo}</Text>}
        <Text style={styles.fieldLabel}>Cuatrimestre</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={cuatrimestre}
            onValueChange={(val) => setCuatrimestre(val)}
            style={styles.picker}
            dropdownIconColor={colors.textPlaceholder}
          >
            <Picker.Item label="Selecciona una opción" value="" />
            <Picker.Item label="1er Cuatrimestre" value="1" />
            <Picker.Item label="2do Cuatrimestre" value="2" />
            <Picker.Item label="3er Cuatrimestre" value="3" />
            <Picker.Item label="4to Cuatrimestre" value="4" />
            <Picker.Item label="5to Cuatrimestre" value="5" />
            <Picker.Item label="6to Cuatrimestre" value="6" />
            <Picker.Item label="7mo Cuatrimestre" value="7" />
            <Picker.Item label="8vo Cuatrimestre" value="8" />  
            <Picker.Item label="9no Cuatrimestre" value="9" />
            <Picker.Item label="10mo Cuatrimestre" value="10" />
            <Picker.Item label="11vo Cuatrimestre" value="11" />
          </Picker>
        </View>
        {errors.cuatrimestre && <Text style={styles.error}>{errors.cuatrimestre}</Text>}
        <Text style={styles.fieldLabel}>Carrera</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={carrera}
            onValueChange={(val) => setCarrera(val)}
            style={styles.picker}
            dropdownIconColor={colors.textPlaceholder}
          >
            <Picker.Item label="Selecciona una opción" value="" />
            {carreras.map((item) => (
              <Picker.Item key={item.codigo} label={item.nombre} value={item.codigo} />
            ))}
          </Picker>
        </View>
        {errors.carrera && <Text style={styles.error}>{errors.carrera}</Text>}

        {/* Seguridad */}
        <Text style={styles.section}>SEGURIDAD</Text>
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: colors.accent, background: colors.inputBackground, text: colors.textPrimary } }}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              color={colors.textPlaceholder}
              onPress={() => setShowPassword((s) => !s)}
            />
          }
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        <TextInput
          label="Confirmar Contraseña"
          value={confirmar}
          onChangeText={setConfirmar}
          secureTextEntry={!showConfirmar}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: colors.accent, background: colors.inputBackground, text: colors.textPrimary } }}
          right={
            <TextInput.Icon
              icon={showConfirmar ? 'eye-off' : 'eye'}
              color={colors.textPlaceholder}
              onPress={() => setShowConfirmar((s) => !s)}
            />
          }
        />
        {errors.confirmar && <Text style={styles.error}>{errors.confirmar}</Text>}

        {/* Botón Crear Cuenta */}
        <TouchableOpacity onPress={handleRegister} activeOpacity={0.9}>
          <LinearGradient
            colors={[colors.accent, colors.accentHover]}
            style={styles.registerButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.registerButtonText}>Crear Cuenta</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Link volver al login */}
        <View style={styles.loginPromptRow}>
          <Text style={styles.link}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.linkAccent}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
          </View>

          <Text style={styles.footer}>© 2026 IUS Project</Text>
        </View>
      </ScrollView>

      <Portal>
        <View pointerEvents="box-none" style={styles.snackbarWrapper}>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={5000}
            theme={{
              colors: {
                inverseSurface: colors.inputBackground,
                inverseOnSurface: colors.textPrimary,
              },
            }}
            style={styles.snackbar}
            action={{
              label: 'OK',
              labelStyle: styles.snackbarAction,
              onPress: () => {
                if (snackbarTimer.current) {
                  clearTimeout(snackbarTimer.current);
                }
                setSnackbarVisible(false);
                navigation.replace('Login');
              },
            }}
          >
            Cuenta creada correctamente
          </Snackbar>
        </View>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1 },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginTop: 8,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  section: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    marginBottom: 12,
    backgroundColor: colors.inputBackground,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  picker: {
    height: 52,
    color: colors.textPrimary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.inputBackground,
    overflow: 'hidden',
    marginBottom: 12,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 6,
  },
  registerButton: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: colors.accentDark,
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    color: colors.textPlaceholder,
    fontSize: 14,
    fontWeight: '600',
  },
  linkAccent: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  loginPromptRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 30,
    fontSize: 12,
  },
  snackbar: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  snackbarAction: {
    color: colors.accent,
    fontWeight: '700',
  },
  snackbarWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 16 : 24,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
});