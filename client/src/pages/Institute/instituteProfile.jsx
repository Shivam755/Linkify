import Axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { InstitProfileOptions } from "../../utilities/defaultValues";
import { updateToast } from "../../utilities/toastify";
import { tokenKey } from "../../utilities/tokenSlice";

const InstituteProfile = ({ drizzle, drizzleState }) => {
  const [res, setRes] = useState(null);
  // let { id } = useParams();
  let token = JSON.parse(sessionStorage.getItem(tokenKey));
  useEffect(() => {
    const fetchdata = async () => {
      const id = toast.loading("Fetching data");
      const { Account } = drizzle.contracts;
      let hash = await Account.methods
        .institData(drizzleState.accounts[0])
        .call();
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/profile",
        {
          hash: hash.slice(2),
          type: "Institute",
        },
        {
          authorization: token,
        }
      ).catch((err) => console.log(err));
      setRes(result.data.profile);
      updateToast(id, "Data fetch complete", "success", false, 500);
    };
    fetchdata();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex h-4/5 justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <h1 className="text-5xl p-2 m-2 bold">Profile</h1>
          {res !== null &&
            Object.keys(res).map((keyName, keyIndex) => {
              if (!InstitProfileOptions.includes(keyName)) {
                return;
              }
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
          <Link
            className="neumorphism-plain px-5 py-3 m-2"
            to={"/Institute/updateProfile"}
          >
            Edit Profile
          </Link>
          <Link
            to="/changePassword/Institute/"
            className="neumorphism-plain px-5 py-3 m-2"
          >
            Change Password
          </Link>
        </form>
      </div>
    </div>
  );
};

export default InstituteProfile;
