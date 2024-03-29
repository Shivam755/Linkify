import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useLocation } from "react-router-dom";
import { isAddress } from "ethereum-address";
import { toast } from "react-toastify";
import { updateToast } from "./../utilities/toastify";
import { getToken } from "../utilities/tokenSlice";
import { useNavigate } from "react-router-dom";

const SendRequest = ({ drizzle, drizzleState }) => {
  const location = useLocation();
  const { senderId, receiverId, receiverName, type, roles } = location.state;
  const [senderName, setSenderName] = useState();
  const [msg, setMsg] = useState("");
  const [role, setRole] = useState("");
  const token = getToken();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchName = async () => {
      const id = toast.loading("Fetching data");
      const { Account } = drizzle.contracts;
      let hash;
      console.log(type);
      if (type === "Recruiting" || type === "Firing") {
        hash = await Account.methods.institData(senderId).call();
      } else {
        hash = await Account.methods.indivData(senderId).call();
      }
      console.log(hash);
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/getName",
        {
          hash: [hash.slice(2)],
          type:
            type === "Recruiting" || type === "Firing"
              ? "Institute"
              : "Individual",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => {
        console.log(err);
        updateToast(id, "Some error in data fetch", "error", false, 1000);
        return null;
      });
      console.log(result);
      if (result) {
        setSenderName(result.data.names[0]);
        updateToast(id, "Data fetch complete", "success", false, 500);
      }
    };
    fetchName();
  }, []);

  const updateRole = (e) => {
    setRole(e.target.value);
  };

  const updateMsg = (e) => {
    setMsg(e.target.value);
  };

  const sendRequest = async (e) => {
    const id = toast.loading("Sending Request!!");
    e.preventDefault();
    if (
      senderId.trim().length <= 0 ||
      receiverId.trim().length <= 0 ||
      msg.trim().length <= 0 ||
      role.trim().length <= 0
    ) {
      return updateToast(
        id,
        "Please fill all fields before moving on",
        "warning"
      );
    }
    if (!isAddress(senderId) || !isAddress(receiverId)) {
      return updateToast(id, "Invalid wallet ID", "warning");
    }
    try {
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/AddRequest",
        {
          senderId,
          senderName,
          receiverId,
          receiverName,
          msg,
          role,
          type,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (result.data.status === "Success") {
        updateToast(id, result.data.message, "success");
        if (type === "Recruiting" || type === "Firing") {
          navigate("/Institute/searchIndividuals");
        } else {
          navigate("/Individual/searchInstitutes");
        }
      } else {
        updateToast(id, result.data.message, "error");
      }
    } catch (err) {
      updateToast(
        id,
        "There's some error on server side.Please wait and try again later!",
        "error"
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-h-max">
      <div className="flex h-5/6 justify-center items-center">
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
          {/* Role */}
          {(type === "Joining" || type === "Recruiting") && (
            <div className="m-1 flex items-center justify-between">
              Role:
              <select
                className="m-1 neumorphism-pressed px-4 py-2"
                name="qualification"
                onChange={updateRole}
                required
              >
                <option value="">Select a role</option>
                {roles.map((e) => {
                  return (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          {/* Message */}
          <div className="m-1 flex items-center justify-between">
            Message:
            <textarea
              cols={40}
              resize={false}
              className="m-1 neumorphism-pressed px-6 py-4 hide-scroll"
              type="text"
              value={msg}
              placeholder="A small text to describe yourself and why you want this role"
              onChange={updateMsg}
              required
            ></textarea>
          </div>
          <button
            className="m-1 active-neumorphism-button px-4 py-2"
            onClick={sendRequest}
          >
            Submit request
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendRequest;
