import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import MaestroTopBar from '../../components/MaestroTopBar';
import { AuthContext } from '../../components/context/AuthContext';
import { getAlumnosByGrupoYCarrera, getMaestroGroupsByDepartamento } from '../../services/authDb';
import {
  getAttendanceByGroupAndDate,
  initAttendanceDb,
  saveAttendanceByGroupAndDate,
} from '../../services/attendanceDb';

const ATTENDANCE_STATUS = {
  presente: 'presente',
  retardo: 'retardo',
  ausente: 'ausente',
};

function createAttendanceBase(alumnos) {
  return (alumnos || []).reduce((acc, alumno) => {
    acc[alumno.id] = null;
    return acc;
  }, {});
}

function formatDateSpanish(date) {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function MAsistenciasScreen() {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [alumnosPorGrupo, setAlumnosPorGrupo] = useState({});
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [asistencias, setAsistencias] = useState({});
  const [dbReady, setDbReady] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingGroupData, setLoadingGroupData] = useState(false);
  const [saving, setSaving] = useState(false);

  const attendanceDateKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const grupoSeleccionado = useMemo(
    () => groups.find((grupo) => grupo.clave === grupoSeleccionadoId) || null,
    [groups, grupoSeleccionadoId],
  );
  const alumnosGrupoSeleccionado = alumnosPorGrupo[grupoSeleccionadoId] || [];

  const fechaRegistro = useMemo(() => {
    const raw = formatDateSpanish(new Date());
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, []);

  useEffect(() => {
    const bootstrapAttendanceDb = async () => {
      try {
        await initAttendanceDb();
        setDbReady(true);
      } catch {
        Alert.alert('Error', 'No se pudo inicializar la base de datos de asistencias.');
      }
    };

    bootstrapAttendanceDb();
  }, []);

  useEffect(() => {
    const loadGroups = async () => {
      if (!user?.carrera) {
        setGroups([]);
        setLoadingGroups(false);
        return;
      }

      setLoadingGroups(true);
      try {
        const fetchedGroups = await getMaestroGroupsByDepartamento(user.carrera);
        setGroups(fetchedGroups || []);
      } catch {
        Alert.alert('Error', 'No se pudieron cargar tus grupos.');
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroups();
  }, [user?.carrera]);

  useEffect(() => {
    if (!dbReady || !grupoSeleccionadoId || !user?.id || !user?.carrera) {
      return;
    }

    const loadAttendance = async () => {
      setLoadingGroupData(true);
      try {
        const [alumnos, savedAttendance] = await Promise.all([
          getAlumnosByGrupoYCarrera(grupoSeleccionadoId, user.carrera),
          getAttendanceByGroupAndDate(user.id, grupoSeleccionadoId, attendanceDateKey),
        ]);

        const baseAttendance = createAttendanceBase(alumnos);

        setAlumnosPorGrupo((prev) => ({ ...prev, [grupoSeleccionadoId]: alumnos || [] }));
        setAsistencias((prev) => ({
          ...prev,
          [grupoSeleccionadoId]: {
            ...baseAttendance,
            ...savedAttendance,
          },
        }));
      } catch {
        Alert.alert('Error', 'No se pudo cargar la asistencia guardada.');
      } finally {
        setLoadingGroupData(false);
      }
    };

    loadAttendance();
  }, [attendanceDateKey, dbReady, grupoSeleccionadoId, user?.id, user?.carrera]);

  const resumenAsistencia = useMemo(() => {
    if (!grupoSeleccionado) {
      return { presentes: 0, retardos: 0, ausentes: 0 };
    }

    const asistenciaGrupo = asistencias[grupoSeleccionado.clave] || {};
    const values = Object.values(asistenciaGrupo);

    return {
      presentes: values.filter((status) => status === ATTENDANCE_STATUS.presente).length,
      retardos: values.filter((status) => status === ATTENDANCE_STATUS.retardo).length,
      ausentes: values.filter((status) => status === ATTENDANCE_STATUS.ausente).length,
    };
  }, [asistencias, grupoSeleccionado]);

  const onSelectGrupo = (grupoId) => {
    setGrupoSeleccionadoId(grupoId);
    setSelectorVisible(false);
  };

  const onSetAsistencia = (grupoId, alumnoId, status) => {
    setAsistencias((prev) => ({
      ...prev,
      [grupoId]: {
        ...prev[grupoId],
        [alumnoId]: status,
      },
    }));
  };

  const onGuardarAsistencias = async () => {
    if (!grupoSeleccionadoId || !user?.id) {
      Alert.alert('Selecciona un grupo', 'Debes seleccionar un grupo antes de guardar.');
      return;
    }

    const asistenciaGrupo = asistencias[grupoSeleccionadoId] || {};

    setSaving(true);
    try {
      await saveAttendanceByGroupAndDate(user.id, grupoSeleccionadoId, attendanceDateKey, asistenciaGrupo);
      Alert.alert('Asistencias guardadas', 'La asistencia se guardo correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudieron guardar las asistencias.');
    } finally {
      setSaving(false);
    }
  };

  const getActionButtonStyle = (isActive, activeColor) => [styles.statusActionButton, isActive ? { backgroundColor: activeColor } : null];

  const getActionLabelStyle = (isActive) => [styles.statusActionText, isActive ? styles.statusActionTextActive : null];

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <MaestroTopBar />

        <View style={styles.headerWrap}>
          <Text style={styles.title}>Registro de Asistencias</Text>
          <Text style={styles.subtitle}>Registra la asistencia de tus alumnos</Text>
        </View>

        <View style={styles.dateCard}>
          <MaterialCommunityIcons name="calendar-month-outline" size={22} color={colors.textPrimary} />
          <View style={styles.dateTextWrap}>
            <Text style={styles.dateLabel}>Fecha de registro</Text>
            <Text style={styles.dateValue}>{fechaRegistro}</Text>
          </View>
        </View>

        <View style={styles.selectorCard}>
          <Text style={styles.selectorTitle}>Seleccionar Grupo</Text>
          <Text style={styles.selectorSubtitle}>Elige el grupo para registrar asistencia</Text>

          <TouchableOpacity style={styles.selectorButton} activeOpacity={0.85} onPress={() => setSelectorVisible(true)}>
            <Text style={styles.selectorButtonText}>
              {grupoSeleccionado ? grupoSeleccionado.clave : 'Selecciona un grupo'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textPlaceholder} />
          </TouchableOpacity>
        </View>

        {loadingGroups ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Cargando grupos...</Text>
          </View>
        ) : grupoSeleccionado ? (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <MaterialCommunityIcons name="check-circle-outline" size={26} color="#00C853" />
                <Text style={[styles.summaryValue, { color: '#00C853' }]}>{resumenAsistencia.presentes}</Text>
                <Text style={styles.summaryLabel}>Presentes</Text>
              </View>

              <View style={styles.summaryCard}>
                <MaterialCommunityIcons name="clock-outline" size={26} color="#F59E0B" />
                <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{resumenAsistencia.retardos}</Text>
                <Text style={styles.summaryLabel}>Retardos</Text>
              </View>

              <View style={styles.summaryCard}>
                <MaterialCommunityIcons name="close-circle-outline" size={26} color="#FF0033" />
                <Text style={[styles.summaryValue, { color: '#FF0033' }]}>{resumenAsistencia.ausentes}</Text>
                <Text style={styles.summaryLabel}>Ausentes</Text>
              </View>
            </View>

            <View style={styles.listCard}>
              <Text style={styles.listTitle}>
                {grupoSeleccionado.clave}
              </Text>
              <Text style={styles.listSubtitle}>{alumnosGrupoSeleccionado.length} alumnos en total</Text>

              {loadingGroupData ? (
                <View style={styles.loadingInnerWrap}>
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={styles.loadingText}>Cargando alumnos...</Text>
                </View>
              ) : null}

              {alumnosGrupoSeleccionado.map((alumno, index) => {
                const statusActual = asistencias[grupoSeleccionado.clave]?.[alumno.id] || null;

                return (
                  <View key={alumno.id} style={styles.studentCard}>
                    <View style={styles.studentTopRow}>
                      <View style={styles.studentNumberWrap}>
                        <Text style={styles.studentNumber}>{index + 1}</Text>
                      </View>

                      <View style={styles.studentMetaWrap}>
                        <Text style={styles.studentName}>{alumno.nombre}</Text>
                        <Text style={styles.studentEnrollment}>Matrícula: {alumno.matricula || alumno.id}</Text>
                      </View>
                    </View>

                    <View style={styles.statusActionsRow}>
                      <TouchableOpacity
                        style={getActionButtonStyle(statusActual === ATTENDANCE_STATUS.presente, '#00C853')}
                        onPress={() => onSetAsistencia(grupoSeleccionado.clave, alumno.id, ATTENDANCE_STATUS.presente)}
                        activeOpacity={0.85}
                      >
                        <MaterialCommunityIcons name="check-circle-outline" size={16} color={statusActual === ATTENDANCE_STATUS.presente ? '#062814' : '#DDE8F9'} />
                        <Text style={getActionLabelStyle(statusActual === ATTENDANCE_STATUS.presente)}>Presente</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={getActionButtonStyle(statusActual === ATTENDANCE_STATUS.retardo, '#F59E0B')}
                        onPress={() => onSetAsistencia(grupoSeleccionado.clave, alumno.id, ATTENDANCE_STATUS.retardo)}
                        activeOpacity={0.85}
                      >
                        <MaterialCommunityIcons name="clock-outline" size={16} color={statusActual === ATTENDANCE_STATUS.retardo ? '#3A2400' : '#DDE8F9'} />
                        <Text style={getActionLabelStyle(statusActual === ATTENDANCE_STATUS.retardo)}>Retardo</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={getActionButtonStyle(statusActual === ATTENDANCE_STATUS.ausente, '#FF0033')}
                        onPress={() => onSetAsistencia(grupoSeleccionado.clave, alumno.id, ATTENDANCE_STATUS.ausente)}
                        activeOpacity={0.85}
                      >
                        <MaterialCommunityIcons name="close-circle-outline" size={16} color={statusActual === ATTENDANCE_STATUS.ausente ? '#3A000F' : '#DDE8F9'} />
                        <Text style={getActionLabelStyle(statusActual === ATTENDANCE_STATUS.ausente)}>Ausente</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                style={[styles.saveButton, (saving || !dbReady) ? styles.saveButtonDisabled : null]}
                activeOpacity={0.85}
                onPress={onGuardarAsistencias}
                disabled={saving || !dbReady}
              >
                <MaterialCommunityIcons name="content-save-outline" size={18} color="#063728" />
                <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar Asistencias'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </ScrollView>

      <Modal visible={selectorVisible} animationType="fade" transparent onRequestClose={() => setSelectorVisible(false)}>
        <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setSelectorVisible(false)}>
          <View style={styles.selectorModal}>
            <Text style={styles.selectorModalTitle}>Selecciona un grupo</Text>

            {groups.map((grupo) => (
              <TouchableOpacity
                key={grupo.clave}
                style={styles.optionButton}
                activeOpacity={0.85}
                onPress={() => onSelectGrupo(grupo.clave)}
              >
                <Text style={styles.optionButtonText}>{grupo.clave}</Text>

                {grupoSeleccionadoId === grupo.clave ? (
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.accent} />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
  headerWrap: {
    marginBottom: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 44 / 1.5,
    fontWeight: '800',
  },
  subtitle: {
    color: '#7B95B7',
    marginTop: 4,
    fontSize: 24 / 2,
    marginBottom: 10,
  },
  loadingWrap: {
    backgroundColor: '#173251',
    borderWidth: 1,
    borderColor: '#1D5B92',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  loadingInnerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  loadingText: {
    color: colors.textPrimary,
    marginTop: 8,
    fontSize: 14,
  },
  dateCard: {
    backgroundColor: '#3C6597',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  dateLabel: {
    color: '#D6E5FB',
    fontSize: 14,
  },
  dateValue: {
    color: colors.textPrimary,
    fontSize: 30 / 2,
    fontWeight: '800',
    marginTop: 2,
  },
  selectorCard: {
    backgroundColor: '#173251',
    borderWidth: 1,
    borderColor: '#1D5B92',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  selectorTitle: {
    color: colors.textPrimary,
    fontSize: 32 / 2,
    fontWeight: '700',
  },
  selectorSubtitle: {
    color: '#8EA3BE',
    fontSize: 18,
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 28,
  },
  selectorButton: {
    backgroundColor: '#112A45',
    borderWidth: 1,
    borderColor: '#1D5B92',
    minHeight: 50,
    borderRadius: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorButtonText: {
    color: '#B6C5D9',
    fontSize: 22 / 2,
    fontWeight: '600',
    flexShrink: 1,
    marginRight: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryCard: {
    width: '32%',
    backgroundColor: '#173251',
    borderWidth: 1,
    borderColor: '#1D5B92',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  summaryValue: {
    fontSize: 28 / 2,
    fontWeight: '800',
    marginTop: 6,
  },
  summaryLabel: {
    color: '#9CB2CC',
    fontSize: 12,
    marginTop: 2,
  },
  listCard: {
    backgroundColor: '#173251',
    borderWidth: 1,
    borderColor: '#1D5B92',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  listTitle: {
    color: colors.textPrimary,
    fontSize: 34 / 2,
    fontWeight: '800',
  },
  listSubtitle: {
    color: '#9CB2CC',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  studentCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  studentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentNumberWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#355A8B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  studentNumber: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  studentMetaWrap: {
    flex: 1,
  },
  studentName: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: '700',
  },
  studentEnrollment: {
    color: '#6B7280',
    fontSize: 22 / 2,
    marginTop: 3,
  },
  statusActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusActionButton: {
    width: '31.5%',
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: '#0B1F37',
    borderWidth: 1,
    borderColor: '#1D5B92',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  statusActionText: {
    color: '#E0E9F6',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusActionTextActive: {
    color: '#0B1320',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#35D1A6',
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#063728',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  selectorModal: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D5B92',
    backgroundColor: '#06152B',
    padding: 12,
  },
  selectorModalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  optionButton: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D5B92',
    backgroundColor: '#112A45',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  optionButtonText: {
    color: '#D3E1F2',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    marginRight: 10,
  },
});