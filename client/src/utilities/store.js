import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import drizzleSlice from './drizzleSlice';
import navSlice from "./navSlice";
import tokenSlice from "./tokenSlice";
import drizzleSlice from "./drizzleSlice";
import thunk from "redux-thunk";
import storageSession from "reduxjs-toolkit-persist/lib/storage/session";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: "root",
  storage: storageSession,
};

const rootReducer = combineReducers({
  navSlice: navSlice,
  tokenSlice: tokenSlice,
  drizzleSlice: drizzleSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// console.log(persistedReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
});

const persistor = persistStore(store);

export { store, persistor };
