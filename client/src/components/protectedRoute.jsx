import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utilities/tokenSlice";
import Axios from "axios";

const isAuthenticated = async () => {
  const token = getToken();
  try {
    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/auth",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).catch((error) => {
      console.log(error);
      return false;
    });
    console.log(result);
    if (result.data.status === "Success") {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const ProtectedRoute = ({ element: Component }) => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(false);
  useEffect(() => {
    isAuthenticated().then((data) => {
      console.log(data);
      if (data) {
        return setAuth(true);
      }
      navigate("/403/Forbidden");
    });
  }, []);

  if (auth) {
    return Component;
  }
  return <div>Authenticating... Please wait</div>;
};

export default ProtectedRoute;
