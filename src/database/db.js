import * as SQLite from 'expo-sqlite';
import { getAuth } from 'firebase/auth';

export const db = SQLite.openDatabaseSync('spotsport.db');

export const inicializarBaseDeDatos = () => {
  try {
    db.execSync(`PRAGMA foreign_keys = ON;`);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS complejos (
        id TEXT PRIMARY KEY NOT NULL,
        nombre TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        direccion TEXT
      );

      CREATE TABLE IF NOT EXISTS canchas (
        id TEXT PRIMARY KEY NOT NULL,
        complejo_id TEXT NOT NULL,
        deporte TEXT NOT NULL,
        nombre_cancha TEXT NOT NULL,
        precio_media_hora REAL,
        FOREIGN KEY (complejo_id) REFERENCES complejos (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reservas (
        id TEXT PRIMARY KEY NOT NULL,
        cancha_id TEXT NOT NULL,
        user_id TEXT, 
        inicio TEXT NOT NULL,
        fin TEXT NOT NULL,
        estado TEXT DEFAULT 'confirmado',
        FOREIGN KEY (cancha_id) REFERENCES canchas (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS usuarios (
        email TEXT PRIMARY KEY NOT NULL,
        foto_uri TEXT
      );
      CREATE TABLE IF NOT EXISTS favoritos (
        user_id TEXT NOT NULL,
        complejo_id TEXT NOT NULL,
        PRIMARY KEY (user_id, complejo_id),
        FOREIGN KEY (complejo_id) REFERENCES complejos (id) ON DELETE CASCADE
      );
    `);

    // Parches de seguridad para columnas faltantes
    const parches = [
      { tabla: 'complejos', columna: 'es_favorito', tipo: 'INTEGER DEFAULT 0' },
      { tabla: 'reservas', columna: 'user_id', tipo: 'TEXT' },
      { tabla: 'reservas', columna: 'estado', tipo: "TEXT DEFAULT 'confirmado'" }
    ];

    parches.forEach(p => {
      try {
        db.execSync(`ALTER TABLE ${p.tabla} ADD COLUMN ${p.columna} ${p.tipo};`);
      } catch (e) { /* Columna ya existe */ }
    });

    console.log("✅ Estructura SQLite verificada y parchada.");
  } catch (error) {
    console.error("❌ Error al inicializar las tablas:", error);
  }
};

// --- MÉTODOS DE INSERCIÓN / ACTUALIZACIÓN ---

export const insertarOActualizarComplejo = (id, nombre, lat, lng, direccion) => {
  return db.runSync(
    `INSERT OR REPLACE INTO complejos (id, nombre, lat, lng, direccion) 
     VALUES (?, ?, ?, ?, ?)`,
    [id, nombre, lat, lng, direccion]
  );
};

export const insertarOActualizarCancha = (id, complejoId, deporte, nombreCancha, precio) => {
  return db.runSync(
    'INSERT OR REPLACE INTO canchas (id, complejo_id, deporte, nombre_cancha, precio_media_hora) VALUES (?, ?, ?, ?, ?)',
    [id, complejoId, deporte, nombreCancha, precio]
  );
};

export const insertarReservaLocal = (id, canchaId, inicio, fin, userId) => {
  return db.runSync(
    'INSERT OR REPLACE INTO reservas (id, cancha_id, inicio, fin, user_id) VALUES (?, ?, ?, ?, ?)',
    [id, canchaId, inicio, fin, userId] // Asegúrate de pasar el 5to parámetro
  );
};

// --- MÉTODOS DE CONSULTA (GETTERS) ---

// src/database/db.js

export const obtenerTodosLosComplejos = (userId) => {
  try {
    console.log(`🔍 LOG [DB]: Consultando sedes para el usuario: ${userId || 'INVITADO'}`);

    const query = `
      SELECT 
        c.*, 
        CASE WHEN f.complejo_id IS NOT NULL THEN 1 ELSE 0 END as es_favorito
      FROM complejos c
      LEFT JOIN favoritos f ON c.id = f.complejo_id AND f.user_id = ?
    `;
    
    const resultados = db.getAllSync(query, [userId ? String(userId) : null]);
    
    // Log para ver si al menos uno viene con es_favorito: 1
    const favCount = resultados.filter(r => r.es_favorito === 1).length;
    console.log(`📊 LOG [DB]: Total sedes: ${resultados.length} | Marcadas como favorito: ${favCount}`);
    
    return resultados;
  } catch (error) {
    console.error("❌ Error en obtenerTodosLosComplejos:", error);
    return [];
  }
};

export const obtenerSedesFavoritasLocal = (userId) => {
  try {
    return db.getAllSync(`
      SELECT c.*, 1 as es_favorito 
      FROM complejos c
      INNER JOIN favoritos f ON c.id = f.complejo_id
      WHERE f.user_id = ?
      ORDER BY c.nombre ASC
    `, [userId]);
  } catch (error) {
    return [];
  }
};

export const obtenerCanchasPorComplejo = (complejoId) => {
  return db.getAllSync('SELECT * FROM canchas WHERE complejo_id = ?', [complejoId]);
};

export const obtenerReservasPorCancha = (canchaId) => {
  return db.getAllSync('SELECT * FROM reservas WHERE cancha_id = ?', [canchaId]);
};


export const obtenerMisReservasLocal = () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return [];

    const userId = String(user.uid);

    const query = `
      SELECT 
        r.id,
        r.cancha_id,
        r.user_id,
        r.inicio,
        r.fin,
        r.estado,
        c.nombre_cancha, 
        c.deporte, 
        comp.nombre AS nombre_sede,
        comp.direccion AS direccion_sede
      FROM reservas r
      LEFT JOIN canchas c ON r.cancha_id = c.id
      LEFT JOIN complejos comp ON c.complejo_id = comp.id
      WHERE r.user_id = ?
      ORDER BY r.inicio DESC
    `;

    const resultados = db.getAllSync(query, [userId]);
    
    // LOG DE CONTROL
    if (resultados.length === 0) {
        // Si no hay resultados, verificamos si es que la tabla está vacía o el filtro falla
        const debugTotal = db.getAllSync("SELECT COUNT(*) as total FROM reservas");
        console.log(`LOG [DB]: 🔍 Tabla reservas tiene ${debugTotal[0].total} registros totales.`);
    }

    return resultados;
  } catch (error) {
    console.error("❌ Error en obtenerMisReservasLocal:", error.message);
    return [];
  }
};

// --- MÉTODOS DE ACTUALIZACIÓN ---

export const actualizarEstadoFavorito = (complejoId, esFavorito, userId) => {
  console.log(`💾 LOG [DB]: Guardando - Sede: ${complejoId} | User: ${userId} | Estado: ${esFavorito}`);

  if (!userId || !complejoId) {
    console.error("❌ LOG [DB]: Faltan datos críticos (userId o complejoId)");
    return;
  }

  try {
    if (esFavorito) {
      const res = db.runSync(
        "INSERT OR IGNORE INTO favoritos (user_id, complejo_id) VALUES (?, ?)",
        [String(userId), String(complejoId)]
      );
      console.log("✅ LOG [DB]: Insertado en tabla favoritos", res);
      return res;
    } else {
      const res = db.runSync(
        "DELETE FROM favoritos WHERE user_id = ? AND complejo_id = ?",
        [String(userId), String(complejoId)]
      );
      console.log("🗑️ LOG [DB]: Eliminado de tabla favoritos", res);
      return res;
    }
  } catch (error) {
    console.error("❌ LOG [DB]: Error al ejecutar query de favorito:", error);
  }
};

// --- MÉTODOS PARA USUARIOS ---

export const guardarFotoUsuario = (email, uri) => {
  return db.runSync(
    'INSERT OR REPLACE INTO usuarios (email, foto_uri) VALUES (?, ?)',
    [email, uri]
  );
};

export const obtenerFotoUsuario = (email) => {
  try {
    const registro = db.getFirstSync('SELECT foto_uri FROM usuarios WHERE email = ?', [email]);
    return registro ? registro.foto_uri : null;
  } catch (error) {
    return null;
  }
};

export const borrarFotoUsuario = (email) => {
  return db.runSync(
    'UPDATE usuarios SET foto_uri = NULL WHERE email = ?',
    [email]
  );
};

// --- LIMPIEZA ---

export const limpiarTablas = () => {
  db.execSync('DELETE FROM reservas; DELETE FROM canchas; DELETE FROM complejos; DELETE FROM favoritos;');
};