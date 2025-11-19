# SmileHair App

**SmileHair App**, kullanıcıların saç ve kafa derisi bakım süreçlerini takip etmelerine yardımcı olan bir mobil uygulamadır. Bu uygulama, kullanıcıların belirlenen 5 kritik açıdan (özellikle saç/kafa derisi bölgelerini kapsayan) kendi fotoğraflarını, yardım almadan ve tutarlı pozlamalarla çekebilmesini sağlayan **akıllı, tam otomatik ve yönlendirici bir Self-Capture Tool** sunar. Amaç: Kullanıcının saç ve kafa derisi ilerlemesini kolayca takip etmesini sağlamak ve tedavi süreçlerini daha etkin yönetmesine yardımcı olmaktır.

***Uygulama Özellikleri***

Fotoğraf Çekme ve Kaydetme: 5 farklı açıdan fotoğraf çekimi (kritik saç/kafa derisi bölgeleri dahil), fotoğraflar lokal SQLite veritabanına kaydedilir, fotoğraf çekim süreci tamamen otomatik ve yönlendiricidir.

Self-Capture Tool: Kullanıcıyı adım adım yönlendirir, tutarlı pozlamalar ve açıların yakalanmasını sağlar, yardım almadan kullanıcı kendi fotoğraf setini oluşturabilir.

Sonuç ve Takip: Kaydedilen fotoğraflar uygulama içinde görüntülenebilir ve kullanıcı ilerlemesini kolayca takip edebilir.

***Proje Yapısı***

app/ → Uygulamanın tüm ekran ve sayfaları burada bulunur.

components/ → Tekrar kullanılabilir React Native bileşenleri.

constants/ → Sabit değerler ve renkler.

hooks/ → Özel React hook'ları.

assets/ → Görseller ve medya dosyaları.

db.ts → SQLite veritabanı bağlantısı ve sorguları.

package.json → Proje bağımlılıkları ve scriptler.

app.json, tsconfig.json, eas.json → Expo ve TypeScript konfigürasyon dosyaları.


# Welcome to your Expo app 👋
Basit ve Kullanıcı Dostu Arayüz: Turuncu ve beyaz renk teması, kolay ve anlaşılır navigasyon.
Uygulama **Expo Go** üzerinden telefonunuza yüklenip çalıştırılabilir. Terminalde çıkan QR kodu **Expo Go ile okutmanız yeterlidir**.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
