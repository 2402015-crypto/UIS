import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../../styles/colors';
import AlumnoTopBar from '../../components/AlumnoTopBar';
import { getScheduleForDate } from '../../services/mockScheduleData';

export default function AHorariosScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const { diaHoy, fechaHoy, clases } = getScheduleForDate(selectedDate);
  const diaCapitalizado = diaHoy.charAt(0).toUpperCase() + diaHoy.slice(1);

  // Funciones para cambiar de día con flechas
  const cambiarDia = (dias) => {
    const nuevaFecha = new Date(selectedDate);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setSelectedDate(nuevaFecha);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* TopBar */}
      <AlumnoTopBar />

      {/* Encabezado */}
      <Text style={styles.sectionTitle}>Horario de Clases</Text>
      <Text style={styles.sectionSubtitle}>Consulta tu horario semanal</Text>

      {/* Selector de día con flechas */}
      <View style={styles.daySelector}>
        <TouchableOpacity onPress={() => cambiarDia(-1)}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={colors.accent} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dayCenter}>
          <MaterialCommunityIcons name="calendar" size={24} color={colors.accent} />
          <Text style={styles.dayText}>{diaCapitalizado} • {fechaHoy}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => cambiarDia(1)}>
          <MaterialCommunityIcons name="chevron-right" size={32} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* DatePicker */}
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Lista de clases */}
      <Text style={styles.dayTitle}>{clases.length} clases</Text>
      {clases.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="calendar-alert" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No tienes clases este dia</Text>
          <Text style={styles.emptyMessage}>Disfruta tu dia libre o revisa otro dia en el calendario.</Text>
        </View>
      ) : (
        clases.map((clase, index) => (
          <View key={index} style={styles.claseCard}>
            <MaterialCommunityIcons name="book-open-variant" size={28} color={colors.accent} />
            <View style={styles.claseInfo}>
              <Text style={styles.claseNombre}>{clase.nombre}</Text>
              <Text style={styles.claseDetalle}>{clase.hora}</Text>
              <Text style={styles.claseDetalle}>{clase.profesor}</Text>
              <Text style={styles.claseDetalle}>Aula {clase.aula}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  contentContainer: { 
    padding: 16, 
    paddingBottom: 24 
  },
  sectionTitle: { 
    color: colors.textPrimary, 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  sectionSubtitle: { 
    color: colors.textSecondary, 
    fontSize: 14, 
    marginBottom: 16 
  },
  daySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayCenter: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  dayText: { 
    color: colors.textPrimary, 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8 
  },
  dayTitle: { 
    color: colors.accent, 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 12 
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyMessage: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  claseCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  claseInfo: { 
    marginLeft: 12, 
    flex: 1 
  },
  claseNombre: { 
    color: colors.textPrimary, 
    fontSize: 15, 
    fontWeight: '700' 
  },
  claseDetalle: { 
    color: colors.textSecondary, 
    fontSize: 13, 
    marginTop: 2 
  },
});