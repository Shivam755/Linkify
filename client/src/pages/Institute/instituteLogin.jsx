import Axios from "axios";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const InstituteLogin = () => {
  const [currentId, setCurrentId] = useState(window.ethereum.selectedAddress);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const updatePassword = (e) => {
    setPassword(e.target.value);
  };
  const Login = async (e) => {
    e.preventDefault();
    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/login",
      {
        address: currentId,
        type: "Institute",
        password: password,
      }
    );
    if (result.data.status === "Success") {
      console.log(result.data.auth);
      sessionStorage.setItem("authToken", JSON.stringify(result.data.auth));
      navigate("/dashboard/Institute");
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
      <div className="flex w-screen h-4/5 justify-center items-center">
        <form className="w-1/2 flex flex-col justify-center items-center py-20 neumorphism-plain">
          <h1 className="text-5xl p-2 m-2 bold">Institute Login</h1>
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

export default InstituteLogin;
