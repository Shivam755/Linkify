import React, { useEffect, useState } from "react";
import Axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/title";
import { updateToast } from "./../utilities/toastify";
import { getToken } from "../utilities/tokenSlice";
import { useParams, useNavigate } from "react-router-dom";

const Dashboard = ({ drizzle, drizzleState }) => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [res, setRes] = useState(null);
  const token = getToken();
  useEffect(() => {
    const fetchData = async () => {
      const toastId = toast.loading("Fetching Info!");
      try {
        let result = await Axios.post(
          process.env.REACT_APP_SERVER_HOST + "/api/getDashboardInfo",
          {
            id: drizzleState.accounts[0],
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!result) {
          return updateToast(
            toastId,
            "No data recieved from backend!",
            "error"
          );
        }
        if (result.data.status === "Failed") {
          return updateToast(toastId, result.data.msg, "error");
        }
        console.log(result.data);
        setRes(result.data);
        updateToast(toastId, "Data fetch successful", "success", false, 500);
      } catch (error) {
        console.log(error);
        return updateToast(
          toastId,
          "Some error occured while fetching data",
          "error"
        );
      }
    };
    fetchData();
  }, []);

  const show = (id, parentId) => {
    console.log(id, parentId);

    let el = document.getElementById(id);
    el.style.display = "flex";
    let parent = document.getElementById(parentId);
    parent.onclick = () => {
      hide(id, parentId);
    };
  };

  const hide = (id, parentId) => {
    console.log(id, parentId);
    let el = document.getElementById(id);
    el.style.display = "none";
    let parent = document.getElementById(parentId);
    parent.onclick = () => [show(id, parentId)];
  };

  const UpdateRequest = async (id, status) => {
    const toastId = toast.loading("Updating status");
    try {
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/updateRequestStatus",
        {
          id,
          status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (result.data.status === "Failed") {
        return updateToast(toastId, result.data.message, "error");
      }
      navigate(`/${type}/profile`);
      return updateToast(toastId, "Request Updated", "success");
    } catch (error) {
      updateToast(toastId, "Some error occured. Please try again", "error");
      console.log(error);
    }
  };

  if (res === null) {
    return (
      <div className="flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-6xl">
        We're loading data. Please wait...
      </div>
    );
  }

  document.onload = (e) => {
    hide("recList", "received");
    hide("sentList", "sent");
  };

  return (
    <div className="h-screen">
      <Title title="Dashboard" />
      {res !== null && (
        <div className="flex flex-col justify-around items-center w-full h-5/6">
          <div
            id="received"
            // onClick={() => show("recList", "received")}
            className="flex flex-col w-9/12 min-h-1/6 max-h-1/2  m-1 p-4  justify-center items-center neumorphism-plain hide-scroll"
          >
            <div className="text-3xl h-1/6">
              Received {res.received.length > 0 && res.received.length}
            </div>
            <div
              id="recList "
              className="flex flex-col m-2 p-2 justify-center items-center w-full text-lg h-5/6 hide-scroll"
            >
              <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
              {res.received.map((element) => {
                return (
                  <div>
                    <div>
                      Request Made by: {element.senderName} ({element.senderId})
                    </div>
                    <div>For Role: {element.role}</div>
                    <div>type: {element.type}</div>
                    <div>Message: {element.message}</div>
                    <div>
                      <button
                        onClick={() => {
                          UpdateRequest(element._id, "Accepted");
                        }}
                        className="m-2 neumorphism-plain px-4 py-2"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          UpdateRequest(element._id, "Rejected");
                        }}
                        className="m-2 neumorphism-plain px-4 py-2"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
              {res.received.length <= 0 && <div>No Requests received!</div>}
            </div>
          </div>
          <div
            id="sent"
            className="flex flex-col w-9/12 min-h-1/6 max-h-1/2  m-1 p-4  justify-center items-center neumorphism-plain hide-scroll"
          >
            <div className="text-3xl h-1/6">
              Sent {res.sent.length > 0 && res.sent.length}
            </div>
            <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
            <div
              id="sentList "
              className="flex flex-col m-2 p-2 justify-center items-center w-full text-lg h-5/6 hide-scroll"
            >
              {res.sent.map((element) => {
                console.log(element.receiverName);
                return (
                  <div>
                    <div>
                      Request Made to: {element.receiverName}(
                      {element.receiverId})
                    </div>
                    <div>For Role: {element.role}</div>
                    <div>Type: {element.type}</div>
                    <div>Message: {element.message}</div>
                    <div>Status: {element.status}</div>
                  </div>
                );
              })}
              {res.sent.length <= 0 && <div>No Requests sent!</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
