import MetamaskConnect from "../components/MetamaskConnect";
import React from "react";
import NavBar from "../components/navbar";

const Institute = () => {
  return (
    <div className=" h-screen">
      <NavBar />
      <div className="flex h-4/5 justify-center  items-center">
        <div className="flex flex-col content-center">
          <h1 className="text-3xl">
            A whole new and secure world awaits you...
          </h1>
          <MetamaskConnect type="Institute" />
        </div>
      </div>
    </div>
  );
};

export default Institute;
