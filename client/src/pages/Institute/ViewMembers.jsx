import Axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { InstitProfileOptions } from "../../utilities/defaultValues";
import { updateToast } from "../../utilities/toastify";
import { getToken } from "../../utilities/tokenSlice";

const ViewMembers = ({ drizzle, drizzleState }) => {
  const [res, setRes] = useState(null);
  // let { id } = useParams();
  let token = getToken();
  useEffect(() => {
    const fetchdata = async () => {
      const id = toast.loading("Fetching data");
      const { Account } = drizzle.contracts;
      let hash = await Account.methods
        .institData(drizzleState.accounts[0])
        .call();
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/getMembers",
        {
          hash: hash.slice(2),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => console.log(err));
      setRes(result.data.members);
      updateToast(id, "Data fetch complete", "success", false, 500);
    };
    fetchdata();
  }, []);

  return (
    <div className="flex flex-col min-h-screen max-h-max">
      <div className="flex flex-col h-5/6 justify-center items-center">
        <h1 className="text-5xl p-2 m-2 bold">Members List</h1>
        {!res && (
          <>
            No Members yet. <Link to={""}>Recruit some</Link>{" "}
          </>
        )}
        {res &&
          res.map((e) => {
            <div
              key={e._id}
              className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain"
            >
              <p>e.name</p>
              <p>e.metamaskId</p>
              <p>e.role</p>
              <Link to={"/Institute/assignDoc/" + e._id}>
                Assign a document
              </Link>
            </div>;
          })}
      </div>
    </div>
  );
};

export default ViewMembers;
