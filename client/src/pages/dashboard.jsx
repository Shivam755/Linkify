import React, { useEffect, useState } from "react";
import Axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/title";
import { updateToast } from "./../utilities/toastify";
import { getToken } from "../utilities/tokenSlice";
import { useParams } from "react-router-dom";

const Dashboard = ({ drizzle, drizzleState }) => {
  const { type } = useParams();
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

  const fetchName = async (address) => {
    const id = toast.loading("Fetching data");
    const { Account } = drizzle.contracts;
    let hash;
    console.log(type);
    if (type === "Individual") {
      hash = await Account.methods.institData(address).call();
    } else {
      hash = await Account.methods.indivData(address).call();
    }
    console.log(hash);
    let result = await Axios.post(
      process.env.REACT_APP_SERVER_HOST + "/api/getName",
      {
        hash: [hash.slice(2)],
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
    if (!result) {
      return null;
      // setSenderName(result.data.name);
    }
    return result.data.names[0];
    updateToast(id, "Data fetch complete", "success", false, 500);
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
  for (let i in res.sent) {
    res.sent[i].receiverName = fetchName(res.sent[i].receiverId).then(
      (data) => data
    );
  }
  for (let i in res.received) {
    res.received[i].senderName = fetchName(res.received[i].senderId);
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
                      Request Made by: {element.senderName}({element.senderId})
                    </div>
                    <div>For Role: {element.role}</div>
                    <div>Message: {element.msg}</div>
                    <div>
                      <button>Accept</button> <button>Reject</button>
                    </div>
                  </div>
                );
              })}
              {res.received.length <= 0 && <div>No Requests received!</div>}
            </div>
          </div>
          <div
            id="sent"
            // onClick={() => show("sentList", "Sent")}
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
                      Request Made to: {element.receiverName.name}(
                      {element.receiverId})
                    </div>
                    <div>For Role: {element.role}</div>
                    <div>Message: {element.msg}</div>
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
