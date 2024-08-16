import { createSlice } from '@reduxjs/toolkit';

const shotSlice = createSlice({
  name: 'shots',
  initialState: {
    shots: [],
  },
  reducers: {
    addShot: (state, action) => {
      state.shots.push(action.payload);
    },
    updateShot: (state, action) => {
      const index = state.shots.findIndex(shot => shot.id === action.payload.id);
      if (index !== -1) {
        state.shots[index] = action.payload;
      }
    },
    moveShot: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedShot] = state.shots.splice(fromIndex, 1);
      state.shots.splice(toIndex, 0, movedShot);
    },
    removeShot: (state, action) => {
      state.shots = state.shots.filter(shot => shot.id !== action.payload);
    },
  },
});

export const { addShot, updateShot, moveShot, removeShot } = shotSlice.actions;

export const selectShots = (state) => state.shots.shots;

export default shotSlice.reducer;
