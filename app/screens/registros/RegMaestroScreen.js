import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Portal, Snackbar, Text, TextInput } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import { AuthContext } from '../../components/context/AuthContext';

export default function RegMaestroScreen() {
	const navigation = useNavigation();
	const { registerUser, carreras } = useContext(AuthContext);

	const [nombre, setNombre] = useState('');
	const [correo, setCorreo] = useState('');
	const [idEmpleado, setIdEmpleado] = useState('');
	const [departamento, setDepartamento] = useState('');
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
		if (!idEmpleado) e.idEmpleado = 'Ingresa tu ID de empleado';
		if (!departamento) e.departamento = 'Selecciona tu departamento';
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
			matricula: idEmpleado,
			grupo: '',
			cuatrimestre: '',
			carrera: departamento,
			password,
			role: 'maestro',
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
						<Image source={require('../../../assets/images/logo.png')} style={styles.logo} />
						<Text style={styles.title}>Registro de Maestro</Text>
						<Text style={styles.subtitle}>Completa el formulario para crear tu cuenta</Text>
					</View>

					<View style={styles.card}>
						<Text style={styles.section}>INFORMACIÓN PERSONAL</Text>
						<TextInput
							label="Nombre Completo"
							value={nombre}
							onChangeText={setNombre}
							style={styles.input}
							mode="outlined"
							theme={{ colors: { primary: colors.accent, background: colors.inputBackground, text: colors.textPrimary } }}
							left={<TextInput.Icon icon="account-outline" color={colors.textPlaceholder} />}
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
							left={<TextInput.Icon icon="email-outline" color={colors.textPlaceholder} />}
						/>
						{errors.correo && <Text style={styles.error}>{errors.correo}</Text>}

						<TextInput
							label="ID de Empleado"
							value={idEmpleado}
							onChangeText={setIdEmpleado}
							style={styles.input}
							mode="outlined"
							autoCapitalize="characters"
							theme={{ colors: { primary: colors.accent, background: colors.inputBackground, text: colors.textPrimary } }}
							left={<TextInput.Icon icon="pound" color={colors.textPlaceholder} />}
						/>
						{errors.idEmpleado && <Text style={styles.error}>{errors.idEmpleado}</Text>}

						<View style={styles.separator} />

						<Text style={styles.section}>INFORMACIÓN LABORAL</Text>
						<Text style={styles.fieldLabel}>Departamento</Text>
						<View style={styles.pickerContainer}>
							<Picker
								selectedValue={departamento}
								onValueChange={(val) => setDepartamento(val)}
								style={styles.picker}
								dropdownIconColor={colors.textPlaceholder}
							>
								<Picker.Item label="Selecciona una opción" value="" />
								{carreras.map((item) => (
									<Picker.Item key={item.codigo} label={item.nombre} value={item.codigo} />
								))}
							</Picker>
						</View>
						{errors.departamento && <Text style={styles.error}>{errors.departamento}</Text>}

						<View style={styles.separator} />

						<Text style={styles.section}>SEGURIDAD</Text>
						<TextInput
							label="Contraseña"
							value={password}
							onChangeText={setPassword}
							secureTextEntry={!showPassword}
							style={styles.input}
							mode="outlined"
							theme={{ colors: { primary: colors.accent, background: colors.inputBackground, text: colors.textPrimary } }}
							left={<TextInput.Icon icon="lock-outline" color={colors.textPlaceholder} />}
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
							left={<TextInput.Icon icon="lock-outline" color={colors.textPlaceholder} />}
							right={
								<TextInput.Icon
									icon={showConfirmar ? 'eye-off' : 'eye'}
									color={colors.textPlaceholder}
									onPress={() => setShowConfirmar((s) => !s)}
								/>
							}
						/>
						{errors.confirmar && <Text style={styles.error}>{errors.confirmar}</Text>}

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
	logo: {
		width: 150,
		height: 120,
		resizeMode: 'contain',
		alignSelf: 'center',
		marginTop: 8,
		marginBottom: 8,
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
		fontSize: 24 / 1.5,
		fontWeight: '700',
		marginTop: 8,
		marginBottom: 10,
	},
	separator: {
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
		marginVertical: 10,
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
	loginPromptRow: {
		marginTop: 16,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	link: {
		color: colors.textSecondary,
	},
	linkAccent: {
		color: colors.accent,
		fontWeight: '700',
	},
	footer: {
		color: colors.textPlaceholder,
		textAlign: 'center',
		marginTop: 20,
		marginBottom: 8,
	},
	snackbarWrapper: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'flex-end',
	},
	snackbar: {
		backgroundColor: colors.inputBackground,
		marginHorizontal: 12,
		marginBottom: 28,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.accent,
	},
	snackbarAction: {
		color: colors.accent,
		fontWeight: '700',
	},
});
