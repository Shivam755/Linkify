import React, { useEffect, useState } from "react";
import Axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/title";
import { updateToast } from "./../utilities/toastify";
import { getToken } from "../utilities/tokenSlice";

const Dashboard = ({ drizzle, drizzleState }) => {
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
  const fetchName = async (address, type) => {
    const id = toast.loading("Fetching data");
    const { Account } = drizzle.contracts;
    let hash;
    console.log(type);
    if (type === "Recruiting") {
      hash = await Account.methods.institData(address).call();
    } else {
      hash = await Account.methods.indivData(address).call();
    }
    console.log(hash);
    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/getName",
      {
        hash: hash.slice(2),
        type: type === "Recruiting" ? "Institute" : "Individual",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).catch((err) => {
      console.log(err);
      updateToast(id, "Some error in data fetch", "error", false, 1000);
      return null;
    });
    console.log(result);
    if (result) {
      // setSenderName(result.data.name);
      updateToast(id, "Data fetch complete", "success", false, 500);
    }
  };

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

  if (res === null) {
    return (
      <div className="flex flex-col h-screen justify-center items-center p-3 m-4 font-bold text-6xl">
        We're loading data. Please wait...
      </div>
    );
  }
  // if (res.sent.length > 0) {
  //   hide("sentList", "sent");
  // }
  // if (res.received.length > 0) {
  //   hide("recList", "received");
  // }
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
            className="flex flex-col w-1/2 min-h-1/6 max-h-1/2  m-1 p-4  justify-center items-center neumorphism-plain hide-scroll"
          >
            <div className="text-3xl h-1/6">
              Received {res.received.length > 0 && res.received.length}
            </div>
            <div
              id="recList "
              className="flex flex-col m-2 p-2 justify-center items-center w-full text-lg h-5/6 hide-scroll"
            >
              <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
              <h1>received List</h1>
              {res.received.map((element) => {
                return (
                  <div>
                    <div>Request Made by: {element.senderId}</div>
                    <div>For Role: {element.role}</div>
                    <div>Message: {element.msg}</div>
                    <div>
                      <button>Accept</button> <button>Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            id="sent"
            // onClick={() => show("sentList", "Sent")}
            className="flex flex-col w-1/2 min-h-fit  m-1 p-4 justify-center items-center neumorphism-plain overflow-y-scroll hide-scroll"
          >
            <div className="text-3xl h-full">
              Sent {res.sent.length > 0 && res.sent.length}
            </div>
            <div id="sentList " className="text-lg h-5/6">
              <h1>sent List</h1>
              {res.sent.map((element) => {
                return (
                  <div>
                    <div>Request Made by: {element.senderId}</div>
                    <div>For Role: {element.role}</div>
                    <div>Message: {element.msg}</div>
                    <div>Status: {element.status}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
