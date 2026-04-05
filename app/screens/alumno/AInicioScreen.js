import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../../styles/colors';
import AlumnoTopBar from '../../components/AlumnoTopBar';
import { AuthContext } from '../../components/context/AuthContext';
import { getScheduleForDate } from '../../services/mockScheduleData';

export default function AInicioScreen() {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);

    const nombre = user?.nombre || 'Alumno';
    const carrera = user?.carreraNombre || user?.carrera || 'No definida';
    const matricula = user?.matricula || 'Sin asignar';
    const grupo = user?.grupo || 'Sin asignar';
    const cuatrimestre = user?.cuatrimestre || 'Sin asignar';

    const { diaHoy, fechaHoy, clases } = getScheduleForDate(new Date());
    const clasesHoy = clases;

    const diaCapitalizado = diaHoy.charAt(0).toUpperCase() + diaHoy.slice(1);
    const subtituloClases = `${diaCapitalizado} • ${
        clasesHoy.length === 0 ? 'Sin clases programadas' : `${clasesHoy.length} clases`
    }`;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <AlumnoTopBar />

            {/* Perfil del alumno */}
            <View style={styles.profileCard}>
                <MaterialCommunityIcons name="account-circle" size={64} color={colors.accent} />
                <Text style={styles.username}>{nombre}</Text>
                <Text style={styles.status}>Activo</Text>
                <Text style={styles.program}>{carrera}</Text>
            </View>

            {/* Estadísticas */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <MaterialCommunityIcons name="chart-line" size={26} color={colors.accent} style={styles.statIcon} />
                    <Text style={styles.statValue}>88.2</Text>
                    <Text style={styles.statLabel}>Promedio General</Text>
                </View>
                <View style={styles.statCard}>
                    <MaterialCommunityIcons name="book-open-variant" size={26} color={colors.accent} style={styles.statIcon} />
                    <Text style={styles.statValue}>5</Text>
                    <Text style={styles.statLabel}>Materias Cursadas</Text>
                </View>
            </View>

            {/* Información del alumno */}
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Información del Alumno</Text>
                <Text style={styles.infoText}>Matrícula: {matricula}</Text>
                <Text style={styles.infoText}>Grupo: {grupo}</Text>
                <Text style={styles.infoText}>Cuatrimestre: {cuatrimestre}</Text>
                <Text style={styles.infoText}>Aula: Por asignar</Text>
                <Text style={styles.infoText}>Tutor Asignado: Por asignar</Text>
            </View>

            {/* Clases de hoy */}
            <View style={styles.classesCard}>
                <View style={styles.classesHeaderRow}>
                    <MaterialCommunityIcons name="clock-outline" size={22} color={colors.accent} />
                    <Text style={styles.classesTitle}>Clases de Hoy</Text>
                </View>

                <Text style={styles.classesSubtitle}>
                    {subtituloClases} • {fechaHoy}
                </Text>

                {clasesHoy.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="calendar" size={48} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>Disfruta tu día libre</Text>
                    </View>
                ) : (
                    clasesHoy.map((clase, index) => (
                        <View key={index} style={styles.claseRow}>
                            <MaterialCommunityIcons name="book-open-variant" size={22} color={colors.accent} />
                            <View style={styles.claseInfo}>
                                <Text style={styles.claseNombre}>{clase.nombre}</Text>
                                <Text style={styles.claseDetalle}>
                                    {clase.hora} • Aula {clase.aula}
                                </Text>
                                <Text style={styles.claseDetalle}>Maestro: {clase.profesor}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Accesos rápidos */}
            <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
            <View style={styles.quickAccessRow}>
                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => navigation.navigate('Horarios')}
                >
                    <MaterialCommunityIcons name="calendar" size={28} color={colors.accent} />
                    <Text style={styles.quickText}>Horarios</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => navigation.navigate('Calificaciones')}
                >
                    <MaterialCommunityIcons name="chart-bar" size={28} color={colors.accent} />
                    <Text style={styles.quickText}>Calificaciones</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: 16, paddingBottom: 24 },

    profileCard: { 
        alignItems: 'center', 
        marginBottom: 20 
    },
    username: { 
        color: colors.textPrimary, 
        fontSize: 20, 
        fontWeight: '700' 
    },
    status: { 
        color: colors.accent, 
        fontSize: 14, 
        marginTop: 4 
    },
    program: { 
        color: colors.textSecondary, 
        fontSize: 14, 
        marginTop: 4 
    },

    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 20 
    },
    statCard: { 
        flex: 1, 
        backgroundColor: colors.card, 
        marginHorizontal: 6, 
        padding: 12, 
        borderRadius: 10, 
        alignItems: 'center' 
    },
    statIcon: { 
        marginBottom: 8 
    },
    statValue: { 
        color: colors.accent, 
        fontSize: 22, 
        fontWeight: '700' 
    },
    statLabel: { 
        color: colors.textSecondary, 
        fontSize: 12 
    },

    infoCard: { 
        backgroundColor: colors.card, 
        padding: 16, 
        borderRadius: 10, 
        marginBottom: 20 
    },
    infoTitle: { color: colors.accent, 
        fontSize: 16, 
        fontWeight: '700', 
        marginBottom: 8 
    },
    infoText: { 
        color: colors.textPrimary, 
        fontSize: 14, 
        marginBottom: 4 
    },

    classesCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    classesHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    classesTitle: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    classesSubtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        marginBottom: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 6,
    },
    claseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    claseInfo: {
        marginLeft: 10,
        flex: 1,
    },
    claseNombre: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    claseDetalle: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },

    sectionTitle: { 
        color: colors.textPrimary, 
        fontSize: 16, 
        fontWeight: '700', 
        marginBottom: 10 
    },
    quickAccessRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-around' 
    },
    quickButton: { 
        alignItems: 'center', 
        backgroundColor: colors.card, 
        padding: 12, 
        borderRadius: 10, 
        width: 120 
    },
    quickText: { 
        color: colors.textPrimary, 
        fontSize: 14, 
        marginTop: 6 
    },
});