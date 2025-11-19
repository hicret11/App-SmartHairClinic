// app/permissions.tsx
// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const HEADER_NAVY = '#071B33';
const WARM_BACKGROUND = '#FFF4EE';
const CARD_BG = '#FFFFFF';

export default function PermissionsScreen() {
  const router = useRouter();
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [micAllowed, setMicAllowed] = useState(false);
  const [fileAllowed, setFileAllowed] = useState(false);
  const [kvkkChecked, setKvkkChecked] = useState(false);

  const canContinue = cameraAllowed && micAllowed && fileAllowed && kvkkChecked;

  const PermissionCard = ({ title, desc, value, onPress }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <TouchableOpacity
        style={[styles.cardButton, value && styles.cardButtonActive]}
        onPress={onPress}
      >
        <Text style={styles.cardButtonText}>
          {value ? 'Verildi' : 'İzin Ver'}
        </Text>
      </TouchableOpacity>
    </View>
  );

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

      {/* SOMON OVAL ALAN (PERSONAL-INFO GİBİ) */}
      <View style={styles.mainSurface}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>İzinler ve Onaylar</Text>
          <Text style={styles.subtitle}>
            Uygulamanın çalışması için aşağıdaki izinlere ihtiyacımız var.
          </Text>

          <PermissionCard
            title="Kamera Erişimi"
            desc="Saç fotoğraflarınızı çekmek için gerekli"
            value={cameraAllowed}
            onPress={() => setCameraAllowed(true)}
          />
          <PermissionCard
            title="Mikrofon Erişimi"
            desc="Sesli mesaj göndermek için gerekli"
            value={micAllowed}
            onPress={() => setMicAllowed(true)}
          />
          <PermissionCard
            title="Dosya Erişimi"
            desc="Fotoğraf yüklemek için gerekli"
            value={fileAllowed}
            onPress={() => setFileAllowed(true)}
          />

          <View style={styles.kvkkRow}>
            <Switch value={kvkkChecked} onValueChange={setKvkkChecked} />
            <Text style={styles.kvkkText}>
              KVKK Onayı: Kişisel verilerimin saç analizi amacıyla
              işlenmesine, saklanmasına ve doktorlarla paylaşılmasına
              onay veriyorum.
            </Text>
          </View>

          <View style={styles.bottomArea}>
            <TouchableOpacity
              style={[
                styles.mainButton,
                !canContinue && styles.mainButtonDisabled,
              ]}
              disabled={!canContinue}
              onPress={() => router.push('/how-to-shoot')}
            >
              <Text style={styles.mainButtonText}>
                İzinleri Onayla ve Devam Et
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: HEADER_NAVY, // arkada lacivert dursun
  },

  // üst lacivert alan – sadece header
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

  // somon ana yüzey – ÜSTÜ OVAL
  mainSurface: {
    flex: 1,
    backgroundColor: WARM_BACKGROUND,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 24,      // içerik biraz aşağıdan başlasın
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: HEADER_NAVY,
  },
  subtitle: {
    color: '#6C757D',
    marginBottom: 32,
    lineHeight: 20,
  },

  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 4,
    color: '#212529',
  },
  cardDesc: {
    color: '#6C757D',
    maxWidth: 220,
    lineHeight: 18,
  },
  cardButton: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#E0E7FF',
  },
  cardButtonActive: {
    backgroundColor: HEADER_NAVY,
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  kvkkRow: {
    flexDirection: 'row',
    marginTop: 32,
    marginBottom: 52,
    alignItems: 'flex-start',
  },
  kvkkText: {
    flex: 1,
    marginLeft: 10,
    color: '#6C757D',
    fontSize: 13.5,
    lineHeight: 18,
  },

  bottomArea: {
    paddingBottom: 70,
  },
  mainButton: {
    backgroundColor: HEADER_NAVY,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonDisabled: {
    backgroundColor: '#C9CED6',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
