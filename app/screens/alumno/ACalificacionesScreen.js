import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../../styles/colors';
import AlumnoTopBar from '../../components/AlumnoTopBar';

export default function ACalificacionesScreen() {
    const [tabActivo, setTabActivo] = useState("calificaciones");

    // Datos simulados
    const promedioGeneral = 88.2;
    const porcentajeAsistencia = 67;

    const materias = [
        {
            nombre: "Programación Web",
            profesor: "María García López",
            calificaciones: { parcial1: 85, parcial2: 90, parcial3: 88, final: 88 },
        },
        {
            nombre: "Base de Datos",
            profesor: "Carlos Hernández",
            calificaciones: { parcial1: 80, parcial2: 84, parcial3: 82, final: 83 },
        },
        {
            nombre: "Desarrollo Móvil",
            profesor: "Ana Pérez",
            calificaciones: { parcial1: 92, parcial2: 95, parcial3: 90, final: 93 },
        },
    ];

    const asistencias = [
        { materia: "Programación Web", fecha: "23 de marzo 2026", estado: "Asistencia" },
        { materia: "Base de Datos", fecha: "23 de marzo 2026", estado: "Asistencia" },
        { materia: "Desarrollo Móvil", fecha: "24 de marzo 2026", estado: "Retardo" },
        { materia: "Programación Web", fecha: "25 de marzo 2026", estado: "Asistencia" },
        { materia: "Ingeniería de Software", fecha: "26 de marzo 2026", estado: "Asistencia" },
        { materia: "Base de Datos", fecha: "27 de marzo 2026", estado: "Falta" },
    ];

    const resumenAsistencia = {
        asistencias: asistencias.filter((item) => item.estado === "Asistencia").length,
        retardos: asistencias.filter((item) => item.estado === "Retardo").length,
        faltas: asistencias.filter((item) => item.estado === "Falta").length,
    };

    const getEstadoConfig = (estado) => {
        if (estado === "Asistencia") {
            return {
                icon: "check-circle-outline",
                iconColor: "#16A34A",
                badgeBg: "#DCFCE7",
                badgeBorder: "#86EFAC",
                badgeText: "#15803D",
            };
        }

        if (estado === "Retardo") {
            return {
                icon: "clock-outline",
                iconColor: "#B45309",
                badgeBg: "#FEF3C7",
                badgeBorder: "#FCD34D",
                badgeText: "#B45309",
            };
        }

        return {
            icon: "close-circle-outline",
            iconColor: "#DC2626",
            badgeBg: "#FEE2E2",
            badgeBorder: "#FCA5A5",
            badgeText: "#B91C1C",
        };
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <AlumnoTopBar />

            <Text style={styles.sectionTitle}>Calificaciones y Asistencias</Text>
            <Text style={styles.sectionSubtitle}>Consulta tu desempeño académico</Text>

            <View style={styles.metricCard}>
                <MaterialCommunityIcons name="medal" size={28} color={colors.accent} />
                <View style={styles.metricInfo}>
                    <Text style={styles.metricLabel}>Promedio General</Text>
                    <Text style={styles.metricValue}>{promedioGeneral}</Text>
                </View>
            </View>

            <View style={styles.metricCard}>
                <MaterialCommunityIcons name="check-circle" size={28} color="green" />
                <View style={styles.metricInfo}>
                    <Text style={styles.metricLabel}>Asistencia</Text>
                    <Text style={styles.metricValue}>{porcentajeAsistencia}%</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsRow}>
                <TouchableOpacity
                    style={[styles.tabButton, tabActivo === "calificaciones" && styles.tabActivo]}
                    onPress={() => setTabActivo("calificaciones")}
                >
                    <Text style={[styles.tabText, tabActivo === "calificaciones" && styles.tabTextActivo]}>
                        Calificaciones
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, tabActivo === "asistencias" && styles.tabActivo]}
                    onPress={() => setTabActivo("asistencias")}
                >
                    <Text style={[styles.tabText, tabActivo === "asistencias" && styles.tabTextActivo]}>
                        Asistencias
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Contenido dinámico */}
            {tabActivo === "calificaciones" ? (
                <>
                    {materias.map((materia, index) => (
                        <View key={index} style={styles.materiaCard}>
                            <Text style={styles.materiaNombre}>{materia.nombre}</Text>
                            <Text style={styles.materiaProfesor}>{materia.profesor}</Text>

                            <View style={styles.gradesRow}>
                                <View style={styles.gradeBox}>
                                    <Text style={styles.gradeLabel}>Parcial 1</Text>
                                    <Text style={styles.gradeValue}>{materia.calificaciones.parcial1}</Text>
                                </View>

                                <View style={styles.gradeBox}>
                                    <Text style={styles.gradeLabel}>Parcial 2</Text>
                                    <Text style={styles.gradeValue}>{materia.calificaciones.parcial2}</Text>
                                </View>

                                <View style={styles.gradeBox}>
                                    <Text style={styles.gradeLabel}>Parcial 3</Text>
                                    <Text style={styles.gradeValue}>{materia.calificaciones.parcial3}</Text>
                                </View>

                                <View style={styles.gradeBoxFinal}>
                                    <Text style={styles.gradeLabelFinal}>Final</Text>
                                    <Text style={styles.gradeValueFinal}>{materia.calificaciones.final}</Text>
                                </View>
                            </View>

                            <Text style={styles.progressPercent}>{materia.calificaciones.final}%</Text>
                            <View style={styles.progressTrack}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${Math.max(0, Math.min(100, materia.calificaciones.final))}%`,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </>
            ) : (
                <>
                    <View style={styles.asistenciasCard}>
                        <Text style={styles.asistenciasTitle}>Resumen de Asistencias</Text>
                        <Text style={styles.asistenciasSubtitle}>Ultimas 6 clases registradas</Text>

                        <View style={styles.summaryRow}>
                            <View style={[styles.summaryBox, styles.summaryBoxSuccess]}>
                                <MaterialCommunityIcons name="check-circle-outline" size={30} color="#16A34A" />
                                <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>{resumenAsistencia.asistencias}</Text>
                                <Text style={styles.summaryLabel}>Asistencias</Text>
                            </View>

                            <View style={[styles.summaryBox, styles.summaryBoxWarning]}>
                                <MaterialCommunityIcons name="clock-outline" size={30} color="#B45309" />
                                <Text style={[styles.summaryValue, styles.summaryValueWarning]}>{resumenAsistencia.retardos}</Text>
                                <Text style={styles.summaryLabel}>Retardos</Text>
                            </View>

                            <View style={[styles.summaryBox, styles.summaryBoxDanger]}>
                                <MaterialCommunityIcons name="close-circle-outline" size={30} color="#DC2626" />
                                <Text style={[styles.summaryValue, styles.summaryValueDanger]}>{resumenAsistencia.faltas}</Text>
                                <Text style={styles.summaryLabel}>Faltas</Text>
                            </View>
                        </View>

                        {asistencias.map((item, index) => (
                            <View key={index} style={styles.asistenciaRowCard}>
                                <MaterialCommunityIcons name="calendar-blank-outline" size={26} color="#8B95A5" />
                                <View style={styles.asistenciaInfo}>
                                    <Text style={styles.asistenciaMateria}>{item.materia}</Text>
                                    <Text style={styles.asistenciaDetalle}>{item.fecha}</Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor: getEstadoConfig(item.estado).badgeBg,
                                            borderColor: getEstadoConfig(item.estado).badgeBorder,
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={getEstadoConfig(item.estado).icon}
                                        size={23}
                                        color={getEstadoConfig(item.estado).iconColor}
                                    />
                                    <Text
                                        style={[
                                            styles.statusBadgeText,
                                            { color: getEstadoConfig(item.estado).badgeText },
                                        ]}
                                    >
                                        {item.estado}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 24
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4
    },
    sectionSubtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 16
    },
    tabsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 6,
        borderRadius: 10,
        backgroundColor: colors.card,
        alignItems: 'center',
    },
    tabActivo: {
        backgroundColor: colors.accent,
    },
    tabText: {
        color: colors.textSecondary,
        fontSize: 15,
        fontWeight: '600',
    },
    tabTextActivo: {
        color: '#fff',
        fontWeight: '700',
    },
    metricCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    metricInfo: {
        marginLeft: 12
    },
    metricLabel: {
        color: colors.textSecondary,
        fontSize: 14
    },
    metricValue: {
        color: colors.accent,
        fontSize: 22,
        fontWeight: '700'
    },
    materiaCard: {
        backgroundColor: '#162E4A',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2B5B90',
    },
    materiaNombre: {
        color: colors.textPrimary,
        fontSize: 40/2,
        fontWeight: '700',
        marginBottom: 4
    },
    materiaProfesor: {
        color: '#9BB1CC',
        fontSize: 17,
        marginBottom: 14,
    },
    gradesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    gradeBox: {
        width: 76,
        height: 104,
        backgroundColor: '#E8E9EB',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradeLabel: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    gradeValue: {
        color: '#6B7280',
        fontSize: 40/2,
        fontWeight: '700',
    },
    gradeBoxFinal: {
        width: 76,
        height: 104,
        backgroundColor: '#31588A',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradeLabelFinal: {
        color: '#E7EEF8',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    gradeValueFinal: {
        color: colors.textPrimary,
        fontSize: 40/2,
        fontWeight: '800',
    },
    progressPercent: {
        color: colors.textPrimary,
        fontSize: 34/2,
        fontWeight: '700',
        marginBottom: 10,
    },
    progressTrack: {
        width: '100%',
        height: 12,
        borderRadius: 999,
        backgroundColor: '#1E5A63',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: '#38D9B0',
    },
    asistenciasCard: {
        backgroundColor: '#162E4A',
        borderRadius: 18,
        padding: 18,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#2B5B90',
    },
    asistenciasTitle: {
        color: colors.textPrimary,
        fontSize: 38/2,
        fontWeight: '700',
        marginBottom: 4,
    },
    asistenciasSubtitle: {
        color: '#9BB1CC',
        fontSize: 17,
        marginBottom: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryBox: {
        width: '31.5%',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
    },
    summaryBoxSuccess: {
        backgroundColor: '#DCE8E3',
    },
    summaryBoxWarning: {
        backgroundColor: '#ECE9D8',
    },
    summaryBoxDanger: {
        backgroundColor: '#F0E5E8',
    },
    summaryValue: {
        fontSize: 40/2,
        fontWeight: '800',
        marginTop: 6,
    },
    summaryValueSuccess: {
        color: '#16A34A',
    },
    summaryValueWarning: {
        color: '#B45309',
    },
    summaryValueDanger: {
        color: '#DC2626',
    },
    summaryLabel: {
        color: '#475569',
        fontSize: 16,
        marginTop: 4,
        fontWeight: '500',
    },
    asistenciaRowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8E9EB',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 16,
        marginBottom: 12,
    },
    asistenciaInfo: {
        marginLeft: 10,
        flex: 1,
    },
    asistenciaMateria: {
        color: '#1F2937',
        fontSize: 15,
        fontWeight: '600',
    },
    asistenciaDetalle: {
        color: '#667085',
        fontSize: 14,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginLeft: 8,
    },
    statusBadgeText: {
        fontSize: 18/1.8,
        fontWeight: '700',
        marginLeft: 6,
    },
});