import { getAuth } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { db } from '../database/db';
import { database } from '../services/firebaseConfig';

/**
 * Sincroniza datos desde Firebase Realtime Database hacia SQLite local.
 * Utiliza UPDATE/INSERT en lugar de REPLACE para evitar el borrado en cascada de favoritos.
 */
export const sincronizarTodoFirebaseASQLite = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log("LOG [Sync]: ℹ️ No hay usuario autenticado. Cancelando sync.");
    return false;
  }

  try {
    const ahora = new Date().toISOString().split('.')[0].substring(0, 16);

    // 1. Descarga paralela
    const [snapComplejos, snapCanchas, snapReservasTotal] = await Promise.all([
      get(ref(database, 'complejos')),
      get(ref(database, 'canchas')),
      get(ref(database, 'reservas'))
    ]);

    const listaComplejos = snapComplejos.exists() ? Object.values(snapComplejos.val()) : [];
    const listaCanchas = snapCanchas.exists() ? Object.values(snapCanchas.val()) : [];

    let listaReservas = [];
    if (snapReservasTotal.exists()) {
      const data = snapReservasTotal.val();
      listaReservas = Object.entries(data)
        .map(([key, val]) => ({
          ...val,
          id: val.id || key
        }))
        .filter(r => String(r.user_id || r.userId) === String(user.uid));
    }

    // 2. Transacción atómica
    db.withTransactionSync(() => {
      
      // A. Limpieza de tablas dependientes (Canchas y Reservas)
      db.runSync('DELETE FROM reservas');
      db.runSync('DELETE FROM canchas');

      // B. ACTUALIZACIÓN INTELIGENTE DE COMPLEJOS
      listaComplejos.forEach((com) => {
        if (com?.id) {
          const idStr = String(com.id);
          
          // Intentamos actualizar los datos básicos sin tocar la fila completa
          const resultado = db.runSync(
            `UPDATE complejos 
             SET nombre = ?, lat = ?, lng = ?, direccion = ? 
             WHERE id = ?`,
            [
              String(com.nombre || ''),
              Number(com.lat || 0),
              Number(com.lng || 0),
              String(com.direccion || ''),
              idStr
            ]
          );

          // Si 'changes' es 0, significa que la sede no existía localmente, entonces la creamos
          if (resultado.changes === 0) {
            db.runSync(
              `INSERT INTO complejos (id, nombre, lat, lng, direccion, es_favorito) 
               VALUES (?, ?, ?, ?, ?, 0)`,
              [
                idStr,
                String(com.nombre || ''),
                Number(com.lat || 0),
                Number(com.lng || 0),
                String(com.direccion || '')
              ]
            );
          }
        }
      });

      // C. Insertar Canchas
      listaCanchas.forEach((can) => {
        if (can?.id) {
          db.runSync(
            `INSERT INTO canchas (id, complejo_id, deporte, nombre_cancha, precio_media_hora) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              String(can.id), 
              String(can.complejoId || can.complejo_id || ''), 
              String(can.deporte || ''), 
              String(can.nombreCancha || can.nombre_cancha || ''), 
              Number(can.precioMediaHora || can.precio_media_hora || 0)
            ]
          );
        }
      });

      // D. Insertar Reservas
      const hoySoloFecha = ahora.split('T')[0];
      let countR = 0;
      listaReservas.forEach((r) => {
        const fechaReserva = String(r.fin || r.inicio).split('T')[0];
        if (r.id && fechaReserva >= hoySoloFecha) {
          db.runSync(
            `INSERT INTO reservas (id, cancha_id, user_id, inicio, fin, estado) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [String(r.id), String(r.cancha_id || r.canchaId || ''), String(user.uid), String(r.inicio), String(r.fin), String(r.estado || 'confirmado')]
          );
          countR++;
        }
      });
      
      console.log(`LOG [Sync]: ✅ Sincronización finalizada. Reservas: ${countR}. Favoritos preservados.`);
    });

    return true;
  } catch (error) {
    console.error("LOG [Sync]: ❌ Error crítico:", error.message);
    return false;
  }
};