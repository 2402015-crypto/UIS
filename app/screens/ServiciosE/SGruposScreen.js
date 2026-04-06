import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import ServiciosETopBar from '../../components/ServiciosETopBar';
import { getGroupSummaries, getUsersByRole } from '../../services/authDb';
import {
  createSchedulesForGroup,
  DAY_OPTIONS,
  deleteScheduleEntry,
  getSchedulesByGroup,
  updateScheduleEntry,
} from '../../services/scheduleDb';

const EMPTY_FORM = {
  nombre: '',
  aula: '',
  horaInicio: '',
  horaFin: '',
  maestroId: '',
  diasSemana: [],
};

function isValidTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export default function SGruposScreen() {
  const [grupos, setGrupos] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [horariosGrupo, setHorariosGrupo] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const groupOptions = useMemo(
    () => grupos.map((item) => ({ value: item.clave, label: `${item.clave} (${item.alumnos} alumnos)` })),
    [grupos]
  );

  const loadCatalogs = async () => {
    try {
      const [groupsData, maestrosData] = await Promise.all([
        getGroupSummaries(),
        getUsersByRole('maestro'),
      ]);

      const parsedGroups = groupsData || [];
      setGrupos(parsedGroups);
      setMaestros(maestrosData || []);

      if (!grupoSeleccionado && parsedGroups.length > 0) {
        setGrupoSeleccionado(parsedGroups[0].clave);
      }
    } catch {
      setGrupos([]);
      setMaestros([]);
    }
  };

  const loadSchedules = async (groupKey) => {
    if (!groupKey) {
      setHorariosGrupo([]);
      return;
    }

    try {
      const data = await getSchedulesByGroup(groupKey);
      setHorariosGrupo(data || []);
    } catch {
      setHorariosGrupo([]);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    loadSchedules(grupoSeleccionado);
  }, [grupoSeleccionado]);

  useFocusEffect(
    React.useCallback(() => {
      loadCatalogs();
    }, [])
  );

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleDay = (dayValue) => {
    setForm((prev) => {
      const exists = prev.diasSemana.includes(dayValue);
      if (exists) {
        return { ...prev, diasSemana: prev.diasSemana.filter((item) => item !== dayValue) };
      }

      return { ...prev, diasSemana: [...prev.diasSemana, dayValue] };
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nombre: item.nombre || '',
      aula: item.aula || '',
      horaInicio: item.hora_inicio || '',
      horaFin: item.hora_fin || '',
      maestroId: item.maestro_id ? String(item.maestro_id) : '',
      diasSemana: [Number(item.dia_semana)],
    });
    setModalVisible(true);
  };

  const onDelete = (item) => {
    Alert.alert(
      'Eliminar horario',
      `¿Deseas eliminar la materia "${item.nombre}" de ${item.dia_label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScheduleEntry(item.id);
              await loadSchedules(grupoSeleccionado);
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el horario.');
            }
          },
        },
      ]
    );
  };

  const validateForm = () => {
    if (!grupoSeleccionado) return 'Selecciona un grupo.';
    if (!form.nombre.trim()) return 'Ingresa la materia.';
    if (!form.maestroId) return 'Selecciona un maestro.';
    if (!isValidTime(form.horaInicio)) return 'Hora de inicio inválida (HH:MM).';
    if (!isValidTime(form.horaFin)) return 'Hora de fin inválida (HH:MM).';
    if (form.horaInicio >= form.horaFin) return 'La hora de inicio debe ser menor que la hora de fin.';
    if (form.diasSemana.length === 0) return 'Selecciona al menos un día.';
    return null;
  };

  const onSave = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validación', error);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateScheduleEntry(editingId, {
          nombre: form.nombre.trim(),
          aula: form.aula.trim(),
          horaInicio: form.horaInicio,
          horaFin: form.horaFin,
          maestroId: Number(form.maestroId),
          diaSemana: form.diasSemana[0],
        });
      } else {
        await createSchedulesForGroup({
          grupo: grupoSeleccionado,
          nombre: form.nombre.trim(),
          aula: form.aula.trim(),
          horaInicio: form.horaInicio,
          horaFin: form.horaFin,
          maestroId: Number(form.maestroId),
          diasSemana: form.diasSemana,
        });
      }

      setModalVisible(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadSchedules(grupoSeleccionado);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el horario.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ServiciosETopBar />

        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Gestión de Horarios</Text>
            <Text style={styles.subtitle}>Asigna materias, maestro, horario y días por grupo</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={openCreate}>
            <MaterialCommunityIcons name="plus" size={22} color="#052217" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Grupo</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={grupoSeleccionado}
            onValueChange={(value) => setGrupoSeleccionado(value)}
            style={styles.picker}
            dropdownIconColor={colors.textPlaceholder}
          >
            <Picker.Item label="Selecciona un grupo" value="" />
            {groupOptions.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>

        {horariosGrupo.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={36} color={colors.textPlaceholder} />
            <Text style={styles.emptyTitle}>Sin horarios asignados</Text>
            <Text style={styles.emptySubtitle}>Agrega horarios para el grupo seleccionado.</Text>
          </View>
        ) : (
          horariosGrupo.map((item) => (
            <View key={item.id} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.subjectName}>{item.nombre}</Text>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{item.dia_label}</Text>
                </View>
              </View>

              <Text style={styles.metaText}>Maestro: {item.maestro_nombre}</Text>
              <Text style={styles.metaText}>Horario: {item.hora_inicio} - {item.hora_fin}</Text>
              <Text style={styles.metaText}>Aula: {item.aula || 'Sin aula'}</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)}>
                  <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.textPrimary} />
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF6B81" />
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView style={styles.modalCard} contentContainerStyle={styles.modalCardContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Editar horario' : 'Nuevo horario'}</Text>

            <TextInput
              label="Materia"
              value={form.nombre}
              onChangeText={(value) => onChange('nombre', value)}
              mode="outlined"
              style={styles.input}
            />

            <Text style={styles.label}>Maestro</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.maestroId}
                onValueChange={(value) => onChange('maestroId', value)}
                style={styles.picker}
                dropdownIconColor={colors.textPlaceholder}
              >
                <Picker.Item label="Selecciona un maestro" value="" />
                {maestros.map((item) => (
                  <Picker.Item key={item.id} label={`${item.nombre} (${item.matricula || 'ID'})`} value={String(item.id)} />
                ))}
              </Picker>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                <TextInput
                  label="Inicio (HH:MM)"
                  value={form.horaInicio}
                  onChangeText={(value) => onChange('horaInicio', value)}
                  mode="outlined"
                  style={styles.input}
                  placeholder="07:00"
                />
              </View>
              <View style={styles.timeCol}>
                <TextInput
                  label="Fin (HH:MM)"
                  value={form.horaFin}
                  onChangeText={(value) => onChange('horaFin', value)}
                  mode="outlined"
                  style={styles.input}
                  placeholder="09:00"
                />
              </View>
            </View>

            <TextInput
              label="Aula"
              value={form.aula}
              onChangeText={(value) => onChange('aula', value)}
              mode="outlined"
              style={styles.input}
            />

            <Text style={styles.label}>{editingId ? 'Día' : 'Días'}</Text>
            <View style={styles.daysWrap}>
              {DAY_OPTIONS.map((item) => {
                const selected = form.diasSemana.includes(item.value);
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.dayChip, selected ? styles.dayChipActive : null]}
                    onPress={() => {
                      if (editingId) {
                        onChange('diasSemana', [item.value]);
                        return;
                      }
                      toggleDay(item.value);
                    }}
                  >
                    <Text style={[styles.dayChipText, selected ? styles.dayChipTextActive : null]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, saving ? styles.saveButtonDisabled : null]}
                onPress={onSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8EA3BE',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '700',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#1D5B92',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0F2B4A',
    marginBottom: 12,
  },
  picker: {
    color: colors.textPrimary,
  },
  emptyCard: {
    backgroundColor: '#173251',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: '#8EA3BE',
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
  },
  scheduleCard: {
    backgroundColor: '#173251',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  dayBadge: {
    backgroundColor: '#355A8B',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  dayBadgeText: {
    color: '#DCE9FF',
    fontSize: 12,
    fontWeight: '700',
  },
  metaText: {
    color: '#9CB2CC',
    fontSize: 14,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D5B92',
    backgroundColor: '#102C4A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 6,
  },
  editButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  deleteButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5A2B45',
    backgroundColor: '#2D1524',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: 6,
  },
  deleteButtonText: {
    color: '#FF6B81',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#173251',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 14,
    maxHeight: '88%',
  },
  modalCardContent: {
    padding: 14,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#0F2B4A',
  },
  timeRow: {
    flexDirection: 'row',
  },
  timeCol: {
    flex: 1,
    marginRight: 6,
  },
  daysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  dayChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1D5B92',
    backgroundColor: '#102C4A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  dayChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayChipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  dayChipTextActive: {
    color: '#052217',
  },
  modalActions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D5B92',
    backgroundColor: '#102C4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#052217',
    fontSize: 14,
    fontWeight: '800',
  },
});
