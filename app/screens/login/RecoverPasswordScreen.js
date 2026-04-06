import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { colors } from '../../../styles/colors';

export default function RecoverPasswordScreen() {
  const navigation = useNavigation();
  const [correo, setCorreo] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendInstructions = () => {
    if (!correo.trim() || !/^\S+@\S+\.\S+$/.test(correo)) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
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
          

          {!sent ? (
            <>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>🔐</Text>
                </View>
                <Text style={styles.brand}>Recuperar Contraseña</Text>
                <Text style={styles.sub}>Ingresa tu correo institucional</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Restablecer Contraseña</Text>
                  <Text style={styles.cardSubtitle}>
                    Te enviaremos un enlace para restablecer tu contraseña
                  </Text>
                </View>

                <View style={styles.form}>
                  <Text style={styles.fieldLabel}>Correo Institucional</Text>
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
                  <Text style={styles.helperText}>
                    Usa tu correo institucional
                  </Text>

                  <TouchableOpacity
                    onPress={handleSendInstructions}
                    disabled={!correo.trim() || loading}
                    activeOpacity={0.9}
                    style={[
                      styles.sendButtonWrapper,
                      (!correo.trim() || loading) && styles.sendButtonDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        !correo.trim() || loading
                          ? [colors.textPlaceholder, colors.textPlaceholder]
                          : [colors.accent, colors.accentHover]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sendButton}
                    >
                      <Text style={styles.sendButtonText}>
                        {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.linkRow}>
                    <Text style={styles.linkText}>¿Recordaste tu contraseña? </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
                      <Text style={styles.linkHighlight}>Inicia Sesión</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.successIconContainer}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
                <Text style={styles.brand}>Correo Enviado</Text>
                <Text style={styles.sub}>Revisa tu bandeja de entrada</Text>
              </View>

              <View style={styles.successCard}>
                <View style={styles.successContent}>
                  <Text style={styles.successTitle}>¡Listo!</Text>
                  <Text style={styles.successMessage}>
                    Hemos enviado instrucciones para restablecer tu contraseña a:
                  </Text>
                  <Text style={styles.emailHighlight}>{correo}</Text>
                  <Text style={styles.successSubtext}>
                    Si no ves el correo, revisa tu carpeta de spam o contacta con Servicios Escolares.
                  </Text>

                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.9}
                    style={styles.returnButtonWrapper}
                  >
                    <LinearGradient
                      colors={[colors.accent, colors.accentHover]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.returnButton}
                    >
                      <Text style={styles.returnButtonText}>Volver a Iniciar Sesión</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

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
    paddingVertical: 16,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 8,
  },
  backButtonText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  iconText: {
    fontSize: 44,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 44,
    color: colors.textWhite,
    fontWeight: 'bold',
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  sub: {
    color: colors.textPlaceholder,
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  successCard: {
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10B981',
    padding: 24,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    marginTop: 0,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
  helperText: {
    color: colors.textPlaceholder,
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sendButtonWrapper: {
    marginTop: 8,
    marginBottom: 16,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButton: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: colors.accentDark,
    fontWeight: '700',
    fontSize: 15,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  linkHighlight: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  successContent: {
    alignItems: 'center',
  },
  successTitle: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  successMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  emailHighlight: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
  },
  successSubtext: {
    color: colors.textPlaceholder,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  returnButtonWrapper: {
    width: '100%',
    marginTop: 8,
  },
  returnButton: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnButtonText: {
    color: colors.accentDark,
    fontWeight: '700',
    fontSize: 15,
  },
  footer: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 24,
    fontSize: 12,
  },
});
