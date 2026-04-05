import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import AlumnoTopBar from '../../components/AlumnoTopBar';

const PRACTICAS_MOCK = [
  {
    id: 'p1',
    titulo: 'Analista de Bases de Datos',
    empresa: 'DataSystems Inc.',
    descripcion: 'Practica profesional en administracion y optimizacion de bases de datos',
    requisitos: ['SQL', 'MySQL o PostgreSQL', 'Analisis de datos', 'Excel avanzado'],
    duracion: '4 meses',
    horario: 'Lunes a Viernes 8:00 - 14:00',
    aplicantes: 8,
    cierreTexto: 'Cierra en 22 dias (19/4/2026)',
    aplicado: false,
  },
  {
    id: 'p2',
    titulo: 'Desarrollador Frontend Jr.',
    empresa: 'NovaSoft',
    descripcion: 'Apoyo en desarrollo de interfaces web y mantenimiento de componentes UI',
    requisitos: ['HTML/CSS', 'JavaScript', 'React basico'],
    duracion: '5 meses',
    horario: 'Lunes a Viernes 9:00 - 15:00',
    aplicantes: 11,
    cierreTexto: 'Cierra en 15 dias (12/4/2026)',
    aplicado: false,
  },
  {
    id: 'p3',
    titulo: 'Soporte de Infraestructura',
    empresa: 'InfraTech MX',
    descripcion: 'Monitoreo de red, soporte tecnico y documentacion de incidencias',
    requisitos: ['Redes', 'Windows/Linux', 'Atencion a usuarios'],
    duracion: '3 meses',
    horario: 'Lunes a Viernes 7:30 - 13:30',
    aplicantes: 5,
    cierreTexto: 'Cierra en 10 dias (7/4/2026)',
    aplicado: false,
  },
  {
    id: 'p4',
    titulo: 'QA Tester',
    empresa: 'Quality Labs',
    descripcion: 'Ejecucion de pruebas funcionales y registro de bugs en sistema de seguimiento',
    requisitos: ['Pruebas funcionales', 'Documentacion', 'Detalle y analisis'],
    duracion: '4 meses',
    horario: 'Lunes a Viernes 8:00 - 14:00',
    aplicantes: 17,
    cierreTexto: 'Cierra en 7 dias (4/4/2026)',
    aplicado: false,
  },
];

export default function APracticasScreen() {
  const [practicas, setPracticas] = useState(PRACTICAS_MOCK);
  const [detalleId, setDetalleId] = useState(null);

  const detalleSeleccionado = useMemo(
    () => practicas.find((item) => item.id === detalleId) || null,
    [practicas, detalleId]
  );

  const resumen = useMemo(() => {
    const postulaciones = practicas.filter((item) => item.aplicado).length;
    const totalAplicantes = practicas.reduce((acc, item) => acc + item.aplicantes, 0);
    return {
      ofertas: practicas.length,
      postulaciones,
      totalAplicantes,
    };
  }, [practicas]);

  const postularAOferta = (id) => {
    setPracticas((prev) => prev.map((item) => (item.id === id ? { ...item, aplicado: true } : item)));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <AlumnoTopBar />
      <Text style={styles.pageTitle}>Practicas Profesionales</Text>
      <Text style={styles.pageSubtitle}>Encuentra y postulate a oportunidades de practicas</Text>

      <View style={styles.metricCard}>
        <MaterialCommunityIcons name="briefcase-outline" size={34} color="#2F80ED" />
        <Text style={styles.metricValue}>{resumen.ofertas}</Text>
        <Text style={styles.metricLabel}>Ofertas Disponibles</Text>
      </View>

      <View style={styles.metricCard}>
        <MaterialCommunityIcons name="check-circle-outline" size={34} color="#00C853" />
        <Text style={styles.metricValue}>{resumen.postulaciones}</Text>
        <Text style={styles.metricLabel}>Postulaciones</Text>
      </View>

      <View style={styles.metricCard}>
        <MaterialCommunityIcons name="account-group-outline" size={34} color="#2F80ED" />
        <Text style={styles.metricValue}>{resumen.totalAplicantes}</Text>
        <Text style={styles.metricLabel}>Total Aplicantes</Text>
      </View>

      {practicas.map((oferta) => (
        <View key={oferta.id} style={[styles.offerCard, oferta.aplicado && styles.offerCardApplied]}>
          <View style={styles.offerHeaderRow}>
            <Text style={styles.offerTitle}>{oferta.titulo}</Text>
            {oferta.aplicado ? (
              <View style={styles.appliedBadge}>
                <MaterialCommunityIcons name="check-circle-outline" size={16} color="#052217" />
                <Text style={styles.appliedBadgeText}>Aplicado</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.offerCompany}>{oferta.empresa}</Text>
          <Text style={styles.offerDescription}>{oferta.descripcion}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textPlaceholder} />
              <Text style={styles.metaText}>{oferta.duracion}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account-group-outline" size={18} color={colors.textPlaceholder} />
              <Text style={styles.metaText}>{oferta.aplicantes} aplicantes</Text>
            </View>
          </View>

          <View style={styles.metaItemSingle}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={colors.textPlaceholder} />
            <Text style={styles.metaText}>{oferta.cierreTexto}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity activeOpacity={0.85} style={styles.detailButton} onPress={() => setDetalleId(oferta.id)}>
              <Text style={styles.detailButtonText}>Ver detalles</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.applyButton, oferta.aplicado && styles.applyButtonDisabled]}
              onPress={() => postularAOferta(oferta.id)}
              disabled={oferta.aplicado}
            >
              <Text style={[styles.applyButtonText, oferta.aplicado && styles.applyButtonTextDisabled]}>
                {oferta.aplicado ? 'Ya aplicado' : 'Postularme'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Modal visible={Boolean(detalleSeleccionado)} transparent animationType="fade" onRequestClose={() => setDetalleId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setDetalleId(null)}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{detalleSeleccionado?.titulo}</Text>
            <Text style={styles.modalCompany}>{detalleSeleccionado?.empresa}</Text>

            <Text style={styles.modalSectionTitle}>Descripcion</Text>
            <Text style={styles.modalText}>{detalleSeleccionado?.descripcion}</Text>

            <Text style={styles.modalSectionTitle}>Requisitos</Text>
            {detalleSeleccionado?.requisitos?.map((req, idx) => (
              <View key={idx} style={styles.requirementRow}>
                <MaterialCommunityIcons name="check-circle-outline" size={20} color="#00C853" />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}

            <View style={styles.modalFooter}>
              <View style={styles.modalFooterRow}>
                <Text style={styles.modalFooterLabel}>Duracion:</Text>
                <Text style={styles.modalFooterValue}>{detalleSeleccionado?.duracion}</Text>
              </View>
              <View style={styles.modalFooterRow}>
                <Text style={styles.modalFooterLabel}>Horario:</Text>
                <Text style={styles.modalFooterValue}>{detalleSeleccionado?.horario}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  pageSubtitle: {
    color: colors.textPlaceholder,
    fontSize: 16,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#162E4A',
    borderWidth: 1,
    borderColor: '#2B5B90',
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 14,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  metricLabel: {
    color: colors.textPlaceholder,
    fontSize: 16,
  },
  offerCard: {
    backgroundColor: '#162E4A',
    borderWidth: 1,
    borderColor: '#2B5B90',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  offerCardApplied: {
    backgroundColor: '#12363B',
  },
  offerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  offerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  appliedBadge: {
    backgroundColor: '#00C853',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedBadgeText: {
    color: '#052217',
    fontWeight: '700',
    marginLeft: 4,
    fontSize: 12,
  },
  offerCompany: {
    color: colors.accent,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 12,
  },
  offerDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItemSingle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    color: colors.textPlaceholder,
    marginLeft: 6,
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  detailButton: {
    borderWidth: 1,
    borderColor: '#2B5B90',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#071A2E',
  },
  detailButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  applyButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#2F80ED',
  },
  applyButtonDisabled: {
    backgroundColor: '#4F7FBE',
    opacity: 0.9,
  },
  applyButtonText: {
    color: '#031525',
    fontWeight: '700',
    fontSize: 16,
  },
  applyButtonTextDisabled: {
    color: '#B9CCE4',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 18,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#031A30',
    borderColor: '#2B5B90',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 2,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  modalCompany: {
    color: '#7EA1C8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  modalSectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalText: {
    color: '#66768D',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    color: '#66768D',
    marginLeft: 8,
    fontSize: 15,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#2B5B90',
    marginTop: 8,
    paddingTop: 10,
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalFooterLabel: {
    color: '#66768D',
    fontSize: 16,
  },
  modalFooterValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
