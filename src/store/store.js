import { configureStore } from '@reduxjs/toolkit';
import favoritosReducer from './favoritosSlice';
import reservasReducer from './reservasSlice';
import sedesReducer from './sedesSlice';

export const contenedor = configureStore({
  reducer: {
    favoritos: favoritosReducer,
    reservas: reservasReducer,
    sedes: sedesReducer,
  },
});