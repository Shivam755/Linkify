import React from "react";
import ReactDOM from "react-dom/client";
// import { Provider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
import { initValue } from "./utilities/navSlice";

import "./index.css";
import App from "./App";
// import { store, persistor } from "./utilities/store";
initValue();
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);
// root.render(
//   <Provider store={store}>
//     <PersistGate loading={null} persistor={persistor}>
//       <App />
//     </PersistGate>
//   </Provider>
// );
