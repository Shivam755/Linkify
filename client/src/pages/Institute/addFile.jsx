import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import Axios from "axios";
import Dropzone from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import { updateToast } from "../../utilities/toastify";
import { getToken } from "../../utilities/tokenSlice";
import client from "../../utilities/ipfs";

import { validFileTypes, maxFileSize } from "../../utilities/defaultValues";

const UploadFile = ({ drizzle, drizzleState }) => {
  let token = getToken();
  const navigate = useNavigate();
  const [recName, setRecName] = useState("");
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState("");
  const [selectedFiles, setSelectedFiles] = useState("");
  const docUrl = useRef("");

  const docId = useRef("");
  const { id } = useParams();
  const updateFileName = (e) => {
    setFileName(e.target.value);
  };
  const onDrop = (files) => {
    if (files.length > 0) {
      setSelectedFiles(files);
      console.log(files);
    }
  };
  const upload = async () => {
    let toastId = toast.loading("Saving document on IPFS..");
    try {
      let currentFile = selectedFiles[0][0];

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
    if (fileName.trim().length <= 0 || selectedFiles.length <= 0) {
      return toast.warning("Please fill all the required fields!");
    }

    let toastId = toast.loading("Saving Information...");
    let res = await upload();
    if (!res) {
      updateToast(toastId, "Saving data failed", "error");
      return res;
    }

    let body = {
      owner: id,
      assignedById: drizzleState.accounts[0],
      docId: docId.current,
      docUrl: docUrl.current,
      docName: fileName,
    };

    try {
      let result = await Axios.post(
        process.env.REACT_APP_SERVER_HOST + "/api/addDocument",
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
      updateToast(toastId, "Document saved Successfully!!", "success");
      navigate("/Institute/viewMembers");
    } catch (error) {
      updateToast(toastId, error, "error");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const toastId = toast.loading("Fetching Info!");
      try {
        const { Account } = drizzle.contracts;
        let hash = await Account.methods.indivData(id).call();

        let result = await Axios.post(
          process.env.REACT_APP_SERVER_HOST + "/api/getName",
          {
            hash: [hash.slice(2)],
            type: "Individual",
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
        setRecName(result.data.names[0]);
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

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Assign Document</h1>
      {/* Receiver Name */}
      <div className="m-1 flex items-center justify-between">
        Assign To:
        <input
          type="text"
          className="m-1 neumorphism-pressed px-4 py-2"
          value={recName}
          disabled={true}
          required
        />
      </div>
      {/* name */}
      <div className="m-1 flex items-center justify-between">
        File Name:
        <input
          type="text"
          className="m-1 neumorphism-pressed px-4 py-2"
          value={fileName}
          placeholder="Course name"
          onChange={updateFileName}
          required
        />
      </div>
      {/* File */}
      <div className="m-1 flex items-center justify-between">
        File:
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
            rejectedFiles,
          }) => {
            return (
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
                {selectedFiles && selectedFiles[0].name ? (
                  <div>
                    <b>Selected File: </b>
                    {selectedFiles && selectedFiles[0].name}
                  </div>
                ) : (
                  "Drag and drop file here, or click to select file"
                )}
                {!isDragActive && "Click here or drop a file to upload!"}
                {isDragActive && !isDragReject && "Drop it like it's hot!"}
                {isDragReject && "File type not accepted, sorry!"}
              </div>
            );
          }}
        </Dropzone>
      </div>
      <div className="m-2 neumorphism-plain px-4 py-2" onClick={saveData}>
        Save Document
      </div>
    </div>
  );
};

export default UploadFile;
