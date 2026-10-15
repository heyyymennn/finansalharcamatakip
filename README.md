# 💰 FinansYönetim - Kişisel Bütçe Takibi

Kişisel bilgisayarınızda kullanabileceğiniz modern, profesyonel bir finans yönetim uygulaması.

## ✨ Özellikler

- 📊 **Dashboard** - Gelir, gider ve bakiye özeti
- 💳 **İşlem Yönetimi** - Gelir/gider ekleme, silme, filtreleme
- 📈 **Analiz & Grafikler** - Aylık trend, kategori dağılımı
- 🤖 **AI Finansal Danışman** - Google Gemini ile kişiselleştirilmiş öneriler
- 🌙 **Dark/Light Mod** - Göz yormayan tema desteği
- 📱 **PWA** - Masaüstü uygulaması gibi kurulum
- 💾 **Offline Destek** - Verileriniz tarayıcınızda güvenle saklanır

---

## 🖥️ Bilgisayarınızda Kullanma YöntemLERİ

### Yöntem 1: PWA Olarak Kurmak (En Kolay - Önerilen)

Bu uygulama bir PWA (Progressive Web App) olarak tasarlanmıştır.

1. Uygulamayı tarayıcınızda açın
2. Adres çubuğundaki **"Yükle"** simgesine tıklayın VEYA
3. Tarayıcı menüsünden **"FinansYönetim'i Yükle"** seçeneğini seçin
4. Uygulama masaüstünüze kısayol olarak eklenir
5. Artık herhangi bir uygulama gibi açabilirsiniz!

**Desteklenen Tarayıcılar:**
- Chrome/Edge: Adres çubuğundaki yükle simgesi
- Firefox: Menü > "Sayfayı kaydet" > "Uygulama olarak yükle"
- Safari (macOS): Dosya > Dock'a Ekle

---

### Yöntem 2: Yerel Sunucu ile Çalıştırmak (Geliştiriciler İçin)

Eğer uygulamayı kendi bilgisayarınızda çalıştırmak istiyorsanız:

#### Gereksinimler:
- [Node.js](https://nodejs.org/) (v18 veya üzeri)

#### Kurulum:

```bash
# 1. Projeyi bilgisayarınıza indirin/klonlayın
# 2. Proje klasörüne gidin
cd finansyonetim

# 3. Bağımlılıkları yükleyin
npm install

# 4. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açın.

#### Production Build:

```bash
# Build oluşturun
npm run build

# Build'i yerel olarak test edin
npm run preview
```

---

### Yöntem 3: Electron ile Masaüstü Uygulaması (İsteğe Bağlı)

Tam bir masaüstü uygulaması istiyorsanız:

```bash
# Electron kurun
npm install -D electron electron-builder

# package.json'a ekleyin:
# "main": "dist-electron/main.js"
# "scripts": { "electron": "electron ." }
```

---

## 🔑 AI Danışman İçin API Anahtarı

1. [Google AI Studio](https://aistudio.google.com/apikey) adresine gidin
2. Google hesabınızla giriş yapın
3. "Create API Key" butonuna tıklayın
4. Oluşturulan anahtarı uygulamaya girin

**Ücretsiz plan:** Dakikada 15 istek, günde 1500 istek

---

## 🔒 Gizlilik

- Tüm verileriniz **yalnızca tarayıcınızda** (localStorage) saklanır
- Hiçbir veri sunucuya gönderilmez
- API anahtarınız sadece sizin tarayıcınızda kalır
- AI istekleri doğrudan Google Gemini API'ye yapılır

---

## 🛠️ Teknolojiler

- React + TypeScript
- Tailwind CSS v4
- Recharts (Grafikler)
- Lucide React (İkonlar)
- Google Gemini API (AI)
- Vite (Build tool)

---

## 📝 Notlar

- Veriler tarayıcınızın localStorage'ında saklanır
- Tarayıcı önbelleğini temizlerseniz verileriniz silinir
- Yedekleme için düzenli olarak ekran görüntüsü alabilirsiniz
- Farklı tarayıcılarda farklı veriler olabilir

---

**Keyfini çıkarın!** 🎉
