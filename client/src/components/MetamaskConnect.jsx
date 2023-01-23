import React from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateToast } from "../utilities/toastify";

const MetamaskConnect = ({ type, drizzle, drizzleState }) => {
  const navigate = useNavigate();
  const toHex = (stringToConvert) =>
    stringToConvert
      .split("")
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");

  //Connect to metamask
  const connect = async (e) => {
    const id = toast.loading("Verifying signature!!");
    if (window.ethereum !== "undefined") {
      try {
        // connecting to metamask
        await window.ethereum.request({ method: "eth_requestAccounts" });
        //Fetching nonce
        let data = await Axios.get(
          process.env.REACT_APP_SERVER_HOST + "/nonce"
        );
        const nonce = data.data.nonce;
        //Asking user to sign nonce
        const sig = await window.ethereum.request({
          method: "personal_sign",
          params: [`0x${toHex(nonce)}`, drizzleState.accounts[0]],
        });

        console.log(drizzleState.accounts);
        //Verifying signature
        data = await Axios.post(
          process.env.REACT_APP_SERVER_HOST + "/verifySignature",
          {
            address: drizzleState.accounts[0],
            ogNonce: nonce,
            signature: sig,
          }
        );
        if (data.data.verified) {
          updateToast(id, "Signature Verified!!!", "success");

          const { Account } = drizzle.contracts;
          let dataKey;
          if (type == "Individual") {
            dataKey = await Account.methods
              .indivCheckId(drizzleState.accounts[0])
              .call();
          } else {
            dataKey = await Account.methods
              .institCheckId(drizzleState.accounts[0])
              .call();
          }
          console.log(dataKey);
          if (dataKey) {
            return navigate(`/${type}/login`);
          }

          navigate(`/${type}/signUp`);
        } else {
          // alert("Signature rejected!!");
          updateToast(id, "Signature rejected!!", "error");
        }
      } catch (error) {
        // User denied account access
        updateToast(
          id,
          "You denied web3 access or there's been an error!",
          "error"
        );

        // alert("You denied web3 access or there's been an error!");
        console.error("User denied web3 access", error);
        return;
      }
    } else {
      // alert("No web3 provider detected");
      updateToast(id, "No web3 provider detected", "error");
      // toast.error("No web3 provider detected");
      console.error("No web3 provider detected");
      return;
    }
  };

  return (
    <div className="flex justify-center content-center">
      <button
        onClick={connect}
        className="flex flex-row w-max justify-center items-center m-5 px-5 py-3 neumorphism-plain"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
          alt="Metamask"
          className="h-5 mr-2"
        />
        Connect to Metamask
      </button>
    </div>
  );
};

export default MetamaskConnect;
