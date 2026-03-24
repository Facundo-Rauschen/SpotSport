import { createSlice } from '@reduxjs/toolkit';

const sedesSlice = createSlice({
  name: 'sedes',
  initialState: {
    listaCompleta: [],
  },
  reducers: {
    setSedes: (state, action) => {
      state.listaCompleta = action.payload;
    },
  },
});

export const { setSedes } = sedesSlice.actions;
export default sedesSlice.reducer;