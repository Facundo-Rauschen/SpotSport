# SpotSport - Gestión de Reservas Deportivas

**SpotSport** es una solución móvil integral diseñada para simplificar la reserva de canchas en complejos deportivos multisede. La plataforma permite a los usuarios gestionar encuentros de **Fútbol, Voley y Padel** de manera eficiente, integrando geolocalización en tiempo real y una arquitectura orientada al rendimiento.

---

## 🚀 Funcionalidades Estratégicas

* **Exploración Geográfica:** Localización de sedes mediante mapas interactivos con visualización de ubicación del usuario en tiempo real.
* **Gestión de Reservas:** Panel centralizado para la administración de turnos, cancelaciones autónomas y filtrado inteligente de fechas.
* **Sedes Favoritas:** Acceso rápido a los complejos deportivos preferidos para agilizar el flujo de reserva.
* **Perfil Personalizado:** Gestión de identidad visual (Avatar/Cámara) y canal de soporte técnico integrado.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React Native (Expo Router)
* **Estado Global:** Redux Toolkit
* **Base de Datos:** SQLite (Persistencia local) + Firebase (Auth / Firestore)
* **Geolocalización:** Google Maps API + React Native Maps
* **Sincronización:** Sistema híbrido *Offline-First* para disponibilidad constante de datos.

---

## 🧠 Desafíos Técnicos y Soluciones

### 1. Arquitectura de Sincronización Híbrida
Se implementó un **Sync Service** que coordina la transferencia de datos entre Firebase y SQLite. Esto permite que la aplicación funcione con latencia cero en consultas de lectura, asegurando la disponibilidad de la información incluso en condiciones de conectividad limitada.

### 2. Consistencia de Estado Local-Global
Mediante el uso de **Redux** en conjunto con el hook `useFocusEffect`, se garantiza que cualquier cambio en la base de datos local (como marcar un favorito o cancelar una reserva) se refleje instantáneamente en toda la UI sin necesidad de recargas manuales.

---

## 📁 Estructura del Proyecto (Arquitectura MVC)

```text
src/
 ├── (components)/     # Componentes de UI atómicos y reutilizables
 ├── app/              # Enrutamiento y pantallas principales (Mapa, Reservas, Perfil)
 ├── database/         # Configuración de SQLite y Servicio de Sincronización
 ├── hooks/            # Lógica de negocio reutilizable y Custom Hooks
 ├── services/         # Integración con Firebase y APIs externas
 ├── store/            # Slices de Redux Toolkit (Sedes, Reservas, Favoritos)
 └── styles/           # Hojas de estilo centralizadas
```


## 📝 Documentación Detallada de Módulos

<details>
<summary>📍 <b>Módulo de Mapa (PantallaMapa.jsx)</b></summary>
<br />

Este componente es el encargado de la visualización geográfica y la orquestación de datos inicial. Es una pieza crítica que asegura que el usuario siempre vea información actualizada, incluso después de un primer inicio de sesión.

**Lógica de Sincronización Híbrida**
La aplicación implementa una estrategia de "Offline First" con sincronización en la nube:
* **Auth Check:** Al detectar un cambio en el estado de autenticación (Firebase Auth), se inicia el flujo.
* **Seeding & Sync:** Se utiliza `seedFirebase()` para asegurar datos base y `sincronizarTodoFirebaseASQLite()` para bajar la información del servidor a la base de datos local persistente.
* **Local Data Fetch:** El hook `recargarSedes` consulta directamente a SQLite mediante el ID del usuario, permitiendo que la app funcione sin latencia de red tras la carga inicial.

**Tecnologías y Hooks Clave**
* **useUbicacionUsuario:** Hook personalizado para gestionar los permisos y la obtención de coordenadas GPS del dispositivo.
* **react-native-maps:** Integración con el proveedor de Google Maps para el renderizado de la cartografía.
* **useFocusEffect:** Garantiza que los datos de las sedes (como el estado de "favoritos") se actualicen cada vez que el usuario vuelve a la pestaña del mapa.
* **Redux (useSelector, useDispatch):** Maneja la lista de complejos deportivos de forma global, permitiendo que otros módulos reaccionen a cambios en las sedes.

**Componentes Integrados**
* **MarcadorSede:** Renderiza iconos personalizados en el mapa según el tipo de deporte o estado de la sede.
* **SedeModal:** Interfaz emergente que se activa al interactuar con un marcador, permitiendo iniciar el flujo de reserva.

**🛠️ Flujo de Datos (Data Flow)**
1. `useEffect` monta el listener de Firebase Auth.
2. Se obtiene la ubicación del usuario para centrar la región del mapa.
3. Se sincronizan los datos remotos a la DB local.
4. `recargarSedes` despacha la información al store de Redux.
5. El mapa renderiza los marcadores (`puntosDeInteres`).

</details>

<details>
<summary>📅 <b>Módulo de Reservas y Favoritos (ReservasScreen.jsx)</b></summary>
<br />

Esta sección permite al usuario administrar su agenda deportiva y acceder rápidamente a sus sedes preferidas. Implementa una lógica de filtrado inteligente y sincronización bajo demanda.

**Gestión Inteligente de Datos**
* **Filtrado Temporal:** El sistema calcula automáticamente qué reservas mostrar basándose en la fecha y hora actual (`ahoraLocalStr`), filtrando turnos pasados para mantener la interfaz limpia y enfocada en lo próximo.
* **Ordenamiento Cronológico:** Las reservas se ordenan mediante `localeCompare` sobre el campo inicio, asegurando que el usuario vea primero su compromiso más cercano.
* **Sincronización Dual:**
    * **Automática:** Mediante `useFocusEffect`, la app intenta sincronizar con Firebase cada vez que el usuario entra a la pestaña.
    * **Manual (Pull-to-Refresh):** Implementación de `RefreshControl` para permitir al usuario forzar la actualización de datos desde la nube.

**Componentes de Interfaz Específicos**
* **FavoritosList:** Un carrusel o lista horizontal que permite acceso rápido a los detalles de las sedes marcadas como favoritas.
* **ReservaCard:** Componente especializado que muestra la información del turno (sede, deporte, horario) y expone la acción de cancelación.
* **FlatList con ListHeaderComponent:** Se utiliza una estructura de lista única para mejorar el rendimiento de scroll.

**Lógica de Estado Local y Global**
El componente actúa como un puente entre la base de datos SQLite y el estado global de Redux:
1. Extrae los datos crudos de la DB local (`obtenerMisReservasLocal`).
2. Procesa, filtra y ordena la información en el frontend.
3. Actualiza los Slices de reservas y favoritos en Redux.

**🛡️ Hooks Personalizados Utilizados**
* **useReservaSede:** Encapsula la lógica de negocio para crear o anular reservas, abstrayendo las llamadas a la API.
* **useFocusEffect:** Crucial para re-ejecutar la carga de datos cada vez que la pantalla gana el foco.

</details>

<details>
<summary>👤 <b>Módulo de Perfil y Configuración (SettingsScreen.jsx)</b></summary>
<br />

Este módulo centraliza la identidad del usuario y los canales de comunicación con el soporte técnico, ofreciendo una interfaz limpia y minimalista.

**Personalización de Identidad**
* **Gestión Dinámica de Avatar:** Lógica de visualización condicional (Foto de perfil o iniciales automáticas basadas en el email).
* **Integración con Hardware:** Utiliza `Alert` para ofrecer un menú de selección entre Cámara y Galería vía `useConfig`.
* **Persistencia de Imagen:** Permite la carga, actualización y eliminación de la foto de perfil sincronizando SQLite y el estado de la app.

**Soporte y Utilidades**
* **Integración de Correo (Linking API):** Implementa comunicación directa vía `mailto:`.
* **Componentes Atómicos (OptionItem):** Uso de componentes reutilizables para mantener la consistencia visual.
* **Seguridad de Sesión (handleSignOut):** Gestión centralizada del cierre de sesión y limpieza de estados globales.

**Detalles de UI/UX**
* **Badges Interactivos:** Superposiciones para los íconos de cámara y eliminación sobre el avatar.
* **Feedback Visual:** Implementación de estilos destructivos (colores de alerta) para acciones críticas como "Cerrar Sesión".

</details>

---
**Desarrollado por Facundo Rauschenberger**
# SpotSport