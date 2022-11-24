import React from "react";
import MetamaskConnect from "./MetamaskConnect";

const NavBar = () => {
  let links = ["l1", "l1", "l1", "l1", "l1", "l1"];
  return (
    <ul className="list-none flex justify-around items-center m-5 p-5 w-9/10 neumorphism-plain">
      {links.map((e) => (
        <li className="py-3 px-5 neumorphism-plain">{e}</li>
      ))}
    </ul>
  );
};

export default NavBar;
