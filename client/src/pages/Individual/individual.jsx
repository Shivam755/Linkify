import React from "react";
import MetamaskConnect from "../../components/MetamaskConnect";

const Individual = ({ drizzle, drizzleState }) => {
  return (
    <div className=" h-screen">
      <div className="flex h-4/5 justify-center  items-center">
        <div className="flex flex-col content-center">
          <h1 className="text-3xl">
            A whole new and secure world awaits you...
          </h1>
          <MetamaskConnect
            type="Individual"
            drizzle={drizzle}
            drizzleState={drizzleState}
          />
        </div>
      </div>
    </div>
  );
};

export default Individual;
