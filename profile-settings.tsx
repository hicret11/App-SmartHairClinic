// app/profile-settings.tsx
// @ts-nocheck
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
const BG_SALMON = '#FCEBE4';
const CARD_BG = '#FFFFFF';
const PRIMARY = HEADER_NAVY;

function formatDate(dateString: string | null) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString; // zaten formatlıysa
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [name, setName] = useState('-');
  const [email, setEmail] = useState('-');
  const [phone, setPhone] = useState('-');

  const [totalShots, setTotalShots] = useState(0);
  const [lastShotDate, setLastShotDate] = useState<string | null>(null);
  const [assignedDoctor, setAssignedDoctor] = useState('-');

  // Randevu bilgileri
  const [appointmentDate, setAppointmentDate] = useState<string | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<string | null>(null);
  const [appointmentDoctor, setAppointmentDoctor] = useState('-');

  // AsyncStorage'dan bilgileri çek
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          storedName,
          storedEmail,
          storedPhone,
          storedTotalShots,
          storedLastShotDate,
          storedDoctor,
          storedApptDate,
          storedApptTime,
          storedApptDoctor,
        ] = await Promise.all([
          AsyncStorage.getItem('userName'),
          AsyncStorage.getItem('userEmail'),
          AsyncStorage.getItem('userPhone'),
          AsyncStorage.getItem('totalShots'),
          AsyncStorage.getItem('lastShotDate'),
          AsyncStorage.getItem('assignedDoctor'),
          AsyncStorage.getItem('appointmentDate'),
          AsyncStorage.getItem('appointmentTime'),
          AsyncStorage.getItem('appointmentDoctor'),
        ]);

        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
        if (storedPhone) setPhone(storedPhone);

        if (storedTotalShots) {
          const num = parseInt(storedTotalShots, 10);
          setTotalShots(isNaN(num) ? 0 : num);
        }

        if (storedLastShotDate) setLastShotDate(storedLastShotDate);
        if (storedDoctor) setAssignedDoctor(storedDoctor);

        if (storedApptDate) setAppointmentDate(storedApptDate);
        if (storedApptTime) setAppointmentTime(storedApptTime);
        if (storedApptDoctor) setAppointmentDoctor(storedApptDoctor);
      } catch (e) {
        console.log('Profil verileri okunamadı', e);
      }
    };

    loadData();
  }, []);

  const upcomingText =
    appointmentDate || appointmentTime
      ? `${formatDate(appointmentDate)} ${appointmentTime || ''}`.trim()
      : '-';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Üst lacivert header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil ve Ayarlar</Text>
      </View>

      {/* Alt gövde (somon) */}
      <View style={styles.bodyWrapper}>
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Kişisel Bilgiler */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kişisel Bilgiler</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Ad Soyad</Text>
              <Text style={styles.value}>{name}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>E-posta</Text>
              <Text style={styles.value}>{email || '-'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Telefon</Text>
              <Text style={styles.value}>{phone || '-'}</Text>
            </View>
          </View>

          {/* Çekim Geçmişi */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Çekim Geçmişi</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Toplam Çekim</Text>
              <Text style={styles.value}>{totalShots}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Son Çekim</Text>
              <Text style={[styles.value, styles.highlight]}>
                {formatDate(lastShotDate)}
              </Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Atanan Doktor</Text>
              <Text style={styles.value}>{assignedDoctor}</Text>
            </View>
          </View>

          {/* RANDEVULARIM */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Randevularım</Text>

            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/doctor-contact')}
            >
              <Text style={styles.label}>Yaklaşan Randevu</Text>
              <Text style={[styles.value, styles.highlight]}>{upcomingText}</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Doktor</Text>
              <Text style={styles.value}>{appointmentDoctor}</Text>
            </View>
          </View>

          {/* Uygulama Ayarları */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Uygulama Ayarları</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Sesli Yönergeler</Text>
              <Switch
                value={voiceEnabled}
                onValueChange={setVoiceEnabled}
                trackColor={{ false: '#E5E5EA', true: '#A5B3C7' }}
                thumbColor={voiceEnabled ? PRIMARY : '#F4F4F4'}
              />
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Bildirimler</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E5EA', true: '#A5B3C7' }}
                thumbColor={notificationsEnabled ? PRIMARY : '#F4F4F4'}
              />
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Dil</Text>
              <Text style={styles.value}>Türkçe</Text>
            </View>
          </View>

          {/* Gizlilik */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gizlilik</Text>

            <TouchableOpacity style={styles.row}>
              <Text style={styles.label}>Gizlilik Politikası</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.row}>
              <Text style={styles.label}>Veri Silme Talebi</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: HEADER_NAVY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: HEADER_NAVY,
  },
  backIconButton: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  bodyWrapper: {
    flex: 1,
    backgroundColor: BG_SALMON,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -8,
    paddingTop: 16,
  },
  bodyScroll: {
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    backgroundColor: CARD_BG,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: '#495057',
    fontSize: 14,
  },
  value: {
    color: '#212529',
    fontWeight: '500',
    fontSize: 14,
  },
  highlight: {
    color: PRIMARY,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  chevron: {
    fontSize: 18,
    color: '#868E96',
  },
});
