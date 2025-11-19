// app/doctor-contact.tsx
// @ts-nocheck
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppHeader from '../components/AppHeader';

// 🔹 DB'den SON çekim setini okumak için
import { getLastCaptureSetPhotos } from '../db';

const HEADER_NAVY = '#0B1E39';
const BG_SALMON = '#FCEBE4';

// Foto etiketleri (pozisyona göre 0–4)
const ANGLE_LABELS = ['Tam yüz', 'Sağ 45°', 'Sol 45°', 'Tepe', 'Ense'];

// 🔹 Sekmeler
const tabs = ['Canlı Sohbet', 'Randevu İste', 'Sonuç', 'SSS'];

const DOCTORS = [
  {
    id: 'gokay',
    name: 'Dr. Gökay Bilgin',
    shortBullets: [
      'Smile Hair Clinic kurucu ortağı',
      '4000+ saç ekimi',
      'Mikromotor & Safir FUE',
    ],
    fullText:
      '• Smile Hair Clinic’in kurucu ortağıdır.\n• Medical Park ve Medicana sağlık gruplarında görev yapmıştır.\n• 4000’den fazla saç ekimi operasyonu gerçekleştirmiştir.\n• Mikromotor greft ekstraksiyonu ve Safir FUE tekniğinde uzmandır.\n• True™ Philosophy yaklaşımının geliştiricisidir.',
  },
  {
    id: 'mehmet',
    name: 'Dr. Mehmet Erdoğan',
    shortBullets: [
      'Kurucu ortak',
      '4000+ saç ekimi',
      'Estetik planlama odaklı',
    ],
    fullText:
      '• Smile Hair Clinic’in diğer kurucu ortağıdır.\n• Acıbadem ve Medicana sağlık gruplarında çalışmıştır.\n• 4000’den fazla saç ekimi operasyonu yapmıştır.\n• Mikromotor Greft ve Safir FUE tekniklerini uygular.\n• Planlama ve estetik tasarıma özel önem verir.',
  },
  {
    id: 'firdavs',
    name: 'Dr. Firdavs Ahmedov',
    shortBullets: [
      '3500+ saç ekimi',
      'FUE & DHI uzmanı',
      'Uluslararası deneyim',
    ],
    fullText:
      '• Smile Hair Clinic’te saç ekimi cerrahıdır.\n• Ege Üniversitesi onur derecesi ile mezundur.\n• ABD Mount Sinai dahil uluslararası klinik deneyime sahiptir.\n• 3500’den fazla saç ekimi operasyonu gerçekleştirmiştir.\n• FUE, DHI ve revizyon saç ekimi konusunda uzmandır.',
  },
  {
    id: 'ali',
    name: 'Dr. Ali Osman Soluk',
    shortBullets: [
      'İstanbul Tıp mezunu',
      'Sağlık yönetimi yüksek lisans',
      'Saç ekimi & ozon tedavisi',
    ],
    fullText:
      '• İstanbul Tıp Fakültesi mezunudur.\n• İBB ve İSPER’de sağlık yönetimi alanında deneyim kazanmıştır.\n• Hastane ve Sağlık Kurumları Yönetimi yüksek lisansına sahiptir.\n• Saç ekimi ve ozon tedavisi alanlarında eğitimler almıştır.\n• Uluslararası sağlık turizmi fuarlarına ve toplantılara katılmıştır.',
  },
  {
    id: 'resat',
    name: 'Dr. M. Reşat Arpacı',
    shortBullets: [
      '2006’dan beri FUE uzmanı',
      'Biofibre sertifikalı',
      'FUE mikromotor patenti',
    ],
    fullText:
      '• Kariyerine Sakarya’da acil servis hekimi olarak başlamıştır.\n• Zamanla saç ekimine yönelmiş, Türkiye ve yurt dışında eğitimler almıştır.\n• Biofibre sentetik saç ekimi sertifikasına sahiptir.\n• 2006’dan beri FUE tekniğinde çalışmaktadır.\n• FUE mikromotor tekniğini geliştirip patent almıştır.\n• 2010’dan beri İstanbul’da saç ekimi merkezlerinde görev almış, 2025 itibarıyla Smile Hair Clinic ekibine katılmıştır.',
  },
];

// Tedaviler listesi (chat cevabı için)
const TREATMENTS_TEXT =
  'Size özel planlanabilecek tedavilerimizden bazıları:\n' +
  '• Saç Ekimi\n' +
  '• Sakal Ekimi\n' +
  '• Kaş Ekimi\n' +
  '• Kadın Saç Ekimi\n' +
  '• Afro Saç Ekimi\n' +
  '• Bıyık Ekimi\n' +
  '• Favori Ekimi\n' +
  '• Mezoterapi';

export default function DoctorContactScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  // CHAT STATE
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      from: 'bot',
      text: 'Merhaba! Fotoğraflarınız başarıyla alındı. Size nasıl yardımcı olabilirim?',
      time: '14:32',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showDoctorCards, setShowDoctorCards] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  // APPOINTMENT STATE
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showApptSuccess, setShowApptSuccess] = useState(false);

  const timeSlots = ['09:00 - 10:00', '10:00 - 11:00', '13:00 - 14:00', '15:00 - 16:00'];

  // 🔹 SONUÇ SEK MESİ İÇİN STATE
  const [resultPhotos, setResultPhotos] = useState<(string | null)[]>(
    Array(5).fill(null),
  );
  const [resultDate, setResultDate] = useState<string | null>(null);

  // 🔹 Jüri için SQLite debug metni
  const [dbDebugText, setDbDebugText] = useState('');
  const [showDbDebug, setShowDbDebug] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  // DB'den en son çekilen 5'li seti oku
  async function loadLastResultSet() {
    try {
      const data = await getLastCaptureSetPhotos();

      if (!data) {
        setResultPhotos(Array(5).fill(null));
        setResultDate(null);
        setDbDebugText('');
        return;
      }

      setResultPhotos(data.photos);

      const d = new Date(data.created_at);
      const formatted = d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      setResultDate(formatted);

      // 🔹 SQLite içeriğini jürilik string'e çevir
      const lines = [
        'Bu bölüm sadece jüriye uygulamanın akışını anlatmak için eklenmiştir.',
        'Gerçek kullanıcı sürümünde gösterilmeyecektir.\n',
        `created_at (SQLite): ${data.created_at}`,
        '',
        'foto URI kayıtları:',
        ...data.photos.map((uri, idx) => `[${idx}] ${uri || '-'}`),
      ];
      setDbDebugText(lines.join('\n'));
    } catch (e) {
      console.log('Son çekim seti okunamadı', e);
    }
  }

  // Sekme "Sonuç" olduğunda her geçişte son seti yenile
  useEffect(() => {
    if (activeTab === 2) {
      loadLastResultSet();
    }
  }, [activeTab]);

  // QUICK REPLIES
  const quickReplies = [
    'Sonuçlarım nerede?',
    'Ne zaman hazır olur?',
    'Doktorlarımız',
    'Tedavilerimiz?',
  ];

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const handleQuickPress = (label: string) => {
    addMessage({
      id: Date.now().toString() + '_u',
      from: 'user',
      text: label,
      time: 'Şimdi',
    });

    if (label === 'Doktorlarımız') {
      setShowDoctorCards(true);
      addMessage({
        id: Date.now().toString() + '_b',
        from: 'bot',
        text: 'Doktorlarımızı aşağıdaki kartlardan inceleyebilir, tercih ettiğinizi bize yazabilirsiniz.',
        time: 'Şimdi',
      });
    } else if (label === 'Sonuçlarım nerede?') {
      setShowDoctorCards(false);
      addMessage({
        id: Date.now().toString() + '_b',
        from: 'bot',
        text:
          'Değerlendirme devam ediyor. Sonuçlar genellikle 24–48 saat içinde hazır olur. Hazır olduğunda "Sonuç" sekmesinden detaylı raporu görebilirsiniz.',
        time: 'Şimdi',
      });
    } else if (label === 'Ne zaman hazır olur?') {
      setShowDoctorCards(false);
      addMessage({
        id: Date.now().toString() + '_b',
        from: 'bot',
        text:
          'Genelde 24–48 saat içinde tamamlanır. Sonuçlar hazır olduğunda uygulama üzerinden bilgilendirme alırsınız.',
        time: 'Şimdi',
      });
    } else if (label === 'Tedavilerimiz?') {
      setShowDoctorCards(false);
      addMessage({
        id: Date.now().toString() + '_b',
        from: 'bot',
        text: TREATMENTS_TEXT,
        time: 'Şimdi',
      });
    }
  };

  // 💬 Serbest yazılan mesajları anlamlandıran mini bot
  const getBotReply = (text: string) => {
    const lower = text.toLowerCase();

    if (
      lower.includes('sonuç') ||
      lower.includes('sonucum') ||
      lower.includes('rapor') ||
      lower.includes('değerlendirme')
    ) {
      return 'Fotoğraflarınız doktorlarımız tarafından değerlendiriliyor. Hazır olduğunda "Sonuç" sekmesinde detaylı raporu görebilirsiniz.';
    }

    if (lower.includes('tedavilerim') || (lower.includes('tedavi') && lower.includes('hazır'))) {
      return TREATMENTS_TEXT;
    }

    if (lower.includes('randevu')) {
      return 'Randevu talebi için "Randevu İste" sekmesine geçerek doktor, tarih ve saat seçebilirsiniz.';
    }

    // Alakasız / tanınmayan sorular
    return 'Merhaba, sorunuzu biraz daha detaylandırabilir misiniz? Size en iyi nasıl yardımcı olabilirim?';
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Kullanıcı mesajı
    addMessage({
      id: Date.now().toString() + '_u',
      from: 'user',
      text: trimmed,
      time: 'Şimdi',
    });
    setInputValue('');
    setShowDoctorCards(false);

    // Bot cevabı
    const botText = getBotReply(trimmed);
    setTimeout(() => {
      addMessage({
        id: Date.now().toString() + '_b',
        from: 'bot',
        text: botText,
        time: 'Şimdi',
      });
    }, 400);
  };

  const handleAppointmentSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert('Eksik bilgi', 'Lütfen doktor, tarih ve saat seçin.');
      return;
    }

    try {
      await AsyncStorage.multiSet([
        ['appointmentDoctor', selectedDoctor],
        ['appointmentDate', selectedDate.toISOString()],
        ['appointmentTime', selectedTime],
      ]);
    } catch (e) {
      console.log('Randevu bilgileri kaydedilemedi', e);
    }

    setShowApptSuccess(true);
    setTimeout(() => {
      setShowApptSuccess(false);
    }, 3000);
  };

  // ---------- TABS ----------

  const renderChat = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.chatArea}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 80 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.chatBubbleRow,
                m.from === 'user' && { justifyContent: 'flex-end' },
              ]}
            >
              {m.from === 'bot' && <View style={styles.chatAvatar} />}

              <View
                style={[
                  styles.chatBubble,
                  m.from === 'user' && styles.chatBubbleUser,
                ]}
              >
                <Text
                  style={[
                    styles.chatText,
                    m.from === 'user' && styles.chatTextUser,
                  ]}
                >
                  {m.text}
                </Text>
                <Text style={styles.chatTime}>{m.time}</Text>
              </View>
            </View>
          ))}

          {showDoctorCards && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionLabel}>Doktorlarımız</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                {DOCTORS.map((doc) => (
                  <View key={doc.id} style={styles.doctorCard}>
                    <View style={styles.doctorAvatar}>
                      <Text style={styles.doctorAvatarText}>👤</Text>
                    </View>
                    <Text style={styles.doctorName}>{doc.name}</Text>
                    {doc.shortBullets.map((b, idx) => (
                      <Text key={idx} style={styles.doctorBullet}>
                        • {b}
                      </Text>
                    ))}

                    <TouchableOpacity
                      style={styles.doctorDetailButton}
                      onPress={() => {
                        Alert.alert(doc.name, doc.fullText);
                      }}
                    >
                      <Text style={styles.doctorDetailButtonText}>Detay</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        <View style={styles.quickRow}>
          {quickReplies.map((t) => (
            <TouchableOpacity
              key={t}
              style={styles.quickChip}
              onPress={() => handleQuickPress(t)}
            >
              <Text style={styles.quickChipText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.messageRow}>
          <TextInput
            placeholder="Mesajınızı yazın..."
            style={styles.messageInput}
            value={inputValue}
            onChangeText={setInputValue}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={{ color: '#FFF', fontSize: 18 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  const renderAppointment = () => {
    const filteredDoctors = DOCTORS.filter((doc) =>
      doc.name.toLowerCase().includes(doctorSearch.toLowerCase()),
    );

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexGrow: 1 }}>
          <Text style={styles.sectionTitle}>Randevu Talep Et</Text>
          <Text style={styles.sectionSubtitle}>Uygun bir tarih ve saat seçin.</Text>

          <Text style={styles.label}>Doktor</Text>
          <View>
            <TouchableOpacity
              style={styles.inputLike}
              onPress={() => setShowDoctorPicker((prev) => !prev)}
            >
              <Text style={selectedDoctor ? styles.inputText : styles.inputPlaceholder}>
                {selectedDoctor || 'Seçiniz'}
              </Text>
            </TouchableOpacity>

            {showDoctorPicker && (
              <View style={styles.doctorDropdown}>
                <TextInput
                  placeholder="Doktor ara..."
                  style={styles.doctorSearchInput}
                  value={doctorSearch}
                  onChangeText={setDoctorSearch}
                  autoFocus
                />
                <ScrollView
                  style={{ maxHeight: 260 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredDoctors.map((doc) => (
                    <TouchableOpacity
                      key={doc.id}
                      style={styles.simpleModalItem}
                      onPress={() => {
                        setSelectedDoctor(doc.name);
                        setShowDoctorPicker(false);
                        setDoctorSearch('');
                      }}
                    >
                      <Text style={{ color: HEADER_NAVY }}>{doc.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={[
                    styles.simpleModalItem,
                    { borderTopWidth: 1, borderTopColor: '#E9ECEF' },
                  ]}
                  onPress={() => {
                    setShowDoctorPicker(false);
                    setDoctorSearch('');
                  }}
                >
                  <Text style={{ color: '#868E96' }}>Vazgeç</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Tarih</Text>
          <TouchableOpacity
            style={styles.inputLike}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={selectedDate ? styles.inputText : styles.inputPlaceholder}>
              {selectedDate ? formatDate(selectedDate) : 'GG/AA/YYYY'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={selectedDate || new Date()}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}

          <Text style={[styles.label, { marginTop: 16 }]}>Saat</Text>
          <View style={styles.timeRow}>
            {timeSlots.map((slot) => {
              const active = slot === selectedTime;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeChip, active && styles.timeChipActive]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      active && { color: '#FFF', fontWeight: '600' },
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.appointmentButton}
          onPress={handleAppointmentSubmit}
        >
          <Text style={styles.appointmentButtonText}>Randevu Talep Gönder</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 🧾 SONUÇ SEKMESİ
  const renderResults = () => (
    <View style={{ flex: 1 }}>
      <Text style={styles.sectionTitle}>Doktor Değerlendirmesi</Text>
      <Text style={styles.sectionSubtitle}>
        Çektiğiniz son 5 fotoğraf doktorlarımıza iletildi. Aşağıda en son çekim setinizin
        örnek değerlendirme kartını görüyorsunuz.
      </Text>

      <View style={styles.resultsCard}>
        <Text style={styles.resultsTitle}>Doktor Değerlendirmesi</Text>
        <Text style={styles.resultsMeta}>
          {resultDate
            ? `📅 Tarih: ${resultDate}   •   👨‍⚕️ Dr. M. Reşat Arpacı değerlendirdi`
            : '📅 Henüz kayıtlı bir çekiminiz yok. 5 açıdan fotoğraf çektiğinizde burada görünecektir.'}
        </Text>

        <View style={styles.resultsPhotoRow}>
          {ANGLE_LABELS.map((label, index) => {
            const uri = resultPhotos[index];
            return (
              <View key={label} style={styles.resultsPhotoBox}>
                {uri ? (
                  <Image
                    source={{ uri }}
                    style={styles.resultsPhotoThumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.resultsPhotoThumb} />
                )}
                <Text style={styles.resultsPhotoLabel}>{label}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.resultsSubHeading}>📌 Genel Değerlendirme</Text>
        <Text style={styles.resultsText}>
          {'• Donör bölgesi: yeterli\n' +
            '• Açıklık seviyesi: A3 sınıfı\n' +
            '• Tahmini ekim alanı: 55–65 cm²'}
        </Text>

        <Text style={[styles.resultsSubHeading, { marginTop: 12 }]}>🩺 Tedavi Önerisi</Text>
        <Text style={styles.resultsText}>
          {'• 3000–3500 greft arası saç ekimi planlanabilir.\n' +
            '• Ön saç çizgisi doğal yoğunlukta tasarlanmalıdır.\n' +
            '• Operasyon öncesi kan tahlilleri ve mevcut hastalıklar mutlaka kontrol edilmelidir.'}
        </Text>

        <Text style={[styles.resultsSubHeading, { marginTop: 12 }]}>ℹ️ Not</Text>
        <Text style={styles.resultsText}>
          {'Bu ekran demo amaçlıdır. Gerçek tıbbi değerlendirme, fotoğraflarınız doktorlarımız tarafından incelendikten sonra burada kişisel olarak gösterilecektir.'}
        </Text>

        {/* 🔹 Geliştirici / Jüri için SQLite debug alanı */}
        {dbDebugText ? (
          <>
            <TouchableOpacity
              style={styles.debugToggle}
              onPress={() => setShowDbDebug((prev) => !prev)}
            >
              <Text style={styles.debugToggleText}>
                {showDbDebug
                  ? '🛈 Geliştirici / Jüri bölümü gizle'
                  : '🛈 Geliştirici / Jüri için SQLite kaydını göster'}
              </Text>
            </TouchableOpacity>

            {showDbDebug && (
              <View style={styles.dbDebugBox}>
                <Text style={styles.dbDebugTitle}>
                  🛠 Geliştirici – Sadece jüri için
                </Text>
                <Text style={styles.dbDebugInfo}>
                  Bu alan, sunum sırasında 5’li fotoğraf setinin SQLite veritabanına
                  nasıl kaydedildiğini göstermek için eklenmiştir. Gerçek kullanıcı
                  sürümünde gösterilmeyecektir.
                </Text>
                <Text style={styles.dbDebugText}>{dbDebugText}</Text>
              </View>
            )}
          </>
        ) : null}
      </View>
    </View>
  );

  const renderFaq = () => (
    <View>
      {[
        {
          q: '📸 Fotoğraflarım ne zaman değerlendirilir?',
          a: 'Genelde 24–48 saat içinde tamamlanır. Hazır olunca bildirim alırsınız.',
        },
        {
          q: '🔒 Verilerim güvende mi?',
          a: 'Evet. Verileriniz şifrelenir ve yalnızca yetkili hekimlerle paylaşılır.',
        },
        {
          q: '🆕 Yeni fotoğraf yükleyebilir miyim?',
          a: 'Evet. Uygulama içinden istediğiniz zaman yeni çekim yapabilirsiniz.',
        },
        {
          q: '💊 Antibiyotikli kremi ne kadar kullanmalıyım?',
          a: 'Operasyondan sonraki ilk 5 gün içinde donör bölgeniz iyileştiyse, antibiyotikli kremi bırakabilirsiniz.',
        },
        {
          q: '🧢 Saç ekimi sonrasında ne kadar süre şapka kullanmalıyım?',
          a: 'Size verilen özel şapkayı yaklaşık 10 gün boyunca düzenli kullanmanız önerilir.',
        },
        {
          q: '🏃‍♂️ Ameliyattan sonra ne zaman spor yapabilirim?',
          a: 'Egzersize başlamak için en az 1 ay beklemelisiniz. Bu, iyileşme sürecinizi korur.',
        },
        {
          q: '💇‍♂️ Nakledilen saçlar döküldü, endişelenmeli miyim?',
          a: 'Hayır, bu beklenen bir süreçtir. Saçlar dökülse bile kökler kalır ve zamanla yeni saçlar çıkar.',
        },
      ].map((item, i) => (
        <View key={i} style={styles.faqCard}>
          <View style={styles.faqIconCircle}>
            <Text style={{ color: '#FFF' }}>•</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.faqQuestion}>{item.q}</Text>
            <Text style={styles.faqAnswer}>{item.a}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    if (activeTab === 0) return renderChat();
    if (activeTab === 1) return renderAppointment();
    if (activeTab === 2) return renderResults();
    return renderFaq();
  };

  return (
    <View style={styles.screen}>
      <AppHeader />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>İLETİŞİM</Text>

          {/* 💌 Yolculuğum butonu */}
          <TouchableOpacity
            onPress={() => router.push('/journey')}
            style={styles.journeyIconButton}
          >
            <Text style={styles.journeyIcon}>💌</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {tabs.map((t, i) => {
            const active = i === activeTab;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(i)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {renderContent()}
        </ScrollView>
      </View>

      {showApptSuccess && (
        <View style={styles.appointmentSuccessBackdrop}>
          <View style={styles.appointmentSuccessCard}>
            <Text style={styles.appointmentSuccessEmoji}>😊</Text>
            <Text style={styles.appointmentSuccessTitle}>Randevunuz oluşturuldu</Text>
            <Text style={styles.appointmentSuccessText}>
              Bilgileriniz doktorunuza iletildi.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// --------- STYLES ----------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: HEADER_NAVY,
  },
  content: {
    flex: 1,
    backgroundColor: BG_SALMON,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: HEADER_NAVY,
  },
  journeyIconButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  journeyIcon: {
    fontSize: 20,
  },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: HEADER_NAVY,
  },
  tabText: {
    color: '#6C757D',
    fontWeight: '500',
  },
  tabTextActive: {
    color: HEADER_NAVY,
    fontWeight: '700',
  },

  // CHAT
  chatArea: {
    flex: 1,
  },
  chatBubbleRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: HEADER_NAVY,
    marginRight: 8,
  },
  chatBubble: {
    maxWidth: '80%',
    backgroundColor: '#F1F3F5',
    borderRadius: 14,
    padding: 10,
  },
  chatBubbleUser: {
    backgroundColor: HEADER_NAVY,
  },
  chatText: {
    color: '#212529',
  },
  chatTextUser: {
    color: '#FFF',
  },
  chatTime: {
    fontSize: 11,
    color: '#868E96',
    marginTop: 4,
    textAlign: 'right',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    marginTop: 4,
  },
  quickChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F1F3F5',
  },
  quickChipText: {
    color: '#495057',
    fontSize: 13,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  messageInput: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#FFF',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: HEADER_NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Doctors (chat kartları)
  sectionLabel: {
    fontWeight: '700',
    color: HEADER_NAVY,
    marginBottom: 8,
    marginLeft: 4,
  },
  doctorCard: {
    width: 260,
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 12,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorAvatarText: {
    fontSize: 22,
  },
  doctorName: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
    color: HEADER_NAVY,
  },
  doctorBullet: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 2,
  },
  doctorDetailButton: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: HEADER_NAVY,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doctorDetailButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },

  // Appointment
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: HEADER_NAVY,
  },
  sectionSubtitle: {
    color: '#6C757D',
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: HEADER_NAVY,
  },
  inputLike: {
    borderRadius: 10,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inputPlaceholder: {
    color: '#ADB5BD',
  },
  inputText: {
    color: '#212529',
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  timeChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  timeChipActive: {
    backgroundColor: HEADER_NAVY,
    borderColor: HEADER_NAVY,
  },
  timeChipText: {
    fontSize: 13,
    color: '#495057',
  },
  appointmentButton: {
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: HEADER_NAVY,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  appointmentButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },

  // Doktor dropdown'u
  doctorDropdown: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    overflow: 'hidden',
  },
  doctorSearchInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  simpleModalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  // Sonuç kartı
  resultsCard: {
    marginTop: 8,
    marginBottom: 40, // tuşlarla çakışmasın
    borderRadius: 16,
    backgroundColor: '#FFF',
    padding: 16,
  },
  resultsTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
    color: HEADER_NAVY,
  },
  resultsMeta: {
    color: '#6C757D',
    fontSize: 12,
    marginBottom: 12,
  },
  resultsPhotoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  resultsPhotoBox: {
    width: '30%',
    alignItems: 'center',
  },
  resultsPhotoThumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#F1F3F5',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    marginBottom: 4,
  },
  resultsPhotoLabel: {
    fontSize: 11,
    color: '#495057',
    textAlign: 'center',
  },
  resultsSubHeading: {
    fontWeight: '600',
    color: HEADER_NAVY,
    marginBottom: 4,
  },
  resultsText: {
    color: '#495057',
    fontSize: 13,
  },

  // Debug / Jüri alanı
  debugToggle: {
    marginTop: 14,
    paddingVertical: 6,
  },
  debugToggleText: {
    fontSize: 12,
    color: '#495057',
    textDecorationLine: 'underline',
  },
  dbDebugBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  dbDebugTitle: {
    fontWeight: '700',
    color: HEADER_NAVY,
    marginBottom: 4,
    fontSize: 12,
  },
  dbDebugInfo: {
    fontSize: 11,
    color: '#495057',
    marginBottom: 6,
  },
  dbDebugText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: '#495057',
  },

  // FAQ
  faqCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  faqIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: HEADER_NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  faqQuestion: {
    fontWeight: '700',
    marginBottom: 4,
    color: HEADER_NAVY,
  },
  faqAnswer: {
    color: '#495057',
  },

  // Appointment success overlay
  appointmentSuccessBackdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 30,
  },
  appointmentSuccessCard: {
    width: '75%',
    borderRadius: 18,
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  appointmentSuccessEmoji: {
    fontSize: 38,
    marginBottom: 8,
  },
  appointmentSuccessTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
    color: HEADER_NAVY,
  },
  appointmentSuccessText: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
  },
});
