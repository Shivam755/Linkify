import React from "react";
import Error_404 from "../assets/page_not_found.svg";

const PageNotFound = () => {
  return (
    <div className=" h-screen">
      <div className="flex flex-col h-5/6 justify-center  items-center">
        <div className="flex justify-center items-center h-1/3">
          <img src={Error_404} className="h-full" />
        </div>
        <div className="flex flex-col h-screen justify-center items-center font-bold text-6xl">
          Page Not Found. Please check the url and try again.
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
