import Axios from "axios";
import React, { useState } from "react";
import { Search } from "react-feather";
import SearchCard from "./searchCard";
import { getToken } from "./../utilities/tokenSlice";

const SearchComp = ({ title, type }) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState([]);
  const [msg, setMsg] = useState(null);

  const token = getToken();

  const updateQuery = (e) => {
    setQuery(e.target.value);
  };
  console.log(result);
  const fetchData = async (e) => {
    e.preventDefault();
    setMsg(null);

    let temp = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/fetchResult",
      {
        query: query,
        type: type,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(temp.data);
    console.log(result == []);
    console.log(typeof result);
    if (temp.data.status === "Failed") {
      setMsg("There was some issue in the backend!");
      setResult([]);
      return;
    }
    if (temp.data.results.length <= 0) {
      setMsg("No match found!");
    }
    setResult(temp.data.results);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="flex h-5/6 flex-col justify-start items-center">
        <form className="p-4 m-2 w-11/12 flex justify-between  neumorphism-pressed">
          <input
            className="w-11/12 m-2 bg-transparent text-xl outline-0"
            type="search"
            value={query}
            onChange={updateQuery}
            placeholder="Search by name, wallet id etc.."
          />
          <button
            onClick={fetchData}
            className="w-1/12 flex justify-center items-center active-neumorphism-plain"
          >
            <Search />
          </button>
        </form>
        <div className="p-5 w-11/12 flex flex-col justify-center items-center">
          {result.length > 0 &&
            result.map((e) => {
              return <SearchCard type={type} info={e} />;
            })}
          {msg !== null && <div>{msg}</div>}
          {result.length <= 0 && <div>Try searching for something.</div>}
        </div>
      </div>
    </div>
  );
};

export default SearchComp;
