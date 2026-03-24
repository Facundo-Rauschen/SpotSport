import { createSlice } from '@reduxjs/toolkit';

const reservasSlice = createSlice({
    name: 'reservas',
    initialState: {
        lista: [],
    },
    reducers: {
        // Guardar todas las reservas (vienen de la DB o Firebase)
        setReservas: (state, action) => {
            state.lista = action.payload;
        },
        // Agregar una reserva individual (cuando el usuario confirma el turno)
        agregarReservaRedux: (state, action) => {
            state.lista.unshift(action.payload); // La pone al principio
        },
        eliminarReservaRedux: (state, action) => {
            // Filtramos la lista para quitar la reserva con el ID que viene en el payload
            state.lista = state.lista.filter(reserva => reserva.id !== action.payload);
        },
    },
});

export const { setReservas, agregarReservaRedux, eliminarReservaRedux } = reservasSlice.actions;
export default reservasSlice.reducer;