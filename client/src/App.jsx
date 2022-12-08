import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Drizzle } from "@drizzle/store";
import { DrizzleContext } from "@drizzle/react-plugin";

import NavBar from "./components/navbar";
import "./App.css";
import Loading from "./components/loading";
import Account from "./contracts/Account.json";
import Home from "./pages/home";
import Individual from "./pages/individual";
import IndividualSignUp from "./pages/individualSignup";
import IndividualLogin from "./pages/individualLogin";
import Institute from "./pages/institute";
import InstituteSignup from "./pages/instituteSignup";
import InstituteLogin from "./pages/instituteLogin";
import Dashboard from "./pages/dashboard";

const drizzleOptions = {
  contracts: [Account],
  web3: {
    fallback: {
      type: "http",
      url: "http://127.0.0.1:9545",
    },
  },
};

function App() {
  const drizzle = new Drizzle(drizzleOptions);
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
            console.log(metaConnect);
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
                <NavBar metaConnect={metaConnect}></NavBar>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/Individual" exact element={<Individual />} />
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
              </div>
            </BrowserRouter>
          );
        }}
      </DrizzleContext.Consumer>
    </DrizzleContext.Provider>
  );
}

export default App;
