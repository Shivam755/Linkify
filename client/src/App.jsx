// import logo from './logo.svg';
import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MetamaskConnect from "./components/MetamaskConnect";
import SignUp from "./pages/signUp";
import NavBar from "./components/navbar";

function App({ drizzle }) {
  // const state = { loading: true, drizzleState: null };
  const [loading, setLoading] = useState(true);
  const [drizzleState, setDrizzleState] = useState(null);

  //analogous to component will mount
  useEffect(() => {
    //analogous to component will mount
    let unsubscribe = drizzle.store.subscribe(() => {
      let tempDrizzle = drizzle.store.getState();
      if (tempDrizzle.drizzleStatus.initialized) {
        setDrizzleState(tempDrizzle);
        setLoading(false);
      }
      //component will unmount
      return () => unsubscribe();
    });
  }, []);

  // if (loading) {
  //   return <div>Component is loading</div>;
  // }
  return (
    <div>
      <NavBar></NavBar>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MetamaskConnect drizzle={drizzle} />} />
          <Route
            path="/signUp"
            element={<SignUp drizzle={drizzle} drizzleState={drizzleState} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
