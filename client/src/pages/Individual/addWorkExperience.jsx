import Axios from "axios";
import Dropzone from "react-dropzone";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { updateToast } from "../../utilities/toastify";
import { getToken } from "../../utilities/tokenSlice";
import client from "../../utilities/ipfs";
import { gradeUnits } from "../../utilities/defaultValues";
import Title from "../../components/title";

const AddWorkExperience = ({ drizzle, drizzleState }) => {
  const navigate = useNavigate();
  const [instits, setInstits] = useState([]);
  const [instituteId, setInstituteId] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [compDate, setCompDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [role, setRole] = useState([]);

  const [selectedOffer, setSelectedOffer] = useState("");
  const offerDocUrl = useRef("");
  const offerDocId = useRef("");
  const offerLetter = useRef("");

  const [selectedRelief, setSelectedRelief] = useState("");
  const reliefDocUrl = useRef("");
  const reliefDocId = useRef("");
  const reliefLetter = useRef("");
  let token = getToken();
  const show = (id) => {
    let element = document.getElementById(id);
    if (element) element.style.display = "flex";
  };
  const hide = (id) => {
    let element = document.getElementById(id);
    if (element) element.style.display = "none";
  };

  const udpateInstituteId = (e) => {
    setInstituteId(e.target.value);
    if (e.target.value.trim().length > 0) {
      hide("institName");
      hide("role");
      show("roleSelect");
      setInstituteName(e.target.selectedOptions[0].text);
      for (let i in instits) {
        if (instits[i].metamaskId === e.target.value) {
          setRoleList(instits[i].roles);
        }
      }
    } else {
      show("institName");
      setInstituteName("");
      // role inputs
      setRoleList([]);
      show("role");
      hide("roleSelect");
      setRole("");
    }
  };

  const updateInstituteName = (e) => {
    console.log(e);
    setInstituteName(e.target.value);
  };

  const updateStartDate = (e) => {
    setStartDate(e.target.value);
  };

  const updateCompleted = (e) => {
    setCompleted(e.target.checked);
  };

  const updateCompDate = (e) => {
    setCompDate(e.target.value);
  };

  const updateRole = (e) => {
    setRole(e.target.value);
  };
  const onOfferDrop = (files) => {
    if (files.length > 0) {
      setSelectedOffer(files);
    }
    console.log(files);
  };
  const onReliefDrop = (files) => {
    if (files.length > 0) {
      setSelectedRelief(files);
    }
  };

  const uploadOffer = async () => {
    let toastId = toast.loading("Saving Offer letter on IPFS..");
    try {
      let currentFile = selectedOffer[0];
      offerLetter.current = currentFile;
      console.log(currentFile);
      let res = await handleSubmitOffer();
      if (res) {
        updateToast(toastId, "Document saved successfully!!", "success");
      } else {
        updateToast(toastId, "Document could not be uploaded!", "error");
      }
      return res;
    } catch (error) {
      updateToast(toastId, error, "error");
      return false;
    }
  };
  const uploadRelief = async () => {
    if (selectedRelief.length <= 0) {
      return true;
    }
    let toastId = toast.loading("Saving relief Letter on IPFS..");
    try {
      let currentFile = selectedRelief[0];

      reliefLetter.current = currentFile;
      console.log(currentFile);
      let res = await handleSubmitRelief();
      if (res) {
        updateToast(toastId, "Document saved successfully!!", "success");
      } else {
        updateToast(toastId, "Document could not be uploaded!", "error");
      }
      return res;
    } catch (error) {
      updateToast(toastId, error, "error");
      return false;
    }
  };

  const handleSubmitRelief = async () => {
    try {
      let blobFile = new Blob([reliefLetter.current]);
      const created = await client.storeBlob(blobFile);
      console.log(created);
      const url = `ipfs://${created}`;
      console.log(url);
      reliefDocId.current = created;
      reliefDocUrl.current = url;
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  };
  const handleSubmitOffer = async () => {
    try {
      console.log(client);
      let blobFile = new Blob([offerLetter.current]);
      const created = await client.storeBlob(blobFile);
      console.log(created);
      const url = `ipfs://${created}`;
      console.log(url);
      offerDocId.current = created;
      offerDocUrl.current = url;
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  };

  const saveData = async () => {
    if (
      role.trim().length <= 0 ||
      instituteName.trim().length <= 0 ||
      startDate.trim().length <= 0 ||
      selectedOffer.length <= 0
    ) {
      return toast.warning("Please fill all the required fields!");
    }

    let toastId = toast.loading("Saving Information...");
    let res1 = await uploadOffer();
    let res2 = await uploadRelief();
    if (!(res1 && res2)) {
      updateToast(toastId, "Saving data failed", "error");
      return;
    }
    let body = {
      id: drizzleState.accounts[0],
      instituteId,
      instituteName,
      isVerified: "Pending",
      startDate,
      completed,
      endDate: compDate,
      role,
      offerLetter: {
        id: offerDocId.current,
        url: offerDocUrl.current,
      },
      reliefLetter: {
        id: reliefDocId.current,
        url: reliefDocUrl.current,
      },
    };

    try {
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/AddWorkExperience",
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => console.log(err));
      if (result.data.status !== "Success") {
        return updateToast(
          toastId,
          "There was some problem in the backend. Please try again!",
          "error"
        );
      }
      let hash = result.data.hash;
      hash = "0x" + hash;
      try {
        const { Account } = drizzle.contracts;
        let temp = Account.methods
          .updateIndivData(drizzleState.accounts[0], hash)
          .send();

        updateToast(toastId, "Data saved Successfully!!", "success");
        navigate("/Individual/profile");
      } catch (err) {
        console.log(err);
        updateToast(toastId, err, "error");
      }
    } catch (error) {
      updateToast(toastId, error, "error");
    }
  };

  useEffect(() => {
    const fetchInstitutes = async () => {
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/fetchAll",
        {
          type: "Institute",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => console.log(err));

      console.log(result.data);
      if (result.data.status !== "Success") {
        toast.error("Error fetching current educational Institutes");
      }
      setInstits(result.data.result);
    };
    fetchInstitutes();
    // if ()
  }, []);

  if (instits.length > 0 && instituteId.trim().length > 0) {
    hide("institName");
  }
  if (completed) {
    show("compData");
  } else hide("compData");

  console.log(roleList);
  if (roleList.length < 0) {
    show("role");
    hide("roleSelect");
  }
  return (
    <div className="flex flex-col h-screen">
      <div className="flex h-5/6 justify-center items-center">
        <div className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <Title title={"Add Work Experience"} />

          {/* Institute */}
          <div className="m-1 flex items-center justify-between">
            Institute:
            <select
              className="m-1 neumorphism-pressed px-4 py-2"
              name="institute"
              onChange={udpateInstituteId}
              required
            >
              {instits.map((e) => {
                return (
                  <option key={e} value={e.metamaskId}>
                    {e.name}
                  </option>
                );
              })}
              <option value={""}>Other</option>
            </select>
            <input
              id="institName"
              className="m-1 neumorphism-pressed px-4 py-2"
              value={instituteName}
              onChange={updateInstituteName}
              type="text"
              placeholder="Name of other Institute"
            />
          </div>
          {/* Role */}
          <div className="m-1 flex items-center justify-between">
            Role:
            <select
              className="m-1 neumorphism-pressed px-4 py-2"
              name="role"
              id="roleSelect"
              onChange={updateRole}
              required
            >
              <option value="">Select a role</option>
              {roleList.map((e) => {
                return (
                  <option key={e} value={e}>
                    {e}
                  </option>
                );
              })}
            </select>
            <input
              id="role"
              className="m-1 neumorphism-pressed px-4 py-2"
              value={role}
              onChange={updateRole}
              type="text"
              placeholder="Role or Designation in Institute"
            />
          </div>
          {/* start date */}
          <div className="m-1 flex items-center justify-between">
            Start date:
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="date"
              onChange={updateStartDate}
              required
            />
          </div>
          {/* Offer Letter */}
          <div className="m-1 flex items-center justify-between">
            Offer Letter file:
            <Dropzone onDrop={onOfferDrop} multiple={false}>
              {({
                getRootProps,
                getInputProps,
                isDragActive,
                isDragReject,
              }) => (
                <section>
                  <div
                    {...getRootProps({
                      className:
                        "neumorphism-pressed h-30 w-64 flex justify-center items-center p-5 m-3 ",
                    })}
                  >
                    <input
                      {...getInputProps({
                        className:
                          "dropinput h-30 w-64 flex justify-center items-center p-5 m-3",
                      })}
                    />
                    {selectedOffer && selectedOffer[0].name ? (
                      <div>
                        <b>Selected File: </b>
                        {selectedOffer && selectedOffer[0].name}
                      </div>
                    ) : (
                      <div>
                        "Drag and drop file here, or click to select file"
                        {!isDragActive &&
                          "Click here or drop a file to upload!"}
                        {isDragActive &&
                          !isDragReject &&
                          "Drop it like it's hot!"}
                        {isDragReject && "File type not accepted, sorry!"}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </Dropzone>
          </div>
          {/* Completed */}
          <div className="m-1 flex items-center justify-between">
            <input
              className="m-1 h-5 w-5"
              type="checkbox"
              name="completed"
              id="completed"
              value={completed}
              onChange={updateCompleted}
            />
            <label htmlFor="completed">Course is completed</label>
          </div>
          <div
            id="compData"
            className="flex flex-col justify-center items-center"
          >
            {/* Completion date */}
            <div
              id="compDate"
              className="m-1 flex items-center justify-between"
            >
              Completion date:
              <input
                className="m-1 neumorphism-pressed px-4 py-2"
                type="date"
                onChange={updateCompDate}
              />
            </div>
            {/* Relief Letter */}
            <div className="m-1 flex items-center justify-between">
              Offer Letter file:
              <Dropzone onDrop={onReliefDrop} multiple={false}>
                {({
                  getRootProps,
                  getInputProps,
                  isDragActive,
                  isDragReject,
                }) => (
                  <section>
                    <div
                      {...getRootProps({
                        className:
                          "neumorphism-pressed h-30 w-64 flex justify-center items-center p-5 m-3 ",
                      })}
                    >
                      <input
                        {...getInputProps({
                          className:
                            "dropinput h-30 w-64 flex justify-center items-center p-5 m-3",
                        })}
                      />
                      {selectedRelief && selectedRelief[0].name ? (
                        <div>
                          <b>Selected File: </b>
                          {selectedRelief && selectedRelief[0].name}
                        </div>
                      ) : (
                        <div>
                          "Drag and drop file here, or click to select file"
                          {!isDragActive &&
                            "Click here or drop a file to upload!"}
                          {isDragActive &&
                            !isDragReject &&
                            "Drop it like it's hot!"}
                          {isDragReject && "File type not accepted, sorry!"}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </Dropzone>
            </div>
          </div>

          <button
            className="m-2 active-neumorphism-button px-4 py-2"
            onClick={saveData}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWorkExperience;
