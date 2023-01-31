import MetamaskConnect from "../../components/MetamaskConnect";
import React from "react";
// import Building from "../../components/SVG/building";
import Building from "../../assets/building.svg";

const Institute = ({ drizzle, drizzleState }) => {
  console.log(drizzleState);
  return (
    <div className="h-screen">
      <div className="flex h-5/6 flex-col justify-center  items-center">
        <div className="flex justify-center items-center h-1/3">
          <img src={Building} className="h-full" />
        </div>
        <h1 className="text-3xl">
          A whole new and secure world awaits for your corporate life...
        </h1>
        <MetamaskConnect
          type="Institute"
          drizzle={drizzle}
          drizzleState={drizzleState}
        />
      </div>
    </div>
  );
};

export default Institute;
