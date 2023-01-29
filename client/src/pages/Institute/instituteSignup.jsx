import Axios from "axios";
import React from "react";
import { useState } from "react";
import { isAddress } from "ethereum-address";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useGeolocated } from "react-geolocated";
import { updateToast } from "../../utilities/toastify";
import { InstituteTypes } from "../../utilities/defaultValues";

const InstituteSignup = ({ drizzle, drizzleState }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [ceoId, setCeoId] = useState("");
  const [type, setType] = useState("");
  const [foundationDate, setFoundationDate] = useState();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
    });
  // console.log(coords);
  // update states
  const updateName = (e) => {
    setName(e.target.value);
  };
  const updateFoundation = (e) => {
    setFoundationDate(e.target.value);
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
  };

  // create a new user!
  const saveData = async (e) => {
    const id = toast.loading("Creating account!!");
    e.preventDefault();
    if (password !== confirmPassword) {
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
    try {
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/createUser",
        {
          type: "Institute",
          metamaskId: drizzleState.accounts[0],
          name: name,
          foundationDate: foundationDate,
          ceoId: ceoId,
          instituteType: type,
          roles: [],
          members: [],
          password: password,
          confirmPassword: confirmPassword,
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        }
      );
      if (result.data.status === "Success") {
        let hash = result.data.hash;
        hash = "0x" + hash;
        console.log(hash);
        try {
          const { Account } = drizzle.contracts;
          let temp = Account.methods
            .createInstituteAccount(drizzleState.accounts[0], hash)
            .send();
          updateToast(id, result.data.message, "success");
          navigate("/Institute/login");
          // alert(result.data.message);
        } catch (err) {
          console.log(err);
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

  return !isGeolocationAvailable ? (
    <div className="flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-6xl">
      Your browser doesn't support Geolocation. We need your geolocation for
      security reasons.
    </div>
  ) : !isGeolocationEnabled ? (
    <div className="flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-6xl">
      We need geolocation for security reasons. Please enable geolocation!
    </div>
  ) : (
    <div className="flex flex-col min-h-screen max-h-max">
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
          {/* Foundation Date */}
          <div className="m-1 flex items-center justify-between">
            Founding Date:{" "}
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="date"
              onChange={updateFoundation}
              required
            />
          </div>
          {/* Type */}
          <div className="m-1 flex items-center justify-between">
            Type:
            <select
              className="m-1 neumorphism-pressed px-4 py-2"
              name="qualification"
              onChange={updateType}
              required
            >
              {InstituteTypes.map((e) => {
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
