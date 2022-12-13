import { createSlice } from "@reduxjs/toolkit";

const tokenSlice = createSlice({
  name: "token",
  initialState: {
    value: null,
  },
  reducers: {
    setToken: (state, action) => {
      state.value = action.payload;
    },
    deleteToken: (state) => {
      state.value = null;
    },
  },
});

export const { setToken, deleteToken } = tokenSlice.actions;

export default tokenSlice.reducer;
