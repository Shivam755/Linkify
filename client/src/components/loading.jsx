import React from "react";
import { TripleMaze } from "react-spinner-animated";

const Loading = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <TripleMaze />
    </div>
  );
};

export default Loading;
