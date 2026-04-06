import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import MaestroTopBar from '../../components/MaestroTopBar';
import { AuthContext } from '../../components/context/AuthContext';
import { getMaestroGroupsByDepartamento } from '../../services/authDb';

export default function MInicioScreen() {
	const navigation = useNavigation();
	const { user } = useContext(AuthContext);
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadGroups = async () => {
			if (!user?.carrera) {
				setGroups([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			try {
				const fetchedGroups = await getMaestroGroupsByDepartamento(user.carrera);
				setGroups(fetchedGroups || []);
			} finally {
				setLoading(false);
			}
		};

		loadGroups();
	}, [user?.carrera]);

	const nombre = user?.nombre || 'Maestro';
	const idEmpleado = user?.matricula || 'Sin ID';
	const departamento = user?.carreraNombre || 'Tecnologías de la Información';
	const totalAlumnos = useMemo(() => groups.reduce((acc, item) => acc + Number(item.alumnos || 0), 0), [groups]);

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
			<MaestroTopBar />

			<View style={styles.profileCard}>
				<View style={styles.profileIconWrap}>
					<MaterialCommunityIcons name="account-group-outline" size={44} color={colors.textSecondary} />
				</View>
				<View style={styles.profileInfo}>
					<Text style={styles.profileName}>{nombre}</Text>
					<Text style={styles.profileMeta}>ID: {idEmpleado}</Text>
					<Text style={styles.profileMeta}>{departamento}</Text>
				</View>
			</View>

			<View style={styles.statsGrid}>
				<View style={styles.statCardHalf}>
					<MaterialCommunityIcons name="book-open-page-variant-outline" size={34} color="#2B6CFF" />
					<Text style={styles.statValue}>{groups.length}</Text>
					<Text style={styles.statLabel}>Grupos</Text>
				</View>

				<View style={styles.statCardHalf}>
					<MaterialCommunityIcons name="account-group-outline" size={34} color="#2B6CFF" />
					<Text style={styles.statValue}>{totalAlumnos}</Text>
					<Text style={styles.statLabel}>Alumnos</Text>
				</View>

				<View style={styles.statCardFull}>
					<MaterialCommunityIcons name="clipboard-text-outline" size={34} color="#00C853" />
					<Text style={styles.statValue}>{groups.length}</Text>
					<Text style={styles.statLabel}>Grupos Activos</Text>
				</View>
			</View>

			<View style={styles.sectionCard}>
				<Text style={styles.sectionTitle}>Mis Grupos</Text>
				<Text style={styles.sectionSubtitle}>Grupos que imparte este cuatrimestre</Text>

				{loading ? (
					<View style={styles.loadingWrap}>
						<ActivityIndicator size="small" color={colors.accent} />
						<Text style={styles.loadingText}>Cargando grupos...</Text>
					</View>
				) : groups.length === 0 ? (
					<Text style={styles.emptyText}>Aún no tienes grupos asignados.</Text>
				) : groups.map((grupo) => (
					<View key={grupo.clave} style={styles.groupCard}>
						<View style={styles.groupHeaderRow}>
							<Text style={styles.groupCode}>{grupo.clave}</Text>
							<View style={styles.groupBadge}>
								<Text style={styles.groupBadgeText}>{grupo.alumnos} alumnos</Text>
							</View>
						</View>

						<Text style={styles.groupSubject}>Tutor: {grupo.tutor}</Text>

						<View style={styles.groupMetaRow}>
							<Text style={styles.groupMetaText}>Aula: {grupo.aula}</Text>
							<Text style={styles.groupMetaText}>{departamento}</Text>
						</View>
					</View>
				))}
			</View>

			<View style={styles.sectionCard}>
				<Text style={styles.sectionTitle}>Accesos Rápidos</Text>

				<View style={styles.quickGrid}>
					<TouchableOpacity style={styles.quickButton} activeOpacity={0.85} onPress={() => navigation.navigate('Grupos')}>
						<MaterialCommunityIcons name="account-group-outline" size={22} color={colors.textPrimary} />
						<Text style={styles.quickText}>Ver Grupos</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.quickButton} activeOpacity={0.85} onPress={() => navigation.navigate('Calificaciones')}>
						<MaterialCommunityIcons name="clipboard-text-outline" size={22} color={colors.textPrimary} />
						<Text style={styles.quickText}>Calificaciones</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.quickButton} activeOpacity={0.85} onPress={() => navigation.navigate('Asistencias')}>
						<MaterialCommunityIcons name="book-open-page-variant-outline" size={22} color={colors.textPrimary} />
						<Text style={styles.quickText}>Asistencias</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.quickButton} activeOpacity={0.85} onPress={() => navigation.navigate('Avisos')}>
						<MaterialCommunityIcons name="trending-up" size={22} color={colors.textPrimary} />
						<Text style={styles.quickText}>Avisos</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	contentContainer: {
		padding: 16,
		paddingBottom: 30,
	},
	profileCard: {
		backgroundColor: '#3E6293',
		borderRadius: 22,
		padding: 16,
		marginBottom: 18,
		flexDirection: 'row',
		alignItems: 'center',
	},
	profileIconWrap: {
		width: 78,
		height: 78,
		borderRadius: 39,
		backgroundColor: 'rgba(255,255,255,0.2)',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 14,
	},
	profileInfo: {
		flex: 1,
	},
	profileName: {
		color: colors.textPrimary,
		fontSize: 40 / 1.5,
		fontWeight: '800',
	},
	profileMeta: {
		color: '#D4E2F4',
		fontSize: 32 / 2,
		marginTop: 2,
	},
	statsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginBottom: 18,
	},
	statCardHalf: {
		width: '48%',
		backgroundColor: '#152C47',
		borderColor: '#1F5EA1',
		borderWidth: 1,
		borderRadius: 20,
		alignItems: 'center',
		paddingVertical: 26,
		marginBottom: 12,
	},
	statCardFull: {
		width: '100%',
		backgroundColor: '#152C47',
		borderColor: '#1F5EA1',
		borderWidth: 1,
		borderRadius: 20,
		alignItems: 'center',
		paddingVertical: 26,
	},
	statValue: {
		color: colors.textPrimary,
		fontSize: 48 / 1.5,
		fontWeight: '800',
		marginTop: 10,
	},
	statLabel: {
		color: colors.textPlaceholder,
		fontSize: 34 / 2,
		marginTop: 2,
	},
	sectionCard: {
		backgroundColor: '#152C47',
		borderColor: '#1F5EA1',
		borderWidth: 1,
		borderRadius: 20,
		padding: 14,
		marginBottom: 16,
	},
	sectionTitle: {
		color: colors.textPrimary,
		fontSize: 34 / 2,
		fontWeight: '700',
	},
	sectionSubtitle: {
		color: colors.textPlaceholder,
		fontSize: 16,
		marginTop: 4,
		marginBottom: 10,
	},
	groupCard: {
		backgroundColor: '#F3F5F8',
		borderRadius: 14,
		padding: 12,
		marginBottom: 10,
	},
	groupHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	groupCode: {
		color: '#1F2937',
		fontSize: 33 / 2,
		fontWeight: '800',
		marginRight: 8,
	},
	groupBadge: {
		backgroundColor: '#355A8B',
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	groupBadgeText: {
		color: colors.textPrimary,
		fontSize: 25 / 2,
		fontWeight: '600',
	},
	groupSubject: {
		color: '#4B5563',
		fontSize: 17,
		marginTop: 4,
		marginBottom: 8,
	},
	groupMetaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	groupMetaText: {
		color: '#6B7280',
		fontSize: 14,
	},
	loadingWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
	},
	loadingText: {
		color: colors.textPlaceholder,
		marginLeft: 8,
	},
	emptyText: {
		color: colors.textPlaceholder,
		paddingVertical: 8,
	},
	quickGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	quickButton: {
		width: '48%',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#1F5EA1',
		backgroundColor: '#0D2038',
		alignItems: 'center',
		paddingVertical: 16,
		marginBottom: 10,
	},
	quickText: {
		color: colors.textPrimary,
		fontSize: 17,
		marginTop: 7,
	},
});
