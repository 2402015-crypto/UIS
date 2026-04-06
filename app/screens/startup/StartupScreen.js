import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';

import { colors } from '../../../styles/colors';

export default function StartupScreen() {
  const pulse = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    floatAnimation.start();

    return () => {
      pulseAnimation.stop();
      floatAnimation.stop();
    };
  }, [float, pulse]);

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.55],
  });

  const logoTranslateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <LinearGradient colors={['#0b1420', '#0f2236', '#08101a']} style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.logoShell,
              {
                transform: [{ translateY: logoTranslateY }],
              },
            ]}
          >
            <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          <Text style={styles.brand}>UIS</Text>
          <Text style={styles.title}>Sistema Escolar</Text>
          <Text style={styles.subtitle}>Bienvenido</Text>

          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <Text style={styles.footer}>Preparando tu sesión...</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  orbTop: {
    position: 'absolute',
    top: -90,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: colors.accent,
    opacity: 0.16,
  },
  orbBottom: {
    position: 'absolute',
    left: -80,
    bottom: -110,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: '#1d8bff',
    opacity: 0.14,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.accent,
  },
  logoShell: {
    width: 164,
    height: 164,
    borderRadius: 40,
    backgroundColor: 'rgba(12, 25, 38, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
    marginBottom: 24,
  },
  logo: {
    width: 132,
    height: 132,
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 6,
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: 14,
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 28,
  },
  footer: {
    color: colors.textPlaceholder,
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 0.4,
  },
});