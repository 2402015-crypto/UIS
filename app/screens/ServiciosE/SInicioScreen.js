import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '../../../styles/colors';
import ServiciosETopBar from '../../components/ServiciosETopBar';
import { getDashboardCounts, getGroupsCount } from '../../services/authDb';
import { getAvisosCount, getPracticasCount, getRecentAvisos } from '../../services/adminContentDb';

const INITIAL_STATS = {
  alumnos: 0,
  maestros: 0,
  grupos: 0,
  practicas: 0,
};

function getBadgeStyles(categoria) {
  if (categoria === 'academico') return { bg: '#DDEBFF', text: '#315FD6' };
  if (categoria === 'administrativo') return { bg: '#E7E8EC', text: '#8B95A5' };
  if (categoria === 'evento') return { bg: '#D8F7E4', text: '#16A34A' };
  return { bg: '#FDE8E8', text: '#B91C1C' };
}

export default function SInicioScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState(INITIAL_STATS);
  const [avisosRecientes, setAvisosRecientes] = useState([]);
  const [avisosCount, setAvisosCount] = useState(0);

  const loadCounts = async () => {
    try {
      const [counts, gruposCount, practicasCount, avisosList, avisosTotal] = await Promise.all([
        getDashboardCounts(),
        getGroupsCount(),
        getPracticasCount(),
        getRecentAvisos(4),
        getAvisosCount(),
      ]);

      setStats((prev) => ({
        ...prev,
        alumnos: counts.alumnos,
        maestros: counts.maestros,
        grupos: gruposCount,
        practicas: practicasCount,
      }));
      setAvisosRecientes(avisosList || []);
      setAvisosCount(avisosTotal || 0);
    } catch {
      // Si falla la carga, el dashboard mantiene los valores actuales.
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCounts();
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ServiciosETopBar />

      <View style={styles.heroCard}>
        <View style={styles.heroIconWrap}>
          <MaterialCommunityIcons name="shield-crown-outline" size={36} color="#041E1E" />
        </View>

        <View style={styles.heroBody}>
          <Text style={styles.heroTitle}>Servicios Escolares</Text>
          <View style={styles.roleBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.roleBadgeText}>Administrador</Text>
          </View>
          <Text style={styles.heroSubtitle}>Panel de Control - Sistema Escolar UIS</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Usuarios')}>
          <View style={[styles.statIconWrap, { backgroundColor: '#113B54' }]}>
            <MaterialCommunityIcons name="account-group-outline" size={22} color={colors.accent} />
          </View>
          <Text style={styles.statValue}>{stats.alumnos}</Text>
          <Text style={styles.statLabel}>Alumnos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Usuarios')}>
          <View style={[styles.statIconWrap, { backgroundColor: '#193863' }]}>
            <MaterialCommunityIcons name="account-tie-outline" size={22} color="#5AA2FF" />
          </View>
          <Text style={styles.statValue}>{stats.maestros}</Text>
          <Text style={styles.statLabel}>Maestros</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Grupos')}>
          <View style={[styles.statIconWrap, { backgroundColor: '#113D4D' }]}>
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={22} color="#22C55E" />
          </View>
          <Text style={styles.statValue}>{stats.grupos}</Text>
          <Text style={styles.statLabel}>Grupos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Practicas')}>
          <View style={[styles.statIconWrap, { backgroundColor: '#2D2555' }]}>
            <MaterialCommunityIcons name="briefcase-outline" size={22} color="#A78BFA" />
          </View>
          <Text style={styles.statValue}>{stats.practicas}</Text>
          <Text style={styles.statLabel}>Practicas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconWrap}>
            <MaterialCommunityIcons name="bell-outline" size={18} color={colors.accent} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Avisos Recientes</Text>
            <Text style={styles.sectionSubtitle}>{avisosCount} avisos publicados</Text>
          </View>
        </View>

        {avisosRecientes.length === 0 ? (
          <View style={styles.noticeEmpty}>
            <Text style={styles.noticeEmptyText}>Aun no hay avisos publicados.</Text>
          </View>
        ) : avisosRecientes.map((item) => {
          const badge = getBadgeStyles(item.categoria);
          return (
            <TouchableOpacity key={item.id} style={styles.noticeRow} onPress={() => navigation.navigate('Avisos')}>
              <Text style={styles.noticeTitle}>{item.titulo}</Text>
              <View style={[styles.noticeBadge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.noticeBadgeText, { color: badge.text }]}>{item.categoria}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
    paddingBottom: 30,
  },
  heroCard: {
    backgroundColor: '#173251',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroBody: {
    flex: 1,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 30 / 1.5,
    fontWeight: '800',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#155E59',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  roleBadgeText: {
    color: '#8CF3C8',
    fontSize: 12,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: '#ABC1D8',
    fontSize: 14,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48.5%',
    backgroundColor: '#173251',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 12,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 36 / 1.5,
    fontWeight: '800',
  },
  statLabel: {
    color: '#9CB2CC',
    fontSize: 14,
    marginTop: 2,
  },
  sectionCard: {
    marginTop: 2,
    backgroundColor: '#173251',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#113B54',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#9CB2CC',
    fontSize: 14,
    marginTop: 2,
  },
  noticeRow: {
    backgroundColor: '#102C4A',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noticeTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  noticeBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  noticeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noticeEmpty: {
    backgroundColor: '#102C4A',
    borderColor: '#1D5B92',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  noticeEmptyText: {
    color: '#9CB2CC',
    fontSize: 14,
  },
});