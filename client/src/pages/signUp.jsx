import Axios from "axios";
import React from "react";
import { useState } from "react";
// import { numStringToBytes32 } from "../utilities/bytes32";

const SignUp = ({ drizzle, drizzleState }) => {
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const [designation, setDesignation] = useState("");
  const [dob, setDOB] = useState();
  const [stackId, setStackId] = useState();
  let qualifications = [
    "Select a value",
    "Not admitted yet",
    "Pre-primary",
    "Primary",
    "Secondary",
    "Higher Secondary",
    "Graduation",
    "Diploma",
    "Post-Graduation",
    "Phd",
  ];

  const updateQualification = (e) => {
    setQualification(e.target.value);
  };
  const updateName = (e) => {
    setName(e.target.value);
  };
  const updateDesignation = (e) => {
    setDesignation(e.target.value);
  };
  const updateDOB = (e) => {
    setDOB(e.target.value);
  };

  const saveData = async () => {
    let result = await Axios.post(
      "http://localhost:3002/api/Individual/createUser",
      {
        metamaskId: window.ethereum.selectedAddress,
        name: name,
        birthDate: dob,
        qualification: qualification,
        designation: designation,
        documentList: [],
      }
    );
    console.log(result);
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
    <div className="flex flex-col justify-center items-center">
      <h1 className="p-3 m-3 font-bold text-6xl">Sign Up</h1>
      <div className="flex justify-between">
        Name:
        <input
          type="text"
          value={name}
          placeholder="Full name"
          onChange={updateName}
          required
        />
      </div>
      <div>
        Date of Birth: <input type="date" onChange={updateDOB} />
      </div>
      <div>
        Qualification:
        <select name="qualification" onChange={updateQualification} required>
          {qualifications.map((e) => {
            return <option key={e}>{e}</option>;
          })}
        </select>
      </div>
      <div>
        Designation:
        <input
          type="text"
          placeholder="Designation"
          value={designation}
          onChange={updateDesignation}
          required
        />
      </div>
      <button
        className="border-slate-800 rounded-md border-2 p-2 m-2"
        onClick={saveData}
      >
        Sign Up
      </button>
    </div>
  );
};

export default SignUp;
