# gift-converter

## English

`gift-converter` is a desktop app that turns batches of videos into GIFs with per-file controls, experimental render tuning, optimization, and ZIP export.

### Features

- Bulk import with file picker and drag and drop
- MP4, MOV, MKV, AVI, WEBM, M4V, WMV, FLV, MPEG, MPG, 3GP, TS, MTS, M2TS support
- Per-video selection and per-video FPS
- Apply FPS to all or only selected videos
- Render modes: Clean, Detail, Retro, Stable, Experimental
- Experimental controls with live comparison previews
- Original or custom sizing with long-edge mode
- Output folder selection and quick folder open link
- GIF optimization flow after export
- ZIP save flow for completed GIFs
- Tray support and background running when the window is closed
- Inline stop controls during conversion
- Log panel with dock/resize behavior

### Run locally

```bash
npm install
npm start
```

## Türkçe

`gift-converter`, videolari toplu sekilde GIF'e donusturen; dosya bazli ayarlar, deneysel render secenekleri, optimizasyon ve ZIP disa aktarma sunan bir masaustu uygulamasidir.

### Ozellikler

- Dosya secici ve surukle birak ile toplu ice aktarma
- MP4, MOV, MKV, AVI, WEBM, M4V, WMV, FLV, MPEG, MPG, 3GP, TS, MTS, M2TS destegi
- Video bazli secim ve video bazli FPS
- FPS'i tum videolara veya sadece secilenlere uygulama
- Render modlari: Clean, Detail, Retro, Stable, Experimental
- Canli karsilastirma onizlemeleriyle deneysel ayarlar
- Original veya Custom boyutlandirma, long edge modu
- Cikti klasoru secimi ve klasore hizli git linki
- Export sonrasinda GIF optimizasyon akisi
- Tamamlanan GIF'ler icin ZIP kaydetme akisi
- Tray destegi ve pencere kapandiginda arka planda calisma
- Donusum sirasinda satir ustunden durdurma kontrolleri
- Dock/resize davranisli log paneli

## Deutsch

`gift-converter` ist eine Desktop-App, die grosse Video-Sammlungen mit dateibasierten Einstellungen, experimentellen Render-Optionen, Optimierung und ZIP-Export in GIFs umwandelt.

### Funktionen

- Stapelimport per Dateiauswahl und Drag-and-Drop
- Unterstuetzung fuer MP4, MOV, MKV, AVI, WEBM, M4V, WMV, FLV, MPEG, MPG, 3GP, TS, MTS, M2TS
- Auswahl und FPS pro Video
- FPS auf alle oder nur auf ausgewaehlte Videos anwenden
- Render-Modi: Clean, Detail, Retro, Stable, Experimental
- Experimentelle Regler mit Live-Vergleichsvorschau
- Originalgroesse oder benutzerdefinierte Skalierung mit Long-Edge-Modus
- Auswahl des Ausgabeordners mit Direktlink zum Ordner
- GIF-Optimierungsablauf nach dem Export
- ZIP-Speicherablauf fuer fertige GIFs
- Tray-Unterstuetzung und Hintergrundbetrieb nach dem Schliessen des Fensters
- Inline-Stopp waehrend der Konvertierung
- Andockbares und groessenveraenderbares Log-Panel

## Francais

`gift-converter` est une application de bureau qui convertit des lots de videos en GIF avec des reglages par fichier, des modes de rendu experimentaux, une optimisation et un export ZIP.

### Fonctionnalites

- Import en lot avec selecteur de fichiers et glisser-deposer
- Prise en charge de MP4, MOV, MKV, AVI, WEBM, M4V, WMV, FLV, MPEG, MPG, 3GP, TS, MTS, M2TS
- Selection par video et FPS par video
- Application du FPS a toutes les videos ou seulement aux videos selectionnees
- Modes de rendu : Clean, Detail, Retro, Stable, Experimental
- Reglages experimentaux avec apercus comparatifs en direct
- Taille d'origine ou taille personnalisee avec mode long edge
- Selection du dossier de sortie avec lien d'ouverture rapide
- Flux d'optimisation GIF apres export
- Flux d'enregistrement ZIP pour les GIF termines
- Support tray et execution en arriere-plan quand la fenetre est fermee
- Controle d'arret integre pendant la conversion
- Panneau de log detachable et redimensionnable

## Русский

`gift-converter` — это настольное приложение для пакетного преобразования видео в GIF с настройками для каждого файла, экспериментальными режимами рендера, оптимизацией и экспортом в ZIP.

### Возможности

- Пакетный импорт через выбор файлов и drag-and-drop
- Поддержка MP4, MOV, MKV, AVI, WEBM, M4V, WMV, FLV, MPEG, MPG, 3GP, TS, MTS, M2TS
- Выбор отдельных видео и FPS для каждого файла
- Применение FPS ко всем видео или только к выбранным
- Режимы рендера: Clean, Detail, Retro, Stable, Experimental
- Экспериментальные настройки с живыми сравнительными превью
- Исходный размер или пользовательский размер с режимом long edge
- Выбор папки вывода и быстрый переход к ней
- Поток оптимизации GIF после экспорта
- Сохранение завершённых GIF в ZIP
- Поддержка tray и работа в фоне после закрытия окна
- Встроенная остановка во время конвертации
- Панель логов с dock/resize поведением

## Structure

- `main.js` Electron main process
- `preload.js` secure bridge
- `src/index.html` app shell
- `src/renderer.js` UI logic
- `src/styles.css` UI styling
