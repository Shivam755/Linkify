import React from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const MetamaskConnect = ({ type }) => {
  const navigate = useNavigate();
  const toHex = (stringToConvert) =>
    stringToConvert
      .split("")
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");

  //Connect to metamask
  const connect = async (e) => {
    if (window.ethereum !== "undefined") {
      try {
        // connecting to metamask
        await window.ethereum.request({ method: "eth_requestAccounts" });
        //Fetching nonce
        let data = await Axios.get("http://localhost:3002/nonce");
        const nonce = data.data.nonce;

        //Asking user to sign nonce
        const sig = await window.ethereum.request({
          method: "personal_sign",
          params: [`0x${toHex(nonce)}`, window.ethereum.selectedAddress],
        });

        //Verifying signature
        data = await Axios.post("http://localhost:3002/verifySignature", {
          address: window.ethereum.selectedAddress,
          ogNonce: nonce,
          signature: sig,
        });

        if (data.data.verified) {
          alert("Signature verified!!");

          data = await Axios.post(`http://localhost:3002/api/checkId`, {
            address: window.ethereum.selectedAddress,
            type: type,
          });
          console.log(data.data);
          if (data.data.Existing) {
            return navigate(`/${type}/login`);
          }

          navigate(`/${type}/signUp`);
        } else {
          alert("Signature rejected!!");
        }
      } catch (error) {
        // User denied account access
        alert("You denied web3 access or there's been an error!");
        console.error("User denied web3 access", error);
        return;
      }
    } else {
      alert("No web3 provider detected");
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
