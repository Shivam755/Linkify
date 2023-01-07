import Axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateToast } from "../../utilities/toastify";
import { qualifications } from "../../utilities/defaultValues";

// import { numStringToBytes32 } from "../utilities/bytes32";

const IndividualSignUp = ({ drizzle, drizzleState }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [differenPassword, setDifferentPassword] = useState(false);
  const [dob, setDOB] = useState();
  const [stackId, setStackId] = useState();

  // update states
  const updateQualification = (e) => {
    setQualification(e.target.value);
  };
  const updateName = (e) => {
    setName(e.target.value);
  };
  const updateDesignation = (e) => {
    setDesignation(e.target.value);
  };
  const updatePassword = (e) => {
    setPassword(e.target.value);
  };
  const updateConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };
  const updateDOB = (e) => {
    setDOB(e.target.value);
  };

  // create a new user!
  const saveData = async (e) => {
    e.preventDefault();
    const id = toast.loading("Creating user!");
    if (password !== confirmPassword) {
      // alert("Password and confirm Password don't match!!!");
      updateToast(
        id,
        "Password and confirm Password don't match!!!",
        "warning"
      );
      return;
    }
    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/createUser",
      {
        type: "Individual",
        metamaskId: drizzleState.accounts[0],
        name: name,
        birthDate: dob,
        qualification: qualification,
        designation: designation,
        password: password,
        confirmPassword: confirmPassword,
        documentList: [],
      }
    );
    console.log(result);
    if (result.data.status === "Success") {
      let hash = result.data.hash;
      hash = "0x" + hash;
      console.log(hash);
      try {
        console.log(drizzle);
        const { Account } = drizzle.contracts;
        let temp = Account.methods["createIndividualAccount"].cacheSend(hash, {
          from: drizzleState.accounts[0],
        });
        setStackId(temp);

        // await checkStatus();
        // alert("User created Successfully!!");
        updateToast(id, "User created Successfully!", "success");
        navigate("/Individual/login");
        // alert(result.data.message);
      } catch (err) {
        console.log(err);
        updateToast(id, err, "error");
      }
    } else {
      updateToast(id, result.data.status, "info");
    }
  };

  const checkStatus = async () => {
    return new Promise((resolve) => {
      let done = false;
      while (!done) {
        let status = getTxStatus();
        if (status !== null) {
          done = true;
          console.log(status);
        }
        setTimeout(() => {}, 1000);
      }
    });
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
      <div className="flex h-4/5 justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <h1 className="p-3 m-4 font-bold text-6xl">Individual Sign Up</h1>
          {/* name */}
          <div className="m-1 flex items-center justify-between">
            Name:
            <input
              type="text"
              className="m-1 neumorphism-pressed px-4 py-2"
              value={name}
              placeholder="Full name"
              onChange={updateName}
              required
            />
          </div>
          {/* Dob */}
          <div className="m-1 flex items-center justify-between">
            Date of Birth:{" "}
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="date"
              onChange={updateDOB}
              required
            />
          </div>
          {/* Qualification */}
          <div className="m-1 flex items-center justify-between">
            Qualification:
            <select
              className="m-1 neumorphism-pressed px-4 py-2"
              name="qualification"
              onChange={updateQualification}
              required
            >
              {qualifications.map((e) => {
                return <option key={e}>{e}</option>;
              })}
            </select>
          </div>
          {/* Designation */}
          <div className="m-1 flex items-center justify-between">
            Designation:
            <input
              type="text"
              className="m-1 neumorphism-pressed px-4 py-2"
              placeholder="Designation"
              value={designation}
              onChange={updateDesignation}
              required
            />
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
            className="m-2 neumorphism-button px-4 py-2"
            onClick={saveData}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default IndividualSignUp;
