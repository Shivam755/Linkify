import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { updateToast } from "../../utilities/toastify";
import { qualifications } from "../../utilities/defaultValues";
import Loading from "../../components/loading";
import { tokenKey } from "../../utilities/tokenSlice";

const IndividualUpdateProfile = ({ drizzle, drizzleState }) => {
  const [res, setRes] = useState(null);
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const [designation, setDesignation] = useState("");
  const [stackId, setStackId] = useState();
  const navigate = useNavigate();
  let hash;
  let token = JSON.parse(sessionStorage.getItem(tokenKey));
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
  useEffect(() => {
    const fetchdata = async () => {
      console.log(drizzle.contracts.Account.methods);
      const Account = drizzle.contracts.Account;
      // console.log(Account);
      hash = await Account.methods.indivData().call();
      console.log(hash);
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/profile",
        {
          hash: hash.slice(2),
          type: "Individual",
        },
        {
          authorization: token,
        }
      ).catch((err) => console.log(err));
      console.log(result.data.profile);
      setRes(result.data.profile);
      //updating values on successful fetch
      setName(result.data.profile.name);
      setDesignation(result.data.profile.designation);
      setQualification(result.data.profile.qualification);
      console.log(result);
    };
    fetchdata();
  }, []);

  //checking if data is fetched
  if (res === null) {
    return <Loading />;
  }

  const saveChanges = async (e) => {
    e.preventDefault();
    const id = toast.loading("Updating profile!");
    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/Individual/updateUser",
      {
        _id: res._id,
        metamaskId: drizzleState.accounts[0],
        name: name,
        birthDate: res.birthDate,
        qualification: qualification,
        designation: designation,
        password: res.password,
        documentList: res.documentList,
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
        let temp = Account.methods["updateIndivData"].cacheSend(hash, {
          from: drizzleState.accounts[0],
        });
        console.log(temp);
        setStackId(temp);

        // await checkStatus();
        // alert("User created Successfully!!");
        updateToast(id, "User updated Successfully!", "success");
        navigate("/Individual/profile/" + hash);
        // alert(result.data.message);
      } catch (err) {
        console.log(err);
        updateToast(id, err, "error");
      }
    } else {
      updateToast(id, result.data.status, "info");
    }
  };
  return (
    <div className="flex flex-col h-screen">
      <div className="flex h-4/5 justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <h1 className="text-5xl p-2 m-2 bold">Update Profile</h1>
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
                return (
                  <option key={e} selected={e === qualification ? true : false}>
                    {e}
                  </option>
                );
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
          <button
            className="m-2 neumorphism-button px-4 py-2"
            onClick={saveChanges}
          >
            save changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default IndividualUpdateProfile;
