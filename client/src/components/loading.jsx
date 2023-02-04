import React from "react";
import { SpinnerCircular } from "spinners-react";

const Loading = ({ text }) => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <SpinnerCircular
        size="8rem"
        color="var(--secondary)"
        secondaryColor="var(--accent)"
      />
      <p>{text}</p>
    </div>
  );
};

export default Loading;
