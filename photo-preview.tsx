// app/photo-preview.tsx
// @ts-nocheck
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const HEADER_NAVY = '#0B1E39';
const BG_SALMON = '#FCEBE4';
const ACCENT_ORANGE = '#FF7A00';

export default function PhotoPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const photos = JSON.parse(params.photos || '[]');

  const TITLES = ['1. Tam Yüz', '2. Sağ 45°', '3. Sol 45°', '4. Tepe', '5. Ense'];

  const handleRetake = (index) => {
    router.push({
      pathname: '/capture-flow',
      params: {
        retakeIndex: index,
        existingPhotos: JSON.stringify(photos),
      },
    });
  };

  const handleConfirm = () => {
    router.replace('/uploading');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Fotoğraf Önizleme</Text>
      <Text style={styles.subtitle}>
        Çekilen fotoğrafları kontrol edin. Eksik veya hatalı olanları yeniden çekebilirsiniz.
      </Text>

      <View style={styles.grid}>
        {photos.map((uri, i) => (
          <View key={i} style={styles.card}>
            {uri ? (
              <Image source={{ uri }} style={styles.image} />
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Fotoğraf Yok</Text>
              </View>
            )}

            <Text style={styles.cardTitle}>{TITLES[i]}</Text>

            <View style={styles.bottomRow}>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => handleRetake(i)}
              >
                <Text style={styles.retakeText}>Tekrar Çek</Text>
              </TouchableOpacity>

              {uri ? (
                <View style={styles.tickCircle}>
                  <Text style={styles.tick}>✓</Text>
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Fotoğrafları Onayla ve Gönder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---- STYLES ----
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: BG_SALMON, // somon arka plan
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    color: HEADER_NAVY,
  },
  subtitle: {
    color: '#6C757D',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 130,
    borderRadius: 12,
  },
  emptyBox: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ADB5BD',
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
    color: HEADER_NAVY,
  },
  bottomRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Tüm butonlar lacivert
  retakeButton: {
    backgroundColor: HEADER_NAVY,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  retakeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Turuncu tik kutusu
  tickCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ACCENT_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tick: {
    color: '#FFF',
    fontWeight: '700',
  },

  // Onayla butonu: yukarıda ve lacivert
  confirmButton: {
    marginTop: 16,
    marginBottom: 32, // ekran dibinden uzaklaştır
    backgroundColor: HEADER_NAVY,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
