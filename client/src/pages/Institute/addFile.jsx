import React from "react";
import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
import { client } from "../utilities/ipfs";
import Dropzone from "react-dropzone";

const UploadFile = () => {
  const [file, setFile] = useState("");
  const [progress, setProgress] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState("");
  const [urlArr, setUrlArr] = useState([]);

  const onDrop = (files) => {
    if (files.length > 0) {
      setSelectedFiles(files);
      console.log(files);
    }
  };
  const upload = () => {
    let currentFile = selectedFiles[0];

    setProgress(0);
    setFile(currentFile);
    console.log(selectedFiles);
    // UploadService.upload(currentFile, (event) => {
    //   .setState({
    //     progress: Math.round((100 * event.loaded) / event.total),
    //   });
    // })
    //   .then((response) => {
    //     .setState({
    //       message: response.data.message,
    //     });
    //     return UploadService.getFiles();
    //   })
    //   .then((files) => {
    //     .setState({
    //       fileInfos: files.data,
    //     });
    //   })
    //   .catch(() => {
    //     .setState({
    //       progress: 0,
    //       message: "Could not upload the file!",
    //       currentFile: undefined,
    //     });
    //   });
  };
  const retrieveFile = (e) => {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      console.log(reader.result);
      console.log("Buffer data: ", Buffer(reader.result));
      setFile(Buffer(reader.result));
    };

    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${created.path}`;
      setUrlArr((prev) => [...prev, url]);
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div>
      <h1>Upload File</h1>
      {file && (
        <div className="progress mb-3">
          <div
            className="progress-bar progress-bar-info progress-bar-striped"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ width: progress + "%" }}
          >
            {progress}%
          </div>
        </div>
      )}

      <Dropzone onDrop={onDrop} multiple={false}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div
              {...getRootProps({
                className:
                  "dropzone neumorphism-pressed h-64 w-64 flex justify-center items-center p-5 m-3",
              })}
            >
              <input
                {...getInputProps({
                  className:
                    "dropinput h-64 w-64 flex justify-center items-center p-5 m-3",
                })}
              />
              {selectedFiles && selectedFiles[0].name ? (
                <div className="selected-file">
                  {selectedFiles && selectedFiles[0].name}
                </div>
              ) : (
                "Drag and drop file here, or click to select file"
              )}
            </div>
            <aside className="selected-file-wrapper">
              <button
                className="btn btn-success"
                disabled={!selectedFiles}
                onClick={upload}
              >
                Upload
              </button>
            </aside>
          </section>
        )}
      </Dropzone>

      {/* <div className="alert alert-light" role="alert">
        {message}
      </div> */}

      {urlArr.length > 0 && (
        <div className="card">
          <div className="card-header">List of Files</div>
          <ul className="list-group list-group-flush">
            {urlArr.map((file, index) => (
              <li className="list-group-item" key={index}>
                <a href={file.url}>{file.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
