import { createSlice } from '@reduxjs/toolkit';

const favoritosSlice = createSlice({
  name: 'favoritos',
  initialState: {
    lista: [], // Aquí guardaremos las sedes favoritas
  },
  reducers: {
    // Para cargar los favoritos desde la base de datos al iniciar
    setFavoritos: (state, action) => {
      state.lista = action.payload;
    },
    // Para agregar o quitar de la lista global
    alternarFavoritoRedux: (state, action) => {
      const sede = action.payload;
      const existe = state.lista.find(item => item.id === sede.id);
      
      if (existe) {
        // Si ya existe, lo sacamos
        state.lista = state.lista.filter(item => item.id !== sede.id);
      } else {
        // Si no existe, lo agregamos marcándolo como favorito
        state.lista.push({ ...sede, es_favorito: 1 });
      }
    },
  },
});

export const { setFavoritos, alternarFavoritoRedux } = favoritosSlice.actions;
export default favoritosSlice.reducer;