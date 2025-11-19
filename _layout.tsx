// app/_layout.tsx
// @ts-nocheck
import { Stack } from 'expo-router'; // sayfalar arası navigasyon için Stack kullanıyoruz
import React, { useEffect } from 'react';
import { initDb } from '../db'; // veritabanı bağlantısı ve tabloların oluşturulması

export default function RootLayout() {
  // App açıldığında veritabanını başlatır
  useEffect(() => {
    initDb(); // app açılırken tabloları oluşturur
  }, []);

  return (
    // Stack navigator ile uygulamadaki sayfaları yönetiyoruz
    <Stack screenOptions={{ headerShown: false }}> 
      {/* Uygulamadaki tüm ekranlar burada tanımlanıyor */}
      <Stack.Screen name="index" /> {/* Ana giriş sayfası */}
      <Stack.Screen name="personal-info" /> {/* Kullanıcı kişisel bilgileri */}
      <Stack.Screen name="permissions" /> {/* Kamera ve dosya izinleri */}
      <Stack.Screen name="how-to-shoot" /> {/* Fotoğraf nasıl çekilir anlatımı */}
      <Stack.Screen name="capture-flow" /> {/* Fotoğraf çekim akışı */}
      <Stack.Screen name="photo-preview" /> {/* Çekilen fotoğrafların önizlemesi */}
      <Stack.Screen name="uploading" /> {/* Fotoğrafların yüklenmesi */}
      <Stack.Screen name="doctor-contact" /> {/* Doktor ile iletişim ekranı */}
      <Stack.Screen name="journey" /> {/* Yolculuk takibi sayfası */}
      <Stack.Screen name="profile-settings" /> {/* Kullanıcı ayarları */}
    </Stack>
  );
}
