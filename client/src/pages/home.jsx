import React from "react";
import BlockChain from "../assets/blockchain.svg";
import SecureAuth from "../assets/secure_authentication.svg";
import SecureLetter from "../assets/secure_letter.svg";
import Vault from "../assets/Secure_vault.svg";

const Home = () => {
  return (
    <div className="w-full p-4 flex flex-col justify-center items-center">
      <div className="h-1/6 flex justify-center items-center">
        <div className="m-8 flex justify-center items-center h-1/3">
          <img src={BlockChain} className="h-full" />
        </div>
        <div className="m-4 flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-4xl">
          The power of blockchain supporting your Educational and Professional
          needs
        </div>
      </div>
      <div className="h-1/6 flex flex-row-reverse justify-center items-center">
        <div className="m-8 flex justify-center items-center h-1/3">
          <img src={SecureAuth} className="h-full" />
        </div>
        <div className="m-4 flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-4xl">
          Authentication Re-Inforced with digital signature.
        </div>
      </div>
      <div className="h-1/6 flex justify-center items-center">
        <div className="m-4 flex justify-center items-center h-1/3">
          <img src={SecureLetter} className="h-full" />
        </div>
        <div className="m-4 flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-4xl">
          Logging of every transaction that happens.
        </div>
      </div>
      <div className="h-1/6 flex flex-row-reverse justify-center items-center">
        <div className="m-4 flex justify-center items-center h-1/3">
          <img src={Vault} className="h-full" />
        </div>
        <div className="m-4 flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-4xl">
          Secure Document storage with the help of IPFS.
        </div>
      </div>
    </div>
  );
};

export default Home;
