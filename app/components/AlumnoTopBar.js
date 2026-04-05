import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import AlumnoMenuDrawer from './AlumnoMenuDrawer';

export default function AlumnoTopBar() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logoImage} />
          <Text style={styles.topBarTitle}>Sistema UIS</Text>
        </View>

        <TouchableOpacity style={styles.menuButton} activeOpacity={0.8} onPress={() => setMenuVisible(true)}>
          <MaterialCommunityIcons name="menu" size={34} color="#E5ECF5" />
        </TouchableOpacity>
      </View>

      <AlumnoMenuDrawer visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
    backgroundColor: '#0F2747',
    borderBottomWidth: 1,
    borderBottomColor: '#1F4C7A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 50,
    height: 50,
    marginTop: 12,
    resizeMode: 'contain',
  },
  topBarTitle: {
    color: '#EAF1FA',
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 12,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
