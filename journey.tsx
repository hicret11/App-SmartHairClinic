// app/journey.tsx
// @ts-nocheck
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppHeader from '../components/AppHeader';

const HEADER_NAVY = '#0B1E39';
const BG_SALMON = '#FCEBE4';
const CARD_BORDER_ACTIVE = '#2F9E44';

// 📸 STATİK FOTOĞRAFLAR
const INITIAL_PHOTO = require('../assets/images/journey_00_initial.png');
const MONTH_PHOTOS = [
  require('../assets/images/journey_01_month1.png'),
  require('../assets/images/journey_02_month2.png'),
  require('../assets/images/journey_03_month3.png'),
  require('../assets/images/journey_04_month4.png'),
  require('../assets/images/journey_05_month5.png'),
  require('../assets/images/journey_06_month6.png'),
  require('../assets/images/journey_07_month7.png'),
  require('../assets/images/journey_08_month8.png'),
  require('../assets/images/journey_09_month9.png'),
  require('../assets/images/journey_10_month10.png'),
  require('../assets/images/journey_11_month11.png'),
  require('../assets/images/journey_12_month12.png'),
];

// Story tarzı paylaşım için 3 frame
const STORY_FRAMES = [
  { label: 'İlk Hali', image: INITIAL_PHOTO },
  { label: '6. Ay', image: MONTH_PHOTOS[5] },
  { label: '12. Ay', image: MONTH_PHOTOS[11] },
];

// Her ay için başlık, açıklama, ilerleme yüzdesi
const MONTHS = [
  {
    title: '1. Ay – İyileşme Başlıyor',
    description:
      'İlk haftalarda kızarıklık, kabuklanma ve hafif kaşıntı normaldir. Kabuklar yavaş yavaş dökülür, ekim alanı daha doğal görünmeye başlar.',
    progress: 5,
  },
  {
    title: '2. Ay – Şok Dökülme Dönemi',
    description:
      'Bu dönemde ekilen saç tellerinin büyük kısmı dökülebilir. Bu, köklerin içeride güçlenmesi için normal ve beklenen bir süreçtir.',
    progress: 10,
  },
  {
    title: '3. Ay – İlk Yeni Saçlar',
    description:
      'İnce ve zayıf yeni saçlar çıkmaya başlar. Her bölgede eşit olmayabilir; düzensiz ve seyrek görünüm bu ay için normaldir.',
    progress: 20,
  },
  {
    title: '4. Ay – Yeni Büyüme Artıyor',
    description:
      'Yeni saçların sayısı artar, bazı bölgelerde daha belirgin olur. Saç telleri hâlâ ince olabilir, kalınlaşma süreci devam eder.',
    progress: 30,
  },
  {
    title: '5. Ay – Kalınlaşma Başlıyor',
    description:
      'Saç kökleri güçlenir, yeni çıkan saçların yapısı kalınlaşmaya başlar. Aynaya baktığınızda değişimi daha net fark edebilirsiniz.',
    progress: 40,
  },
  {
    title: '6. Ay – Ara Sonuçlar',
    description:
      'Genellikle nihai sonucun %40–50’si bu ayda görülür. Saç çizgisi ve yoğunluk belirginleşir, saç ekiminin etkisi dışarıdan fark edilir.',
    progress: 55,
  },
  {
    title: '7. Ay – Dolgunluk Artıyor',
    description:
      'Saçların yoğunluğu ve hacmi artar. Tepe ve ön bölgedeki boşluklar giderek daha iyi kapanmaya başlar.',
    progress: 70,
  },
  {
    title: '8. Ay – Şekillenme Dönemi',
    description:
      'Saçların dokusu daha doğal hale gelir. Tarama ve şekil verme daha kolay olur; saçlar günlük hayata uyum sağlamaya başlar.',
    progress: 80,
  },
  {
    title: '9. Ay – Olgunlaşma',
    description:
      'Ekilen saçların büyük bölümü çıkmıştır. Yoğunluk artmaya devam eder, saçlar daha güçlü ve sağlıklı görünür.',
    progress: 85,
  },
  {
    title: '10. Ay – Son Rötuşlar',
    description:
      'Kalan zayıf bölgelerdeki saçlar da güçlenir. Genel görünüm büyük ölçüde tamamlanmıştır, küçük dolgunluk artışları devam eder.',
    progress: 90,
  },
  {
    title: '11. Ay – Son Dokunuşlar',
    description:
      'Saçların kalınlığı, parlaklığı ve yapısı oturur. Ekim alanı ile doğal saçlar arasındaki fark iyice azalır.',
    progress: 95,
  },
  {
    title: '12. Ay – Final Sonuç',
    description:
      'Saç ekiminin tam sonucu ortaya çıkar. Ekilen saçlar doğal saçlarınızla uyumlu hale gelir ve uzun vadeli kalıcı görünüm elde edilir.',
    progress: 100,
    finalMessage:
      '🎉 Tebrikler! Saç ekimi yolculuğunuzun 12. ayına ulaştınız. Artık elde ettiğiniz sonuç kalıcı ve günlük hayatınızın doğal bir parçası.',
  },
];

// Doktor değerlendirmesi verileri (örnekler)
const EVALUATIONS = [
  {
    date: '12 Kasım 2025',
    doctor: 'Dr. M. Reşat Arpacı',
    donor: 'Donör bölgesi: yeterli yoğunlukta, iyileşme uyumlu.',
    openness: 'Açıklık seviyesi: A3 sınıfı (ön bölge ağırlıklı).',
    area: 'Ekim alanı tahmini: 60–70 cm².',
    note: 'İyileşme beklenen düzeyde. Kabuklanma ve kızarıklık normal sınırlarda.',
  },
  {
    date: '12 Aralık 2025',
    doctor: 'Dr. Gökay Bilgin',
    donor: 'Donör bölgesi: stabil, ek travma bulgusu yok.',
    openness: 'Açıklık seviyesi: A3–A4 arası, şok dökülme süreci gözleniyor.',
    area: 'Ekim alanı tahmini: 65–75 cm².',
    note: 'Şok dökülme beklenen şekilde devam ediyor. Köklerin korunması açısından sorun yok.',
  },
  {
    date: '12 Ocak 2026',
    doctor: 'Dr. Mehmet Erdoğan',
    donor: 'Donör bölgesi: iyi, izler minimal düzeyde.',
    openness: 'Açıklık seviyesi: A3, yeni ince saç çıkışları başlamış.',
    area: 'Ekim alanı tahmini: 70 cm² civarında.',
    note: 'İlk yeni saçlar görülüyor, yoğunluk henüz düşük ama süreç olumlu.',
  },
  {
    date: '12 Şubat 2026',
    doctor: 'Dr. Firdavs Ahmedov',
    donor: 'Donör bölgesi: düzenli ve homojen iyileşme.',
    openness: 'Açıklık seviyesi: A3, bazı bölgelerde dolgunluk artışı mevcut.',
    area: 'Ekim alanı tahmini: 70–80 cm².',
    note: 'Yeni saçların sayısı artıyor, sabırlı olunması önerilir.',
  },
  {
    date: '12 Mart 2026',
    doctor: 'Dr. Ali Osman Soluk',
    donor: 'Donör bölgesi: yeterli, ek işlem ihtiyacı yok.',
    openness: 'Açıklık seviyesi: A3–A4, kalınlaşma süreci başlamış.',
    area: 'Ekim alanı tahmini: 80 cm².',
    note: 'Kalınlaşma ile birlikte saç çizgisi daha belirgin hale geliyor.',
  },
  {
    date: '12 Nisan 2026',
    doctor: 'Dr. M. Reşat Arpacı',
    donor: 'Donör bölgesi: stabil, yoğunluk korunmuş.',
    openness: 'Açıklık seviyesi: A4’ten A3’e doğru iyileşme.',
    area: 'Ekim alanı tahmini: 80–90 cm².',
    note: 'Ara sonuçlar başarılı, ön bölgedeki yoğunluk artışı tatmin edici.',
  },
  {
    date: '12 Mayıs 2026',
    doctor: 'Dr. Gökay Bilgin',
    donor: 'Donör bölgesi: iyi, ek seans için rezerv mevcut.',
    openness: 'Açıklık seviyesi: A3 civarında, dolgunluk artışı sürüyor.',
    area: 'Ekim alanı tahmini: 90 cm² civarı.',
    note: 'Saç hacmi belirginleşmiş, günlük kullanım açısından konforlu.',
  },
  {
    date: '12 Haziran 2026',
    doctor: 'Dr. Mehmet Erdoğan',
    donor: 'Donör bölgesi: doğal görünümlü, simetri iyi.',
    openness: 'Açıklık seviyesi: A2–A3 arası, tepe bölgesinde de dolgunluk artıyor.',
    area: 'Ekim alanı tahmini: 90–100 cm².',
    note: 'Saç yapısı ve dokusu doğal saçla daha uyumlu hale geliyor.',
  },
  {
    date: '12 Temmuz 2026',
    doctor: 'Dr. Firdavs Ahmedov',
    donor: 'Donör bölgesi: korunmuş, izler minimal.',
    openness: 'Açıklık seviyesi: A2, geniş alanlar büyük ölçüde kapatılmış.',
    area: 'Ekim alanı tahmini: 100 cm².',
    note: 'Olgunlaşma dönemine girildi, yoğunluk ve kalınlık tatmin edici.',
  },
  {
    date: '12 Ağustos 2026',
    doctor: 'Dr. Ali Osman Soluk',
    donor: 'Donör bölgesi: dengeli, ek yüklenme izlenmiyor.',
    openness: 'Açıklık seviyesi: A2’ye kadar gerilemiş durumda.',
    area: 'Ekim alanı tahmini: 100–110 cm².',
    note: 'Genel görünüm büyük ölçüde tamamlanmış, küçük artışlar devam ediyor.',
  },
  {
    date: '12 Eylül 2026',
    doctor: 'Dr. M. Reşat Arpacı',
    donor: 'Donör bölgesi: sağlıklı, saç yönleri doğal.',
    openness: 'Açıklık seviyesi: A1–A2 arası, ekim başarılı.',
    area: 'Ekim alanı tahmini: 110 cm².',
    note: 'Saçın parlaklığı ve kalitesi artmış, doğal görünüme oldukça yakın.',
  },
  {
    date: '12 Ekim 2026',
    doctor: 'Dr. Gökay Bilgin',
    donor: 'Donör bölgesi: kalıcı ve dengeli görünümde.',
    openness: 'Açıklık seviyesi: A1, ekilen alan ile doğal alan uyumlu.',
    area: 'Ekim alanı tahmini: 110–120 cm².',
    note: 'Nihai sonuç elde edilmiştir, uzun dönem için oldukça iyi bir görünüm mevcut.',
  },
];

export default function JourneyScreen() {
  const router = useRouter();

  // Hangi ayın detaylı açık olduğu
  const [activeMonth, setActiveMonth] = useState(0);
  // Her ay için notlar
  const [notes, setNotes] = useState<string[]>(Array(MONTHS.length).fill(''));
  // TextInput’ları fokuslamak için referanslar
  const noteRefs = useRef<(TextInput | null)[]>([]);
  // Doktor değerlendirme kartı açık mı?
  const [showEvaluation, setShowEvaluation] = useState(false);
  // Mini "Yolculuğumu Paylaş" overlay açık mı?
  const [showSharePreview, setShowSharePreview] = useState(false);
  // Story’de hangi frame gösteriliyor?
  const [currentStory, setCurrentStory] = useState(0);

  // Overlay açıksa 2 sn’de bir frame değiştir -> video hissi
  useEffect(() => {
    if (!showSharePreview) return;
    const id = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % STORY_FRAMES.length);
    }, 2000);
    return () => clearInterval(id);
  }, [showSharePreview]);

  const handleNoteChange = (index: number, text: string) => {
    setNotes((prev) => {
      const clone = [...prev];
      clone[index] = text;
      return clone;
    });
  };

  const handleNoteClear = (index: number) => {
    setNotes((prev) => {
      const clone = [...prev];
      clone[index] = '';
      return clone;
    });
  };

  const focusNoteInput = (index: number) => {
    noteRefs.current[index]?.focus();
  };

  const handleSystemShare = async () => {
    try {
      await Share.share({
        message:
          '“Smile Hair ile 12 aylık saç ekimi yolculuğum” #smilehairclinic #hairtransplant',
      });
    } catch (e) {
      // sessiz geç
    }
  };

  const handleOpenInstagram = async () => {
    try {
      const storyUrl = 'instagram://story-camera';
      const canOpen = await Linking.canOpenURL(storyUrl);
      if (canOpen) {
        await Linking.openURL(storyUrl);
      } else {
        await Linking.openURL('https://www.instagram.com');
      }
    } catch (e) {
      // sessiz geç
    }
  };

  // Bir ay için büyük (detaylı) kart
  const renderActiveCard = (index: number) => {
    const month = MONTHS[index];
    const progress = month.progress ?? 0;
    const evalData = EVALUATIONS[index];

    return (
      <View style={styles.monthCardActive}>
        <Text style={styles.monthTitle}>{month.title}</Text>

        <View style={styles.photoRow}>
          <View style={styles.photoBox}>
            <Text style={styles.photoLabel}>İlk Hali</Text>
            <Image
              source={INITIAL_PHOTO}
              style={styles.photoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.photoBox}>
            <Text style={styles.photoLabel}>Bu Ay</Text>
            <Image
              source={MONTH_PHOTOS[index]}
              style={styles.photoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.monthDesc}>{month.description}</Text>

        <Text style={styles.progressLabel}>İlerleme</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressPercent}>{progress}%</Text>

        {month.finalMessage && (
          <Text style={styles.finalMessage}>{month.finalMessage}</Text>
        )}

        {/* Doktor Değerlendirmesi alanı */}
        <View style={styles.evalWrapper}>
          {!showEvaluation ? (
            <TouchableOpacity
              style={styles.evalCollapsedRow}
              onPress={() => setShowEvaluation(true)}
            >
              <Text style={styles.evalCollapsedTitle}>
                Ay {index + 1} – Doktor Değerlendirmesi
              </Text>
              <Text style={styles.evalChevron}>›</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.evalCard}>
              <Text style={styles.evalTitle}>
                Doktor Değerlendirmesi – (Ay {index + 1})
              </Text>
              <Text style={styles.evalMeta}>
                📅 Tarih: {evalData?.date || '-'}
              </Text>
              <Text style={styles.evalMeta}>
                👨‍⚕️ {evalData?.doctor || 'Doktor bilgisi bekleniyor'}
              </Text>

              <View style={styles.evalDivider} />

              <Text style={styles.evalSectionTitle}>📌 Genel Değerlendirme:</Text>
              <Text style={styles.evalBullet}>• {evalData?.donor}</Text>
              <Text style={styles.evalBullet}>• {evalData?.openness}</Text>
              <Text style={styles.evalBullet}>• {evalData?.area}</Text>
              {evalData?.note && (
                <Text style={styles.evalNoteText}>• {evalData.note}</Text>
              )}

              <TouchableOpacity
                style={styles.evalCloseButton}
                onPress={() => setShowEvaluation(false)}
              >
                <Text style={styles.evalCloseText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Not + ikonlar */}
        <View style={styles.noteRow}>
          <TextInput
            ref={(el) => (noteRefs.current[index] = el)}
            placeholder="Not Ekle 📝"
            placeholderTextColor="#868E96"
            style={styles.noteInput}
            value={notes[index]}
            onChangeText={(text) => handleNoteChange(index, text)}
            multiline
          />

          <View style={styles.noteIconColumn}>
            <TouchableOpacity
              style={styles.noteIconButton}
              onPress={() => focusNoteInput(index)}
            >
              <Text style={styles.noteIconText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.noteIconButton}
              onPress={() => handleNoteClear(index)}
            >
              <Text style={styles.noteIconText}>🗑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Diğer aylar için kapalı (küçük) kart
  const renderCollapsedCard = (index: number) => {
    const month = MONTHS[index];
    const hasNote = !!notes[index];

    return (
      <TouchableOpacity
        key={index}
        style={styles.monthCardCollapsed}
        onPress={() => {
          setActiveMonth(index);
          setShowEvaluation(false);
        }}
      >
        <View>
          <Text style={styles.monthLockedTitle}>{month.title}</Text>
          <Text style={styles.monthLockedDesc}>Detayları görmek için dokunun</Text>
        </View>
        {hasNote && <Text style={styles.noteBadge}>Not var</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader />

      <View style={styles.content}>
        <Text style={styles.title}>Yolculuğum</Text>
        <Text style={styles.subtitle}>
          Her ay ilerlemeni kaydet ve farkı gör.
        </Text>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {MONTHS.map((_, index) =>
            index === activeMonth ? (
              <View key={index} style={{ marginBottom: 12 }}>
                {renderActiveCard(index)}
              </View>
            ) : (
              <View key={index} style={{ marginBottom: 8 }}>
                {renderCollapsedCard(index)}
              </View>
            ),
          )}

          {/* Mini “Yolculuğumu Paylaş” bölümü */}
          <View style={styles.shareSection}>
            <Text style={styles.shareTitle}>✨ Mini “Yolculuğumu Paylaş”</Text>
            <Text style={styles.shareSubtitle}>
              İlk halin, 6. ay ve 12. ay görsellerini story tarzı önizlemede
              izle ve yolculuğunu paylaş.
            </Text>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {
                setCurrentStory(0);
                setShowSharePreview(true);
              }}
            >
              <Text style={styles.shareButtonText}>
                Story Önizlemesini Aç
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Geri Dön</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Story / video hissi veren overlay */}
      {showSharePreview && (
        <View style={styles.shareOverlay}>
          <View style={styles.sharePreviewCard}>
            {/* Progress barlar */}
            <View style={styles.storyProgressRow}>
              {STORY_FRAMES.map((_, i) => (
                <View key={i} style={styles.storyProgressTrack}>
                  <View
                    style={[
                      styles.storyProgressFill,
                      { opacity: i <= currentStory ? 1 : 0.25 },
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* Ana görsel */}
            <View style={styles.storyImageWrapper}>
              <Image
                source={STORY_FRAMES[currentStory].image}
                style={styles.storyImage}
                resizeMode="contain"
              />
              <View style={styles.storyLabelPill}>
                <Text style={styles.storyLabelText}>
                  {STORY_FRAMES[currentStory].label}
                </Text>
              </View>
            </View>

            <Text style={styles.sharePreviewCaption}>
              “Smile Hair ile 12 aylık saç ekimi yolculuğum”
            </Text>

            <View style={styles.shareButtonsRow}>
              <TouchableOpacity
                style={[styles.sharePreviewBtn, styles.sharePreviewBtnOutline]}
                onPress={handleOpenInstagram}
              >
                <Text style={styles.sharePreviewBtnOutlineText}>
                  Instagram’da Aç
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sharePreviewBtn}
                onPress={handleSystemShare}
              >
                <Text style={styles.sharePreviewBtnText}>Paylaş</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sharePreviewCloseButton}
              onPress={() => setShowSharePreview(false)}
            >
              <Text style={styles.sharePreviewCloseText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

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
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: HEADER_NAVY,
  },
  subtitle: {
    color: '#6C757D',
    marginBottom: 16,
  },

  // Aktif kart
  monthCardActive: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER_ACTIVE,
    padding: 16,
    backgroundColor: '#F8FFF8',
  },
  monthTitle: {
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2933',
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoBox: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  photoLabel: {
    position: 'absolute',
    zIndex: 2,
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(11, 30, 57, 0.75)',
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  monthDesc: {
    color: '#495057',
    marginBottom: 12,
  },
  progressLabel: {
    fontWeight: '600',
    color: '#343A40',
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E9ECEF',
    marginTop: 4,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: CARD_BORDER_ACTIVE,
  },
  progressPercent: {
    textAlign: 'right',
    fontSize: 12,
    color: CARD_BORDER_ACTIVE,
    marginBottom: 8,
    marginTop: 2,
  },
  finalMessage: {
    marginTop: 8,
    color: HEADER_NAVY,
    fontWeight: '600',
  },

  // Doktor değerlendirmesi
  evalWrapper: {
    marginTop: 8,
    marginBottom: 8,
  },
  evalCollapsedRow: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#EFF2F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evalCollapsedTitle: {
    color: '#111827',
    fontWeight: '600',
  },
  evalChevron: {
    fontSize: 18,
    color: '#6B7280',
  },
  evalCard: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  evalTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#111827',
  },
  evalMeta: {
    color: '#4B5563',
    fontSize: 13,
  },
  evalDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  evalSectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  evalBullet: {
    color: '#374151',
    fontSize: 13,
    marginBottom: 2,
  },
  evalNoteText: {
    color: '#374151',
    fontSize: 13,
    marginTop: 2,
  },
  evalCloseButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: HEADER_NAVY,
  },
  evalCloseText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Not alanı + ikonlar
  noteRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 4,
  },
  noteInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
    maxHeight: 120,
  },
  noteIconColumn: {
    marginLeft: 8,
    justifyContent: 'space-between',
  },
  noteIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noteIconText: {
    fontSize: 18,
  },

  // Kapalı kartlar
  monthCardCollapsed: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F8F9FA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthLockedTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#343A40',
  },
  monthLockedDesc: {
    color: '#868E96',
    fontSize: 13,
  },
  noteBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E9F7EF',
    color: '#2F9E44',
    fontSize: 11,
    fontWeight: '600',
  },

  // geri butonu
  backButton: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: HEADER_NAVY,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    color: HEADER_NAVY,
    fontWeight: '600',
  },

  // Mini “Yolculuğumu Paylaş” bölümü
  shareSection: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF7EC',
    borderWidth: 1,
    borderColor: '#FFE0B3',
  },
  shareTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#8B5E00',
  },
  shareSubtitle: {
    color: '#946200',
    fontSize: 13,
    marginBottom: 12,
  },
  shareButton: {
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: HEADER_NAVY,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // Story / overlay
  shareOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharePreviewCard: {
    width: '86%',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  storyProgressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  storyProgressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  storyProgressFill: {
    flex: 1,
    backgroundColor: HEADER_NAVY,
  },
  storyImageWrapper: {
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  storyImage: {
    width: '100%',
    height: 260,
  },
  storyLabelPill: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  storyLabelText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  sharePreviewCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 12,
  },
  shareButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  sharePreviewBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: HEADER_NAVY,
  },
  sharePreviewBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sharePreviewBtnOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HEADER_NAVY,
  },
  sharePreviewBtnOutlineText: {
    color: HEADER_NAVY,
    fontWeight: '600',
    fontSize: 14,
  },
  sharePreviewCloseButton: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  sharePreviewCloseText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 13,
  },
});
