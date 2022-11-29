import Axios from "axios";
import React from "react";
import { useState } from "react";
import NavBar from "../components/navbar";

const InstituteSignup = ({ drizzle, drizzleState }) => {
  const [name, setName] = useState("");
  const [ceoId, setCeoId] = useState("");
  const [type, setType] = useState("");
  const [roles, setRoles] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [differenPassword, setDifferentPassword] = useState(false);
  const [stackId, setStackId] = useState();
  let qualifications = ["Select a value", "Educational", "Corporate"];

  // update states
  const updateName = (e) => {
    setName(e.target.value);
  };
  const updateCeoId = (e) => {
    setCeoId(e.target.value);
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
  const saveData = async () => {
    if (differenPassword) {
      alert("Password and confirm Password don't match!!!");
      return;
    }
    let result = await Axios.post(
      "http://localhost:3002/api/Institute/createUser",
      {
        metamaskId: window.ethereum.selectedAddress,
        name: name,
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
        alert(result.data.message);
      } catch (err) {
        console.log(err);
      }
    } else {
      alert(result.data.message);
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
      <NavBar className=""></NavBar>
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
          {/* Qualification */}
          <div className="m-1 flex items-center justify-between">
            Type:
            <select
              className="m-1 neumorphism-pressed px-4 py-2"
              name="qualification"
              // onChange={}
              required
            >
              {qualifications.map((e) => {
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
