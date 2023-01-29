import Axios from "axios";
import Dropzone from "react-dropzone";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { updateToast } from "../../utilities/toastify";
import { getToken } from "../../utilities/tokenSlice";
import { client } from "../../utilities/ipfs";
import { gradeUnits } from "../../utilities/defaultValues";

const AddWorkExperience = ({ drizzle, drizzleState }) => {
  const navigate = useNavigate();
  const [instits, setInstits] = useState([]);
  const [course, setCourse] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [compDate, setCompDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [role, setRole] = useState([]);

  const [selectedOffer, setSelectedOffer] = useState("");
  const offerDocUrl = useRef("");
  const offerDocId = useRef("");
  const [offerLetter, setOfferLetter] = useState("");

  const [selectedRelief, setSelectedRelief] = useState("");
  const reliefDocUrl = useRef("");
  const reliefDocId = useRef("");
  const [reliefLetter, setReliefLetter] = useState("");
  const [progress, setProgress] = useState(null);
  let token = getToken();
  const show = (id) => {
    let element = document.getElementById(id);
    if (element) element.style.display = "flex";
  };
  const hide = (id) => {
    let element = document.getElementById(id);
    if (element) element.style.display = "none";
  };

  const updateCourse = (e) => {
    setCourse(e.target.value);
  };

  const udpateInstituteId = (e) => {
    setInstituteId(e.target.value);
    if (e.target.value.trim().length > 0) {
      hide("institName");
    } else {
      show("institName");
      setInstituteName("");
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

  const onOfferDrop = (files) => {
    if (files.length > 0) {
      setSelectedOffer(files);
      console.log(files);
    }
  };
  const onReliefDrop = (files) => {
    if (files.length > 0) {
      setSelectedOffer(files);
      console.log(files);
    }
  };

  const upload = async () => {
    let toastId = toast.loading("Saving document on IPFS..");
    try {
      let currentFile = selectedOffer[0];

      setProgress(0);
      setOfferLetter(currentFile);
      console.log(selectedOffer);
      let res = await handleSubmit();
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

  const handleSubmit = async () => {
    try {
      console.log("handle submit started");
      console.log(client);
      const created = await client.add(offerLetter);
      console.log(created);
      const url = `https://ipfs.infura.io/ipfs/${created.path}`;
      console.log(url);
      offerDocUrl.current = url;
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  };

  const saveData = async () => {
    if (
      course.trim().length <= 0 ||
      instituteName.trim().length <= 0 ||
      startDate.trim().length <= 0 ||
      offerDocId.trim().length <= 0 ||
      offerDocUrl.trim().length <= 0
    ) {
      return toast.warning("Please fill all the required fields!");
    }

    let toastId = toast.loading("Saving Information...");
    let res = await upload();
    if (!res) {
      updateToast(toastId, "Saving data failed", "error");
      return res;
    }
    let body = {
      id: drizzleState.accounts[0],
      course,
      instituteId,
      instituteName,
      isVerified: false,
      startDate,
      completed,
      endDate: compDate,
    };

    try {
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/AddEducation",
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => console.log(err));

      updateToast(toastId, "Data saved Successfully!!", "success");
      // navigate("/Individual/profile");
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
          // subType: "Educational",
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

  if (instits.length > 0 && instituteId.trim().length > 0) hide("institName");
  if (completed) {
    show("compDate");
  } else hide("compDate");

  return (
    <div className="flex flex-col min-h-screen max-h-max">
      <div className="flex h-5/6 justify-center items-center">
        <div className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <div className="p-3 m-4 font-bold text-6xl">AddEducation</div>

          {/* name */}
          <div className="m-1 flex items-center justify-between">
            Course:
            <input
              type="text"
              className="m-1 neumorphism-pressed px-4 py-2"
              value={course}
              placeholder="Course name"
              onChange={updateCourse}
              required
            />
          </div>
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
          {/* Completion date */}
          <div id="compDate" className="m-1 flex items-center justify-between">
            Completion date:
            <input
              className="m-1 neumorphism-pressed px-4 py-2"
              type="date"
              onChange={updateCompDate}
            />
          </div>

          {/* Offer Letter */}
          <div className="m-1 flex items-center justify-between">
            Offer Letter file:
            <Dropzone onDrop={onOfferDrop} multiple={false}>
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div
                    {...getRootProps({
                      className:
                        "neumorphism-pressed h-64 w-64 flex justify-center items-center p-5 m-3 ",
                    })}
                  >
                    <input
                      {...getInputProps({
                        className:
                          "dropinput h-64 w-64 flex justify-center items-center p-5 m-3",
                      })}
                    />
                    {selectedOffer && selectedOffer[0].name ? (
                      <div>
                        <b>Selected File: </b>
                        {selectedOffer && selectedOffer[0].name}
                      </div>
                    ) : (
                      "Drag and drop file here, or click to select file"
                    )}
                  </div>
                </section>
              )}
            </Dropzone>
          </div>
          {/* Relief Letter */}
          <div className="m-1 flex items-center justify-between">
            Offer Letter file:
            <Dropzone onDrop={onReliefDrop} multiple={false}>
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div
                    {...getRootProps({
                      className:
                        "neumorphism-pressed h-64 w-64 flex justify-center items-center p-5 m-3 ",
                    })}
                  >
                    <input
                      {...getInputProps({
                        className:
                          "dropinput h-64 w-64 flex justify-center items-center p-5 m-3",
                      })}
                    />
                    {selectedRelief && selectedRelief[0].name ? (
                      <div>
                        <b>Selected File: </b>
                        {selectedRelief && selectedRelief[0].name}
                      </div>
                    ) : (
                      "Drag and drop file here, or click to select file"
                    )}
                  </div>
                </section>
              )}
            </Dropzone>
          </div>

          <button
            className="m-2 neumorphism-button px-4 py-2"
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
