import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { updateToast } from "./../utilities/toastify";

const SendRequest = ({ drizzle, drizzleState }) => {
  const location = useLocation();
  const { senderId, receiverId, senderName, type } = location.state;
  const [receiverName, setReceiverName] = useState();
  const [msg, setMsg] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchName = async () => {
      const id = toast.loading("Fetching data");
      const { Account } = drizzle.contracts;
      let hash;
      if (type === "Recruiting") {
        hash = await Account.methods
          .institData(drizzleState.accounts[0])
          .call();
      } else {
        hash = await Account.methods.indivData(drizzleState.accounts[0]).call();
      }
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/getName",
        {
          hash: hash,
          type: type === "Recruiting" ? "Individual" : "Institute",
        }
      ).catch((err) => {
        console.log(err);
        updateToast(id, "Some error in data fetch", "error", false, 500);
        return null;
      });
      if (result) {
        setReceiverName(result.data.name);
        updateToast(id, "Data fetch complete", "success", false, 500);
      }
    };
    fetchName();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex h-4/5 justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          {/* Sender Name */}
          <div className="m-1 flex items-center justify-between">
            Sender:
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="text"
              value={senderName}
              disabled
            />
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="text"
              value={senderId}
              disabled
            />
          </div>
          {/* Receiver Name */}
          <div className="m-1 flex items-center justify-between">
            Receiver:
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="text"
              value={receiverName}
              disabled
            />
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="text"
              value={receiverId}
              disabled
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendRequest;
