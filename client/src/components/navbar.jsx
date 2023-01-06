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
  let token = JSON.parse(sessionStorage.getItem(tokenKey));
  const [res, setRes] = useState(null);
  const navigate = useNavigate();

  updateNav = (type) => {
    if (type === "Individual") {
      indivLogin();
    } else if (type === "Institute") {
      institLogin();
    } else {
      initValue();
      setRes(null);
    }
    setLinks(JSON.parse(sessionStorage.getItem(navKey)));
  };

  const fetchdata = async () => {
    const { Account } = drizzle.contracts;
    let hash = await Account.methods.indivData().call();
    // console.log(Account);
    // console.log(hash);
    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/profile",
      {
        hash: hash.slice(2),
        type: "Individual",
      },
      {
        authorization: token,
      }
    ).catch((err) => console.log(err));
    console.log(result);
    setRes(result.data);
    // console.log(result);
  };

  if (token !== null && res === null) {
    fetchdata();
  }

  const logout = () => {
    deleteToken();
    token = null;
    updateNav();
    navigate("/");
    toast.success("Logout successful!!");
  };

  // console.log(links);
  return (
    <ul className="list-none flex justify-around items-center m-5 p-5 w-9/10 neumorphism-pressed">
      {links.map((e) => (
        <Link to={e.link} key={e.text} className="py-3 px-5 neumorphism-plain">
          {e.text}
        </Link>
      ))}

      {res !== null && (
        <div className="flex flex-row items-center justify-center">
          <Link
            to={"/Individual/profile/" + drizzleState.accounts[0]}
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
