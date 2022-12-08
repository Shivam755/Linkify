import React from "react";
import { TripleMaze } from "react-spinner-animated";

const Loading = ({ text }) => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <TripleMaze text={text} />
    </div>
  );
};

export default Loading;
