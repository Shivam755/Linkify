import React from "react";
import { useNavigate } from "react-router-dom";

const SearchCard = ({ type, info }) => {
  const navigate = useNavigate();

  const viewClick = (e) => {
    if (type == "Individual") {
      return navigate("/Institute/viewIndividualInfo/" + info._id);
    }
    return navigate("/Individual/viewInstituteInfo/" + info._id);
  };

  return (
    <div className="flex items-center justify-between  w-full px-10 py-4 my-4">
      <div>
        <div className="text-5xl font-bold">{info.name}</div>
        <div className="text-2xl ">{info.metamaskId}</div>
        {type === "Institute" && (
          <div className="text-lg">{info.instituteType}</div>
        )}
      </div>
      <div>
        <button
          onClick={viewClick}
          className="p-4 text-2xl active-neumorphism-button hover:underline"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default SearchCard;
