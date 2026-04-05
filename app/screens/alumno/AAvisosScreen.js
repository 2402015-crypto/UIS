import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import AlumnoTopBar from '../../components/AlumnoTopBar';

const AVISOS_MOCK = [
  {
    id: 'a1',
    titulo: 'Inicio de Inscripciones 5to Cuatrimestre',
    descripcion:
      'Las inscripciones para el proximo cuatrimestre inician el 1 de abril. No olvides verificar tu situacion academica antes de inscribirte.',
    autor: 'Coordinacion Academica',
    fecha: '27 de marzo de 2026',
    categoria: 'academico',
  },
  {
    id: 'a2',
    titulo: 'Mantenimiento de Sistemas',
    descripcion:
      'El sistema estara en mantenimiento el dia 30 de marzo de 22:00 a 02:00 hrs. Durante este tiempo no podras acceder a la plataforma.',
    autor: 'Departamento de TI',
    fecha: '26 de marzo de 2026',
    categoria: 'administrativo',
  },
  {
    id: 'a3',
    titulo: 'Feria de Practicas Profesionales 2026',
    descripcion:
      'Te invitamos a la Feria de Practicas Profesionales que se llevara a cabo el 5 de abril en el auditorio principal. Mas de 30 empresas estaran presentes.',
    autor: 'Vinculacion Empresarial',
    fecha: '25 de marzo de 2026',
    categoria: 'evento',
  },
  {
    id: 'a4',
    titulo: 'Actualizacion de Datos Urgente',
    descripcion:
      'Se requiere que todos los alumnos actualicen sus datos de contacto antes del 31 de marzo. Es indispensable para continuar con el proceso de titulacion.',
    autor: 'Control Escolar',
    fecha: '24/3/2026',
    categoria: 'urgente',
  },
];

const FILTERS = [
  { key: 'todos', label: 'Todos (4)' },
  { key: 'academico', label: 'Academicos (1)' },
  { key: 'administrativo', label: 'Admin (1)' },
  { key: 'evento', label: 'Eventos (1)' },
];

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

export default function AAvisosScreen() {
  const [filtro, setFiltro] = useState('todos');

  const avisoUrgente = AVISOS_MOCK.find((item) => item.categoria === 'urgente');

  const avisosFiltrados = useMemo(() => {
    if (filtro === 'todos') return AVISOS_MOCK.filter((item) => item.categoria !== 'urgente');
    return AVISOS_MOCK.filter((item) => item.categoria === filtro);
  }, [filtro]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <AlumnoTopBar />

      <Text style={styles.pageTitle}>Avisos y Anuncios</Text>
      <Text style={styles.pageSubtitle}>Manten­te informado de las novedades</Text>

      {avisoUrgente ? (
        <View style={styles.urgentOuterCard}>
          <View style={styles.urgentHeaderRow}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#991B1B" />
            <View>
              <Text style={styles.urgentTitle}>Avisos Urgentes</Text>
              <Text style={styles.urgentSubtitle}>Atencion inmediata requerida</Text>
            </View>
          </View>

          <View style={styles.urgentInnerCard}>
            <Text style={styles.urgentInnerTitle}>{avisoUrgente.titulo}</Text>
            <Text style={styles.urgentInnerText}>{avisoUrgente.descripcion}</Text>
          </View>

          <View style={styles.urgentFooterRow}>
            <Text style={styles.urgentFooterText}>{avisoUrgente.autor}</Text>
            <Text style={styles.urgentFooterText}>{avisoUrgente.fecha}</Text>
          </View>
        </View>
      ) : null}

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

      {avisosFiltrados.map((aviso) => {
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
      })}
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
