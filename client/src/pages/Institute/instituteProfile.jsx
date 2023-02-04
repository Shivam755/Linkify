import Axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { InstitProfileOptions } from "../../utilities/defaultValues";
import { updateToast } from "../../utilities/toastify";
import { updateNav } from "../../components/navbar";
import { getToken, deleteToken } from "../../utilities/tokenSlice";
import Title from "../../components/title";

const InstituteProfile = ({ drizzle, drizzleState }) => {
  const [res, setRes] = useState(null);
  const navigate = useNavigate();
  // let { id } = useParams();
  let token = getToken();
  useEffect(() => {
    const fetchdata = async () => {
      const id = toast.loading("Fetching data");
      const { Account } = drizzle.contracts;
      let hash = await Account.methods
        .institData(drizzleState.accounts[0])
        .call();
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/profile",
        {
          hash: hash.slice(2),
          type: "Institute",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => console.log(err));
      setRes(result.data.profile);
      updateToast(id, "Data fetch complete", "success", false, 500);
    };
    fetchdata();
  }, []);
  const deleteAccount = async (e) => {
    const id = toast.loading("Deleting profile!");
    const { Account } = drizzle.contracts;
    let result = await Account.methods
      .deleteInstitData(drizzleState.accounts[0])
      .send();
    console.log(result);
    if (result) {
      updateToast(id, "Account deleted Successfully!", "success");
      deleteToken();
      updateNav();
      navigate("/");
    } else {
      updateToast(
        id,
        "There some issue with transacting the change. Please try again!",
        "error"
      );
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Do you really want to delete your account?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
      color: "#ffffff",
      background: "#0a0a0b",
      customClass: {
        // actions: "neumorphism-plain",
        cancelButton: "neumorphism-plain",
        confirmButton: "neumorphism-plain",
        denyButton: "neumorphism-plain",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAccount();
      } else if (result.isDenied) {
        toast.info("We're glad you decided to stay!!");
      }
    });
  };
  return (
    <div className="flex flex-col h-screen">
      <div className="flex h-5/6 justify-center items-center">
        <form className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <Title title="Profile" />
          {res !== null &&
            Object.keys(res).map((keyName, keyIndex) => {
              if (!InstitProfileOptions.includes(keyName)) {
                return;
              }
              return (
                <div className="m-1 flex items-center justify-between">
                  <span className="text-[#0892d0]">
                    {keyName.charAt(0).toUpperCase() + keyName.slice(1)}:
                  </span>
                  <input
                    type="text"
                    className="m-1 neumorphism-pressed px-4 py-2 bg-transparent"
                    value={res[keyName]}
                    placeholder={keyName}
                    disabled
                  />
                </div>
              );
            })}
          <div className="flex">
            <Link
              className="active-neumorphism-plain px-5 py-3 m-2"
              to={"/Institute/updateProfile"}
            >
              Edit Profile
            </Link>
            <Link
              to="/changePassword/Institute/"
              className="active-neumorphism-plain px-5 py-3 m-2"
            >
              Change Password
            </Link>
            <Link
              to="/Institute/manageRoles"
              className="active-neumorphism-plain px-5 py-3 m-2"
            >
              Manage Roles
            </Link>
          </div>
          <button
            className="red-neumorphism-plain px-5 py-3 m-2"
            onClick={handleDelete}
          >
            Delete Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default InstituteProfile;
