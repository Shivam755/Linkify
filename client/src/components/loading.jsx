import React from "react";
import { TripleMaze } from "react-spinner-animated";

const Loading = ({ text }) => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <svg viewBox="0 0 24 24" xmlns="<http://www.w3.org/2000/svg>">
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke-width="4"
          stroke="tomato"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default Loading;
