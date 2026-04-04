import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { colors } from '../../../styles/colors';
import { AuthContext } from '../../components/context/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const registerOptions = [
    { label: 'Registro Alumno', route: 'RegAlumno' },
    { label: 'Registro Maestro', route: 'RegMaestro' },
  ];

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (errors.correo && correo.length > 3) setErrors((prev) => ({ ...prev, correo: undefined }));
    if (errors.password && password.length > 3) setErrors((prev) => ({ ...prev, password: undefined }));
  }, [correo, password]);

  const validate = () => {
    const e = {};
    if (!correo) e.correo = 'Ingresa tu correo';
    else if (!/^\S+@\S+\.\S+$/.test(correo)) e.correo = 'Correo invalido';
    if (!password) e.password = 'Ingresa tu contrasena';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      if (correo === 'admin@ius.mx' && password === '1234') {
        login(correo);
      } else {
        setErrors({ password: 'Credenciales incorrectas' });
      }
    } catch (err) {
      setErrors({ password: 'Error al iniciar sesion' });
    } finally {
      setLoading(false);
    }
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
          <View style={styles.header}>
            <Image source={require('../../../assets/images/logo.png')} style={styles.logo} />
            <Text style={styles.brand}>Sistema Escolar UIS</Text>
            <Text style={styles.sub}>Bienvenido</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inic}>Iniciar Sesion</Text>
            <Text style={styles.sub2}>Ingresa tus credenciales para continuar</Text>

            <View style={styles.form}>
              <Text style={styles.fieldLabel}>Correo Electronico</Text>
              <TextInput
                value={correo}
                onChangeText={setCorreo}
                placeholder="tu.correo@uis.mx"
                placeholderTextColor={colors.textPlaceholder}
                textColor={colors.textWhite}
                style={styles.input}
                contentStyle={styles.inputContent}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={colors.accent}
                theme={{
                  colors: {
                    primary: colors.accent,
                    text: colors.textWhite,
                    placeholder: colors.textPlaceholder,
                    background: colors.inputBackground,
                  },
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email-outline" color={colors.textPlaceholder} />}
              />
              {errors.correo ? <Text style={styles.error}>{errors.correo}</Text> : null}

              <View style={styles.passwordHeaderRow}>
                <Text style={styles.fieldLabel}>Contrasena</Text>
                <TouchableOpacity onPress={() => {}} activeOpacity={0.8} style={styles.forgotRow}>
                  <Text style={styles.forgotText}>Olvidaste tu contrasena?</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="minimo 6 caracteres"
                placeholderTextColor={colors.textPlaceholder}
                textColor={colors.textWhite}
                secureTextEntry={!showPassword}
                style={styles.input}
                contentStyle={styles.inputContent}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={colors.accent}
                theme={{
                  colors: {
                    primary: colors.accent,
                    text: colors.textWhite,
                    placeholder: colors.textPlaceholder,
                    background: colors.inputBackground,
                  },
                }}
                left={<TextInput.Icon icon="lock-outline" color={colors.textPlaceholder} />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    color={colors.textPlaceholder}
                    onPress={() => setShowPassword((s) => !s)}
                  />
                }
              />
              {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

              <TouchableOpacity onPress={handleLogin} activeOpacity={0.9}>
                <LinearGradient
                  colors={[colors.accent, colors.accentHover]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>{loading ? 'Cargando...' : 'Iniciar Sesion'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>No tienes cuenta?</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.registerRow}>
                {registerOptions.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => navigation.navigate(option.route)}
                    style={styles.registerButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.registerButtonText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.footer}>© 2026 IUS Project</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1 },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContentContainer: { flexGrow: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sub: {
    color: colors.textPlaceholder,
    fontSize: 18,
    marginTop: 6,
    marginBottom: 12,
    opacity: 0.9,
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
  },
  logo: {
    width: 120,
    height: 120,
  },
  card: {
    marginTop: 18,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  form: {
    marginTop: 0,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
    textAlign: 'left',
  },
  input: {
    backgroundColor: colors.inputBackground,
    marginBottom: 6,
  },
  inputContent: {
    textAlign: 'left',
    paddingHorizontal: 0,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotRow: {
    marginTop: 0,
    marginBottom: 8,
  },
  forgotText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginButtonText: {
    color: colors.accentDark,
    fontWeight: '700',
    fontSize: 16,
  },
  dividerRow: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    marginHorizontal: 10,
    fontSize: 14,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  registerButton: {
    backgroundColor: colors.background,
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 18,
    fontSize: 12,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 6,
  },
  inic: {
    fontSize: 22,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  sub2: {
    color: colors.textPlaceholder,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 38,
    marginTop: 6,
  },
});
