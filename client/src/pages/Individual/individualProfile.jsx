import Axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const IndividualProfile = ({ drizzle }) => {
  const [res, setRes] = useState(null);
  // let { id } = useParams();
  let token = useSelector((state) => state.tokenSlice.value);
  useEffect(() => {
    const fetchdata = async () => {
      const { Account } = drizzle.contracts;
      console.log(Account);
      let hash = await Account.methods.indivData().call();
      console.log(hash);
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/profile",
        {
          hash: hash.slice(2),
          type: "Individual",
        },
        {
          authorization: token,
        }
      ).catch((err) => console.log(err));
      setRes(result.data.profile);
      console.log(result);
    };
    fetchdata();
  }, []);

  const editProfile = (e) => {
    e.preventDefault();
    return toast("Edit profile clicked!!");
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex h-4/5 justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <h1 className="text-5xl p-2 m-2 bold">Profile</h1>
          {res !== null &&
            Object.keys(res).map((keyName, keyIndex) => {
              return (
                <div className="m-1 flex items-center justify-between">
                  {keyName.charAt(0).toUpperCase() + keyName.slice(1)}:
                  <input
                    type="text"
                    className="m-1 neumorphism-pressed px-4 py-2"
                    value={res[keyName]}
                    placeholder={keyName}
                    disabled
                  />
                </div>
              );
            })}
          <button onClick={editProfile}>Edit Profile</button>
        </form>
      </div>
    </div>
  );
};

export default IndividualProfile;
