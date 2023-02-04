import Axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { IndivProfileOptions } from "../../utilities/defaultValues";
import { updateToast } from "../../utilities/toastify";
import { updateNav } from "../../components/navbar";
import { getToken, deleteToken } from "../../utilities/tokenSlice";
import Title from "../../components/title";

const IndividualProfile = ({ drizzle, drizzleState }) => {
  const [res, setRes] = useState(null);
  const navigate = useNavigate();
  const [education, setEducation] = useState([]);
  const [work, setWork] = useState([]);
  const totalCredits = useRef(0);
  // let { id } = useParams();
  let token = getToken();
  useEffect(() => {
    const fetchdata = async () => {
      let toastId = toast.loading("Fetching data");
      try {
        const { Account } = drizzle.contracts;
        console.log(Account);
        let hash = await Account.methods
          .indivData(drizzleState.accounts[0])
          .call();
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
        if (!result.data.profile) {
          return updateToast(toastId, "Data fetch failed", "error");
        }
        let edRes = await Axios.post(
          process.env.REACT_APP_SERVER_HOST + "/api/getEducation",
          {
            id: result.data.profile.metamaskId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch((err) => {
          console.log(err);
          updateToast(toastId, "Some error in data fetch", "error", false, 500);
          // return null;
        });
        for (let i = 0; i < edRes.data.result.length; i++) {
          totalCredits.current += edRes.data.result[i].CreditsGained;
        }
        setEducation(edRes.data.result);
        let workRes = await Axios.post(
          process.env.REACT_APP_SERVER_HOST + "/api/getWorkExperience",
          {
            id: result.data.profile.metamaskId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch((err) => {
          console.log(err);
          updateToast(toastId, "Some error in data fetch", "error", false, 500);
          // return null;
        });
        setWork(workRes.data.result);
        setRes(result.data.profile);
        console.log(result);
        return updateToast(toastId, "Data fetch successful!", "success");
      } catch (error) {
        return updateToast(toastId, error, "error");
      }
    };
    fetchdata();
  }, []);

  const deleteAccount = async (e) => {
    const id = toast.loading("Deleting profile!");
    const { Account } = drizzle.contracts;
    console.log(Account.methods.deleteIndivData());
    let result = await Account.methods
      .deleteIndivData(drizzleState.accounts[0])
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
      text: "All your files and data will be deleted!!",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
      color: "#ffffff",
      background: "#0a0a0b",
      // backdrop: "rgba(255,255,255,0.4)",
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
        <form className="p-6 w-5/6 flex flex-col justify-center items-center neumorphism-plain">
          <Title title={"Profile"} />
          {res !== null &&
            Object.keys(res).map((keyName, keyIndex) => {
              if (!IndivProfileOptions.includes(keyName)) {
                return;
              }
              return (
                <div className="m-1 flex items-center justify-between">
                  <label className="text-[#0892d0]">
                    {keyName.charAt(0).toUpperCase() + keyName.slice(1)}
                  </label>
                  :
                  <input
                    type="text"
                    className="m-1 px-4 py-2 bg-transparent"
                    value={res[keyName]}
                    placeholder={keyName}
                    disabled
                  />
                </div>
              );
            })}
          <div className="flex justify-center items-around w-5/6">
            <div className="m-2 p-6 w-1/2 flex flex-col justify-center items-center hide-scroll">
              <h1 className="text-[#0892d0] text-3xl m-2">Education</h1>
              {education.map((element) => (
                <div>
                  <div>
                    <span className="text-[#0892d0]">Verification:</span>{" "}
                    {element.isVerified}
                  </div>
                  <div>
                    <span className="text-[#0892d0]">Course:</span>{" "}
                    {element.course}
                  </div>
                  <div>
                    <span className="text-[#0892d0]">Institute Name:</span>{" "}
                    {element.InstituteName}
                  </div>
                  <div>
                    <span className="text-[#0892d0]">Final Grade:</span>{" "}
                    {element.finalGrade} {element.finalGradeUnit}
                  </div>
                  <hr className="w-full h-px my-3 bg-[#0892d0] border-0 dark:bg-[#0892d0]" />
                </div>
              ))}
            </div>
            <div className="m-2 p-6 w-1/2 flex flex-col justify-center items-center hide-scroll">
              <h1 className="text-[#0892d0] text-3xl m-2">Work Experience</h1>
              {work.map((element) => (
                <div>
                  <div>
                    <span className="text-[#0892d0]">Verification:</span>{" "}
                    {element.isVerified}
                  </div>
                  <div>
                    <span className="text-[#0892d0]">Designation:</span>{" "}
                    {element.role}
                  </div>
                  <div>
                    <span className="text-[#0892d0]">Institute Name:</span>{" "}
                    {element.InstituteName}
                  </div>

                  <hr className="w-full h-px my-8 bg-[#0892d0] border-0 dark:dark:bg-[#0892d0]" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap">
            <Link
              className="active-neumorphism-plain px-5 py-3 m-2"
              to={"/Individual/updateProfile"}
            >
              Edit Profile
            </Link>
            <Link
              to="/changePassword/Individual/"
              className="active-neumorphism-plain px-5 py-3 m-2"
            >
              Change Password
            </Link>
            <Link
              to="/Individual/addEducation"
              className="active-neumorphism-plain px-5 py-3 m-2"
            >
              Add Education
            </Link>
            <Link
              to="/Individual/addWorkExperience"
              className="active-neumorphism-plain px-5 py-3 m-2"
            >
              Add Work Experience
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

export default IndividualProfile;
