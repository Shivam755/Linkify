import React, { useState } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const NavBar = ({ drizzle, drizzleState }) => {
  let links = useSelector((state) => state.navSlice.value);
  let token = useSelector((state) => state.tokenSlice.value);
  const [res, setRes] = useState(null);

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
  // console.log(links);
  return (
    <ul className="list-none flex justify-around items-center m-5 p-5 w-9/10 neumorphism-pressed">
      {links.map((e) => (
        <Link to={e.link} key={e.text} className="py-3 px-5 neumorphism-plain">
          {e.text}
        </Link>
      ))}

      {res !== null && (
        <li>
          <Link
            to={"/Individual/profile/" + drizzleState.accounts[0]}
            className="py-3 px-5 neumorphism-plain"
          >
            {res.profile.name}
          </Link>
        </li>
      )}
    </ul>
  );
};

export default NavBar;
