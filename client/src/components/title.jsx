import React from "react";

const Title = ({ title }) => {
  return (
    <div className="flex w-full justify-center items-center text-5xl text-[#0892d0] m-4 p-2">
      {title}
    </div>
  );
};

export default Title;
