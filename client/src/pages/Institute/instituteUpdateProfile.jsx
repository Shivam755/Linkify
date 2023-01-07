import React, { useEffect, useState } from "react";
import { isAddress } from "ethereum-address";
import { toast } from "react-toastify";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { updateToast } from "../../utilities/toastify";
import Loading from "../../components/loading";
import { InstituteTypes } from "../../utilities/defaultValues";
import { tokenKey } from "../../utilities/tokenSlice";

const InstituteUpdateProfile = ({ drizzle, drizzleState }) => {
  const [res, setRes] = useState(null);
  const [name, setName] = useState("");
  const [institType, setInstitType] = useState("");
  const [ceoId, setCeoId] = useState("");
  const [stackId, setStackId] = useState();
  const navigate = useNavigate();
  let hash;
  let token = JSON.parse(sessionStorage.getItem(tokenKey));

  const updateName = (e) => {
    setName(e.target.value);
  };

  const updateInstitType = (e) => {
    setInstitType(e.target.value);
  };
  const updateCeoId = (e) => {
    setCeoId(e.target.value);
  };

  useEffect(() => {
    const fetchdata = async () => {
      console.log(drizzle.contracts.Account.methods);
      const Account = drizzle.contracts.Account;
      // console.log(Account);
      hash = await Account.methods.institData().call();
      console.log(hash);
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/profile",
        {
          hash: hash.slice(2),
          type: "Institute",
        },
        {
          authorization: token,
        }
      ).catch((err) => console.log(err));
      console.log(result.data.profile);
      setRes(result.data.profile);
      //updating values on successful fetch
      setName(result.data.profile.name);
      setInstitType(result.data.profile.instituteType);
      setCeoId(result.data.profile.ceoId);
      console.log(result);
    };
    fetchdata();
  }, []);

  if (res === null) {
    return <Loading />;
  }
  const saveChanges = async (e) => {
    e.preventDefault();
    const id = toast.loading("Updating profile!");
    if (!isAddress(ceoId)) {
      updateToast(id, "Invalid CEO wallet ID", "warning");
      // alert("Invalid CEO wallet ID");
      return;
    }
    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/updateUser",
      {
        type: "Institute",
        _id: res._id,
        metamaskId: drizzleState.accounts[0],
        name: name,
        ceoId: ceoId,
        instituteType: institType,
        foundationDate: res.foundationDate,
        password: res.password,
        roles: res.roles,
        location: res.location,
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
        let temp = Account.methods["updateInstitData"].cacheSend(hash, {
          from: drizzleState.accounts[0],
        });
        console.log(temp);
        setStackId(temp);

        // await checkStatus();
        // alert("User created Successfully!!");
        updateToast(id, "User updated Successfully!", "success");
        navigate("/Institute/profile/");
        // alert(result.data.message);
      } catch (err) {
        console.log(err);
        updateToast(id, err, "error");
      }
    } else {
      updateToast(id, result.data.msg, "error");
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
          {/* InstituteType */}
          <div className="m-1 flex items-center justify-between">
            Institution Type:
            <select
              className="m-1 neumorphism-pressed px-4 py-2"
              name="institType"
              onChange={updateInstitType}
              required
            >
              {InstituteTypes.map((e) => {
                return (
                  <option key={e} selected={e === institType ? true : false}>
                    {e}
                  </option>
                );
              })}
            </select>
          </div>
          {/* Ceo Id */}
          <div className="m-1 flex items-center justify-between">
            Ceo Id:
            <input
              type="text"
              className="m-1 neumorphism-pressed px-4 py-2"
              value={ceoId}
              placeholder="0x9802..."
              onChange={updateCeoId}
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

export default InstituteUpdateProfile;
