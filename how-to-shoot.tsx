// app/how-to-shoot.tsx
// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const HEADER_NAVY = '#071B33';
const WARM_BACKGROUND = '#FFF4EE';
const ORANGE = '#FF9762';

// 🔹 Lokal videolar
const GENERAL_VIDEO = require('../assets/video/genelcekim.mp4');
const NECK_VIDEO = require('../assets/video/ensecekim.mp4');

type ActiveVideo = 'general' | 'neck' | null;

export default function HowToShootScreen() {
  const router = useRouter();

  const videoRef = useRef<Video | null>(null);
  const [activeVideo, setActiveVideo] = useState<ActiveVideo>(null);

  const openVideo = (which: ActiveVideo) => {
    setActiveVideo(which);
  };

  const closeVideo = async () => {
    try {
      if (videoRef.current) {
        const status = await videoRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await videoRef.current.pauseAsync();
        }
      }
    } catch (e) {
      console.log('video stop error', e);
    }
    setActiveVideo(null);
  };

  const getSource = () => {
    if (activeVideo === 'general') return GENERAL_VIDEO;
    if (activeVideo === 'neck') return NECK_VIDEO;
    return null;
  };

  const getCaption = () => {
    if (activeVideo === 'general')
      return 'Genel çekim videosu – 5 açıyı doğru şekilde nasıl hizalayacağınızı gösterir.';
    if (activeVideo === 'neck')
      return 'Ense çekimi videosu – donör bölgesini tek başınıza nasıl çekeceğinizi anlatır.';
    return '';
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ÜST LACİVERT ARKA PLAN + HEADER */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Smile Hair Clinic</Text>

          <TouchableOpacity onPress={() => router.push('/profile-settings')}>
            <Ionicons name="settings-outline" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SOMON OVAL ANA YÜZEY */}
      <View style={styles.mainSurface}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Nasıl Çekim Yapılır?</Text>
          <Text style={styles.subtitle}>
            Doğru fotoğraflar için bu kısa yönergeleri izleyin.
          </Text>

          {/* 1) GENEL ÇEKİM KARTI */}
          <Text style={styles.sectionLabel}>1. Genel çekim videosu</Text>
          <TouchableOpacity
            style={styles.videoBox}
            activeOpacity={0.8}
            onPress={() => openVideo('general')}
          >
            <View style={styles.playCircle}>
              <Ionicons name="play" size={30} color={HEADER_NAVY} />
            </View>
            <Text style={styles.videoBoxText}>İzlemek için dokunun</Text>
          </TouchableOpacity>

          {/* 2) ENSE ÇEKİMİ KARTI */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
            2. Ense çekimi videosu
          </Text>
          <TouchableOpacity
            style={styles.videoBox}
            activeOpacity={0.8}
            onPress={() => openVideo('neck')}
          >
            <View style={styles.playCircle}>
              <Ionicons name="play" size={30} color={HEADER_NAVY} />
            </View>
            <Text style={styles.videoBoxText}>İzlemek için dokunun</Text>
          </TouchableOpacity>

          {/* İPUÇLARI */}
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipText}>İyi aydınlatılmış bir ortamda çekim yap.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>📱</Text>
            <Text style={styles.tipText}>Telefonu sabit tut, titremeyi azalt.</Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>🙂</Text>
            <Text style={styles.tipText}>
              Yüzünü veya başını ekrandaki şablona hizalamaya çalış.
            </Text>
          </View>

          {/* Alt butonlar */}
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => openVideo('general')}
            >
              <Text style={styles.secondaryButtonText}>Tekrar İzle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/capture-flow')}
            >
              <Text style={styles.primaryButtonText}>Devam Et</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* 🔹 TAM EKRAN VİDEO OYNATICI */}
      {activeVideo && (
        <View style={styles.playerOverlay}>
          <View style={styles.playerHeader}>
            <Text style={styles.playerTitle}>
              {activeVideo === 'general'
                ? 'Genel çekim videosu'
                : 'Ense çekimi videosu'}
            </Text>
            <TouchableOpacity onPress={closeVideo}>
              <Ionicons name="close" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.playerCenter}>
            <Video
              key={activeVideo} // video değişince yeniden yaratılsın
              ref={videoRef}
              source={getSource()}
              style={styles.playerVideo}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay
              isLooping
            />
          </View>

          <Text style={styles.playerCaption}>{getCaption()}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: HEADER_NAVY,
  },
  // üst lacivert alan
  headerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // somon yüzey (üstü oval)
  mainSurface: {
    flex: 1,
    backgroundColor: WARM_BACKGROUND,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 24,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: HEADER_NAVY,
  },
  subtitle: {
    color: '#6C757D',
    marginBottom: 24,
    lineHeight: 20,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: HEADER_NAVY,
    marginBottom: 8,
  },

  // Turuncu kart
  videoBox: {
    height: 190,
    borderRadius: 24,
    backgroundColor: ORANGE,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFFDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  videoBoxText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

 tipCard: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 14,
  borderRadius: 16,
  backgroundColor: '#FFFFFF',
  
  // 🔹 Mesafe ayarları
  marginTop: 14,        // TURUNCU KART → BEYAZ KART boşluğu
  marginBottom: 14,     // BEYAZ KARTLAR arası boşluk

  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
},

  tipEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    color: '#212529',
  },

  bottomRow: {
    flexDirection: 'row',
    marginTop: 30,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HEADER_NAVY,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: HEADER_NAVY,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: HEADER_NAVY,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },

  // Tam ekran video overlay
  playerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 24,
    justifyContent: 'flex-start',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  playerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // dikey uzun video
  playerVideo: {
    width: '90%',
    aspectRatio: 9 / 16, // dikey
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  playerCaption: {
    marginTop: 16,
    color: '#ECECEC',
    textAlign: 'center',
    fontSize: 13,
  },
});
