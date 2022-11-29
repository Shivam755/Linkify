import Axios from "axios";
import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";

const IndividualLogin = ({ drizzle, drizzleState }) => {
  const [currentId, setCurrentId] = useState(window.ethereum.selectedAddress);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  console.log(drizzleState);

  // useEffect(async () => {
  //   let data = await Axios.post(`http://localhost:3002/api/getName`, {
  //     address: currentId,
  //     type: "Individual",
  //   }).catch((err) => {
  //     alert("Error in name fetching!!");
  //     console.log(err);
  //   });

  //   setName(data.data.name);
  // });

  const updatePassword = (e) => {
    setPassword(e.target.value);
  };
  const Login = async (e) => {
    e.preventDefault();
    let result = await Axios.post("http://localhost:3002/api/login", {
      address: currentId,
      type: "Individual",
      password: password,
    });
    if (result.data.status === "Success") {
      navigate("/dashboard/" + currentId);
    } else {
      alert("Login failed!!");
    }
  };

  // useEffect(() => {
  //   setCurrentId(window.ethereum.selectedAddress);
  // }, [drizzleState]);
  // console.log(window.ethereum.selectedAddress);
  if (currentId === null) {
    return (
      <div>
        <h1>No accounts linked!!</h1>
        <p>
          Please <Link to="/Individual"> Connect to Metamask </Link>
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen">
      <NavBar className=""></NavBar>
      <div className="flex w-screen h-4/5 justify-center items-center">
        <form className="w-1/2 flex flex-col justify-center items-center py-20 neumorphism-plain">
          <h1 className="text-5xl p-2 m-2 bold">Individual Login</h1>
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
            className="m-2 px-4 py-2 neumorphism-button outline-0 border-0"
            onClick={Login}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default IndividualLogin;
