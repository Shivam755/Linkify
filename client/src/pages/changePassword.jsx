import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { updateToast } from "../utilities/toastify";
import Axios from "axios";
import { getToken } from "../utilities/tokenSlice";

const ChangePassword = ({ drizzle, drizzleState }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  let { type } = useParams();
  const token = getToken();
  //Methods for updating state
  const updateOldPassword = (e) => {
    setOldPassword(e.target.value);
  };
  const updateNewPassword = (e) => {
    setNewPassword(e.target.value);
  };
  const updateConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  //Method for saving the password
  const changePassword = async (e) => {
    e.preventDefault();
    if (
      oldPassword.trim().length <= 0 ||
      newPassword.trim().length <= 0 ||
      confirmPassword.trim().length <= 0
    ) {
      return toast.warning("None of the fields can be empty");
    }
    const id = toast.loading("changing password!");
    const { Account } = drizzle.contracts;
    let hash;
    //fetching data id
    if (type === "Individual") {
      hash = await Account.methods.indivData(drizzleState.accounts[0]).call();
    } else {
      hash = await Account.methods.institData(drizzleState.accounts[0]).call();
    }

    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/changePassword",
      {
        id: hash.slice(2),
        type: type,
        old: oldPassword,
        new: newPassword,
        confirm: confirmPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (result.data.status === "Success") {
      let hash = result.data.hash;
      hash = "0x" + hash;
      try {
        let temp;
        if (type === "Individual") {
          temp = await Account.methods
            .updateIndivData(drizzleState.accounts[0], hash)
            .send();
        } else {
          temp = await Account.methods
            .updateInstitData(drizzleState.accounts[0], hash)
            .send();
        }
        if (temp) {
          updateToast(id, "Password Changed Successfully!", "success");
          navigate("/" + type + "/profile/");
        }
        updateToast(id, "Password Changing Failed!!", "error");
      } catch (err) {
        console.log(err);
        updateToast(id, err, "error");
      }
    } else {
      updateToast(id, result.data.msg, "info");
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-h-max">
      <div className="flex h-5/6 justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <h1 className="text-5xl p-2 m-2 bold">Change Password</h1>
          {/* Old Password */}
          <div className="m-1 flex items-center justify-between">
            Old Password:
            <input
              type="password"
              className="m-1 neumorphism-pressed px-4 py-2"
              value={oldPassword}
              placeholder="..."
              onChange={updateOldPassword}
              required
            />
          </div>
          {/* New Password */}
          <div className="m-1 flex items-center justify-between">
            New Password:
            <input
              type="password"
              className="m-1 neumorphism-pressed px-4 py-2"
              value={newPassword}
              placeholder="..."
              onChange={updateNewPassword}
              required
            />
          </div>
          {/* Confirm Password */}
          <div className="m-1 flex items-center justify-between">
            Confirm Password:
            <input
              type="password"
              className="m-1 neumorphism-pressed px-4 py-2"
              value={confirmPassword}
              placeholder="..."
              onChange={updateConfirmPassword}
              required
            />
          </div>
          <button
            className="m-2 neumorphism-button px-4 py-2"
            onClick={changePassword}
          >
            save changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
