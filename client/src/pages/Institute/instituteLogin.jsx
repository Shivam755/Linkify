import Axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useGeolocated } from "react-geolocated";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateToast } from "../../utilities/toastify";
import Title from "../../components/title";
import { setToken } from "../../utilities/tokenSlice";
import { updateNav } from "../../components/navbar";

const InstituteLogin = ({ drizzle, drizzleState }) => {
  const [currentId, setCurrentId] = useState(drizzleState.accounts[0]);
  const [password, setPassword] = useState("");
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
    });
  const ogCoords = useRef([]);
  // const [name, setName] = useState("");
  const navigate = useNavigate();

  const updatePassword = (e) => {
    setPassword(e.target.value);
  };
  const Login = async (e) => {
    const id = toast.loading("Logging in!!");
    e.preventDefault();
    const { Account } = drizzle.contracts;
    let hash = await Account.methods
      .institData(drizzleState.accounts[0])
      .call();
    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/login",
      {
        hash: hash.slice(2),
        type: "Institute",
        password: password,
      }
    );
    console.log(result);
    if (result.data.status === "Success") {
      updateToast(id, "Login Successful!!", "success");
      console.log(result.data.auth);
      setToken(result.data.auth);
      updateNav("Institute");
      navigate("/dashboard/Institute");
    } else {
      updateToast(id, result.data.msg, "error");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      let toastId = toast.loading("Fetching Original location!");
      try {
        let result = await Axios.post(
          process.env.REACT_APP_SERVER_HOST + "/api/getLocation",
          {
            id: drizzleState.accounts[0],
          }
        );
        console.log(result);

        if (result.data.status === "Failed") {
          return updateToast(toastId, result.data.msg, "error");
        }

        ogCoords.current = result.data.location;
        updateToast(toastId, "Data fetch successful", "success", false, 100);
      } catch (error) {
        console.log(error);
        updateToast(toastId, "Some error occured while loading page!", "error");
      }
    };

    fetchData();
  }, []);
  // useEffect(() => {
  //   setCurrentId(window.ethereum.selectedAddress);
  // }, [drizzleState]);
  // console.log(window.ethereum.selectedAddress);
  if (currentId === null) {
    return (
      <div>
        <h1>No accounts linked!!</h1>
        <p>
          Please <Link to="/Institute"> Connect to Metamask </Link>
        </p>
      </div>
    );
  } else if (coords !== null && coords) {
    if (coords[0] !== ogCoords.current[0] || coords[1] !== ogCoords[1]) {
      return (
        <div>
          <h1>Wrong location!!</h1>
          <p>
            You're logging in from wrong a different location!! This is not
            allowed due to security reasons
          </p>
        </div>
      );
    }
  }
  return !isGeolocationAvailable ? (
    <div className="flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-6xl">
      Your browser doesn't support Geolocation. We need your geolocation for
      security reasons.
    </div>
  ) : !isGeolocationEnabled ? (
    <div className="flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-6xl">
      We need geolocation for security reasons. Please enable geolocation!
    </div>
  ) : (
    <div className="flex flex-col h-screen">
      <div className="flex w-screen h-5/6 justify-center items-center">
        <form className="w-1/2 flex flex-col justify-center items-center py-20 neumorphism-plain">
          <Title title="Institute Login" />
          <div>
            MetamaskID:{" "}
            <input
              className="py-2 px-4 m-2 neumorphism-pressed"
              type="text"
              value={currentId}
              disabled
            />
          </div>
          <div>
            Password:{" "}
            <input
              className="py-2 px-4 m-2 neumorphism-pressed bg-slate-200"
              onChange={updatePassword}
              type="password"
              value={password}
            />
          </div>
          <button
            className="m-2 px-4 py-2 active-neumorphism-button outline-0 border-0"
            onClick={Login}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default InstituteLogin;
