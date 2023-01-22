import Axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { InstitProfileOptions } from "../../utilities/defaultValues";
import { updateToast } from "../../utilities/toastify";
import { tokenKey } from "../../utilities/tokenSlice";

const ViewMembers = () => {
  const [res, setRes] = useState(null);
  // let { id } = useParams();
  let token = JSON.parse(sessionStorage.getItem(tokenKey));
  useEffect(() => {
    const fetchdata = async () => {
      const id = toast.loading("Fetching data");
      const { Account } = drizzle.contracts;
      let hash = await Account.methods.institData().call();
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/getMembers",
        {
          hash: hash.slice(2),
        },
        {
          authorization: token,
        }
      ).catch((err) => console.log(err));
      setRes(result.data.members);
      updateToast(id, "Data fetch complete", "success", false, 500);
    };
    fetchdata();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex h-4/5 justify-center items-center">
        <h1 className="text-5xl p-2 m-2 bold">Members List</h1>
        {() => {
          if (res === null) {
            return (
              <>
                No Members yet. <Link to={""}>Recruit some</Link>{" "}
              </>
            );
          }
          return res.map((e) => {
            <form
              key={e.id}
              className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain"
            >
              <p>e.name</p>
              <p>e.metamaskId</p>
              <p>e.role</p>
            </form>;
          });
        }}
      </div>
    </div>
  );
};

export default ViewMembers;
