import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const NavBar = () => {
  let links = useSelector((state) => state.navSlice.value);
  // console.log(links);
  return (
    <ul className="list-none flex justify-around items-center m-5 p-5 w-9/10 neumorphism-plain">
      {links.map((e) => (
        <Link to={e.link} className="py-3 px-5 neumorphism-plain">
          {e.text}
        </Link>
      ))}
    </ul>
  );
};

export default NavBar;
