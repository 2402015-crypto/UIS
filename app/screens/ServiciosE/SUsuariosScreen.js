import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import ServiciosETopBar from '../../components/ServiciosETopBar';
import {
  createUserByAdmin,
  deleteUserByAdmin,
  getAulasCatalog,
  getCarrerasCatalog,
  getUsersByRole,
  updateUserByAdmin,
} from '../../services/authDb';

const EMPTY_FORM = {
  nombre: '',
  correo: '',
  matricula: '',
  grupo: '',
  cuatrimestre: '',
  carrera: '',
  tutor: '',
  aula: '',
  password: '',
};

export default function SUsuariosScreen() {
  const [tab, setTab] = useState('alumno');
  const [alumnos, setAlumnos] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const users = useMemo(() => (tab === 'alumno' ? alumnos : maestros), [alumnos, maestros, tab]);

  const loadUsers = async () => {
    try {
      const [alumnosData, maestrosData] = await Promise.all([
        getUsersByRole('alumno'),
        getUsersByRole('maestro'),
      ]);

      setAlumnos(alumnosData || []);
      setMaestros(maestrosData || []);
    } catch {
      setAlumnos([]);
      setMaestros([]);
    }
  };

  const loadCatalogs = async () => {
    try {
      const [carrerasData, aulasData] = await Promise.all([
        getCarrerasCatalog(),
        getAulasCatalog(),
      ]);
      setCarreras(carrerasData || []);
      setAulas(aulasData || []);
    } catch {
      setCarreras([]);
      setAulas([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadCatalogs();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, [])
  );

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentUserId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setCurrentUserId(item.id);
    setForm({
      nombre: item.nombre || '',
      correo: item.correo || '',
      matricula: item.matricula || '',
      grupo: item.grupo || '',
      cuatrimestre: item.cuatrimestre || '',
      carrera: item.carrera || '',
      tutor: item.tutor || '',
      aula: item.aula || '',
      password: '',
    });
    setModalVisible(true);
  };

  const onDelete = (item) => {
    Alert.alert(
      'Eliminar usuario',
      `¿Deseas eliminar a ${item.nombre || 'este usuario'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserByAdmin(item.id);
              await loadUsers();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el usuario.');
            }
          },
        },
      ]
    );
  };

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.nombre.trim()) return 'Ingresa el nombre.';
    if (!form.correo.trim()) return 'Ingresa el correo.';
    if (!/^\S+@\S+\.\S+$/.test(form.correo.trim())) return 'Correo inválido.';
    if (!form.matricula.trim()) return tab === 'alumno' ? 'Ingresa la matrícula.' : 'Ingresa el ID de empleado.';
    if (!form.carrera.trim()) return tab === 'alumno' ? 'Selecciona una carrera.' : 'Selecciona un departamento.';

    if (tab === 'alumno') {
      if (!form.grupo.trim()) return 'Ingresa el grupo.';
      if (!form.cuatrimestre.trim()) return 'Ingresa el cuatrimestre.';
      if (!form.tutor.trim()) return 'Ingresa el tutor.';
      if (!form.aula.trim()) return 'Selecciona un aula.';
    }

    if (!isEditing && !form.password.trim()) return 'Ingresa una contraseña inicial.';
    return null;
  };

  const onSave = async () => {
    const error = validate();

    if (error) {
      Alert.alert('Validación', error);
      return;
    }

    setLoading(true);
    try {
      if (isEditing && currentUserId) {
        await updateUserByAdmin(currentUserId, form);
      } else {
        await createUserByAdmin({
          ...form,
          role: tab,
        });
      }

      await loadUsers();
      setModalVisible(false);
      setForm(EMPTY_FORM);
      setCurrentUserId(null);
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el usuario. Verifica que el correo no esté repetido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ServiciosETopBar />

        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Gestión de Usuarios</Text>
            <Text style={styles.subtitle}>Administra cuentas de alumnos y maestros</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <MaterialCommunityIcons name="account-plus-outline" size={20} color="#052217" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'alumno' ? styles.tabButtonActive : null]}
            onPress={() => setTab('alumno')}
          >
            <MaterialCommunityIcons name="account-school-outline" size={18} color={tab === 'alumno' ? '#052217' : colors.textSecondary} />
            <Text style={[styles.tabText, tab === 'alumno' ? styles.tabTextActive : null]}>
              Alumnos ({alumnos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, tab === 'maestro' ? styles.tabButtonActive : null]}
            onPress={() => setTab('maestro')}
          >
            <MaterialCommunityIcons name="account-tie-outline" size={18} color={tab === 'maestro' ? '#052217' : colors.textSecondary} />
            <Text style={[styles.tabText, tab === 'maestro' ? styles.tabTextActive : null]}>
              Maestros ({maestros.length})
            </Text>
          </TouchableOpacity>
        </View>

        {users.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="database-off-outline" size={36} color={colors.textPlaceholder} />
            <Text style={styles.emptyTitle}>Sin registros</Text>
            <Text style={styles.emptySubtitle}>No hay usuarios para mostrar en esta categoría.</Text>
          </View>
        ) : (
          users.map((item) => (
            <View key={item.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>{(item.nombre || 'U').charAt(0).toUpperCase()}</Text>
                </View>

                <View style={styles.userMeta}>
                  <Text style={styles.userName}>{item.nombre || 'Sin nombre'}</Text>
                  <Text style={styles.userEmail}>{item.correo}</Text>
                  <Text style={styles.userExtra}>
                    {tab === 'alumno'
                      ? `Matrícula: ${item.matricula || 'N/A'} · Grupo: ${item.grupo || 'N/A'} · Aula: ${item.aula || 'N/A'}`
                      : `ID Empleado: ${item.matricula || 'N/A'} · Departamento: ${item.carrera || 'N/A'}`}
                  </Text>
                  {tab === 'alumno' ? <Text style={styles.userExtra}>Tutor: {item.tutor || 'N/A'}</Text> : null}
                </View>

                <View style={styles.actionsCol}>
                  <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                    <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF6B81" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView style={styles.modalCard} contentContainerStyle={styles.modalCardContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Editar usuario' : `Nuevo ${tab}`}</Text>

            <TextInput label="Nombre" value={form.nombre} onChangeText={(v) => onChange('nombre', v)} mode="outlined" style={styles.input} />
            <TextInput label="Correo" value={form.correo} onChangeText={(v) => onChange('correo', v)} mode="outlined" style={styles.input} autoCapitalize="none" />
            <TextInput
              label={tab === 'alumno' ? 'Matrícula' : 'ID de empleado'}
              value={form.matricula}
              onChangeText={(v) => onChange('matricula', v)}
              mode="outlined"
              style={styles.input}
            />

            {tab === 'alumno' ? (
              <>
                <TextInput label="Grupo" value={form.grupo} onChangeText={(v) => onChange('grupo', v)} mode="outlined" style={styles.input} />
                <TextInput label="Cuatrimestre" value={form.cuatrimestre} onChangeText={(v) => onChange('cuatrimestre', v)} mode="outlined" style={styles.input} />
                <TextInput label="Tutor" value={form.tutor} onChangeText={(v) => onChange('tutor', v)} mode="outlined" style={styles.input} />

                <Text style={styles.fieldLabel}>Carrera</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.carrera}
                    onValueChange={(v) => onChange('carrera', v)}
                    style={styles.picker}
                    dropdownIconColor={colors.textPlaceholder}
                  >
                    <Picker.Item label="Selecciona una carrera" value="" />
                    {carreras.map((item) => (
                      <Picker.Item key={item.codigo} label={item.nombre} value={item.codigo} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.fieldLabel}>Aula</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.aula}
                    onValueChange={(v) => onChange('aula', v)}
                    style={styles.picker}
                    dropdownIconColor={colors.textPlaceholder}
                  >
                    <Picker.Item label="Selecciona un aula" value="" />
                    {aulas.map((item) => (
                      <Picker.Item key={item.codigo} label={item.nombre} value={item.nombre} />
                    ))}
                  </Picker>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Departamento</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.carrera}
                    onValueChange={(v) => onChange('carrera', v)}
                    style={styles.picker}
                    dropdownIconColor={colors.textPlaceholder}
                  >
                    <Picker.Item label="Selecciona un departamento" value="" />
                    {carreras.map((item) => (
                      <Picker.Item key={item.codigo} label={item.nombre} value={item.codigo} />
                    ))}
                  </Picker>
                </View>
              </>
            )}

            <TextInput
              label={isEditing ? 'Contraseña (opcional)' : 'Contraseña inicial'}
              value={form.password}
              onChangeText={(v) => onChange('password', v)}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.saveButton, loading ? styles.saveButtonDisabled : null]} onPress={onSave} disabled={loading}>
                <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
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
  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: '#112A45',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabText: {
    color: colors.textSecondary,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#052217',
  },
  emptyCard: {
    backgroundColor: '#173251',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
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
  },
  userCard: {
    backgroundColor: '#173251',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#355A8B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    color: '#9CB2CC',
    fontSize: 14,
    marginTop: 2,
  },
  userExtra: {
    color: '#7B95B7',
    fontSize: 13,
    marginTop: 4,
  },
  actionsCol: {
    marginLeft: 8,
  },
  editButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#112A45',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#301929',
    alignItems: 'center',
    justifyContent: 'center',
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
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    marginTop: 2,
    marginBottom: 6,
    fontWeight: '700',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#1D5B92',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0F2B4A',
    marginBottom: 8,
  },
  picker: {
    color: colors.textPrimary,
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
