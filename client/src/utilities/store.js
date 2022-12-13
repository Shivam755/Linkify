import { configureStore } from "@reduxjs/toolkit";
// import drizzleSlice from './drizzleSlice';
import navSlice from "./navSlice";
import tokenSlice from "./tokenSlice";

export default configureStore({
  reducer: {
    navSlice,
    tokenSlice,
  },
});
