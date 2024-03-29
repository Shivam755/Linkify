import React, { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Axios from "axios";
import { LogOut, User } from "react-feather";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  navKey,
  indivLogin,
  institLogin,
  initValue,
} from "../utilities/navSlice";
import { getToken, deleteToken } from "../utilities/tokenSlice";
import logo from "../assets/logo.png";

let updateNav;
let logout;

const NavBar = ({ drizzle, drizzleState }) => {
  const [links, setLinks] = useState(
    JSON.parse(sessionStorage.getItem(navKey))
  );
  const [res, setRes] = useState(null);
  const [type, setType] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  let token = getToken();
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
    console.log(drizzle);
    const { Account } = drizzle.contracts;
    if (type === "Individual") {
      hash = await Account.methods.indivData(drizzleState.accounts[0]).call();
    } else {
      hash = await Account.methods.institData(drizzleState.accounts[0]).call();
    }

    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/profile",
      {
        hash: hash.slice(2),
        type: type,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch((err) => console.log(err));
    setRes(result.data);
  };
  if (token && res === null && type !== null) {
    fetchdata(type);
  } else if (!token && links === null) {
    updateNav();
  }

  logout = () => {
    deleteToken();
    updateNav();
    navigate("/");
  };
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
      color: "#ffffff",
      background: "#0a0a0b",
      customClass: {
        cancelButton: "neumorphism-plain",
        confirmButton: "neumorphism-plain",
        denyButton: "neumorphism-plain",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        token = null;
        toast.success("Logout successful!!");
      } else if (result.isDenied) {
        toast.info("Logout Cancelled!!");
      }
    });
  };

  return (
    <div className="flex justify-between items-center">
      {/* <div className="m-5 p-5 text-3xl font-black">logo</div> */}
      <img src={logo} className="h-24" />
      <ul className="list-none flex justify-end items-center m-5 p-5 w-9/10">
        {links.map((e) => (
          <Link
            to={e.link}
            key={e.text}
            className={`py-3 px-5 mx-5 ${
              e.link === location.pathname
                ? "active-neumorphism-plain"
                : "neumorphism-plain"
            } hover:underline`}
          >
            {e.text}
          </Link>
        ))}

        {res !== null && (
          <div className="flex flex-row items-center justify-center justify-self-end">
            <Link
              to={"/" + type + "/profile"}
              className={`py-3 px-5 mx-5 ${
                "/" + type + "/profile" === location.pathname
                  ? "active-neumorphism-plain"
                  : "neumorphism-plain"
              } hover:underline flex flex-row`}
            >
              <User />
              {res.profile.name}
            </Link>
            <button
              onClick={handleLogout}
              className="h-10 w-10 p-3 mx-3 red-neumorphism-plain flex justify-center items-center"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        )}
      </ul>
    </div>
  );
};

export default NavBar;
export { updateNav, logout };
