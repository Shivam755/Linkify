import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Drizzle } from "@drizzle/store";
import { DrizzleContext } from "@drizzle/react-plugin";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NavBar from "./components/navbar";
import "./App.css";
import Loading from "./components/loading";
import Account from "./contracts/Account.json";
import Home from "./pages/home";
import Individual from "./pages/Individual/individual";
import IndividualSignUp from "./pages/Individual/individualSignup";
import IndividualLogin from "./pages/Individual/individualLogin";
import Institute from "./pages/Institute/institute";
import InstituteSignup from "./pages/Institute/instituteSignup";
import InstituteLogin from "./pages/Institute/instituteLogin";
import Dashboard from "./pages/dashboard";
import IndividualProfile from "./pages/Individual/individualProfile";
import { useSelector } from "react-redux";

const drizzleOptions = {
  contracts: [Account],
  // events: [],
  web3: {
    fallback: {
      type: "http",
      url: "http://127.0.0.1:9545",
    },
  },
};

function App() {
  const drizzle = new Drizzle(drizzleOptions);
  // const drizzle = useSelector((state) => state.drizzleSlice.value);
  console.log(drizzle);
  const [loading, setLoading] = useState(false);
  const [metaConnect, setMetaConnect] = useState(false);
  let reason;

  window.ethereum.on("accountsChanged", (accounts) => {
    console.log(accounts);
    if (accounts.length <= 0) {
      setMetaConnect(false);
    } else {
      setMetaConnect(true);
    }
  });

  useEffect(() => {
    if (window.ethereum.selectedAddress !== null) {
      setMetaConnect(true);
    }
  }, []);

  const updateLoading = (status, text = "Loading") => {
    reason = text;
    setLoading(status);
  };

  if (loading) {
    return <Loading text={reason} />;
  }
  return (
    <DrizzleContext.Provider drizzle={drizzle}>
      <DrizzleContext.Consumer>
        {(drizzleContext) => {
          const { drizzle, drizzleState, initialized } = drizzleContext;

          if (!initialized) {
            return <Loading />;
          } else if (!metaConnect) {
            return (
              <div>
                <Loading />
                <p>Metamask NOt connected</p>
              </div>
            );
          }
          return (
            <BrowserRouter>
              <div>
                <NavBar
                  drizzle={drizzle}
                  metaConnect={metaConnect}
                  drizzleState={drizzleState}
                ></NavBar>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/Individual"
                    exact
                    element={<Individual drizzle={drizzle} />}
                  />
                  <Route
                    path="/Individual/signUp"
                    element={
                      <IndividualSignUp
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                        updateLoading={updateLoading}
                      />
                    }
                  />
                  <Route
                    path="/Individual/login"
                    element={
                      <IndividualLogin
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                      />
                    }
                  />
                  <Route
                    path="/Individual/profile/:id"
                    element={
                      <IndividualProfile
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                      />
                    }
                  />
                  <Route path="/Institute" exact element={<Institute />} />
                  <Route
                    path="/Institute/signup"
                    element={
                      <InstituteSignup
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                      />
                    }
                  />
                  <Route
                    path="/Institute/login"
                    element={
                      <InstituteLogin
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                      />
                    }
                  />
                  <Route
                    path="/dashboard/:type"
                    element={
                      <Dashboard
                        drizzle={drizzle}
                        drizzleState={drizzleState}
                      />
                    }
                  />
                </Routes>
                <ToastContainer
                  draggable={true}
                  position={toast.POSITION.BOTTOM_RIGHT}
                />
              </div>
            </BrowserRouter>
          );
        }}
      </DrizzleContext.Consumer>
    </DrizzleContext.Provider>
  );
}

export default App;
