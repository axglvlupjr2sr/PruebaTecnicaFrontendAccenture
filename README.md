# 📝 To-Do App — Prueba Técnica Frontend

> Aplicación híbrida de gestión de tareas construida con **Ionic 8**, **Angular 20** y **Cordova**.  
> Diseño Notion-inspired en blanco y negro. Estado reactivo con Signals nativos de Angular. Feature flag via Firebase Remote Config.

---

## 🎬 Demo - En Releases encontrara el apk descargable 📦

https://res.cloudinary.com/axginterprise/video/upload/v1774832551/bbabad5b-9304-4f6e-bad0-9138a1b6dfdb_hm8dm2.mp4

---

## 📋 Tabla de Contenidos

- [Demo](#-demo)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Arquitectura](#️-arquitectura)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Ejecución](#️-instalación-y-ejecución)
- [Funcionalidades](#-funcionalidades)
- [Feature Flag — Firebase Remote Config](#-feature-flag--firebase-remote-config)
- [Optimizaciones de Rendimiento](#-optimizaciones-de-rendimiento)
- [Build Nativo](#-build-nativo)
- [Decisiones Técnicas](#-decisiones-técnicas)
- [Autor](#-autor)

---

## 🛠️ Stack Tecnológico

| Área | Tecnología | Versión |
|------|-----------|---------|
| Framework Web | Angular (standalone) | 20.x |
| UI Library | Ionic Framework | 8.x |
| State Management | Angular Signals (`signal`, `computed`, `effect`) | — |
| Persistencia | LocalStorage (versioned JSON schema) | — |
| Feature Flags | Firebase Remote Config | modular SDK |
| Build Nativo | Apache Cordova | 13.x |
| Tipografía | DM Serif Display + Inter | Google Fonts |
| Node | Node.js LTS | 20.x (via nvm) |
| Package Manager | npm | 10+ |

---

## 🏗️ Arquitectura

### Principios

- **Standalone components**: Sin `NgModules`. Todo usa `bootstrapApplication()` con providers explícitos.
- **Feature-first folder structure**: El código se organiza por dominio (`core/`, `shared/`, `features/todo/`), no por tipo técnico.
- **Container-Presentational pattern**: `TodoPageComponent` es el único container que inyecta el store y los servicios. Los componentes hijos son puramente presentacionales (inputs/outputs).
- **Signal-based reactive state**: Sin RxJS para estado local, sin NgRx, sin libraries externas. `signal()` para estado mutable, `computed()` para estado derivado, `effect()` para side effects de persistencia.
- **OnPush everywhere**: Los 7 componentes usan `ChangeDetectionStrategy.OnPush` — Angular solo re-renderiza cuando cambian inputs o se disparan señales.

### Jerarquía de Componentes

```
AppComponent
└── IonApp + IonRouterOutlet
    └── TodoPageComponent (container — lazy loaded)
        ├── TaskFormComponent       ← presentational: emite (taskCreated)
        ├── FilterBarComponent      ← presentational: emite (filterChanged)
        ├── TaskListComponent       ← presentational: recibe [tasks]
        │   └── TaskCardComponent   ← presentational: recibe [task], emite (toggle), (delete)
        └── EmptyStateComponent     ← presentational: se muestra cuando no hay tareas
```

### Flujo de Datos

```
UI Action
   │
   ▼
TodoStore (signal)          ◄── LocalStorageService.load() (app init)
   │  signal.update()
   │
   ├── filteredTasks()       ← computed() — recalcula solo cuando cambian tasks o activeFilter
   │
   └── effect()             ─── LocalStorageService.save() (debounced)

RemoteConfigService
   ├── init() → Firebase fetchAndActivate()
   └── showPriorityBadges (Signal<boolean>) ─── TaskCardComponent (badge condicional)
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── app.component.ts              # Root standalone component (IonApp + IonRouterOutlet)
│   ├── app.config.ts                 # bootstrapApplication providers (router, ionic, http)
│   ├── app.routes.ts                 # Root routes ('' → redirect, 'todo' → lazy load)
│   │
│   ├── core/
│   │   ├── models/
│   │   │   └── task.model.ts         # Task, Category, TaskPriority, StorageSchema interfaces
│   │   └── services/
│   │       ├── category.service.ts   # Seed categories, getAll() → Signal<Category[]>
│   │       ├── local-storage.service.ts  # load(), save(), reset() con versioned schema
│   │       └── remote-config.service.ts  # init(), showPriorityBadges signal, offline fallback
│   │
│   ├── shared/
│   │   └── components/
│   │       └── empty-state/          # (legacy — movido a features/todo/components)
│   │
│   └── features/
│       └── todo/
│           ├── todo.routes.ts        # Child routes del feature
│           ├── store/
│           │   └── todo.store.ts     # Signal store: tasks, filteredTasks, CRUD, persistence
│           ├── pages/
│           │   └── todo-page/
│           │       └── todo-page.component.ts  # Container: orquesta todos los hijos
│           └── components/
│               ├── task-form/        # Formulario de nueva tarea (signals para estado)
│               ├── filter-bar/       # Filtro por categoría (chips horizontales)
│               ├── task-list/        # Lista de tareas con @for + track
│               ├── task-card/        # Tarjeta individual (badge condicional, hover delete)
│               └── empty-state/     # Estado vacío con mensaje contextual
│
├── theme/
│   └── variables.scss               # CSS custom properties (Notion color tokens)
├── global.scss                      # Reset, tipografía, Ionic overrides
└── main.ts                          # Entry point con bootstrapApplication()
```

---

## ⚙️ Instalación y Ejecución

### Prerrequisitos

- **Node 20 LTS** — recomendado via [nvm](https://github.com/nvm-sh/nvm)
- **npm 10+**
- **Ionic CLI**: `npm install -g @ionic/cli`

### Setup

```bash
# 1. Clonar el repositorio
git clone https://github.com/axglvlupjr2sr/PruebaTecnicaFrontendAccenture.git
cd PruebaTecnicaFrontendAccenture

# 2. Fijar Node 20 (requerido por Cordova)
nvm use 20

# 3. Instalar dependencias
npm install

# 4. Ejecutar en desarrollo
ionic serve
```

La app estará disponible en `http://localhost:8100`.

### Archivo .nvmrc

El proyecto incluye un `.nvmrc` que fija `20`. Podés ejecutar simplemente:

```bash
nvm use
```

---

## ✨ Funcionalidades

| Funcionalidad | Descripción |
|--------------|-------------|
| ✅ Crear tarea | Título + categoría seleccionable |
| ✅ Completar tarea | Toggle con tachado visual |
| ✅ Eliminar tarea | Botón visible al hacer hover/focus |
| ✅ Filtro por categoría | Chips horizontales, estado activo resaltado |
| ✅ Categorías | Work, Personal, Shopping, Health, Learning |
| ✅ Persistencia | LocalStorage — las tareas sobreviven al reload |
| ✅ Feature Flag | Priority badges activables via Firebase Remote Config |
| ✅ Diseño Notion-style | B&W, DM Serif Display, max-width 680px |
| ✅ Build nativo | Android APK y iOS IPA via Cordova |

---

## 🏁 Feature Flag — Firebase Remote Config

### Nombre del flag: `todo_show_priority_badges`

Este feature flag controla la visibilidad de los **badges de prioridad** en cada tarjeta de tarea.

| Aspecto | Detalle |
|--------|---------|
| Valor por defecto | `false` (badges ocultos) |
| Cuando `true` | Se muestra un badge con el nivel de prioridad de la tarea |
| Proyecto Firebase | `prueba-tecnica-todo-app` |
| Implementación | `RemoteConfigService.showPriorityBadges` — `Signal<boolean>` |

### Cómo activarlo en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com/) → Proyecto `prueba-tecnica-todo-app`
2. En el menú lateral: **Remote Config**
3. Buscar el parámetro `todo_show_priority_badges`
4. Cambiar el valor a `true`
5. Hacer click en **Publish changes**
6. La app tomará el nuevo valor en la próxima apertura (cache de 1 hora en producción)

### Comportamiento offline

Si Firebase es inalcanzable (sin conexión, error de red), `RemoteConfigService` captura la excepción en un `try/catch` y mantiene el valor por defecto `false`. **La app nunca crashea por un feature flag.**

---

## ⚡ Optimizaciones de Rendimiento

### Bundle

| Métrica | Valor |
|--------|-------|
| Bundle inicial | **248 kB** |
| Lazy chunk (todo feature) | **5.4 kB** |
| Estrategia | `loadComponent` + `loadChildren` |

### Técnicas aplicadas

| Optimización | Detalle |
|-------------|---------|
| **Lazy loading** | La feature `todo` se carga on-demand — el bundle inicial solo contiene el shell + router |
| **OnPush** | Los 7 componentes usan `ChangeDetectionStrategy.OnPush` — mínimos ciclos de detección |
| **Signals** | Estado reactivo nativo — sin subscripciones, sin Zone.js overhead para cambios de estado |
| **`computed()`** | `filteredTasks()` recalcula solo cuando cambian `tasks` o `activeFilter` |
| **`trackBy`** | `@for (task of tasks; track task.id)` — Angular reutiliza nodos DOM en lugar de recrearlos |
| **Effect debounce** | Persistencia a localStorage ejecuta después del microtask, no en cada keystroke |
| **Standalone tree-shaking** | Imports granulares de Ionic — solo los componentes usados van al bundle |

---

## 📱 Build Nativo

> **Nota**: El desarrollo web (`ionic serve`) funciona en cualquier sistema operativo. Los builds nativos requieren SDKs específicos de plataforma.

### Prerrequisitos

**Para desarrollo web (sin build nativo):**
- Node 20 LTS (via nvm)
- npm 10+
- Ionic CLI: `npm install -g @ionic/cli`

**Para Android (APK):**
- Todo lo anterior +
- Android Studio con Android SDK (API level 34 recomendado)
- Java JDK 17+ (OpenJDK recomendado)
- Gradle 8+ (incluido con Android Studio)
- Variables de entorno configuradas:
  ```bash
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
  ```

**Para iOS (IPA):**
- Todo lo anterior +
- macOS con Xcode 15+
- Apple Developer Account
- CocoaPods: `sudo gem install cocoapods`
- Un provisioning profile válido configurado en Xcode

### Agregar plataformas (primera vez)

```bash
nvm use 20   # Obligatorio — Cordova no soporta Node 24+
ionic cordova platform add android
ionic cordova platform add ios     # Solo en macOS
```

### Android (APK)

**Opción 1 — Ionic CLI (recomendado):**
```bash
nvm use 20
ionic cordova build android --prod --release
# Output: platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**Opción 2 — Build manual (workaround si Ionic CLI da error):**
```bash
nvm use 20
# Paso 1: Build web de producción
npx ng build --configuration=production
# Paso 2: Copiar assets web a la plataforma
npx cordova prepare android
# Paso 3: Compilar APK
npx cordova compile android --release
# Output: platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**Firmar el APK para distribución:**
```bash
# Generar keystore (una sola vez)
keytool -genkey -v -keystore todo-app-release.keystore -alias todoapp -keyalg RSA -keysize 2048 -validity 10000

# Firmar
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore todo-app-release.keystore \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk todoapp

# Zipalign (optimizar)
zipalign -v 4 app-release-unsigned.apk TodoApp.apk
```

### iOS (IPA) — solo macOS

```bash
nvm use 20
ionic cordova build ios --prod --release
# Output: platforms/ios/build/device/TodoApp.ipa
```

> Requiere un provisioning profile válido y firma de código configurados en Xcode.

### ⚠️ Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| `Unknown argument: platform` | Incompatibilidad Ionic CLI 7.x con Angular 20 builders | Usar build manual (Opción 2) |
| `ERR_OSSL_EVP_UNSUPPORTED` | Node 24+ no compatible con Cordova | `nvm use 20` |
| `ANDROID_HOME is not set` | Android SDK no configurado | Instalar Android Studio y configurar variables |
| Build iOS falla en Linux/Windows | iOS requiere macOS + Xcode | Solo se puede compilar en macOS |

---

## 🧠 Decisiones Técnicas

| # | Decisión | Elección | Alternativas descartadas | Razón |
|---|----------|---------|--------------------------|-------|
| 1 | Estrategia de bootstrap | `bootstrapApplication()` standalone | `AppModule` NgModule-based | Angular standalone es el estándar moderno; elimina boilerplate; mejor tree-shaking |
| 2 | Gestión de estado | Signal-based `TodoStore` | NgRx, RxJS BehaviorSubject | Cero dependencias externas; `computed()` para estado derivado; sin boilerplate de actions/reducers |
| 3 | Persistencia | `LocalStorageService` con schema versionado | IndexedDB, Capacitor Preferences | Spec requiere local-only; datos < 1MB; localStorage es sincrónico y suficiente |
| 4 | Feature flags | Firebase Remote Config (SDK modular) | REST polling, flags hardcodeados | El brief explícitamente requiere Firebase; SDK modular hace tree-shaking de módulos no usados |
| 5 | Build nativo | Apache Cordova | Capacitor | El brief explícitamente requiere Cordova |
| 6 | Design system | CSS Custom Properties + SCSS global | Tailwind, solo theming de Ionic | Control total sobre el diseño Notion; evitar conflictos con estilos de Ionic |
| 7 | Patrón de componentes | Container-Presentational | Smart-only, Atomic Design puro | Separación clara de responsabilidades; componentes presentacionales son reutilizables y testeables |
| 8 | Change detection | `OnPush` en todos los componentes | `Default` | Detección explícita; mejor rendimiento en listas; sin renders innecesarios |

---

## 👤 Autor

**Abiezer Guerra**

- GitHub: [@axglvlupjr2sr](https://github.com/axglvlupjr2sr)
- Repositorio: [PruebaTecnicaFrontendAccenture](https://github.com/axglvlupjr2sr/PruebaTecnicaFrontendAccenture)

---

*Prueba Técnica Frontend — Accenture — 2026*
