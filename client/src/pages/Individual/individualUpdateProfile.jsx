import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { updateToast } from "../../utilities/toastify";
import { qualifications } from "../../utilities/defaultValues";
import Loading from "../../components/loading";
import { getToken } from "../../utilities/tokenSlice";
import Title from "../../components/title";

const IndividualUpdateProfile = ({ drizzle, drizzleState }) => {
  const [res, setRes] = useState(null);
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const navigate = useNavigate();
  let hash;
  let token = getToken();
  // update states
  const updateQualification = (e) => {
    setQualification(e.target.value);
  };
  const updateName = (e) => {
    setName(e.target.value);
  };

  useEffect(() => {
    const fetchdata = async () => {
      console.log(drizzle.contracts.Account.methods);
      const Account = drizzle.contracts.Account;
      // console.log(Account);
      hash = await Account.methods.indivData(drizzleState.accounts[0]).call();
      console.log(hash);
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/profile",
        {
          hash: hash.slice(2),
          type: "Individual",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => console.log(err));
      setRes(result.data.profile);
      //updating values on successful fetch
      setName(result.data.profile.name);
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
    if (
      !(
        (name !== res.name || qualification !== res.qualification)
        // designation !== res.designation
      )
    ) {
      updateToast(id, "No changes were made", "info");
      return navigate("/Individual/profile");
    }

    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/updateUser",
      {
        type: "Individual",
        _id: res._id,
        metamaskId: drizzleState.accounts[0],
        name: name,
        birthDate: res.birthDate,
        qualification: qualification,
        // designation: designation,
        password: res.password,
        documentList: res.documentList,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
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
        let temp = Account.methods
          .updateIndivData(drizzleState.accounts[0], hash)
          .send();
        console.log(temp);

        // await checkStatus();
        // alert("User created Successfully!!");
        updateToast(id, "User updated Successfully!", "success");
        navigate("/Individual/profile/");
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
    <div className="h-screen flex flex-col min-h-screen max-h-max">
      <div className="flex h-5/6 justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <Title title={"Update Profile"} />
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
          <button
            className="m-2 active-neumorphism-button px-4 py-2"
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
