import { createSlice } from "@reduxjs/toolkit";

const noLogin = [
  { text: "Home", link: "/" },
  { text: "Institute login/signup", link: "/Institute" },
  { text: "Individual Login/Signup", link: "/Individual" },
];
const Individual = [{ text: "DashBoard", link: "/dashboard/Individual" }];

const Institute = [{ text: "Dashboard", link: "/dashboard/Institute" }];

export const navSlice = createSlice({
  name: "nav",
  initialState: {
    value: noLogin,
  },
  reducers: {
    institLogin: (state) => {
      state.value = Institute;
    },
    indivLogin: (state) => {
      console.log("indivLogin");
      state.value = Individual;
    },
    logout: (state) => {
      state.value = noLogin;
    },
  },
});

// Action creators are generated for each case reducer function
export const { institLogin, indivLogin, logout } = navSlice.actions;

export default navSlice.reducer;
