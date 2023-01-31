import React from "react";
import MetamaskConnect from "../../components/MetamaskConnect";
import SecurityOn from "../../assets/security_on.svg";

const Individual = ({ drizzle, drizzleState }) => {
  return (
    <div className=" h-screen">
      <div className="flex flex-col h-5/6 justify-center  items-center">
        <div className="flex justify-center items-center h-1/3">
          <img src={SecurityOn} className="h-full" />
        </div>
        <h1 className="text-3xl">A whole new and secure world awaits you...</h1>
        <MetamaskConnect
          type="Individual"
          drizzle={drizzle}
          drizzleState={drizzleState}
        />
      </div>
    </div>
  );
};

export default Individual;
