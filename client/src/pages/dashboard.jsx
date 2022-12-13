import React from "react";
import Axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const [res, setRes] = useState(null);
  let { type } = useParams();
  let token = useSelector((state) => state.tokenSlice.value);
  // console.log(type);
  // console.log(process.env.REACT_APP_SERVER_HOST);
  useEffect(() => {
    const fetchdata = async () => {
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/profile",
        {
          address: window.ethereum.selectedAddress,
          type: type,
        },
        {
          authorization: token,
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
      {res !== null ? res.data.profile.name : ""}
    </div>
  );
};

export default Dashboard;
