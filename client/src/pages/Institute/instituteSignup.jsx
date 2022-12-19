import Axios from "axios";
import React from "react";
import { useState } from "react";
import { isAddress } from "ethereum-address";
import { toast } from "react-toastify";
import { updateToast } from "../../utilities/toastify";

const InstituteSignup = ({ drizzle, drizzleState }) => {
  const [name, setName] = useState("");
  const [ceoId, setCeoId] = useState("");
  const [type, setType] = useState("");
  // const [roles, setRoles] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [differenPassword, setDifferentPassword] = useState(false);
  const [stackId, setStackId] = useState();
  let typeList = ["Select a value", "Educational", "Corporate"];

  // update states
  const updateName = (e) => {
    setName(e.target.value);
  };
  const updateCeoId = (e) => {
    setCeoId(e.target.value);
  };
  const updateType = (e) => {
    setType(e.target.value);
  };
  const updatePassword = (e) => {
    setPassword(e.target.value);
  };
  const updateConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
    if (password !== confirmPassword) {
      setDifferentPassword(true);
    } else {
      setDifferentPassword(false);
    }
  };

  // create a new user!
  const saveData = async (e) => {
    const id = toast.loading("Creating account!!");
    e.preventDefault();
    if (differenPassword) {
      // alert("Password and confirm Password don't match!!!");
      updateToast(
        id,
        "Password and confirm Password don't match!!!",
        "warning"
      );
      return;
    }
    if (!isAddress(ceoId)) {
      updateToast(id, "Invalid CEO wallet ID", "warning");
      // alert("Invalid CEO wallet ID");
      return;
    }
    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/Institute/createUser",
      {
        metamaskId: drizzleState.accounts[0],
        name: name,
        ceoId: ceoId,
        instituteType: type,
        roles: [],
        password: password,
        confirmPassword: confirmPassword,
      }
    );
    if (result.data.status === "Success") {
      let hash = result.data.hash;
      hash = "0x" + hash;
      console.log(hash);
      try {
        const { Account } = drizzle.contracts;
        let temp = Account.methods["createIndividualAccount"].cacheSend(hash, {
          from: drizzleState.accounts[0],
        });
        setStackId(temp);
        updateToast(id, result.data.message, "success");
        // alert(result.data.message);
      } catch (err) {
        console.log(err);
      }
    } else {
      updateToast(id, result.data.message, "error");
    }
  };

  const getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[stackId];

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    return transactions[txHash] && transactions[txHash].status;
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col h-screen justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <h1 className="p-3 m-4 font-bold text-6xl">Institute Sign Up</h1>
          {/* name */}
          <div className="m-1 flex items-center justify-between">
            Name:
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="text"
              value={name}
              placeholder="Full name"
              onChange={updateName}
              required
            />
          </div>
          {/* Ceo ID */}
          <div className="m-1 flex items-center justify-between">
            CEO wallet ID:
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="text"
              value={ceoId}
              placeholder="eg. 0x7f9845e768...."
              onChange={updateCeoId}
              required
            />
          </div>
          {/* Qualification */}
          <div className="m-1 flex items-center justify-between">
            Type:
            <select
              className="m-1 neumorphism-pressed px-4 py-2"
              name="qualification"
              onChange={updateType}
              required
            >
              {typeList.map((e) => {
                return <option key={e}>{e}</option>;
              })}
            </select>
          </div>

          {/* Password */}
          <div className="m-1 flex items-center justify-between">
            Password:
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="password"
              value={password}
              onChange={updatePassword}
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
              onChange={updateConfirmPassword}
              required
            />
          </div>
          <button
            className="m-1 neumorphism-button px-4 py-2"
            onClick={saveData}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default InstituteSignup;
