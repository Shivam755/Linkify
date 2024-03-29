import { Link, useParams } from "react-router-dom";
import Axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { updateToast } from "../../utilities/toastify";
import { getToken } from "../../utilities/tokenSlice";
import Title from "../../components/title";

const InstituteViewInfo = ({ drizzle, drizzleState }) => {
  let { id } = useParams();
  const [res, setRes] = useState(null);
  const [state, setState] = useState({});
  const joined = useRef(false);

  let token = getToken();
  useEffect(() => {
    const fetchdata = async () => {
      const toastId = toast.loading("Fetching data");
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/profile",
        {
          hash: id,
          type: "Institute",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => {
        console.log(err);
        updateToast(toastId, "Some error in data fetch", "error", false, 500);
        // return null;
      });
      console.log(result);
      if (result) {
        const { Account } = drizzle.contracts;
        let hash = await Account.methods
          .indivData(drizzleState.accounts[0])
          .call();

        if (result.data.profile.members.includes(hash)) {
          joined.current = true;
        }
        setRes(result.data.profile);
        console.log(result.data.profile.name);
        setState({
          senderId: drizzleState.accounts[0],
          receiverId: result.data.profile.metamaskId,
          receiverName: result.data.profile.name,
          type: joined ? "Joining" : "Leaving",
          roles: result.data.profile.roles,
        });

        updateToast(toastId, "Data fetch complete", "success", false, 500);
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
    <div className="flex flex-col min-h-screen max-h-max">
      <div className="flex h-5/6 justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <div className="p-2 w-3/5 flex items-center justify-between">
            <Title title={res.name} />
            <Link
              className="active-neumorphism-plain px-4 py-3 w-1/2 text-center"
              to="/makeRequest"
              state={state}
            >
              Apply to {joined.current ? "join" : "leave"}
            </Link>
          </div>
          <div>
            <span className="text-[#0892d0]">Founded On:</span>{" "}
            {res.foundationDate}
          </div>
          <div>
            <span className="text-[#0892d0]">Member Count:</span>{" "}
            {res.members.length}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstituteViewInfo;
