import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { updateToast } from "../../utilities/toastify";
import { X } from "react-feather";
import Title from "../../components/title";
import { getToken } from "../../utilities/tokenSlice";

const AddRole = ({ drizzle, drizzleState }) => {
  const [role, setRole] = useState("");
  const [roleList, setRoleList] = useState([]);
  const token = getToken();

  useEffect(() => {
    const fetchdata = async () => {
      const toastId = toast.loading("Fetching data");
      let roles;
      try {
        const { Account } = drizzle.contracts;
        let hash = await Account.methods
          .institData(drizzleState.accounts[0])
          .call();
        roles = await Axios.post(
          process.env.REACT_APP_SERVER_HOST + "/api/getRoles",
          {
            hash: hash.slice(2),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        updateToast(toastId, "Data fetch successful", "success", false, 500);
      } catch (error) {
        return updateToast(
          toastId,
          "Some error occurred! Please try again",
          "error"
        );
      }
      console.log(`UseEffect: ${roles}`);
      setRoleList(roles.data.roles);
    };
    fetchdata();
  }, []);

  const updateRole = (e) => {
    e.preventDefault();
    setRole(e.target.value);
  };
  const addRole = () => {
    console.log(`Addrole: ${roleList.concat([role])}`);
    let temp = roleList.concat([role]);
    setRoleList(temp);
    // setRole("");
  };

  const removeRole = (roleName) => {
    // e.preventDefault();
    setRoleList(roleList.filter((el) => el !== roleName));
  };

  const saveChanges = async () => {
    const toastId = toast.loading("Fetching data");
    try {
      const Account = drizzle.contracts.Account;
      // console.log(Account);
      let hash = await Account.methods
        .institData(drizzleState.accounts[0])
        .call();
      console.log(hash);
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/updateRoles",
        {
          hash: hash.slice(2),
          roles: roleList,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => console.log(err));
      console.log(result);
      if (result.data.status === "Success") {
        let hash = result.data.hash;
        hash = "0x" + hash;
        console.log(hash);
        try {
          console.log(drizzle);
          const { Account } = drizzle.contracts;
          let temp = Account.methods
            .addRole(drizzleState.accounts[0], hash, roleList)
            .send();
          console.log(temp);

          // await checkStatus();
          // alert("User created Successfully!!");
          updateToast(toastId, "Roles updated Successfully!", "success");
          //   navigate("/Institute/profile/");
          // alert(result.data.profile.message);
        } catch (err) {
          console.log(err);
          updateToast(toastId, err, "error");
        }
      } else {
        updateToast(toastId, result.data.msg, "error");
      }
    } catch (error) {
      console.log(error);
      updateToast(toastId, "Some error occured. Please try again!", "error");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    Swal.fire({
      title:
        "Every save change executes a transaction which costs you.\n Do the bulk of your work in a single transaction to minimise cost.\n Do you really want to save changes?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
      color: "#ffffff",
      background: "#0a0a0b",
      customClass: {
        cancelButton: "neumorphism-plain",
        confirmButton: "neumorphism-plain",
        denyButton: "neumorphism-plain",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        saveChanges();
      } else if (result.isDenied) {
        return;
      }
    });
  };
  console.log(`root Level: ${roleList}`);
  return (
    <div className="flex flex-col min-h-screen max-h-max">
      <div className="flex flex-col h-screen justify-center items-center">
        <div className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <Title title="Manage Roles" />
          {/* name */}
          <div className="m-1 flex items-center justify-between">
            Role Name:
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="text"
              value={role}
              placeholder="Role name"
              onChange={updateRole}
              required
            />
            <button
              className="active-neumorphism-plain px-5 py-3 m-2"
              onClick={addRole}
            >
              Add
            </button>
          </div>

          <button
            className="neumorphism-plain px-5 py-3 m-2"
            onClick={handleSave}
          >
            Save Changes
          </button>
          <div className="m-1 h-11/12 flex items-center justify-between overflow-y-scroll hide-scroll">
            {roleList.map((element) => {
              return (
                <div>
                  {element}
                  <button
                    className="neumorphism-plain px-5 py-3 m-2"
                    onClick={() => {
                      removeRole(element);
                    }}
                  >
                    <X />
                  </button>
                </div>
              );
            })}
            {roleList.length <= 0 && <Title title={"No Roles added Yet!"} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRole;
