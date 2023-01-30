import Axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { updateToast } from "./../utilities/toastify";
import { getToken } from "./../utilities/tokenSlice";

const ViewDocuments = ({ drizzleState }) => {
  const [res, setRes] = useState(null);
  //   let { id } = useParams();
  let token = getToken();
  useEffect(() => {
    const fetchdata = async () => {
      const toastId = toast.loading("Fetching data");
      try {
        let result = await Axios.post(
          process.env.REACT_APP_SERVER_HOST + "/api/getDocumentsById",
          {
            id: drizzleState.accounts[0],
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch((err) => console.log(err));
        setRes(result.data.result);
        updateToast(toastId, "Data fetch complete", "success", false, 500);
      } catch (error) {
        updateToast(toastId, "Some error occured!", "error");
      }
    };
    fetchdata();
  }, []);
  return (
    <div className="flex flex-col min-h-screen max-h-max">
      <div className="flex flex-col h-5/6 justify-center items-center">
        <h1 className="text-5xl p-2 m-2 bold">Members List</h1>
        {!res && <>No Documents to show.</>}
        {res &&
          res.map((e) => {
            return (
              <div
                key={e._id}
                className="m-2 p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain"
              >
                <p>{e.docName}</p>
                <a
                  target="_blank"
                  href={e.docUrl}
                  className="m-2 neumorphism-plain px-4 py-2"
                >
                  View document
                </a>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ViewDocuments;
