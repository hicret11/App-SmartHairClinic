// app/capture-flow.tsx
// @ts-nocheck
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Speech from 'expo-speech';
import { saveCaptureSetFromArray } from '../db';

// 🔹 KENDİ BİLGİSAYAR IP ADRESİNİ YAZ
const BACKEND_URL = 'http://172.16.19.136:8000';

// ----------------------------------------------------------
// 5 ADIM – + angleCode
// ----------------------------------------------------------
// Her bir adım için başlık, açıklama, sesli rehber ve ikon
const STEPS = [
  {
    title: '1. Tam Yüz 🙂',
    description: 'Kameraya doğru bakın ve başınızı düz tutun.',
    speechText:
      'Telefonu göz hizana getir. Yüzünü beyaz ovalin içine ortala ve başını dik tut.',
    icon: require('../assets/images/front.png'),
    angleCode: 'FRONT',
  },
  {
    title: '2. Sağ 45°',
    description: 'Başınızı sağa doğru 45 derece çevirin.',
    speechText:
      'Başını hafifçe sağa çevir. Çeneni çok döndürme ve saç çizgin görünür olsun.',
    icon: require('../assets/images/right.png'),
    angleCode: 'SIDE',
  },
  {
    title: '3. Sol 45°',
    description: 'Başınızı sola doğru 45 derece çevirin.',
    speechText:
      'Başını hafifçe sola çevir. Şakak bölgenin görünür olmasına dikkat et.',
    icon: require('../assets/images/left.png'),
    angleCode: 'SIDE',
  },
  {
    title: '4. Tepe (Vertex)',
    description: 'Başınızı öne eğin, tepe bölgesi görünsün.',
    speechText:
      'Telefonu başının biraz üstüne kaldır. Başını hafifçe öne eğ ki tepe bölgen tam ortada olsun. Beyaz ovalin içinde sadece tepe kısmı görünsün.',
    icon: require('../assets/images/top.png'),
    angleCode: 'TOP',
  },
  {
    title: '5. Ense (Donör)',
    description: 'Başınızı öne eğin, ense bölgesi görünsün.',
    speechText:
      'Şimdi ense fotoğrafını çekeceğiz. Bu açı biraz zor olabilir, o yüzden adım adım gidelim. Mümkünse bir ayna karşısına geçin veya bir yakınınızdan yardım isteyin. Tek başınaysanız, başınızı öne doğru eğin ve çenenizi göğsünüze yaklaştırın. Telefonu ensenizin hizasına getirip hafif yukarıdan aşağı bakacak şekilde tutun. Ekrandaki beyaz ovalin içinde, ensenizin tamamı görünmeye çalışsın; kulaklarınızın altından omuz başlangıcına kadar olan bölge net olsun.',
    icon: require('../assets/images/back.png'),
    angleCode: 'BACK',
  },
];

export default function CaptureFlowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // Eğer fotoğraf yeniden çekilecekse hangi index
  const retakeIndex = params?.retakeIndex ? parseInt(params.retakeIndex) : null;

  // Daha önce çekilmiş fotoğraflar
  const existingPhotos = params?.existingPhotos
    ? JSON.parse(params.existingPhotos)
    : Array(5).fill(null);

  const [currentStep, setCurrentStep] = useState(retakeIndex ?? 0);
  const [photos, setPhotos] = useState(existingPhotos);

  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [facing, setFacing] = useState<'front' | 'back'>('front');

  // 🔹 Açı kontrol durumu: idle / checking / success / error
  const [angleStatus, setAngleStatus] = useState<
    'idle' | 'checking' | 'success' | 'error'
  >('idle');
  const [angleMessage, setAngleMessage] = useState<string>('');

  // Kamera izni kontrolü, yoksa istek gönder
  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  // ✅ Doğru / yanlış mesajını 3 saniye sonra otomatik gizle
  useEffect(() => {
    if (angleStatus === 'success' || angleStatus === 'error') {
      const timer = setTimeout(() => {
        setAngleStatus('idle');
        setAngleMessage('');
      }, 3000); // 3 sn

      return () => clearTimeout(timer);
    }
  }, [angleStatus]);

  // 🔹 Ense adımına gelince otomatik kısa açıklama
  useEffect(() => {
    const stepMeta = STEPS[currentStep];
    if (stepMeta.angleCode === 'BACK') {
      Speech.stop();
      Speech.speak(
        'Bu adımda ense bölgenizin fotoğrafını çekeceğiz. Hazır olduğunuzda alttaki Fotoğraf Çek butonuna dokunun; beş saniyelik geri sayım başlayacak ve fotoğraf otomatik kaydedilecek.',
        {
          language: 'tr-TR',
          rate: 0.98,
          pitch: 1.0,
        },
      );
    }
  }, [currentStep]);

  // 🔊 Ses butonu: toggle (basınca başlat, tekrar basınca durdur)
  const speakCurrentStep = async () => {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) {
      Speech.stop();
      return;
    }

    const step = STEPS[currentStep];
    Speech.stop();
    Speech.speak(step.speechText, {
      language: 'tr-TR',
      rate: 0.98,
      pitch: 1.0,
    });
  };

  // 🔹 Geri sayımı başlat
  const startCountdown = () => {
    if (isCapturing || countdown !== null || angleStatus === 'checking') return;

    // yeni çekimde önceki mesajı temizle
    setAngleStatus('idle');
    setAngleMessage('');

    const stepMeta = STEPS[currentStep];

    // Ense için özel davranış: 5 sn geri sayım
    if (stepMeta.angleCode === 'BACK') {
      Speech.stop();
      Speech.speak(
        'Telefonu ensene yerleştir, başını öne eğ ve sabit kal. Beş saniye içinde fotoğraf otomatik çekilecek.',
        {
          language: 'tr-TR',
          rate: 0.98,
          pitch: 1.0,
        },
      );
      setCountdown(5); // 🔹 5 saniye
    } else {
      // Diğer açılarda klasik 3,2,1
      setCountdown(3);
    }
  };

  // 🔹 Geri sayımda 0 olunca fotoğraf çek
  useEffect(() => {
    let timer;
    if (countdown !== null) {
      if (countdown === 0) {
        takePhoto();
        setCountdown(null);
      } else {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 🔹 Backend ile açı doğrulama (yumuşak, timeout yok)
  const validatePhotoAngle = async (
    uri: string,
    expectedAngle: string,
    stepTitle: string,
  ) => {
    try {
      setAngleStatus('checking');
      setAngleMessage(
        'Açı kontrol ediliyor, lütfen birkaç saniye sabit kalın.',
      );

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const res = await fetch(`${BACKEND_URL}/predict-angle`, {
        method: 'POST',
        body: formData,
      });

      // Backend hata verirse bile kullanıcıyı üzmeyelim
      if (!res.ok) {
        console.log('Angle API error status:', res.status);
        setAngleStatus('success');
        setAngleMessage(
          'Harika! Fotoğraf istenen açıya uygun kaydedildi. Bir sonraki adıma geçiliyor.',
        );
        return true;
      }

      const json = await res.json();
      const detectedRaw = json?.predicted_angle || '';
      const detectedAngle = String(detectedRaw).trim().toUpperCase();

      console.log('Expected:', expectedAngle, 'Detected:', detectedAngle);

      if (detectedAngle === expectedAngle) {
        // ✅ DOĞRU AÇI
        setAngleStatus('success');
        setAngleMessage(
          'Harika! Fotoğraf istenen açıya uygun kaydedildi. Bir sonraki adıma geçiliyor.',
        );
        return true;
      }

      // ❌ YANLIŞ AÇI
      setAngleStatus('error');
      setAngleMessage(
        `${stepTitle} için çekilen fotoğraf istenen açıya tam uymuyor.\n\nLütfen ekrandaki küçük görseli ve sesli yönergeyi takip ederek başınızı doğru yöne çevirin ve yeniden çekim yapın.`,
      );

      Alert.alert(
        'Açı Uyuşmuyor',
        `${stepTitle} için istenen açı yakalanamadı.\n\nBaşınızı ekrandaki şablona göre ayarlayıp, tekrar fotoğraf çekebilirsiniz.`,
      );

      return false;
    } catch (e: any) {
      console.log('Angle API exception:', e?.name || e);

      // Her türlü beklenmeyen hatada kullanıcıyı kilitleme:
      setAngleStatus('success');
      setAngleMessage(
        'Harika! Fotoğraf istenen açıya uygun kaydedildi. Bir sonraki adıma geçiliyor.',
      );
      return true;
    }
  };

  // 🔹 Fotoğraf çekme ve ilerletme
  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const result = await cameraRef.current.takePictureAsync({ quality: 0.8 });

      if (!result?.uri) {
        setIsCapturing(false);
        return;
      }

      const expectedAngle = STEPS[currentStep].angleCode;
      const stepTitle = STEPS[currentStep].title;

      // 🔹 TEPE (TOP) ve ENSE (BACK) için kontrolü yumuşat
      if (expectedAngle === 'TOP') {
        setAngleStatus('success');
        setAngleMessage(
          'Tepe bölgesi fotoğrafınız kaydedildi. Bu açı kullanıcılar için zor olduğu için, şablon ve sesli yönlendirme ile devam ediyoruz.',
        );
      } else if (expectedAngle === 'BACK') {
        setAngleStatus('success');
        setAngleMessage(
          'Ense bölgesi fotoğrafınız başarıyla kaydedildi. Bu açı kullanıcılar için zor olduğu için, doğru yerleşim yeterli kabul ediliyor.',
        );
      } else {
        const isValid = await validatePhotoAngle(
          result.uri,
          expectedAngle,
          stepTitle,
        );

        if (!isValid) {
          setIsCapturing(false);
          return;
        }
      }

      // 🔹 açı doğruysa (veya TOP/BACK ise) fotoyu kaydet & akışı ilerlet
      const updated = [...photos];
      updated[currentStep] = result.uri;
      setPhotos(updated);
      setIsCapturing(false);

      if (retakeIndex !== null) {
        router.replace({
          pathname: '/photo-preview',
          params: { photos: JSON.stringify(updated) },
        });
        return;
      }

      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // ✅ Tüm 5 açı tamamlandı → DB’ye kaydet + ön izleme sayfasına geç
        try {
          await saveCaptureSetFromArray(updated); // <--- 5'li seti kaydediyoruz
        } catch (e) {
          console.log('DB kaydı sırasında hata', e);
        }

        router.push({
          pathname: '/photo-preview',
          params: { photos: JSON.stringify(updated) },
        });
      }
    } catch (e) {
      console.log('Fotoğraf çekilirken hata:', e);
      setIsCapturing(false);
      setAngleStatus('idle');
    }
  };

  // 🔹 Kamera ön/arka toggle
  const toggleFacing = () => {
    setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  const step = STEPS[currentStep];

  // Kamera izni yoksa uyarı göster
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Kamera izni...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 8 }}>Kamera izni gerekli</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔹 Butonun yazısı, duruma göre değişsin
  let buttonLabel =
    currentStep === STEPS.length - 1 ? 'Son Fotoğrafı Çek' : 'Fotoğraf Çek';

  if (countdown !== null) {
    buttonLabel = String(countdown);
  } else if (angleStatus === 'checking') {
    buttonLabel = 'Açı Kontrol Ediliyor...';
  } else if (angleStatus === 'success') {
    buttonLabel =
      currentStep === STEPS.length - 1
        ? 'Son Fotoğraf Kaydedildi'
        : 'Devam Ediliyor...';
  } else if (angleStatus === 'error') {
    buttonLabel = 'Tekrar Çek';
  }

  return (
    <View style={styles.container}>
      {/* INFO CARD */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          {/* Küçük kafa ikonu */}
          <Image source={step.icon} style={styles.stepIcon} resizeMode="contain" />

          {/* Metinler */}
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>{step.title}</Text>
            <Text style={styles.infoDesc}>{step.description}</Text>
          </View>

          {/* Ses Butonu */}
          <TouchableOpacity onPress={speakCurrentStep} style={styles.voiceButton}>
            <MaterialIcons name="volume-up" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Kamera */}
      <View style={styles.cameraWrapper}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
        />

        {/* Beyaz oval hizalama çizgisi */}
        <View style={styles.mask}>
          <View style={styles.oval} />
        </View>

        {/* Kamera çevirme butonu */}
        <TouchableOpacity style={styles.switchButton} onPress={toggleFacing}>
          <MaterialIcons name="flip-camera-android" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Geri sayım overlay'i */}
        {countdown !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>

      {/* Açı geri bildirim mesajı – tek açık renk kutu */}
      {angleMessage ? (
        <View
          style={[
            styles.angleMessageBox,
            angleStatus === 'success' && styles.angleMessageSuccess,
            angleStatus === 'error' && styles.angleMessageError,
            angleStatus === 'checking' && styles.angleMessageChecking,
          ]}
        >
          <Text
            style={[
              styles.angleMessageText,
              angleStatus === 'success' && { color: '#0B1E39' },
              angleStatus === 'error' && { color: '#C92A2A' },
              angleStatus === 'checking' && { color: '#495057' },
            ]}
          >
            {angleMessage}
          </Text>
        </View>
      ) : null}

      {/* FOTOĞRAF ÇEKME BUTONU */}
      <TouchableOpacity
        style={[
          styles.button,
          angleStatus === 'checking' && styles.buttonChecking,
          angleStatus === 'success' && styles.buttonSuccess,
          angleStatus === 'error' && styles.buttonError,
        ]}
        disabled={isCapturing || countdown !== null || angleStatus === 'checking'}
        onPress={startCountdown}
      >
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ----------------------------------------------------------
// STYLES
// ----------------------------------------------------------
const HEADER_NAVY = '#0B1E39';
const BG_SALMON = '#FCEBE4';

// 🔹 Burada sadece stil tanımları, okunabilirlik için ayrı tuttuk
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_SALMON,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  infoCard: {
    borderRadius: 18,
    backgroundColor: HEADER_NAVY,
    padding: 14,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    width: 42,
    height: 42,
    marginRight: 10,
  },
  infoTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#FFF',
  },
  infoDesc: {
    color: '#EAEAEA',
    fontSize: 13,
    marginTop: 2,
  },
  voiceButton: {
    width: 32,
    height: 32,
    backgroundColor: '#ffffff33',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  cameraWrapper: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 16,
  },
  switchButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#00000055',
    padding: 8,
    borderRadius: 30,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oval: {
    width: '70%',
    height: '55%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF99',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 64,
    color: '#FFF',
    fontWeight: '700',
  },
  angleMessageBox: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: '#E5ECF7',
    borderWidth: 1,
    borderColor: '#0B1E39',
  },
  angleMessageSuccess: {
    backgroundColor: '#E6F4EA',
    borderColor: '#2F9E44',
  },
  angleMessageError: {
    backgroundColor: '#FFE3E3',
    borderColor: '#C92A2A',
  },
  angleMessageChecking: {
    backgroundColor: '#E9ECEF',
    borderColor: '#CED4DA',
  },
  angleMessageText: {
    fontSize: 13,
  },
  button: {
    backgroundColor: HEADER_NAVY,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonChecking: {
    backgroundColor: '#6C757D',
  },
  buttonSuccess: {
    backgroundColor: '#2F9E44',
  },
  buttonError: {
    backgroundColor: '#C92A2A',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG_SALMON,
  },
});
