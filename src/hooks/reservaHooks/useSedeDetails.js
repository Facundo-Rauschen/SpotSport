import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  actualizarEstadoFavorito,
  obtenerCanchasPorComplejo,
  obtenerSedesFavoritasLocal
} from '../../database/db';
import { setFavoritos } from '../../store/favoritosSlice';

export const useSedeDetails = (visible, sede, onDataChange) => {
  const dispatch = useDispatch();
  const auth = getAuth(); 
  
  const [canchasSede, setCanchasSede] = useState([]);
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    if (visible && sede?.id) {
      const data = obtenerCanchasPorComplejo(sede.id);
      setCanchasSede(data || []);
      setEsFavorito(sede.es_favorito === 1);
    }
  }, [visible, sede]);

  const alternarFavorito = async () => {
    const user = auth.currentUser;
    if (!user || !sede?.id) {
      console.error("❌ No se puede cambiar favorito: falta usuario o sede");
      return;
    }

    try {
      const nuevoEstado = !esFavorito;
      const userId = user.uid;

      // 1. Usamos la función que inserta/borra en la tabla 'favoritos'
      actualizarEstadoFavorito(sede.id, nuevoEstado, userId);

      // 2. Actualizamos el estado visual local del corazón
      setEsFavorito(nuevoEstado);

      // 3. Refrescamos Redux con la lista de favoritos de ESTE usuario
      const listaActualizada = obtenerSedesFavoritasLocal(userId);
      dispatch(setFavoritos(listaActualizada));

      // 4. Si el mapa nos pasó una función para refrescarse, la ejecutamos
      if (onDataChange) onDataChange();

    } catch (error) {
      console.error("❌ Error al alternar favorito:", error.message);
    }
  };

  return { canchasSede, esFavorito, alternarFavorito };
};