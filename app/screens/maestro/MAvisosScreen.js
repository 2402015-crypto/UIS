import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import MaestroTopBar from '../../components/MaestroTopBar';
import { getAvisos, initAdminContentDb } from '../../services/adminContentDb';

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

export default function MAvisosScreen() {
  const [filtro, setFiltro] = useState('todos');
  const [avisos, setAvisos] = useState([]);

  const FILTERS = useMemo(() => {
    const byCategory = ['academico', 'administrativo', 'evento'].reduce((acc, item) => {
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
  }, [filtro, avisos]);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <MaestroTopBar />

      <Text style={styles.pageTitle}>Avisos y Anuncios</Text>
      <Text style={styles.pageSubtitle}>Mantente informado de las novedades</Text>

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
          <Text style={styles.emptySubtitle}>Cuando existan avisos publicados aparecerán aquí.</Text>
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
            </View>
          );
        })
      )}
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
    paddingBottom: 32,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 40 / 2,
    fontWeight: '700',
    marginBottom: 4,
  },
  pageSubtitle: {
    color: colors.textPlaceholder,
    fontSize: 17,
    marginBottom: 16,
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
    fontSize: 30 / 2,
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
    fontSize: 32 / 2,
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
    fontSize: 30 / 2,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.textPrimary,
  },
  emptyCard: {
    backgroundColor: '#162E4A',
    borderWidth: 1,
    borderColor: '#2B5B90',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: colors.textPlaceholder,
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
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
    lineHeight: 32 / 1.1,
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
});
