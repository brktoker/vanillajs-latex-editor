// GeoGebra JavaScript Controller - React olmadan kullanım
// react-geogebra paketinin mantığını kullanarak

class GeoGebraController {
  constructor() {
    this.applet = null;
    this.isLoaded = false;
    this.isLoading = true;
    this.init();
  }

  async init() {
    try {
      // GeoGebra script'ini yükle
      await this.loadGeoGebraScript();

      // GeoGebra applet'ini başlat
      this.initializeApplet();

      // Event listener'ları kur
      this.setupEventListeners();
    } catch (error) {
      console.error("GeoGebra yükleme hatası:", error);
      this.showError("GeoGebra yüklenirken bir hata oluştu");
    }
  }

  async loadGeoGebraScript() {
    return new Promise((resolve, reject) => {
      // Script zaten yüklü mü kontrol et
      if (window.GGBApplet) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://geogebra.org/apps/deployggb.js";
      script.crossOrigin = "";
      script.id = "geogebra-script";

      script.onload = () => {
        console.log("GeoGebra script yüklendi");
        resolve();
      };

      script.onerror = () => {
        reject(new Error("GeoGebra script yüklenemedi"));
      };

      document.head.appendChild(script);
    });
  }

  initializeApplet() {
    if (!window.GGBApplet) {
      console.error("GeoGebra API yüklenmedi");
      return;
    }

    // Kaydedilmiş ayarları al veya varsayılanları kullan
    const settings = this.getCurrentSettings();
    this.initializeAppletWithSettings(settings);
  }

  onAppletReady() {
    console.log("GeoGebra applet hazır");
    this.isLoaded = true;
    this.isLoading = false;
    this.hideLoading();
    this.showGeoGebra();
    this.updateStatus("GeoGebra hazır");

    // Applet referansını al
    this.applet = window.ggbApplet;

    // Mouse koordinatlarını takip et
    this.setupCoordinateTracking();

    // Applet'i container'a tam sığdır
    setTimeout(() => {
      this.resizeApplet();
    }, 100);
  }

  onAppletError(error) {
    console.error("GeoGebra applet hatası:", error);
    this.showError("GeoGebra başlatılamadı");
  }

  hideLoading() {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 300);
    }
  }

  showGeoGebra() {
    const container = document.getElementById("geogebra-container");

    if (container) {
      container.classList.remove("hidden");
    }
  }

  showError(message) {
    this.isLoading = false;
    this.hideLoading();

    const statusText = document.getElementById("status-text");
    if (statusText) {
      statusText.textContent = message;
      statusText.className = "text-red-600";
    }

    console.error(message);
  }

  updateStatus(message) {
    const statusText = document.getElementById("status-text");
    if (statusText) {
      statusText.textContent = message;
      statusText.className = "text-gray-600";
    }
  }

  setupCoordinateTracking() {
    if (!this.applet) return;

    // Mouse hareketlerini takip et
    document.addEventListener("mousemove", (e) => {
      if (this.isLoaded && this.applet) {
        try {
          // GeoGebra koordinat sistemine çevir
          const rect = document
            .getElementById("ggb-applet")
            .getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Koordinatları güncelle
          const coordinatesElement = document.getElementById("coordinates");
          if (coordinatesElement) {
            coordinatesElement.textContent = `(${Math.round(x)}, ${Math.round(
              y
            )})`;
          }
        } catch (error) {
          // Koordinat hesaplama hatası - sessizce geç
        }
      }
    });
  }

  // Event listener'ları kur
  setupEventListeners() {
    // Window resize handler
    window.addEventListener("resize", () => {
      if (this.isLoaded && this.applet) {
        this.resizeApplet();
      }
    });

    // Yardım modalı
    const helpBtn = document.getElementById("help-btn");
    const helpModal = document.getElementById("help-modal");
    const closeHelp = document.getElementById("close-help");
    const closeHelpBtn = document.getElementById("close-help-btn");

    if (helpBtn) {
      helpBtn.addEventListener("click", () => this.toggleHelpModal());
    }

    if (closeHelp) {
      closeHelp.addEventListener("click", () => this.toggleHelpModal());
    }

    if (closeHelpBtn) {
      closeHelpBtn.addEventListener("click", () => this.toggleHelpModal());
    }

    if (helpModal) {
      helpModal.addEventListener("click", (e) => {
        if (e.target === helpModal) {
          this.toggleHelpModal();
        }
      });
    }

    // Ayarlar modalı
    const settingsBtn = document.getElementById("settings-btn");
    const settingsModal = document.getElementById("settings-modal");
    const closeSettings = document.getElementById("close-settings");
    const applySettings = document.getElementById("apply-settings");
    const resetSettings = document.getElementById("reset-settings");

    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => this.toggleSettingsModal());
    }

    if (closeSettings) {
      closeSettings.addEventListener("click", () => this.toggleSettingsModal());
    }

    if (applySettings) {
      applySettings.addEventListener("click", () => this.applySettings());
    }

    if (resetSettings) {
      resetSettings.addEventListener("click", () => this.resetToDefaults());
    }

    if (settingsModal) {
      settingsModal.addEventListener("click", (e) => {
        if (e.target === settingsModal) {
          this.toggleSettingsModal();
        }
      });
    }

    // Klavye kısayolları
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e)
    );
  }

  toggleHelpModal() {
    const modal = document.getElementById("help-modal");
    if (modal) {
      const isHidden = modal.classList.contains("hidden");

      if (isHidden) {
        modal.classList.remove("hidden");
        setTimeout(() => (modal.style.opacity = "1"), 10);
      } else {
        modal.style.opacity = "0";
        setTimeout(() => modal.classList.add("hidden"), 300);
      }
    }
  }

  toggleSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (modal) {
      const isHidden = modal.classList.contains("hidden");

      if (isHidden) {
        modal.classList.remove("hidden");
        setTimeout(() => (modal.style.opacity = "1"), 10);
        this.loadCurrentSettings();
      } else {
        modal.style.opacity = "0";
        setTimeout(() => modal.classList.add("hidden"), 300);
      }
    }
  }

  loadCurrentSettings() {
    // Mevcut ayarları form'a yükle
    const settings = this.getCurrentSettings();

    // App type
    const appTypeRadios = document.querySelectorAll('input[name="appType"]');
    appTypeRadios.forEach((radio) => {
      radio.checked = radio.value === settings.appName;
    });

    // Checkboxes
    const checkboxes = [
      "showToolBar",
      "showMenuBar",
      "showAlgebraInput",
      "showToolBarHelp",
      "showResetIcon",
      "showAnimationButton",
      "showFullscreenButton",
    ];

    checkboxes.forEach((id) => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.checked = settings[id] || false;
      }
    });

    // Language
    const languageSelect = document.getElementById("languageSelect");
    if (languageSelect) {
      languageSelect.value = settings.language || "tr";
    }
  }

  getCurrentSettings() {
    // Mevcut ayarları localStorage'dan al veya varsayılanları kullan
    const savedSettings = localStorage.getItem("geogebra-settings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }

    // Varsayılan ayarlar
    return {
      appName: "geometry",
      showToolBar: true,
      showMenuBar: true,
      showAlgebraInput: true,
      showToolBarHelp: true,
      showResetIcon: true,
      showAnimationButton: true,
      showFullscreenButton: false,
      language: "tr",
    };
  }

  applySettings() {
    // Form'dan ayarları al
    const settings = {
      appName:
        document.querySelector('input[name="appType"]:checked')?.value ||
        "classic",
      showToolBar: document.getElementById("showToolBar")?.checked || false,
      showMenuBar: document.getElementById("showMenuBar")?.checked || false,
      showAlgebraInput:
        document.getElementById("showAlgebraInput")?.checked || false,
      showToolBarHelp:
        document.getElementById("showToolBarHelp")?.checked || false,
      showResetIcon: document.getElementById("showResetIcon")?.checked || false,
      showAnimationButton:
        document.getElementById("showAnimationButton")?.checked || false,
      showFullscreenButton:
        document.getElementById("showFullscreenButton")?.checked || false,
      language: document.getElementById("languageSelect")?.value || "tr",
    };

    // Ayarları localStorage'a kaydet
    localStorage.setItem("geogebra-settings", JSON.stringify(settings));

    // GeoGebra'yı yeniden başlat
    this.restartGeoGebra(settings);

    // Modal'ı kapat
    this.toggleSettingsModal();

    // Kullanıcıya bilgi ver
    this.showNotification(
      "Ayarlar uygulandı! GeoGebra yeniden başlatılıyor..."
    );
  }

  resetToDefaults() {
    // Varsayılan ayarları yükle
    const defaultSettings = {
      appName: "geometry",
      showToolBar: true,
      showMenuBar: true,
      showAlgebraInput: true,
      showToolBarHelp: true,
      showResetIcon: true,
      showAnimationButton: true,
      showFullscreenButton: false,
      language: "tr",
    };

    // Form'u varsayılan değerlerle doldur
    const appTypeRadios = document.querySelectorAll('input[name="appType"]');
    appTypeRadios.forEach((radio) => {
      radio.checked = radio.value === defaultSettings.appName;
    });

    const checkboxes = [
      "showToolBar",
      "showMenuBar",
      "showAlgebraInput",
      "showToolBarHelp",
      "showResetIcon",
      "showAnimationButton",
      "showFullscreenButton",
    ];

    checkboxes.forEach((id) => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.checked = defaultSettings[id];
      }
    });

    const languageSelect = document.getElementById("languageSelect");
    if (languageSelect) {
      languageSelect.value = defaultSettings.language;
    }

    this.showNotification("Ayarlar varsayılana döndürüldü!");
  }

  restartGeoGebra(settings) {
    // Mevcut applet'i temizle
    const appletContainer = document.getElementById("ggb-applet");
    if (appletContainer) {
      appletContainer.innerHTML = "";
    }

    // Loading ekranını göster
    this.showLoading();

    // Yeni ayarlarla GeoGebra'yı başlat
    setTimeout(() => {
      this.initializeAppletWithSettings(settings);
    }, 500);
  }

  initializeAppletWithSettings(settings) {
    if (!window.GGBApplet) {
      console.error("GeoGebra API yüklenmedi");
      return;
    }

    // Container boyutlarını hesapla
    const container = document.getElementById("geogebra-container");
    let width = 800;
    let height = 600;

    if (container) {
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 800);
      height = Math.max(rect.height, 600);
    }

    // Ayarları parametrelere dönüştür
    const parameters = {
      appName: settings.appName,
      width: width.toString(),
      height: height.toString(),
      showToolBar: settings.showToolBar,
      showMenuBar: settings.showMenuBar,
      showAlgebraInput: settings.showAlgebraInput,
      showToolBarHelp: settings.showToolBarHelp,
      showResetIcon: settings.showResetIcon,
      showAnimationButton: settings.showAnimationButton,
      showFullscreenButton: settings.showFullscreenButton,
      showGrid: false, // Izgara varsayılan olarak kapalı
      showAxes: false, // Eksenler varsayılan olarak kapalı
      showCoordinates: false, // Koordinatlar varsayılan olarak kapalı
      enableLabelDrags: settings.enableLabelDrags,
      enableShiftDragZoom: settings.enableShiftDragZoom,
      enableRightClick: settings.enableRightClick,
      language: settings.language,
      appletOnLoad: () => this.onAppletReady(),
      appletOnLoadError: (error) => this.onAppletError(error),
    };

    try {
      const ggbApp = new window.GGBApplet(parameters, true);
      ggbApp.inject("ggb-applet");
    } catch (error) {
      console.error("GeoGebra applet başlatma hatası:", error);
      this.showError("GeoGebra başlatılamadı");
    }
  }

  showLoading() {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.display = "block";
      loadingScreen.style.opacity = "1";
    }
  }

  showNotification(message) {
    // Basit bir bildirim göster
    const notification = document.createElement("div");
    notification.className =
      "fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  handleKeyboardShortcuts(e) {
    // F1 - Yardım
    if (e.key === "F1") {
      e.preventDefault();
      this.toggleHelpModal();
    }

    // Esc - Yardım modalını kapat
    if (e.key === "Escape") {
      const helpModal = document.getElementById("help-modal");
      if (helpModal && !helpModal.classList.contains("hidden")) {
        this.toggleHelpModal();
      }
    }
  }

  // Public API
  getApplet() {
    return this.applet;
  }

  resizeApplet() {
    if (!this.applet || !this.isLoaded) return;

    try {
      const container = document.getElementById("geogebra-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        const width = Math.max(rect.width, 800);
        const height = Math.max(rect.height, 600);

        // GeoGebra applet'ini yeniden boyutlandır
        this.applet.setSize(width, height);
      }
    } catch (error) {
      console.error("GeoGebra yeniden boyutlandırma hatası:", error);
    }
  }

  isReady() {
    return this.isLoaded;
  }
}

// Global instance oluştur
let geoGebraController;

// Sayfa yüklendiğinde başlat
document.addEventListener("DOMContentLoaded", () => {
  geoGebraController = new GeoGebraController();
});

// Global erişim için
window.GeoGebraController = GeoGebraController;
window.geoGebraController = geoGebraController;
