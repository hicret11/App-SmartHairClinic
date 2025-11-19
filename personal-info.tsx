// app/personal-info.tsx
// @ts-nocheck
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons'; // 👈 Google ikonu için
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const HEADER_NAVY = '#071B33';
const WARM_BACKGROUND = '#FFF4EE'; // hafif somon
const INPUT_BG = '#FFFFFF';
const BORDER = '#E5D5CF';

export default function PersonalInfoScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [phone, setPhone] = useState('');

  const canContinue = name && mail && phone;

  const handleNext = async () => {
  if (!canContinue) return;

  // Kullanıcı bilgilerini kaydet
  try {
    await AsyncStorage.multiSet([
      ['userName', name],
      ['userEmail', mail],
      ['userPhone', phone],
    ]);
  } catch (e) {
    console.log('Kullanıcı bilgileri kaydedilemedi', e);
  }

  router.push('/permissions');
};


  const handleGooglePress = () => {
    Alert.alert('Bilgi', 'Google ile giriş özelliği yakında eklenecek.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Üst lacivert alan */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bilgilerinizi Giriniz</Text>
        <Text style={styles.headerSubtitle}>
          Giriş yapmak için bilgilerinizi girin.
        </Text>
      </View>

      {/* Alt kısım (somon zemin + form) */}
      <View style={styles.bodyWrapper}>
        <ScrollView contentContainerStyle={styles.bodyContent}>
          {/* Ad Soyad */}
          <View style={styles.field}>
            <Text style={styles.label}>Adınız Soyadınız</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınız ve soyadınızı giriniz"
              placeholderTextColor="#B0B5C0"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* E-posta */}
          <View style={styles.field}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor="#B0B5C0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={mail}
              onChangeText={setMail}
            />
          </View>

          {/* Telefon */}
          <View style={styles.field}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              placeholder="0555 123 45 67"
              placeholderTextColor="#B0B5C0"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Giriş yap butonu */}
          <TouchableOpacity
            style={[styles.button, !canContinue && styles.buttonDisabled]}
            disabled={!canContinue}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>

          {/* --- Alternatif giriş seçenekleri --- */}

          {/* veya ayırıcı */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>veya</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google ile devam et butonu + ikon */}
          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.8}
            onPress={handleGooglePress}
          >
            <View style={styles.googleButtonContent}>
              <AntDesign
                name="google"
                size={18}
                color="#DB4437" // Google kırmızısı
                style={{ marginRight: 8 }}
              />
              <Text style={styles.googleButtonText}>Google ile devam et</Text>
            </View>
          </TouchableOpacity>

          {/* Hesap oluştur metni - sadece dursun */}
          <View style={styles.bottomTextRow}>
            <Text style={styles.bottomText}>Hesabın yok mu? </Text>
            <Text style={styles.bottomTextLink}>Hesap oluştur</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ---- STYLES ----
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: HEADER_NAVY,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 56,        // ⬆ lacivert alan biraz büyüdü
    backgroundColor: HEADER_NAVY,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  headerSubtitle: {
    color: '#D6E0F0',
    fontSize: 14,
  },
  bodyWrapper: {
    flex: 1,
    backgroundColor: WARM_BACKGROUND,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    marginTop: -20,          // daha az yukarı çıksın, içerik aşağı insin
    overflow: 'hidden',
  },
  bodyContent: {
    paddingHorizontal: 24,
    paddingTop: 36,          // form biraz daha aşağıdan başlasın
    paddingBottom: 40,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#3A3F4A',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: INPUT_BG,
  },
  button: {
    marginTop: 28,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEADER_NAVY,
  },
  buttonDisabled: {
    backgroundColor: '#C9CED6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // alternatif giriş
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0D2CB',
  },
  orText: {
    marginHorizontal: 12,
    color: '#8B8F98',
    fontSize: 13,
    fontWeight: '500',
  },
  googleButton: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D6D9E0',
    backgroundColor: '#FFFFFF',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C4048',
  },
  bottomTextRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  bottomText: {
    fontSize: 13,
    color: '#7A7F88',
  },
  bottomTextLink: {
    fontSize: 13,
    color: HEADER_NAVY,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
