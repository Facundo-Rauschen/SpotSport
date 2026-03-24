import { getAuth } from "firebase/auth";
import { get, ref, update } from "firebase/database";
import { database } from "./firebaseConfig";

export const seedFirebase = async () => {
  const auth = getAuth();
  
  if (!auth.currentUser) {
    console.log("LOG [Seeder]: ℹ️ Usuario no autenticado. Omitiendo seeder.");
    return;
  }
  
  try {
    const hoyIso = new Date().toISOString().split('T')[0];
    const complejosRef = ref(database, 'complejos');

    // 1. Verificamos si ya existen datos
    const snapshot = await get(complejosRef);
    
    if (snapshot.exists()) {
      console.log("LOG [Seeder]: ✅ Firebase ya tiene datos. Omitiendo carga inicial.");
      return;
    }

    // 2. LÓGICA DE RESET (Comentada según tu pedido)
    // console.log("LOG [Seeder]: 🗑️ Borrando base de datos actual...");
    // await update(ref(database), { 
    //   complejos: null, 
    //   canchas: null, 
    //   reservas: null 
    // });

    console.log("LOG [Seeder]: 🚩 Base de datos vacía. Iniciando carga única...");

    const sedesReales = [
      { id: 1, nombre: 'SpotSport Muñiz', lat: -34.5443, lng: -58.6992, dir: 'San José 701' },
      { id: 2, nombre: 'SpotSport Bella Vista', lat: -34.5543, lng: -58.6977, dir: 'Dr. Pedro A. Pardo 1609' },
      { id: 3, nombre: 'SpotSport Constituyentes', lat: -34.5742, lng: -58.5068, dir: 'Av. de los Constituyentes 6020' },
      { id: 4, nombre: 'SpotSport Beiró', lat: -34.5988, lng: -58.4999, dir: 'Av. Francisco Beiró 3352' },
      { id: 5, nombre: 'SpotSport Unicenter', lat: -34.5087, lng: -58.5270, dir: 'Paraná 3745' },
      { id: 6, nombre: 'SpotSport Libertador', lat: -34.5456, lng: -58.4597, dir: 'Av. del Libertador 7395' },
      { id: 7, nombre: 'SpotSport Belgrano R', lat: -34.5701, lng: -58.4682, dir: 'Zapiola 2125' },
      { id: 8, nombre: 'SpotSport Almagro', lat: -34.6033, lng: -58.4216, dir: 'Av. Medrano 522' },
      { id: 10, nombre: 'SpotSport Flores', lat: -34.6295, lng: -58.4633, dir: 'Av. Rivadavia 7055' },
      { id: 11, nombre: 'SpotSport Paraguay', lat: -34.5985, lng: -58.3975, dir: 'Paraguay 2060' },
      { id: 12, nombre: 'SpotSport Palermo', lat: -34.5828, lng: -58.4234, dir: 'Av. Santa Fe 3535' },
      { id: 13, nombre: 'SpotSport Caballito', lat: -34.6174, lng: -58.4411, dir: 'Av. Juan B. Alberdi 402' },
      { id: 14, nombre: 'SpotSport Urquiza', lat: -34.5724, lng: -58.4851, dir: 'Bauness 2161' },
      { id: 15, nombre: 'SpotSport Colegiales', lat: -34.5794, lng: -58.4501, dir: 'Av. Federico Lacroze 2751' },
      { id: 16, nombre: 'SpotSport Vicente López', lat: -34.5224, lng: -58.4721, dir: 'Av. del Libertador 1000' },
      { id: 17, nombre: 'SpotSport Pilar', lat: -34.4533, lng: -58.9133, dir: 'Ruta 8 km 50' },
      { id: 18, nombre: 'SpotSport Lanús', lat: -34.7001, lng: -58.3933, dir: 'Av. Hipólito Yrigoyen 4500' },
      { id: 19, nombre: 'SpotSport Lomas', lat: -34.7583, lng: -58.4022, dir: 'España 65' },
      { id: 20, nombre: 'SpotSport Castelar', lat: -34.6594, lng: -58.6322, dir: 'Santa Rosa 951' }
    ];

    const dataFinal = { complejos: {}, canchas: {} };
    let canchaContador = 1;

    sedesReales.forEach((sede) => {
      dataFinal.complejos[sede.id] = {
        id: sede.id,
        nombre: sede.nombre,
        lat: sede.lat,
        lng: sede.lng,
        direccion: sede.dir
      };

      const configSede = [
        { deporte: 'Fútbol', cant: 3, precio: 6000 },
        { deporte: 'Voley', cant: 2, precio: 4500 },
        { deporte: 'Padel', cant: 2, precio: 5500 }
      ];

      configSede.forEach((conf) => {
        for (let i = 1; i <= conf.cant; i++) {
          const currentCanchaId = canchaContador++;
          dataFinal.canchas[currentCanchaId] = {
            id: currentCanchaId,
            complejoId: sede.id,
            deporte: conf.deporte,
            nombreCancha: `${conf.deporte} ${i}`,
            precioMediaHora: conf.precio
          };
        }
      });
    });

    // 3. CARGA DE DATOS
    await update(ref(database), {
      complejos: dataFinal.complejos,
      canchas: dataFinal.canchas
    });

    console.log(`LOG [Seeder]: ✅ Carga exitosa (${hoyIso}).`);

  } catch (error) {
    console.error("LOG [Seeder]: ⚠️ Seeder abortado:", error.message);
  }
};