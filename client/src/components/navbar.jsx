import React, { useState } from "react";
import { toast } from "react-toastify";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  navKey,
  indivLogin,
  institLogin,
  initValue,
} from "../utilities/navSlice";
import { tokenKey, deleteToken } from "../utilities/tokenSlice";
import { LogOut } from "react-feather";

let updateNav;

const NavBar = ({ drizzle, drizzleState }) => {
  const [links, setLinks] = useState(
    JSON.parse(sessionStorage.getItem(navKey))
  );
  const [res, setRes] = useState(null);
  const [type, setType] = useState(null);
  const navigate = useNavigate();
  let token = JSON.parse(sessionStorage.getItem(tokenKey));

  updateNav = (updateType = null) => {
    setType(updateType);
    if (updateType === "Individual") {
      indivLogin();
      fetchdata(updateType);
    } else if (updateType === "Institute") {
      institLogin();
      fetchdata(updateType);
    } else {
      initValue();
      setRes(null);
    }
    setLinks(JSON.parse(sessionStorage.getItem(navKey)));
  };

  const fetchdata = async (type) => {
    let hash;
    const { Account } = drizzle.contracts;
    if (type === "Individual") {
      hash = await Account.methods.indivData().call();
    } else {
      hash = await Account.methods.institData().call();
    }

    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/profile",
      {
        hash: hash.slice(2),
        type: type,
      },
      {
        authorization: token,
      }
    ).catch((err) => console.log(err));
    setRes(result.data);
  };

  if (token !== null && res === null && type !== null) {
    fetchdata(type);
  } else if (token === null && links === null) {
    updateNav();
  }

  const logout = () => {
    deleteToken();
    token = null;
    updateNav();
    navigate("/");
    toast.success("Logout successful!!");
  };

  return (
    <ul className="list-none flex justify-end items-center m-5 p-5 w-9/10">
      {links.map((e) => (
        <Link
          to={e.link}
          key={e.text}
          className="py-3 px-5 mx-5 neumorphism-plain"
        >
          {e.text}
        </Link>
      ))}

      {res !== null && (
        <div className="flex flex-row items-center justify-center justify-self-end">
          <Link
            to={"/" + type + "/profile"}
            className="py-3 px-5 neumorphism-plain"
          >
            {res.profile.name}
          </Link>
          <button
            onClick={logout}
            className="h-10 w-10 p-3 mx-3 neumorphism-plain"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      )}
    </ul>
  );
};

export default NavBar;
export { updateNav };
