import Axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateToast } from "../../utilities/toastify";
import { tokenKey } from "../../utilities/tokenSlice";
import { Link, useParams } from "react-router-dom";

const InstituteViewInfo = ({ drizzle, drizzleState }) => {
  let { id } = useParams();
  const [res, setRes] = useState(null);
  const [state, setState] = useState({});

  let token = JSON.parse(sessionStorage.getItem(tokenKey));
  useEffect(() => {
    const fetchdata = async () => {
      const id = toast.loading("Fetching data");
      const { Account } = drizzle.contracts;
      console.log(Account);
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
      ).catch((err) => {
        console.log(err);
        updateToast(id, "Some error in data fetch", "error", false, 500);
        // return null;
      });
      console.log(result);
      if (result) {
        setRes(result.data.profile);
        setState({
          senderId: drizzleState.accounts[0],
          receiverId: result.data.profile.metamaskId,
          reciverName: result.data.profile.name,
          type: "Joining",
          roles: result.data.profile.roles,
        });
        updateToast(id, "Data fetch complete", "success", false, 500);
      }
    };
    fetchdata();
  }, []);

  if (res === null) {
    return (
      <div className="flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-6xl">
        We're loading data. Please wait...
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen">
      <div className="flex h-4/5 justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <h1>{res.name}</h1>
          <Link to="/makeRequest" state={state}>
            Apply to join
          </Link>
          <div>Founded On: {res.foundationDate}</div>
          <div>Member Count: {res.members.length}</div>
        </form>
      </div>
    </div>
  );
};

export default InstituteViewInfo;
