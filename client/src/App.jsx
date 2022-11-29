import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Drizzle } from "@drizzle/store";
import { DrizzleContext } from "@drizzle/react-plugin";

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
  // const [loading, setLoading] = useState(true);
  // const drizzleState = useSelector((state) => state.state);
  // const unsubscribe = useSelector((state) => state.unsubscribe);
  // const dispatch = useDispatch();

  // if (drizzleState != null) {
  //   setLoading(false);
  // }
  // //analogous to component will mount
  // useEffect(() => {
  //   console.log("use effect called!");
  //   //analogous to component will mount
  //   dispatch(initDrizzleState());
  //   //component will unmount
  //   return () => unsubscribe();
  // }, []);
  // if (loading) {
  //   return <div>Component is loading</div>;
  // }
  // return (
  //   <div>
  //     <BrowserRouter>
  //       <Routes>
  //         <Route path="/" element={<MetamaskConnect />} />
  //         <Route path="/signUp" element={<SignUp />} />
  //       </Routes>
  //     </BrowserRouter>
  //   </div>
  // );
  const drizzle = new Drizzle(drizzleOptions);
  return (
    <DrizzleContext.Provider drizzle={drizzle}>
      <DrizzleContext.Consumer>
        {(drizzleContext) => {
          const { drizzle, drizzleState, initialized } = drizzleContext;

          if (!initialized) {
            return <Loading />;
          }

          return (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Individual" exact element={<Individual />} />
                <Route
                  path="/Individual/signUp"
                  element={
                    <IndividualSignUp
                      drizzle={drizzle}
                      drizzleState={drizzleState}
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
                  path="/dashboard"
                  element={
                    <Dashboard drizzle={drizzle} drizzleState={drizzleState} />
                  }
                />
              </Routes>
            </BrowserRouter>
          );
        }}
      </DrizzleContext.Consumer>
    </DrizzleContext.Provider>
  );
}

export default App;
