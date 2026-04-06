import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import MaestroTopBar from '../../components/MaestroTopBar';
import { AuthContext } from '../../components/context/AuthContext';
import { getAlumnosByGrupoYCarrera, getMaestroGroupsByDepartamento } from '../../services/authDb';

export default function MGruposScreen() {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [alumnosPorGrupo, setAlumnosPorGrupo] = useState({});
  const [loading, setLoading] = useState(true);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.carrera) {
        setGroups([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedGroups = await getMaestroGroupsByDepartamento(user.carrera);
        setGroups(fetchedGroups || []);
      } catch {
        Alert.alert('Error', 'No se pudieron cargar tus grupos.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.carrera]);

  const grupoSeleccionado = useMemo(
    () => groups.find((grupo) => grupo.clave === grupoSeleccionadoId),
    [groups, grupoSeleccionadoId],
  );

  const onVerLista = async (grupoClave) => {
    if (grupoSeleccionadoId === grupoClave) {
      setGrupoSeleccionadoId(null);
      return;
    }

    setGrupoSeleccionadoId(grupoClave);

    if (!alumnosPorGrupo[grupoClave]) {
      try {
        const alumnos = await getAlumnosByGrupoYCarrera(grupoClave, user?.carrera);
        setAlumnosPorGrupo((prev) => ({ ...prev, [grupoClave]: alumnos || [] }));
      } catch {
        Alert.alert('Error', 'No se pudo cargar la lista de alumnos.');
      }
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <MaestroTopBar />

        <View style={styles.headerWrap}>
          <Text style={styles.title}>Mis Grupos</Text>
          <Text style={styles.subtitle}>Administra tus grupos y alumnos</Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Cargando grupos...</Text>
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin grupos asignados</Text>
            <Text style={styles.emptyText}>No hay grupos disponibles para tu departamento.</Text>
          </View>
        ) : groups.map((grupo) => (
          <View key={grupo.clave} style={styles.groupCard}>
            <View style={styles.groupHeaderRow}>
              <Text style={styles.groupCode}>{grupo.clave}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{grupo.alumnos} alumnos</Text>
              </View>
            </View>

            <Text style={styles.groupSubject}>Tutor: {grupo.tutor}</Text>

            <View style={styles.groupMetaRow}>
              <MaterialCommunityIcons name="office-building-outline" size={18} color={colors.accent} />
              <Text style={styles.groupMetaText}>Aula {grupo.aula}</Text>
            </View>

            <View style={styles.groupMetaRow}>
              <MaterialCommunityIcons name="school-outline" size={18} color={colors.accent} />
              <Text style={styles.groupMetaText}>{user?.carreraNombre || 'Departamento'}</Text>
            </View>

            <TouchableOpacity style={styles.listButton} activeOpacity={0.85} onPress={() => onVerLista(grupo.clave)}>
              <MaterialCommunityIcons name="account-multiple-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.listButtonText}>Ver lista de alumnos</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal visible={Boolean(grupoSeleccionado)} animationType="fade" transparent onRequestClose={() => setGrupoSeleccionadoId(null)}>
        <View style={styles.modalOverlay}>
          {grupoSeleccionado ? (
            <View style={styles.listPanel}>
              <View style={styles.listPanelHeader}>
                <Text style={styles.listPanelTitle}>Lista de Alumnos - {grupoSeleccionado.clave}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setGrupoSeleccionadoId(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.studentListContent}>
                {(alumnosPorGrupo[grupoSeleccionado.clave] || []).map((alumno, index) => (
                  <View key={String(alumno.id)} style={styles.studentCard}>
                    <View style={styles.studentNumberWrap}>
                      <Text style={styles.studentNumber}>{index + 1}</Text>
                    </View>

                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{alumno.nombre}</Text>
                      <Text style={styles.studentEnrollment}>Matrícula: {alumno.matricula || alumno.id}</Text>

                      <View style={styles.studentMailRow}>
                        <MaterialCommunityIcons name="email-outline" size={16} color="#6B7280" />
                        <Text style={styles.studentMail}>{alumno.correo}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
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
    paddingBottom: 28,
  },
  headerWrap: {
    marginBottom: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 40 / 1.5,
    fontWeight: '800',
  },
  subtitle: {
    color: '#7B95B7',
    marginTop: 4,
    fontSize: 25 / 2,
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
  },
  loadingText: {
    color: colors.textPrimary,
    marginTop: 10,
    fontSize: 15,
  },
  emptyCard: {
    backgroundColor: '#173251',
    borderWidth: 1,
    borderColor: '#1D5B92',
    borderRadius: 16,
    padding: 20,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: '#9CB2CC',
    marginTop: 6,
  },
  groupCard: {
    backgroundColor: '#173251',
    borderWidth: 1,
    borderColor: '#1D5B92',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  groupCode: {
    color: colors.textPrimary,
    fontSize: 34 / 2,
    fontWeight: '800',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#355A8B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: '#DCE9FF',
    fontSize: 12,
    fontWeight: '700',
  },
  groupSubject: {
    color: '#8EA3BE',
    fontSize: 18,
    marginTop: 8,
    marginBottom: 14,
  },
  groupMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupMetaText: {
    color: colors.accent,
    marginLeft: 8,
    fontSize: 24 / 2,
    fontWeight: '500',
  },
  listButton: {
    marginTop: 6,
    backgroundColor: '#071C35',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D5B92',
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  listButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  listPanel: {
    backgroundColor: '#06152B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D5B92',
    padding: 12,
    width: '95%',
    maxHeight: '72%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  studentListContent: {
    paddingBottom: 4,
  },
  listPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listPanelTitle: {
    color: colors.textPrimary,
    fontSize: 30 / 2,
    fontWeight: '800',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  studentNumberWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#355A8B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  studentNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: '800',
  },
  studentEnrollment: {
    color: '#4B5563',
    fontSize: 15,
    marginTop: 2,
  },
  studentMailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  studentMail: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 8,
    flexShrink: 1,
  },
});