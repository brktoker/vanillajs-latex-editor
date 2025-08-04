# LaTeX Math Tools

Bu proje, matematik formüllerini oluşturmak ve geometri çizimleri yapmak için kullanılan bir web uygulamasıdır.

## Özellikler

### 📝 LaTeX Editor

- Matematik formüllerini LaTeX formatında yazma
- Gerçek zamanlı önizleme
- KaTeX ile matematiksel ifadeleri render etme
- MathLive editörü ile gelişmiş matematik yazımı

### 🎯 GeoGebra (Dinamik Geometri Editörü)

- Profesyonel dinamik matematik yazılımı
- Geometri, cebir, istatistik ve analiz araçları
- React olmadan saf JavaScript kullanımı
- Gelişmiş matematiksel araçlar
- Responsive tasarım ve tam ekran desteği

## Kurulum

1. Projeyi klonlayın:

```bash
git clone <repository-url>
cd latexeditorjs
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. Uygulamayı başlatın:

```bash
npm start
```

## Kullanım

### LaTeX Editor

- `index.html` dosyasını açın
- "Math" modunu seçin
- Matematik formüllerinizi yazın
- Gerçek zamanlı önizleme göreceksiniz

### GeoGebra

- `geogebra.html` dosyasını açın
- GeoGebra'nın kendi araçlarını kullanın
- Dinamik geometri çizimleri oluşturun
- Klavye kısayollarını kullanın:
  - `F1`: Yardım
  - `Esc`: Yardım modalını kapat

## GeoGebra Özellikleri

### Temel Özellikler

- **Dinamik Geometri**: Noktalar, çizgiler, daireler ve diğer geometrik şekiller
- **Cebir Entegrasyonu**: Geometrik ve cebirsel görünümler
- **Responsive Tasarım**: Tüm ekran boyutlarına uyum
- **Tam Ekran Modu**: Gelişmiş çizim deneyimi
- **Yardım Sistemi**: Kapsamlı kullanım kılavuzu

### Klavye Kısayolları

- `F1`: Yardım modalını aç
- `Esc`: Yardım modalını kapat

### API Kullanımı

GeoGebra JavaScript API'sini doğrudan kullanabilirsiniz:

```javascript
// GeoGebra controller'a erişim
const controller = window.geoGebraController;

// Applet hazır mı kontrol et
if (controller.isReady()) {
  const applet = controller.getApplet();

  // Nokta oluştur
  applet.evalCommand("A=(2,3)");

  // Çizgi oluştur
  applet.evalCommand("line[A,B]");

  // Daire oluştur
  applet.evalCommand("circle[A,5]");
}
```

## Teknik Detaylar

### GeoGebra Entegrasyonu

- `react-geogebra` paketinin mantığı kullanıldı
- React olmadan saf JavaScript ile implementasyon
- GeoGebra'nın resmi JavaScript API'si kullanıldı
- Asenkron script yükleme ve hata yönetimi
- Responsive tasarım ve z-index kontrolü

### Dosya Yapısı

```
latexeditorjs/
├── index.html          # LaTeX Editor
├── geogebra.html       # GeoGebra Editor
├── geogebra.js         # GeoGebra JavaScript Controller
├── script.js           # LaTeX Editor Controller
├── package.json        # Proje bağımlılıkları
└── README.md           # Proje dokümantasyonu
```

## Bağımlılıklar

- **KaTeX**: Matematik formüllerini render etme
- **MathLive**: Gelişmiş matematik editörü
- **react-geogebra**: GeoGebra entegrasyonu (sadece script yükleme için)
- **Tailwind CSS**: Stil ve UI bileşenleri

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Destek

Sorunlarınız için GitHub Issues kullanın veya iletişime geçin.
