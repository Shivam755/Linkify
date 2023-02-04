import { Link, useParams } from "react-router-dom";
import Axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { updateToast } from "../../utilities/toastify";
import { getToken } from "../../utilities/tokenSlice";
import Title from "../../components/title";

const IndividualViewInfo = ({ drizzle, drizzleState }) => {
  let { id } = useParams();
  const [res, setRes] = useState(null);
  const [state, setState] = useState({});
  const [education, setEducation] = useState([]);
  const [work, setWork] = useState([]);
  const totalCredits = useRef(0);
  const joined = useRef(false);

  let token = getToken();
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
      } catch (error) {
        return updateToast(
          toastId,
          "Some error occurred! Please try again",
          "error"
        );
      }
      console.log(roles);
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/profile",
        {
          hash: id,
          type: "Individual",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => {
        console.log(err);
        updateToast(toastId, "Some error in data fetch", "error", false, 500);
        // return null;
      });
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
      console.log("Education: ");
      console.log(edRes);
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
      console.log("Work: ");
      console.log(workRes.data.result);
      setWork(workRes.data.result);
      if (result) {
        const { Account } = drizzle.contracts;
        let hash = await Account.methods
          .institData(drizzleState.accounts[0])
          .call();
        let institRes = await Axios.post(
          process.env.REACT_APP_SERVER_HOST + "/api/profile",
          {
            hash: hash.slice(2),
            type: "Institute",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        for (let i = 0; i < institRes.data.profile.members.length; i++) {
          if (
            institRes.data.profile.members[i].id === result.data.profile._id
          ) {
            joined.current = true;
          }
        }
        setRes(result.data.profile);
        setState({
          senderId: drizzleState.accounts[0],
          receiverId: result.data.profile.metamaskId,
          receiverName: result.data.profile.name,
          type: joined ? "Firing" : "Recruiting",
          roles: roles.data.roles,
        });
        updateToast(toastId, "Data fetch complete", "success", false, 500);
      }
    };
    fetchdata();
  }, []);

  if (res === null) {
    return (
      <div className="flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-6xl">
        We're loading data. Please wait...
      </div>
    );
  }
  console.log("Work: ");
  console.log(work);
  return (
    <div className="flex flex-col h-screen">
      <div className="flex h-5/6 justify-center items-center">
        <form className="p-6 w-5/6 flex flex-col justify-center items-center neumorphism-plain">
          <div className="p-2 w-3/5 h-max flex items-center justify-between">
            <Title title={res.name} />
            <Link
              className="active-neumorphism-plain px-4 py-3 w-1/2 text-center"
              to="/makeRequest"
              state={state}
            >
              {joined ? "Fire" : "Recruit"}
            </Link>
          </div>
          <div>
            <span className="text-[#0892d0]">Date of Birth:</span>{" "}
            {res.birthDate}
          </div>
          <div>
            <span className="text-[#0892d0]">Total Credits:</span>{" "}
            {totalCredits.current}
          </div>
          <div className="flex justify-center items-around w-5/6">
            <div className="m-2 p-6 w-1/2 flex flex-col justify-center items-center hide-scroll">
              <h1 className="text-[#0892d0] text-2xl">Education</h1>
              {education.map((element) => {
                return (
                  <div>
                    <div>
                      <span className="text-[#0892d0]">
                        Education Done by:{" "}
                      </span>{" "}
                      {element.DoneByName} ({element.DoneBy})
                    </div>
                    <div>
                      <span className="text-[#0892d0]">Course: </span>
                      {element.course}
                    </div>
                    <div>
                      <span className="text-[#0892d0]">Start Date: </span>
                      {element.startDate}
                    </div>
                    <div>
                      <span className="text-[#0892d0]">Completed: </span>{" "}
                      {element.completed ? "Yes" : "No"}
                    </div>
                    {element.completed && (
                      <div className="m-2">
                        <div>
                          <span className="text-[#0892d0]">
                            Completion Date:{" "}
                          </span>
                          {element.endDate}
                        </div>
                        <div>
                          <span className="text-[#0892d0]">Credits: </span>
                          {element.CreditsGained}
                        </div>
                        <div>
                          <span className="text-[#0892d0]">Final Grade: </span>
                          {element.finalGrade} {element.finalGradeUnit}
                        </div>
                        <a
                          target="_blank"
                          href={element.finalMarksheetLink}
                          rel="noreferrer"
                          className="m-2 active-neumorphism-plain px-4 py-2"
                        >
                          View Marksheet
                        </a>
                      </div>
                    )}
                    <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                  </div>
                );
              })}
              {education.length <= 0 && (
                <div className="text-[#0892d0]">
                  No Educational Record found!
                </div>
              )}
            </div>
            <div className="m-2 p-6 w-1/2 flex flex-col justify-center items-center hide-scroll">
              <h1 className="text-[#0892d0] text-2xl">Work Experience</h1>
              {work.map((element) => {
                return (
                  <div>
                    <div>
                      <span className="text-[#0892d0]">Work Done by: </span>
                      {element.DoneByName} ({element.DoneBy})
                    </div>
                    <div>
                      <span className="text-[#0892d0]">Role: </span>{" "}
                      {element.role}
                    </div>
                    <div>
                      <span className="text-[#0892d0]">Start Date: </span>{" "}
                      {element.startDate}
                    </div>
                    <div>
                      <span className="text-[#0892d0]">Completed: </span>
                      {element.completed ? "Yes" : "No"}
                    </div>
                    <a
                      target="_blank"
                      href={element.OfferLetterLink}
                      rel="noreferrer"
                      className="active-neumorphism-plain px-4 py-2 my-4"
                    >
                      View OfferLetter
                    </a>
                    {element.completed && (
                      <div>
                        <div>
                          <span className="text-[#0892d0]">
                            Completion Date:{" "}
                          </span>
                          {element.endDate}
                        </div>
                        <a
                          target="_blank"
                          href={element.ReliefLetterLink}
                          rel="noreferrer"
                          className="m-2 active-neumorphism-plain px-4 py-2"
                        >
                          View ReliefLetter
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
              {work.length <= 0 && (
                <div className="text-[#0892d0]">
                  No Work experience record found!
                </div>
              )}
              <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IndividualViewInfo;
