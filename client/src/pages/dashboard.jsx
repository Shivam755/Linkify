import React from "react";
import Axios from "axios";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useState } from "react";

const Dashboard = () => {
  let [res, setRes] = useState();
  let { type } = useParams();
  console.log(type);
  console.log(process.env.REACT_APP_SERVER_HOST);
  useEffect(() => {
    const fetchdata = async () => {
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/profile",
        {
          address: window.ethereum.selectedAddress,
          type: type,
          token: sessionStorage.getItem("authToken"),
        },
        {
          auth: sessionStorage.getItem("authToken"),
        }
      ).catch((err) => console.log(err));
      setRes(result);
      console.log(result);
    };
    fetchdata();
  }, []);
  return (
    <div>
      <h1>Dashboard</h1>
      {res !== null ? res : ""}
    </div>
  );
};

export default Dashboard;
