import Axios from "axios";
import Dropzone from "react-dropzone";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { updateToast } from "../../utilities/toastify";
import { getToken } from "../../utilities/tokenSlice";
import client from "../../utilities/ipfs";
import {
  gradeUnits,
  validFileTypes,
  maxFileSize,
} from "../../utilities/defaultValues";
import { Blob } from "nft.storage";
import Title from "../../components/title";

const AddEducation = ({ drizzle, drizzleState }) => {
  const navigate = useNavigate();
  const [instits, setInstits] = useState([]);
  const [course, setCourse] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [compDate, setCompDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [credits, setCredits] = useState(0);
  const [finalGrade, setFinalGrade] = useState(0);
  const [finalGradeUnit, setFinalGradeUnit] = useState("");
  const [selectedFiles, setSelectedFiles] = useState("");
  const docUrl = useRef("");
  const docId = useRef("");
  const [file, setFile] = useState("");
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
      setInstituteName(e.target.selectedOptions[0].text);
    } else {
      show("institName");
      setInstituteName("");
    }
  };

  const updateInstituteName = (e) => {
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

  const updateCredits = (e) => {
    setCredits(e.target.value);
  };

  const updateFinalGrade = (e) => {
    setFinalGrade(e.target.value);
  };

  const updateFinalGradeUnit = (e) => {
    setFinalGradeUnit(e.target.value);
  };

  const onDrop = (files) => {
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const upload = async () => {
    let toastId = toast.loading("Saving document on IPFS..");
    try {
      let currentFile = selectedFiles[0];

      setFile(currentFile);
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
      let blobFile = new Blob([file]);
      const created = await client.storeBlob(blobFile);
      const url = `ipfs://${created}`;
      docId.current = created;
      docUrl.current = url;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const saveData = async () => {
    if (
      course.trim().length <= 0 ||
      instituteName.trim().length <= 0 ||
      startDate.trim().length <= 0 ||
      finalGradeUnit.trim().length <= 0 ||
      selectedFiles.length <= 0
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
      isVerified: "Pending",
      startDate,
      completed,
      endDate: compDate,
      CreditsGained: credits,
      finalGrade,
      finalGradeUnit,
      finalMarksheet: {
        id: docId.current,
        url: docUrl.current,
      },
    };

    try {
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/AddEducation",
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
          subType: "Educational",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((err) => console.log(err));

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
    show("compData");
  } else hide("compData");

  return (
    <div className="flex flex-col h-screen">
      <div className="flex h-5/6 justify-center items-center">
        <div className="p-6 w-1/2 flex flex-col justify-center items-center neumorphism-plain">
          <Title title={"Add Education"} />

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
            {/* <CheckBox value={completed} updateValue={updateCompleted} /> */}
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
            className="flex flex-col justify-center items-center "
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
            {/* Credits */}
            <div className="m-1 flex items-center justify-between">
              Credits gained:
              <input
                type="number"
                className="m-1 neumorphism-pressed px-4 py-2"
                value={credits}
                placeholder="credits"
                onChange={updateCredits}
                required
              />
            </div>
            {/* Final Grade */}
            <div className="m-1 flex items-center justify-between">
              Final Grade:
              <input
                type="number"
                className="m-1 neumorphism-pressed px-4 py-2"
                value={finalGrade}
                placeholder="Grade"
                onChange={updateFinalGrade}
                required
              />
              <select
                className="m-1 neumorphism-pressed px-4 py-2"
                name="gradeUnit"
                onChange={updateFinalGradeUnit}
                required
              >
                {gradeUnits.map((e) => {
                  return (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Final Marksheet */}
            <div className="m-1 flex items-center justify-between">
              Marksheet file:
              <Dropzone
                onDrop={onDrop}
                accept={validFileTypes}
                minSize={0}
                maxSize={maxFileSize}
                multiple={false}
              >
                {({
                  getRootProps,
                  getInputProps,
                  isDragActive,
                  isDragReject,
                }) => {
                  // const isFileTooLarge =
                  //   rejectedFiles.length > 0 &&
                  //   rejectedFiles[0].size > maxFileSize;
                  return (
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
                      {selectedFiles && selectedFiles[0].name ? (
                        <div>
                          <b>Selected File: </b>
                          {selectedFiles && selectedFiles[0].name}
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

                      {/* {isFileTooLarge && (
                      <div className="text-danger mt-2">File is too large.</div>
                    )} */}
                    </div>
                  );
                }}
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

export default AddEducation;
