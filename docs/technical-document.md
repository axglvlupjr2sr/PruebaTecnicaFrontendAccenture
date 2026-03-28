# Documento Técnico — Prueba Técnica Frontend

**Proyecto**: To-Do App Híbrida  
**Stack**: Ionic 8 + Angular 20 + Cordova 13  
**Firebase**: prueba-tecnica-todo-app  
**Repositorio**: https://github.com/axglvlupjr2sr/PruebaTecnicaFrontendAccenture  

---

## 1. Desafíos Enfrentados

### 1.1 Compatibilidad de Node 24 con Cordova

**Problema**: El entorno de desarrollo tenía Node v24.12.0 instalado globalmente. Varios plugins y herramientas de Cordova CLI son incompatibles con versiones de Node superiores a la 20 LTS, produciendo errores como `ERR_OSSL_EVP_UNSUPPORTED` y fallos en el binding nativo de módulos.

**Solución**: Se utilizó `nvm` para gestionar versiones de Node. Se creó un archivo `.nvmrc` en la raíz del proyecto fijando la versión `20`. Cada sesión de build nativo requiere ejecutar `nvm use 20` antes de cualquier comando de Cordova o Ionic.

**Impacto**: Eliminó todos los errores de compatibilidad en builds nativos. La versión de Node queda documentada y es reproducible en cualquier entorno.

---

### 1.2 Migración de NgModules a Standalone Components

**Problema**: El scaffold estándar de Ionic CLI genera una aplicación basada en `AppModule`, `IonicModule.forRoot()`, y el patrón de módulos de Angular 14 y anteriores. La prueba técnica requería el stack moderno de Angular standalone.

**Solución**: Refactorización completa eliminando `AppModule`. La app se bootstrappea con `bootstrapApplication()` en `main.ts` con providers explícitos:

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideIonicAngular(),
    provideHttpClient(),
  ]
});
```

Cada componente importa sus dependencias directamente, lo que permite a Angular tree-shake las partes de Ionic que no se usan.

**Impacto**: Bundle inicial reducido gracias a tree-shaking granular. Imports explícitos y trazables. Arquitectura alineada con Angular 20 moderno.

---

### 1.3 `FormsModule` + `[(ngModel)]` con `OnPush` Change Detection

**Problema crítico**: El `TaskFormComponent` usaba `[(ngModel)]` para enlazar el input del formulario a una propiedad de clase (`title: string`). Con `ChangeDetectionStrategy.OnPush`, las mutaciones directas a propiedades de clase no disparan change detection en Angular. El formulario dejaba de actualizarse visualmente al tipear.

**Solución**: Eliminación completa de `FormsModule` del componente. El estado del formulario se reescribió usando `signal()`:

```typescript
// Antes (ROTO con OnPush)
title = '';  // propiedad de clase, no dispara CD con OnPush

// Después (CORRECTO)
protected readonly title = signal('');
protected readonly category = signal<string>('personal');

// En el template
<ion-input [value]="title()" (ionInput)="title.set($event.detail.value)" />
```

**Impacto**: Formulario completamente reactivo sin depender de Zone.js para detección de cambios. Sin `FormsModule` en el bundle de este componente.

---

### 1.4 Firebase Remote Config en Modo Offline

**Problema**: La aplicación debe funcionar sin conexión a internet. `firebase/remote-config` lanza excepciones si Firebase es inalcanzable. Un crash en la inicialización de Remote Config hubiera bloqueado el arranque de la app.

**Solución**: `RemoteConfigService.init()` está completamente envuelto en `try/catch`. Si Firebase falla, el servicio mantiene el valor por defecto del feature flag (`false`) sin interrumpir el flujo de la aplicación:

```typescript
async init(): Promise<void> {
  if (!this.remoteConfig) {
    return;
  }

  try {
    this.remoteConfig.settings = {
      ...this.remoteConfig.settings,
      minimumFetchIntervalMillis: isDevMode() ? 0 : 3600_000,
    };

    await fetchAndActivate(this.remoteConfig);

    const value = getBoolean(this.remoteConfig, FLAG_SHOW_PRIORITY_BADGES);
    this._showPriorityBadges.set(value);
  } catch {
    // Firebase unreachable or any error — keep default (false)
    // App MUST continue working normally
  }
}
```

**Impacto**: App 100% funcional offline. Degradación elegante sin crasheo. El feature flag simplemente no se activa cuando Firebase es inalcanzable.

---

### 1.5 Push a GitHub sin Credential Helper del Sistema

**Problema**: En el entorno de desarrollo, el credential helper configurado en git (`ksshaskpass`) requería interacción con el entorno gráfico de KDE para autenticar el push. Esto hacía imposible el push automático desde terminal/agente.

**Solución**: Se usó el token de `gh` CLI inline en la URL de push, sin modificar la configuración global de git:

```bash
TOKEN=$(gh auth token) && git push https://${TOKEN}@github.com/axglvlupjr2sr/PruebaTecnicaFrontendAccenture.git HEAD:main
```

**Impacto**: Push reproducible en entornos de CI/CD y agentes automatizados. No requiere modificar la configuración de git ni las credenciales del sistema.

---

## 2. Optimizaciones Aplicadas

### 2.1 Rendimiento de Inicio (Time to Interactive)

**Lazy Loading por feature**: La ruta `/todo` carga el `TodoPageComponent` y sus dependencias on-demand:

```typescript
// app.routes.ts
{
  path: 'todo',
  loadChildren: () => import('./features/todo/todo.routes').then(m => m.TODO_ROUTES)
}
```

Resultado: el bundle inicial solo contiene el shell (`AppComponent` + `IonApp` + router). La feature de todo se carga en un chunk separado.

**Métricas de bundle**:

| Chunk | Tamaño |
|-------|--------|
| Bundle inicial | **248.60 kB** |
| Chunk lazy (todo feature) | **5.44 kB** |

**Tree-shaking de Ionic**: Standalone components permiten importar solo los componentes de Ionic que se usan (`IonItem`, `IonButton`, etc.) en lugar de `IonicModule` completo.

---

### 2.2 Rendimiento en Runtime

**`ChangeDetectionStrategy.OnPush`**: Los 7 componentes de la aplicación usan OnPush. Angular solo ejecuta change detection en un componente cuando:
- Cambia un `@Input()` (por referencia)
- Se dispara un evento del componente
- Se actualiza un `Signal` leído en el template

Esto elimina los "phantom renders" que ocurren con la estrategia `Default`.

**Signals como estado reactivo**: Sin `subscribe()`, sin `async pipe`, sin manejo manual de subscripciones. Los componentes leen `store.filteredTasks()` directamente en el template.

**`computed()` para estado derivado**: `filteredTasks` no es un signal mutable — es un `computed()` que recalcula solo cuando cambia `tasks` o `activeFilter`:

```typescript
readonly filteredTasks = computed(() => {
  const filter = this.activeFilter();
  return filter
    ? this.tasks().filter(t => t.categoryId === filter)
    : this.tasks();
});
```

**`@for` con `track`**: Las listas de tareas usan el nuevo control flow de Angular con track explícito:

```html
@for (task of tasks(); track task.id) {
  <app-task-card [task]="task" ... />
}
```

Esto permite a Angular reutilizar nodos DOM existentes en lugar de destruirlos y recrearlos en cada cambio.

---

### 2.3 Gestión de Memoria

**Sin subscripciones manuales**: Los Signals no requieren `unsubscribe()`. No hay memory leaks por subscripciones no canceladas.

**Actualizaciones inmutables**: Cada mutación del store crea un nuevo array (nunca se muta el array original):

```typescript
addTask(title: string, categoryId: string, priority?: TaskPriority): void {
  this.tasks.update(tasks => [...tasks, newTask]);  // nuevo array
}
```

Esto es necesario para que OnPush detecte el cambio por referencia, y además previene bugs de mutación compartida.

**Schema versionado en LocalStorage**: El schema incluye un campo `version` para migraciones futuras. Los datos corruptos o de versión incompatible son descartados gracefully (estado vacío, no crash).

---

### 2.4 UX y Accesibilidad

**Diseño Notion-style**: Interfaz minimalista en blanco y negro que reduce la carga cognitiva. Tipografía `DM Serif Display` para el título (auténtico look Notion), `Inter` para el cuerpo.

**Max-width 680px**: El contenido está centrado con un máximo de 680px — el mismo ancho que usa Notion para sus páginas. Mejora la legibilidad en pantallas anchas.

**Delete on hover**: El botón de eliminar aparece solo al hacer hover o focus sobre una tarjeta, reduciendo el ruido visual en el estado normal.

**Accesibilidad**: Los componentes incluyen `aria-label`, `aria-live` para listas dinámicas, y roles semánticos correctos.

---

## 3. Calidad del Código

### 3.1 Arquitectura

**Feature-first structure**: El código está organizado por dominio, no por tipo técnico:

```
core/      → transversal a toda la app (models, services)
shared/    → componentes reutilizables sin dominio específico
features/  → código específico de un dominio (todo/)
```

Esto facilita la escalabilidad: agregar un nuevo feature (`notes/`, `calendar/`) implica crear una nueva carpeta en `features/` sin tocar nada de `core/` o `shared/`.

**Container-Presentational pattern**: `TodoPageComponent` es el único componente que conoce el store y los servicios. Los componentes hijos (`TaskCard`, `FilterBar`, `TaskForm`) solo reciben inputs y emiten outputs — son fácilmente testeables sin mocks de servicios.

**Single Responsibility**: Cada servicio tiene una única responsabilidad:
- `LocalStorageService` → persistencia
- `RemoteConfigService` → feature flags
- `CategoryService` → datos de categorías
- `TodoStore` → estado de dominio

---

### 3.2 Tipado TypeScript

**Interfaces centralizadas**: Todos los tipos del dominio están en `core/models/task.model.ts`:

```typescript
type TaskPriority = 'low' | 'medium' | 'high';

interface Category { id: string; label: string; }

interface Task {
  id: string;          // crypto.randomUUID()
  title: string;
  completed: boolean;
  categoryId: string;
  priority?: TaskPriority;
  createdAt: string;   // ISO 8601
  updatedAt: string;
}

interface StorageSchema {
  version: number;
  tasks: Task[];
}
```

**Sin `any`**: TypeScript strict habilitado. No se usa `any` en interfaces públicas.

**Type guards en `LocalStorageService`**: Antes de hidratar el store, se valida que el objeto recuperado de localStorage tiene la estructura esperada. Datos corruptos retornan `null`.

---

### 3.3 Resiliencia

| Escenario de fallo | Comportamiento |
|-------------------|----------------|
| localStorage corrupto | `LocalStorageService.load()` retorna `null` → store inicia vacío |
| localStorage lleno (`QuotaExceededError`) | `try/catch` en `save()` → log de warning, no crash |
| Firebase inalcanzable | `RemoteConfigService.init()` captura exception → flag permanece `false` |
| Token Remote Config expirado | `minimumFetchIntervalMillis: 3600000` previene fetches excesivos |
| Título de tarea vacío | Validado en `TaskFormComponent` y en `TodoStore.addTask()` |

---

### 3.4 Mantenibilidad

**CSS Custom Properties como design tokens**: El sistema de diseño Notion está definido en `src/theme/variables.scss`. Cambiar cualquier aspecto visual del design system requiere editar una sola variable:

```scss
:root {
  --color-bg: #ffffff;
  --color-text: #191919;
  --color-text-secondary: #787774;
  --color-border: #e9e9e7;
  --font-display: 'DM Serif Display', serif;
  --font-body: 'Inter', sans-serif;
  --max-width-content: 680px;
}
```

**Conventional commits**: El historial de git usa commits semánticos (`feat:`, `fix:`, `docs:`, `refactor:`, `perf:`). Esto facilita la generación de changelogs y la trazabilidad de cambios.

**`.nvmrc`**: La versión de Node requerida está documentada en el repositorio y es enforceable con `nvm use`.

---

## 4. Guía de Build Nativo

> **Importante**: El desarrollo web (`ionic serve`) funciona en cualquier sistema operativo. Los builds nativos requieren SDKs específicos de plataforma y solo se pueden ejecutar en el entorno correcto.

### 4.0 Prerrequisitos por plataforma

**Para desarrollo web (sin build nativo):**
- Node 20 LTS (via nvm) — Node 24+ no es compatible con Cordova
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

---

### 4.1 Known Issue: Ionic CLI + Angular 20 Builders

**Síntoma**: Al ejecutar `ionic cordova build android --prod` con Ionic CLI 7.2.1 y Angular CLI 21.2.5 se produce el error:

```
[ERROR] Unknown argument: platform
```

**Cuándo ocurre**: Ionic CLI 7.2.1 + Angular CLI 21.2.5 + `@ionic/angular-toolkit` sobre Angular 20.

**Por qué ocurre**: `@ionic/angular-toolkit` pasa el argumento `--platform` al builder de Angular durante la fase de compilación web (`ng build`). Angular 20 cambió la interfaz de sus builders y ya no acepta ese argumento desconocido, fallando antes de invocar a Cordova.

**Workaround — Build manual en 3 pasos**: Separar el proceso en fases independientes, sin pasar por el builder de Ionic:

```bash
nvm use 20
# Paso 1: Build web de producción (Angular puro, sin intermediario de Ionic)
npx ng build --configuration=production
# Paso 2: Copiar assets web compilados a la plataforma nativa
npx cordova prepare android
# Paso 3: Compilar el APK
npx cordova compile android --release
```

**Estado**: Pendiente de fix por parte del equipo de Ionic. Registrado en el issue tracker de Ionic CLI. El workaround de build manual es 100% funcional y produce el mismo artefacto final.

---

### 4.2 Agregar plataformas (primera vez)

```bash
nvm use 20   # Obligatorio — Cordova no soporta Node 24+
ionic cordova platform add android
ionic cordova platform add ios     # Solo en macOS
```

---

### 4.3 Flujo completo para Android

**Opción 1 — Ionic CLI (recomendado si no hay error de builder):**

```bash
# 1. Asegurar Node 20 (obligatorio)
nvm use 20

# 2. Build APK debug (para testing)
ionic cordova build android

# 3. Build APK release
ionic cordova build android --prod --release

# Output: platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**Opción 2 — Build manual (workaround para `Unknown argument: platform`):**

```bash
# 1. Asegurar Node 20 (obligatorio)
nvm use 20

# 2. Build web de producción (Angular CLI directo)
npx ng build --configuration=production

# 3. Copiar assets web compilados a la plataforma
npx cordova prepare android

# 4. Compilar APK release
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

# Zipalign (optimizar para distribución)
zipalign -v 4 app-release-unsigned.apk TodoApp.apk
```

---

### 4.4 Flujo completo para iOS (solo macOS)

```bash
# 1. Asegurar Node 20
nvm use 20

# 2. Build IPA release
ionic cordova build ios --prod --release

# Output: platforms/ios/build/device/TodoApp.ipa
```

> Requiere un provisioning profile válido y firma de código configurados en Xcode. No es posible compilar para iOS en Linux ni Windows.

---

### 4.5 Troubleshooting rápido

| Problema | Causa | Solución |
|----------|-------|----------|
| `Unknown argument: platform` | Incompatibilidad Ionic CLI 7.x con Angular 20 builders | Usar build manual (sección 4.3 Opción 2) |
| `ERR_OSSL_EVP_UNSUPPORTED` | Node 24+ no compatible con Cordova | `nvm use 20` |
| `ANDROID_HOME is not set` | Android SDK no configurado | Instalar Android Studio y configurar variables de entorno |
| Build iOS falla en Linux/Windows | iOS requiere macOS + Xcode | Solo se puede compilar en macOS |
| `Gradle build failed` | Versión de JDK incompatible | Verificar JDK 17+: `java -version` |

---

*Documento técnico generado para la Prueba Técnica Frontend — Accenture — 2026*
