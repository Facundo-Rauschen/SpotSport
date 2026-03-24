import { useFocusEffect } from 'expo-router';
import { getAuth } from 'firebase/auth'; // Importante para el userId
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// Acciones de Redux e Hooks de lógica
import { useReservaSede } from '../../src/hooks/useReservaSede';
import { setFavoritos } from '../../src/store/favoritosSlice';
import { setReservas } from '../../src/store/reservasSlice';

// Funciones de Base de Datos y Sync
import { obtenerMisReservasLocal, obtenerSedesFavoritasLocal } from '../../src/database/db';
import { sincronizarTodoFirebaseASQLite } from '../../src/database/syncService';

// Componentes
import FavoritosList from '../(components)/FavoritosList';
import ReservaCard from '../(components)/ReservaCard';
import DetalleSedeModal from '../(components)/SedeModal';

export default function ReservasScreen() {
  const dispatch = useDispatch();

  const reservas = useSelector((state) => state.reservas.lista);
  const favoritos = useSelector((state) => state.favoritos.lista);

  const [refreshing, setRefreshing] = useState(false);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { ejecutarCancelacion } = useReservaSede(false, null, null);

  const cargarDatosDesdeBD = useCallback(() => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      const datosReservas = obtenerMisReservasLocal() || [];
      const datosFavoritos = obtenerSedesFavoritasLocal(userId) || [];

      const ahora = new Date();
      const ahoraLocalStr = ahora.toLocaleString('sv-SE').replace(' ', 'T').substring(0, 16);

      // FILTRADO DE PRÓXIMAS RESERVAS
      const proximas = datosReservas.filter(res => {
        const tiempoLimite = res.fin || res.inicio;
        return tiempoLimite >= ahoraLocalStr;
      });

      // ORDENAMIENTO (Aquí se define 'ordenadas')
      const ordenadas = proximas.sort((a, b) => a.inicio.localeCompare(b.inicio));

      // DESPACHO A REDUX
      dispatch(setReservas(ordenadas));
      dispatch(setFavoritos(datosFavoritos));
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      cargarDatosDesdeBD();
      const autoSync = async () => {
        try {
          const exito = await sincronizarTodoFirebaseASQLite();
          if (exito) cargarDatosDesdeBD();
        } catch (error) {
          console.error("❌ Error en auto-sync:", error);
        }
      };
      autoSync();
    }, [cargarDatosDesdeBD])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await sincronizarTodoFirebaseASQLite();
      cargarDatosDesdeBD();
    } finally {
      setRefreshing(false);
    }
  };

  const manejarPresionarFavorito = (sede) => {
    setSedeSeleccionada(sede);
    setModalVisible(true);
  };

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={reservas}
        keyExtractor={(item) => `reserva-${item.id}`}
        renderItem={({ item }) => (
          <ReservaCard
            item={item}
            onCancelar={ejecutarCancelacion}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.encabezadoPrincipal}>
              <Text style={styles.titulo}>Mis Turnos</Text>
              <Text style={styles.textoContador}>{reservas.length} turnos</Text>
            </View>

            <FavoritosList
              favoritos={favoritos}
              onSedePress={manejarPresionarFavorito}
            />

            {reservas.length > 0 ? (
              <Text style={styles.tituloSeccion}>Próximas Reservas</Text>
            ) : (
              <View style={styles.contenedorVacio}>
                <Text style={styles.textoVacio}>No tienes reservas para hoy</Text>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.contenidoLista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E74C3C" />
        }
      />

      {sedeSeleccionada && (
        <DetalleSedeModal
          visible={modalVisible}
          onClose={() => { setModalVisible(false); setSedeSeleccionada(null); cargarDatosDesdeBD(); }}
          sede={sedeSeleccionada}
          onDataChange={cargarDatosDesdeBD}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8F9F9', paddingHorizontal: 20 },
  contenidoLista: { paddingTop: 60, paddingBottom: 100 },
  encabezadoPrincipal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
  textoContador: { color: '#95A5A6', fontSize: 14, fontWeight: '600' },
  tituloSeccion: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 15, marginTop: 15 },
  contenedorVacio: { padding: 40, alignItems: 'center' },
  textoVacio: { color: '#BDC3C7', fontSize: 16 }
});