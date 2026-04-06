import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useContext } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '../../styles/colors';
import { AuthContext } from './context/AuthContext';

const MENU_ITEMS = [
  { label: 'Inicio', route: 'Inicio', icon: 'home-outline' },
  { label: 'Usuarios', route: 'Usuarios', icon: 'account-multiple-outline' },
  { label: 'Grupos', route: 'Grupos', icon: 'book-open-page-variant-outline' },
  { label: 'Practicas', route: 'Practicas', icon: 'briefcase-outline' },
  { label: 'Avisos', route: 'Avisos', icon: 'bell-outline' },
];

export default function ServiciosEMenuDrawer({ visible, onClose }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, logout } = useContext(AuthContext);

  const navigateTo = (targetRoute) => {
    onClose();
    navigation.navigate(targetRoute);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />

        <View style={styles.drawer}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="shield-crown-outline" size={28} color="#041E1E" />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.username}>{user?.nombre || 'Servicios Escolares'}</Text>
              <Text style={styles.userRole}>Administrador</Text>
              <Text style={styles.userEmail}>{user?.correo || 'servicios@uis.mx'}</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => {
              const isActive = route.name === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => navigateTo(item.route)}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={23}
                    color={isActive ? '#052217' : colors.textSecondary}
                  />
                  <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={22} color="#FF5A6E" />
            <Text style={styles.logoutText}>Cerrar Sesion</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    flexDirection: 'row',
  },
  backdropTouch: {
    flex: 1,
  },
  drawer: {
    width: 290,
    backgroundColor: '#152C47',
    borderRightWidth: 1,
    borderRightColor: '#1F4C7A',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F4C7A',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  userRole: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  userEmail: {
    color: colors.textPlaceholder,
    fontSize: 14,
    marginTop: 8,
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: {
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  menuText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginLeft: 12,
    fontWeight: '600',
  },
  menuTextActive: {
    color: '#052217',
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#1F4C7A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  logoutText: {
    color: '#FF5A6E',
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '700',
  },
});
