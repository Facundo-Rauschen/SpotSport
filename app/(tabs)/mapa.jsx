import { useFocusEffect } from 'expo-router';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';

import { obtenerTodosLosComplejos } from '../../src/database/db.js';
import { sincronizarTodoFirebaseASQLite } from '../../src/database/syncService.js';
import { useUbicacionUsuario } from '../../src/hooks/useUbicacionUsuario.js';
import { seedFirebase } from '../../src/services/seederFirebase.js';
import { setSedes } from '../../src/store/sedesSlice';

import MarcadorSede from '../(components)/MarcadorSede.jsx';
import SedeModal from '../(components)/SedeModal.jsx';

export default function PantallaMapa() {
  const dispatch = useDispatch();
  const puntosDeInteres = useSelector((state) => state.sedes.listaCompleta);

  const auth = getAuth();

  const [estaCargando, setEstaCargando] = useState(true);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mapaVersion, setMapaVersion] = useState(0);
  const [regionActual, setRegionActual] = useState(null);
  const { ubicacionActual, obtenerUbicacion } = useUbicacionUsuario();

  const recargarSedes = useCallback(() => {
    const userId = auth.currentUser?.uid;

    // 3. Pasamos el userId a la consulta de la DB
    const locales = obtenerTodosLosComplejos(userId);

    dispatch(setSedes(locales || []));
    setMapaVersion(v => v + 1);
  }, [dispatch, auth.currentUser]);

  useFocusEffect(
    useCallback(() => {
      recargarSedes();
    }, [recargarSedes])
  );

  useEffect(() => {
    // 4. El listener de Auth ya maneja la lógica de carga inicial
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        const ubi = await obtenerUbicacion();
        if (ubi) setRegionActual(ubi);

        if (user) {
          console.log("LOG [Mapa]: 👤 Usuario detectado:", user.uid);
          await seedFirebase();

          setTimeout(async () => {
            try {
              await sincronizarTodoFirebaseASQLite();
              recargarSedes(); // Aquí ya se ejecutará con el nuevo usuario
            } catch (syncError) {
              console.log("⚠️ Fallo sincronización:", syncError.message);
            }
          }, 700);

        }
      } catch (error) {
        console.log("Error inicial en Mapa:", error);
      } finally {
        setEstaCargando(false);
        recargarSedes(); // Aseguramos carga final
      }
    });

    return () => unsubscribe();
  }, [recargarSedes]);

  const manejarCierreModal = () => {
    setMostrarModal(false);
    setSedeSeleccionada(null);
    recargarSedes();
  };

  const alCambiarRegion = (region) => {
    setRegionActual(region);
  };

  if (estaCargando) {
    return (
      <View style={styles.contenedorCentro}>
        <ActivityIndicator size="large" color="#E74C3C" />
        <Text style={styles.textoCarga}>Sincronizando con SpotSport...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedorPrincipal}>
      <MapView
        key={`map-v-${mapaVersion}`}
        provider={PROVIDER_GOOGLE}
        style={styles.mapa}
        showsUserLocation={true}
        region={regionActual || ubicacionActual || {
          latitude: -34.6037, longitude: -58.3816,
          latitudeDelta: 0.1, longitudeDelta: 0.1
        }}
        onRegionChangeComplete={alCambiarRegion}
      >
        {puntosDeInteres.map((sede) => (
          <MarcadorSede
            key={`${sede.id}-${sede.es_favorito}`}
            sede={sede}
            alPresionar={(s) => {
              setSedeSeleccionada(s);
              setMostrarModal(true);
            }}
          />
        ))}
      </MapView>

      <SedeModal
        visible={mostrarModal}
        onClose={manejarCierreModal}
        sede={sedeSeleccionada}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: { flex: 1 },
  mapa: { ...StyleSheet.absoluteFillObject },
  contenedorCentro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  textoCarga: {
    marginTop: 10,
    color: '#2C3E50',
    fontWeight: '500'
  },
});