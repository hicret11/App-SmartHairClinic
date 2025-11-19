// app/index.tsx
// @ts-nocheck
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BRAND_NAVY = '#071B33';
const BRAND_ORANGE = '#FF6B2C';
const WARM_BACKGROUND = '#FFF4EE'; // somon
// buton için artık lacivert kullanacağız

export default function WelcomeScreen() {
  const router = useRouter();
  const [language, setLanguage] = React.useState<'tr' | 'en'>('tr');

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.06,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleStart = () => {
    router.push('/personal-info');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_NAVY} />
      <View style={styles.container}>
        {/* Üst lacivert alan + logo */}
        <View style={styles.header}>
          <Animated.View style={[styles.logoWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <Image
              source={require('../assets/images/smile-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Orta içerik */}
        <View style={styles.content}>
          <View style={styles.languagePill}>
            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'tr' && styles.languageOptionActive,
              ]}
              onPress={() => setLanguage('tr')}
            >
              <Text
                style={[
                  styles.languageText,
                  language === 'tr' && styles.languageTextActive,
                ]}
              >
                TR Türkçe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'en' && styles.languageOptionActive,
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={[
                  styles.languageText,
                  language === 'en' && styles.languageTextActive,
                ]}
              >
                US English
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.appName}>
              <Text style={styles.appNameBold}>Smile Hair </Text>
              <Text style={styles.appNameAccent}>Clinic</Text>
            </Text>
            <Text style={styles.tagline}>
              Gülümseyin, Saçlarınız Güvende!
            </Text>
          </View>
        </View>

        {/* Alt CTA butonu */}
        <View style={styles.bottom}>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startText}>Başla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---- STYLES ----
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: WARM_BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: WARM_BACKGROUND,
  },
  header: {
    height: 260,
    backgroundColor: BRAND_NAVY,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: '#0E2745',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 90,
    height: 90,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  languagePill: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    padding: 4,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  languageOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageOptionActive: {
    backgroundColor: BRAND_NAVY, // aktif dil butonu da lacivert
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
  languageTextActive: {
    color: '#FFFFFF',
  },
  titleBlock: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 26,
    marginBottom: 6,
  },
  appNameBold: {
    fontWeight: '700',
    color: BRAND_NAVY,
  },
  appNameAccent: {
    fontWeight: '700',
    color: BRAND_ORANGE,
  },
  tagline: {
    color: '#6C757D',
    fontSize: 14,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 56, // tuşlardan yukarıda dursun
  },
  startButton: {
    backgroundColor: BRAND_NAVY, // 🔵 lacivert
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
