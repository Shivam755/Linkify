import MetamaskConnect from "../../components/MetamaskConnect";
import React from "react";

const Institute = () => {
  return (
    <div className="h-screen">
      <div className="flex h-4/5 justify-center  items-center">
        <div className="flex flex-col content-center">
          <h1 className="text-3xl">
            A whole new and secure world awaits for your corporate life...
          </h1>
          <MetamaskConnect type="Institute" />
        </div>
      </div>
    </div>
  );
};

export default Institute;
