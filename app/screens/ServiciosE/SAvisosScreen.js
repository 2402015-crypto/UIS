import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import ServiciosETopBar from '../../components/ServiciosETopBar';
import {
  createAviso,
  deleteAviso,
  getAvisos,
  initAdminContentDb,
  updateAviso,
} from '../../services/adminContentDb';

const CATEGORIAS = ['academico', 'administrativo', 'evento', 'urgente'];

function getCategoriaStyles(categoria) {
  if (categoria === 'academico') {
    return { bg: '#DDEBFF', text: '#315FD6', label: 'academico' };
  }
  if (categoria === 'administrativo') {
    return { bg: '#E7E8EC', text: '#8B95A5', label: 'administrativo' };
  }
  if (categoria === 'evento') {
    return { bg: '#D8F7E4', text: '#16A34A', label: 'evento' };
  }
  return { bg: '#FDE8E8', text: '#B91C1C', label: 'urgente' };
}

function getTodayLabel() {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export default function SAvisosScreen() {
  const [avisos, setAvisos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    autor: 'Servicios Escolares',
    categoria: 'academico',
    fecha: getTodayLabel(),
  });

  const FILTERS = useMemo(() => {
    const byCategory = CATEGORIAS.reduce((acc, item) => {
      acc[item] = avisos.filter((aviso) => aviso.categoria === item).length;
      return acc;
    }, {});

    return [
      { key: 'todos', label: `Todos (${avisos.length})` },
      { key: 'academico', label: `Academicos (${byCategory.academico || 0})` },
      { key: 'administrativo', label: `Admin (${byCategory.administrativo || 0})` },
      { key: 'evento', label: `Eventos (${byCategory.evento || 0})` },
    ];
  }, [avisos]);

  const avisosUrgentes = useMemo(() => avisos.filter((item) => item.categoria === 'urgente') || [], [avisos]);

  const avisosFiltrados = useMemo(() => {
    if (filtro === 'todos') return avisos.filter((item) => item.categoria !== 'urgente');
    return avisos.filter((item) => item.categoria === filtro);
  }, [avisos, filtro]);

  const loadAvisos = async () => {
    try {
      await initAdminContentDb();
      const data = await getAvisos();
      setAvisos(data || []);
    } catch {
      setAvisos([]);
    }
  };

  useEffect(() => {
    loadAvisos();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadAvisos();
    }, [])
  );

  const openCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm({
      titulo: '',
      descripcion: '',
      autor: 'Servicios Escolares',
      categoria: 'academico',
      fecha: getTodayLabel(),
    });
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setForm({
      titulo: item.titulo || '',
      descripcion: item.descripcion || '',
      autor: item.autor || 'Servicios Escolares',
      categoria: item.categoria || 'academico',
      fecha: item.fecha || getTodayLabel(),
    });
    setModalVisible(true);
  };

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim() || !form.autor.trim()) {
      Alert.alert('Validacion', 'Completa titulo, descripcion y autor.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && currentId) {
        await updateAviso(currentId, form);
      } else {
        await createAviso(form);
      }

      setModalVisible(false);
      await loadAvisos();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el aviso.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (item) => {
    Alert.alert(
      'Eliminar anuncio',
      `¿Deseas eliminar el anuncio "${item.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAviso(item.id);
              await loadAvisos();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el anuncio.');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ServiciosETopBar />

        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.pageTitle}>Avisos y Anuncios</Text>
            <Text style={styles.pageSubtitle}>Crea y edita comunicados institucionales</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={openCreate}>
            <MaterialCommunityIcons name="plus" size={24} color="#052217" />
          </TouchableOpacity>
        </View>

        {avisosUrgentes.length > 0 && (
          <>
            <View style={styles.urgentHeaderRow}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#991B1B" />
              <View>
                <Text style={styles.urgentTitle}>Avisos Urgentes</Text>
                <Text style={styles.urgentSubtitle}>Atencion inmediata requerida ({avisosUrgentes.length})</Text>
              </View>
            </View>
            {avisosUrgentes.map((aviso) => (
              <View key={aviso.id} style={styles.urgentOuterCard}>
                <View style={styles.urgentInnerCard}>
                  <Text style={styles.urgentInnerTitle}>{aviso.titulo}</Text>
                  <Text style={styles.urgentInnerText}>{aviso.descripcion}</Text>
                </View>

                <View style={styles.urgentFooterRow}>
                  <Text style={styles.urgentFooterText}>{aviso.autor}</Text>
                  <Text style={styles.urgentFooterText}>{aviso.fecha}</Text>
                </View>

                <View style={styles.noticeActionsRow}>
                  <TouchableOpacity style={styles.noticeEditButton} onPress={() => openEdit(aviso)}>
                    <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.textPrimary} />
                    <Text style={styles.noticeEditText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.noticeDeleteButton} onPress={() => onDelete(aviso)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF6B81" />
                    <Text style={styles.noticeDeleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.filtersWrap}>
          {FILTERS.map((item) => {
            const active = filtro === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFiltro(item.key)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {avisosFiltrados.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="bell-off-outline" size={36} color={colors.textPlaceholder} />
            <Text style={styles.emptyTitle}>Sin avisos</Text>
            <Text style={styles.emptySubtitle}>Crea anuncios desde el boton +.</Text>
          </View>
        ) : (
          avisosFiltrados.map((aviso) => {
            const categoriaStyle = getCategoriaStyles(aviso.categoria);
            return (
              <View key={aviso.id} style={styles.noticeCard}>
                <View style={styles.noticeHeaderRow}>
                  <Text style={styles.noticeTitle}>{aviso.titulo}</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: categoriaStyle.bg }]}>
                    <Text style={[styles.categoryBadgeText, { color: categoriaStyle.text }]}>{categoriaStyle.label}</Text>
                  </View>
                </View>

                <Text style={styles.noticeDescription}>{aviso.descripcion}</Text>

                <View style={styles.noticeDivider} />

                <View style={styles.noticeMetaRow}>
                  <View style={styles.noticeMetaItem}>
                    <MaterialCommunityIcons name="account-outline" size={18} color={colors.textPlaceholder} />
                    <Text style={styles.noticeMetaText}>{aviso.autor}</Text>
                  </View>
                </View>
                <View style={styles.noticeMetaRow}>
                  <View style={styles.noticeMetaItem}>
                    <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={colors.textPlaceholder} />
                    <Text style={styles.noticeMetaText}>{aviso.fecha}</Text>
                  </View>
                </View>

                <View style={styles.noticeActionsRow}>
                  <TouchableOpacity style={styles.noticeEditButton} onPress={() => openEdit(aviso)}>
                    <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.textPrimary} />
                    <Text style={styles.noticeEditText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.noticeDeleteButton} onPress={() => onDelete(aviso)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF6B81" />
                    <Text style={styles.noticeDeleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isEditing ? 'Editar anuncio' : 'Nuevo anuncio'}</Text>

            <TextInput label="Titulo" value={form.titulo} onChangeText={(v) => onChange('titulo', v)} mode="outlined" style={styles.input} />
            <TextInput label="Descripcion" value={form.descripcion} onChangeText={(v) => onChange('descripcion', v)} mode="outlined" multiline style={styles.input} />
            <TextInput label="Autor" value={form.autor} onChangeText={(v) => onChange('autor', v)} mode="outlined" style={styles.input} />
            <TextInput label="Fecha" value={form.fecha} onChangeText={(v) => onChange('fecha', v)} mode="outlined" style={styles.input} />

            <View style={styles.categoryRow}>
              {CATEGORIAS.map((cat) => {
                const isActive = form.categoria === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryButton, isActive ? styles.categoryButtonActive : null]}
                    onPress={() => onChange('categoria', cat)}
                  >
                    <Text style={[styles.categoryButtonText, isActive ? styles.categoryButtonTextActive : null]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, saving ? styles.saveButtonDisabled : null]} onPress={onSave} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  pageSubtitle: {
    color: colors.textPlaceholder,
    fontSize: 17,
    marginBottom: 10,
  },
  urgentOuterCard: {
    backgroundColor: '#F6ECEE',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  urgentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgentTitle: {
    color: '#991B1B',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  urgentSubtitle: {
    color: '#B91C1C',
    fontSize: 15,
    marginLeft: 8,
    marginTop: 2,
  },
  urgentInnerCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1B4BC',
  },
  urgentInnerTitle: {
    color: '#991B1B',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  urgentInnerText: {
    color: '#4B5563',
    fontSize: 16,
    lineHeight: 25,
  },
  urgentFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  urgentFooterText: {
    color: '#667085',
    fontSize: 14,
  },
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0F2D4D',
    borderRadius: 999,
    padding: 4,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 4,
    marginBottom: 4,
  },
  filterChipActive: {
    backgroundColor: '#1A3555',
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  filterTextActive: {
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
  },
  noticeCard: {
    backgroundColor: '#162E4A',
    borderWidth: 1,
    borderColor: '#2B5B90',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  noticeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  noticeTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  noticeDescription: {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 28,
    marginTop: 10,
  },
  noticeDivider: {
    height: 1,
    backgroundColor: '#2B5B90',
    marginVertical: 10,
  },
  noticeMetaRow: {
    marginBottom: 6,
  },
  noticeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeMetaText: {
    color: colors.textPlaceholder,
    marginLeft: 7,
    fontSize: 16,
  },
  noticeActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  noticeEditButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2B5B90',
    backgroundColor: '#102C4A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 6,
  },
  noticeEditText: {
    color: colors.textPrimary,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
  },
  noticeDeleteButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5A2B45',
    backgroundColor: '#2D1524',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: 6,
  },
  noticeDeleteText: {
    color: '#FF6B81',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    marginBottom: 8,
  },
  categoryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1D5B92',
    backgroundColor: '#102C4A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  categoryButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryButtonTextActive: {
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
