import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import ServiciosETopBar from '../../components/ServiciosETopBar';
import {
  createPractica,
  deletePractica,
  getPracticasForAdmin,
  initAdminContentDb,
  updatePractica,
} from '../../services/adminContentDb';

const EMPTY_FORM = {
  titulo: '',
  empresa: '',
  descripcion: '',
  requisitosText: '',
  duracion: '',
  horario: '',
  modalidad: '',
  vacantes: '1',
  estado: 'activa',
};

export default function SPracticasScreen() {
  const [practicas, setPracticas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const totalActivas = useMemo(() => practicas.filter((p) => p.estado === 'activa').length, [practicas]);

  const loadPracticas = async () => {
    try {
      await initAdminContentDb();
      const data = await getPracticasForAdmin();
      setPracticas(data || []);
    } catch {
      setPracticas([]);
    }
  };

  useEffect(() => {
    loadPracticas();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPracticas();
    }, [])
  );

  const openCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setForm({
      titulo: item.titulo || '',
      empresa: item.empresa || '',
      descripcion: item.descripcion || '',
      requisitosText: Array.isArray(item.requisitos) ? item.requisitos.join(', ') : '',
      duracion: item.duracion || '',
      horario: item.horario || '',
      modalidad: item.modalidad || '',
      vacantes: String(item.vacantes || 1),
      estado: item.estado || 'activa',
    });
    setModalVisible(true);
  };

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onDelete = (item) => {
    Alert.alert(
      'Eliminar oferta',
      `¿Deseas eliminar la oferta "${item.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePractica(item.id);
              await loadPracticas();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la oferta.');
            }
          },
        },
      ]
    );
  };

  const onSave = async () => {
    if (!form.titulo.trim() || !form.empresa.trim() || !form.descripcion.trim()) {
      Alert.alert('Validacion', 'Completa titulo, empresa y descripcion.');
      return;
    }

    const requisitos = form.requisitosText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        empresa: form.empresa.trim(),
        descripcion: form.descripcion.trim(),
        requisitos,
        duracion: form.duracion.trim(),
        horario: form.horario.trim(),
        modalidad: form.modalidad.trim(),
        vacantes: Number(form.vacantes || '1'),
        estado: form.estado,
      };

      if (isEditing && currentId) {
        await updatePractica(currentId, payload);
      } else {
        await createPractica(payload);
      }

      setModalVisible(false);
      setForm(EMPTY_FORM);
      setCurrentId(null);
      setIsEditing(false);
      await loadPracticas();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la practica.');
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
            <Text style={styles.title}>Gestion de Practicas</Text>
            <Text style={styles.subtitle}>Crea y edita ofertas visibles para alumnos</Text>
            <Text style={styles.counterText}>{totalActivas} ofertas activas</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={openCreate}>
            <MaterialCommunityIcons name="plus" size={24} color="#052217" />
          </TouchableOpacity>
        </View>

        {practicas.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="briefcase-outline" size={36} color={colors.textPlaceholder} />
            <Text style={styles.emptyTitle}>Sin ofertas</Text>
            <Text style={styles.emptySubtitle}>Crea una oferta desde el boton +.</Text>
          </View>
        ) : (
          practicas.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <View style={[styles.badge, item.estado === 'activa' ? styles.badgeActive : styles.badgeClosed]}>
                  <Text style={[styles.badgeText, item.estado === 'activa' ? styles.badgeTextActive : styles.badgeTextClosed]}>
                    {item.estado === 'activa' ? 'Activa' : 'Cerrada'}
                  </Text>
                </View>
              </View>

              <Text style={styles.companyText}>{item.empresa}</Text>
              <Text style={styles.descText}>{item.descripcion}</Text>

              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="account-group-outline" size={18} color={colors.accent} />
                <Text style={styles.metaText}>{item.aplicantes || 0} aplicantes</Text>
              </View>

              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="office-building-outline" size={18} color={colors.accent} />
                <Text style={styles.metaText}>{item.modalidad || 'Sin modalidad'}</Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openEdit(item)}>
                  <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.textPrimary} />
                  <Text style={styles.actionButtonText}>Editar oferta</Text>
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
            <Text style={styles.modalTitle}>{isEditing ? 'Editar oferta' : 'Nueva oferta'}</Text>

            <TextInput label="Titulo" value={form.titulo} onChangeText={(v) => onChange('titulo', v)} mode="outlined" style={styles.input} />
            <TextInput label="Empresa" value={form.empresa} onChangeText={(v) => onChange('empresa', v)} mode="outlined" style={styles.input} />
            <TextInput label="Descripcion" value={form.descripcion} onChangeText={(v) => onChange('descripcion', v)} mode="outlined" multiline style={styles.input} />
            <TextInput label="Requisitos (separados por coma)" value={form.requisitosText} onChangeText={(v) => onChange('requisitosText', v)} mode="outlined" style={styles.input} />
            <TextInput label="Duracion" value={form.duracion} onChangeText={(v) => onChange('duracion', v)} mode="outlined" style={styles.input} />
            <TextInput label="Horario" value={form.horario} onChangeText={(v) => onChange('horario', v)} mode="outlined" style={styles.input} />
            <TextInput label="Modalidad" value={form.modalidad} onChangeText={(v) => onChange('modalidad', v)} mode="outlined" style={styles.input} />
            <TextInput label="Vacantes" value={form.vacantes} onChangeText={(v) => onChange('vacantes', v.replace(/[^0-9]/g, ''))} mode="outlined" keyboardType="number-pad" style={styles.input} />

            <View style={styles.stateRow}>
              <TouchableOpacity
                style={[styles.stateButton, form.estado === 'activa' ? styles.stateButtonActive : null]}
                onPress={() => onChange('estado', 'activa')}
              >
                <Text style={[styles.stateText, form.estado === 'activa' ? styles.stateTextActive : null]}>Activa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stateButton, form.estado === 'cerrada' ? styles.stateButtonActive : null]}
                onPress={() => onChange('estado', 'cerrada')}
              >
                <Text style={[styles.stateText, form.estado === 'cerrada' ? styles.stateTextActive : null]}>Cerrada</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, saving ? styles.saveButtonDisabled : null]} onPress={onSave} disabled={saving}>
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
    marginBottom: 10,
  },
  headerTextWrap: {
    flex: 1,
    marginRight: 12,
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
  },
  counterText: {
    color: colors.accent,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '700',
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  card: {
    backgroundColor: '#173251',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeActive: {
    backgroundColor: '#D8F7E4',
  },
  badgeClosed: {
    backgroundColor: '#E7E8EC',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#16A34A',
  },
  badgeTextClosed: {
    color: '#8B95A5',
  },
  companyText: {
    color: colors.accent,
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
  },
  descText: {
    color: colors.textSecondary,
    marginTop: 6,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  actionButton: {
    marginTop: 10,
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D5B92',
    backgroundColor: '#102C4A',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  deleteButton: {
    marginTop: 10,
    marginLeft: 8,
    minWidth: 110,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5A2B45',
    backgroundColor: '#2D1524',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
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
    maxHeight: '85%',
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
  stateRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 10,
  },
  stateButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D5B92',
    backgroundColor: '#102C4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stateButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stateText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  stateTextActive: {
    color: '#052217',
  },
  modalActions: {
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
