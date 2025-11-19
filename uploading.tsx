// app/uploading.tsx
// @ts-nocheck
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const HEADER_NAVY = '#0B1E39';
const BG_SALMON = '#FCEBE4';

// Çekim istatistiklerini güncelleyen fonksiyon
async function updateShotStats() {
  try {
    const currentTotalStr = await AsyncStorage.getItem('totalShots');
    const currentTotal = currentTotalStr ? parseInt(currentTotalStr, 10) : 0;
    const nextTotal = (isNaN(currentTotal) ? 0 : currentTotal) + 1;

    await AsyncStorage.multiSet([
      ['totalShots', String(nextTotal)],
      ['lastShotDate', new Date().toISOString()],
      // Doktor henüz yoksa '-' kalsın; sonra atandığında güncellersin
    ]);
  } catch (e) {
    console.log('Çekim istatistikleri güncellenemedi', e);
  }
}

export default function UploadingScreen() {
  const [progress, setProgress] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  // Dönen halka animasyonu (yükleme bitene kadar)
  useEffect(() => {
    let loop;
    if (spinning) {
      loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    }
    return () => loop?.stop();
  }, [spinning]);

  // Yükleme simülasyonu
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(id);
          setSpinning(false); // 100% olduğunda dönmeyi durdur
          return 100;
        }
        return prev + 4;
      });
    }, 180);
    return () => clearInterval(id);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Devam Et'e basılınca: önce istatistikleri güncelle, sonra doktor ekrana git
  const goNext = async () => {
    await updateShotStats();
    router.replace('/doctor-contact');
  };

  return (
    <View style={styles.screen}>
      {/* Üst lacivert alan */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Smile Hair Clinic</Text>
          <TouchableOpacity
            onPress={() => router.push('/profile-settings')}
            style={styles.settingsIcon}
          >
            <Text style={{ fontSize: 22, color: '#FFF' }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Somon içerik */}
      <View style={styles.container}>
        {/* Dönen halka */}
        <Animated.View
          style={[
            styles.circleOuter,
            {
              transform: spinning ? [{ rotate: spin }] : [],
              // 100% olunca tüm halka lacivert
              borderColor: progress >= 100 ? HEADER_NAVY : '#0B1E391A',
              borderTopColor: HEADER_NAVY,
            },
          ]}
        >
          <View
            style={[
              styles.circleInner,
              { backgroundColor: progress >= 100 ? HEADER_NAVY : '#FF7A00' },
            ]}
          />
        </Animated.View>

        <Text style={styles.title}>Fotoğraflar Gönderiliyor</Text>
        <Text style={styles.subtitle}>
          {progress >= 100 ? 'Yükleme Tamamlandı' : 'Şifreleniyor...'}
        </Text>

        {/* İlerleme çubuğu */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.percentText}>{progress}%</Text>

        {/* 🔒 Küçük gri bilgi satırı (arka plan yok) */}
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoText}>Görüntüler şifrelenerek gönderiliyor</Text>
        </View>

        {/* Alttaki butonu aşağı itmek için otomatik boşluk */}
        <View style={{ flex: 1 }} />

        {/* Yükleme tamamlanınca buton */}
        {progress >= 100 && (
          <TouchableOpacity style={styles.primaryButton} onPress={goNext}>
            <Text style={styles.primaryButtonText}>Devam Et</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ---- STYLES ----
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: HEADER_NAVY,
  },

  headerWrapper: {
    backgroundColor: HEADER_NAVY,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  settingsIcon: { padding: 4 },

  container: {
    flex: 1,
    backgroundColor: BG_SALMON,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
    marginTop: 12,
  },

  // Halka
  circleOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 8,
    borderColor: '#0B1E391A',
    borderTopColor: HEADER_NAVY,
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  circleInner: {
    flex: 1,
    margin: 10,
    borderRadius: 38,
    backgroundColor: '#FF7A00',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    color: HEADER_NAVY,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6C757D',
    marginBottom: 20,
  },

  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E9ECEF',
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: 5,
    backgroundColor: HEADER_NAVY,
  },
  percentText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    color: '#6C757D',
    fontWeight: '600',
  },

  // Küçük gri bilgi satırı
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoIcon: { fontSize: 16, marginRight: 4 },
  infoText: { color: '#6C757D', fontSize: 14, fontWeight: '500' },

  // Devam Et butonu (ekranın altına daha yakın)
  primaryButton: {
    marginTop: 'auto',
    marginBottom: 28,
    backgroundColor: HEADER_NAVY,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
