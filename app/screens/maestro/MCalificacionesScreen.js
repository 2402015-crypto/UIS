import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import MaestroTopBar from '../../components/MaestroTopBar';
import { AuthContext } from '../../components/context/AuthContext';
import { getAlumnosByGrupoYCarrera, getMaestroGroupsByDepartamento } from '../../services/authDb';
import { getGradesByGroup, saveGradesByGroup } from '../../services/gradesDb';

const UNIDADES = ['u1', 'u2', 'u3'];

function createGroupGradesBase(alumnos) {
  return (alumnos || []).reduce((acc, alumno) => {
    acc[alumno.id] = { u1: '', u2: '', u3: '' };
    return acc;
  }, {});
}

function sanitizeGrade(value) {
  const cleanValue = value.replace(/[^0-9.]/g, '');
  const parts = cleanValue.split('.');
  const normalized = parts.length <= 1 ? cleanValue : `${parts[0]}.${parts.slice(1).join('')}`;

  if (normalized === '') {
    return '';
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return '';
  }

  if (parsed < 0) {
    return '0';
  }

  if (parsed > 100) {
    return '100';
  }

  return normalized;
}

function calculateAverage(studentGrades) {
  const numericGrades = UNIDADES.map((unidad) => Number(studentGrades[unidad]))
    .filter((grade) => Number.isFinite(grade) && grade >= 0 && grade <= 100);

  if (numericGrades.length === 0) {
    return '--';
  }

  const sum = numericGrades.reduce((acc, grade) => acc + grade, 0);
  return (sum / numericGrades.length).toFixed(1);
}

export default function MCalificacionesScreen() {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [alumnosPorGrupo, setAlumnosPorGrupo] = useState({});
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [calificaciones, setCalificaciones] = useState({});
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingGroupData, setLoadingGroupData] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const grupoSeleccionado = useMemo(
    () => groups.find((grupo) => grupo.clave === grupoSeleccionadoId) || null,
    [groups, grupoSeleccionadoId],
  );

  const alumnosGrupoSeleccionado = alumnosPorGrupo[grupoSeleccionadoId] || [];

  const onSelectGrupo = async (grupoId) => {
    setGrupoSeleccionadoId(grupoId);
    setSelectorVisible(false);

    if (!user?.id || !user?.carrera) {
      return;
    }

    if (alumnosPorGrupo[grupoId] && calificaciones[grupoId]) {
      return;
    }

    setLoadingGroupData(true);
    try {
      const [alumnos, savedGrades] = await Promise.all([
        getAlumnosByGrupoYCarrera(grupoId, user.carrera),
        getGradesByGroup(user.id, grupoId),
      ]);

      const baseGrades = createGroupGradesBase(alumnos);
      const mergedGrades = { ...baseGrades };

      Object.keys(savedGrades || {}).forEach((alumnoId) => {
        mergedGrades[alumnoId] = {
          ...(mergedGrades[alumnoId] || { u1: '', u2: '', u3: '' }),
          u1: savedGrades[alumnoId].u1 ?? '',
          u2: savedGrades[alumnoId].u2 ?? '',
          u3: savedGrades[alumnoId].u3 ?? '',
        };
      });

      setAlumnosPorGrupo((prev) => ({ ...prev, [grupoId]: alumnos || [] }));
      setCalificaciones((prev) => ({ ...prev, [grupoId]: mergedGrades }));
    } catch {
      Alert.alert('Error', 'No se pudieron cargar alumnos y calificaciones.');
    } finally {
      setLoadingGroupData(false);
    }
  };

  const onChangeCalificacion = (grupoId, alumnoId, unidad, value) => {
    const safeValue = sanitizeGrade(value);

    setCalificaciones((prev) => ({
      ...prev,
      [grupoId]: {
        ...prev[grupoId],
        [alumnoId]: {
          ...(prev[grupoId]?.[alumnoId] || { u1: '', u2: '', u3: '' }),
          [unidad]: safeValue,
        },
      },
    }));
  };

  const onGuardarCambios = async () => {
    if (!grupoSeleccionadoId || !user?.id) {
      Alert.alert('Selecciona un grupo', 'Debes seleccionar un grupo antes de guardar.');
      return;
    }

    setSaving(true);
    try {
      await saveGradesByGroup(user.id, grupoSeleccionadoId, calificaciones[grupoSeleccionadoId] || {});
      Alert.alert('Cambios guardados', 'Las calificaciones se guardaron correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudieron guardar las calificaciones.');
    } finally {
      setSaving(false);
    }
  };

  const onImportar = () => {
    Alert.alert('Importar', 'Próximamente podrás importar calificaciones desde archivo.');
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <MaestroTopBar />

        <View style={styles.headerWrap}>
          <Text style={styles.title}>Gestion de Calificaciones</Text>
          <Text style={styles.subtitle}>Registra y actualiza las calificaciones de tus alumnos</Text>
        </View>

        <View style={styles.selectorCard}>
          <Text style={styles.selectorTitle}>Seleccionar Grupo</Text>
          <Text style={styles.selectorSubtitle}>Elige el grupo para ver y editar calificaciones</Text>

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
          <View style={styles.groupGradesCard}>
            <Text style={styles.groupGradesTitle}>
              {grupoSeleccionado.clave}
            </Text>
            <Text style={styles.groupGradesSubtitle}>{alumnosGrupoSeleccionado.length} alumnos registrados</Text>

            {loadingGroupData ? (
              <View style={styles.loadingInnerWrap}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.loadingText}>Cargando alumnos...</Text>
              </View>
            ) : null}

            {alumnosGrupoSeleccionado.map((alumno) => {
              const studentGrades = calificaciones[grupoSeleccionado.clave]?.[alumno.id] || { u1: '', u2: '', u3: '' };
              const promedio = calculateAverage(studentGrades);

              return (
                <View key={alumno.id} style={styles.studentCard}>
                  <Text style={styles.studentName}>{alumno.nombre}</Text>
                  <Text style={styles.studentEnrollment}>Matrícula: {alumno.matricula || alumno.id}</Text>

                  <View style={styles.inputListWrap}>
                    {UNIDADES.map((unidad, index) => (
                      <View key={unidad} style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Unidad {index + 1}</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="decimal-pad"
                          value={studentGrades[unidad]}
                          onChangeText={(value) => onChangeCalificacion(grupoSeleccionado.clave, alumno.id, unidad, value)}
                          placeholder="0 - 100"
                          placeholderTextColor="#6F86A2"
                          maxLength={5}
                        />
                      </View>
                    ))}
                  </View>

                  <View style={styles.averageRow}>
                    <Text style={styles.averageLabel}>Promedio</Text>
                    <Text style={styles.averageValue}>{promedio}</Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.saveButton, saving ? styles.actionDisabled : null]}
                activeOpacity={0.85}
                onPress={onGuardarCambios}
                disabled={saving}
              >
                <MaterialCommunityIcons name="content-save-outline" size={18} color="#07213D" />
                <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar Cambios'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.importButton} activeOpacity={0.85} onPress={onImportar}>
                <MaterialCommunityIcons name="upload-outline" size={18} color={colors.textPrimary} />
                <Text style={styles.importButtonText}>Importar</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    marginBottom: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 44 / 1.5,
    fontWeight: '800',
  },
  subtitle: {
    color: '#7B95B7',
    marginTop: 4,
    fontSize: 25 / 2,
    marginBottom: 10,
    maxWidth: 340,
  },
  loadingWrap: {
    backgroundColor: '#173251',
    borderWidth: 1,
    borderColor: '#1D5B92',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  groupGradesCard: {
    backgroundColor: '#173251',
    borderWidth: 1,
    borderColor: '#1D5B92',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  groupGradesTitle: {
    color: colors.textPrimary,
    fontSize: 34 / 2,
    fontWeight: '800',
  },
  groupGradesSubtitle: {
    color: '#9CB2CC',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 14,
  },
  studentCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  studentName: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: '700',
  },
  studentEnrollment: {
    color: '#6B7280',
    fontSize: 22 / 2,
    marginTop: 4,
    marginBottom: 10,
  },
  inputListWrap: {
    gap: 8,
  },
  inputRow: {
    marginBottom: 2,
  },
  inputLabel: {
    color: '#415169',
    fontSize: 22 / 2,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0F2B4A',
    borderWidth: 1,
    borderColor: '#1D5B92',
    color: colors.textPrimary,
    borderRadius: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  averageRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#94A8BF',
    paddingTop: 8,
  },
  averageLabel: {
    color: '#6B7280',
    fontSize: 22 / 2,
  },
  averageValue: {
    color: '#173D6B',
    fontSize: 32 / 2,
    fontWeight: '800',
    marginTop: 2,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  saveButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: '#4C9CFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 10,
  },
  saveButtonText: {
    color: '#07213D',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
  importButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#1D5B92',
    backgroundColor: '#0B1F37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 10,
  },
  importButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  actionDisabled: {
    opacity: 0.7,
  },
});