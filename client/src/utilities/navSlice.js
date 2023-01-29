const navKey = "navSlice";
const noLogin = [
  { text: "Home", link: "/" },
  { text: "Institute login/signup", link: "/Institute" },
  { text: "Individual Login/Signup", link: "/Individual" },
];
const Individual = [
  { text: "DashBoard", link: "/dashboard/Individual" },
  { text: "Find Institutes", link: "/Individual/searchInstitutes" },
  { text: "Transaction History", link: "/viewTransactions" },
];

const Institute = [
  { text: "Dashboard", link: "/dashboard/Institute" },
  { text: "Find Individuals", link: "/Institute/searchIndividuals" },
  { text: "View Members", link: "/Institute/viewMembers" },
  { text: "Transaction History", link: "/viewTransactions" },
];

const institLogin = () => {
  sessionStorage.setItem(navKey, JSON.stringify(Institute));
};
const indivLogin = () => {
  sessionStorage.setItem(navKey, JSON.stringify(Individual));
};

const initValue = () => {
  // let value = JSON.parse(sessionStorage.getItem(navKey));
  // if (!value) {
  //   sessionStorage.setItem(navKey, JSON.stringify(noLogin));
  // }
  sessionStorage.setItem(navKey, JSON.stringify(noLogin));
};

export { navKey, institLogin, indivLogin, initValue };

// import { createSlice } from "@reduxjs/toolkit";

// export const navSlice = createSlice({
//   name: "nav",
//   initialState: {
//     value: noLogin,
//   },
//   reducers: {
//     institLogin: (state) => {
//       state.value = Institute;
//     },
//     indivLogin: (state) => {
//       console.log("indivLogin");
//       state.value = Individual;
//     },
//     logout: (state) => {
//       state.value = noLogin;
//     },
//   },
// });

// // Action creators are generated for each case reducer function
// export const { institLogin, indivLogin, logout } = navSlice.actions;

// export default navSlice.reducer;
