const hash = require("crypto").createHash;
const jwt = require("jsonwebtoken");
const { recoverPersonalSignature } = require("@metamask/eth-sig-util");
// const nodeApp = require("./clientConnect").client.db("NodeApp");
const client = require("./mongoDbConnect");
const { app } = require("./expressSetup");
const {
  toHex,
  validateIndividualJson,
  validateInstituteJson,
  validUserTypes,
  validRequestTypes,
  RequestStatus,
  SUCCESS,
  FAILED,
} = require("./utilities");
const passport = require("./middlewares/auth");
const Individual = require("./model/Individual");
const Institute = require("./model/Institute");
const Request = require("./model/Request");
const Education = require("./model/Education");
const WorkExperience = require("./model/WorkExperience");
const Documents = require("./model/Documents");
const port = 3002;

//methods for digital signature
app.get("/nonce", (req, res) => {
  const generatedNonce = Math.floor(Math.random() * 1000000).toString();

  return res.send({
    nonce: generatedNonce,
  });
});

app.post("/verifySignature", (req, res) => {
  const ogNonce = req.body.ogNonce;
  const sig = req.body.signature;
  const address = req.body.address;

  const verifiedNonce = recoverPersonalSignature({
    data: `0x${toHex(ogNonce)}`,
    signature: sig,
  });
  return res.send({
    verified: verifiedNonce === address.toLowerCase(),
  });
});

app.post(
  "/api/auth",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.send({ status: SUCCESS, msg: "Authentication is working" });
  }
);

// Fetching bulk info from tables
app.post(
  "/api/fetchAll",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let type = req.body.type;
    //verifying if type of user is valid
    if (!validUserTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }

    try {
      let result;
      if (type === validUserTypes[0]) {
        result = await Individual.find();
      } else {
        let subType = req.body.subType;
        if (!subType || subType.trim().length <= 0) {
          result = await Institute.find();
        } else {
          result = await Institute.find({ instituteType: subType });
        }
      }
      let maskList = [];
      let accountList = [];
      //Removing repeated accounts
      for (let i in result) {
        if (!maskList.includes(result[i].metamaskId)) {
          let temp;
          if (type === validUserTypes[0]) {
            temp = await Individual.find({
              metamaskId: { $regex: result[i].metamaskId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
          } else {
            temp = await Institute.find({
              metamaskId: { $regex: result[i].metamaskId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
          }
          accountList.push(temp[0]._doc);
          maskList.push(result[i].metamaskId);
        }
      }
      return res.send({
        status: SUCCESS,
        result: accountList,
      });
    } catch (error) {
      console.log("Error in Fetch all: ");
      console.log(error);
      return res.send({
        status: FAILED,
        message: error,
      });
    }
  }
);

app.post(
  "/api/getLatestHashes",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let Id = req.body.Id;
    let type = req.body.type;
    if (!validUserTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }

    try {
      if (Id.length < 0) {
        return res.send({
          status: FAILED,
          msg: "Provide atleast one id to find it's hash",
        });
      }
    } catch (error) {
      return res.send({
        status: FAILED,
        msg: "Id must be an array of metamsk Ids, containing atleast one Id",
      });
    }
    try {
      let results = [];
      for (let id in Id) {
        if (type === validUserTypes[0]) {
          results.push(
            await Individual.find({
              metamaskId: { $regex: Id[id], $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1)
          );
        } else {
          results.push(
            await Institute.find({
              metamaskId: { $regex: Id[id], $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1)
          );
        }
      }
      if (results) {
        let hashes = [];
        console.log("List of hashes: " + results);
        for (let result in results) {
          hashes.push(results[result][0]._id);
        }
        return res.send({
          status: SUCCESS,
          hashes: hashes,
        });
      }
      return res.send({
        status: FAILED,
        msg: "No Account exists with the given wallet ID",
      });
    } catch (err) {
      console.log("Error in Get latest Hashes: ");
      console.log(err);
      res.send({
        status: FAILED,
        msg: err,
      });
    }
  }
);

app.post(
  "/api/getDocumentsById",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let id = req.body.id;
    try {
      let result = await Documents.find({
        owner: { $regex: id, $options: "i" },
      });
      // Adding Individual name
      for (let i in result) {
        let indiv = await Individual.find({
          metamaskId: { $regex: result[i].assignedById, $options: "i" },
        })
          .sort({
            createdAt: -1,
          })
          .limit(1);
        if (indiv.length <= 0) {
          let instit = await Institute.find({
            metamaskId: { $regex: result[i].assignedById, $options: "i" },
          })
            .sort({
              createdAt: -1,
            })
            .limit(1);
          result[i] = { assignByName: instit[0].name, ...result[i]._doc };
        } else {
          result[i] = { assignByName: indiv[0].name, ...result[i]._doc };
        }
      }

      return res.send({
        status: SUCCESS,
        result,
      });
    } catch (error) {
      console.log("Error in get document by ID: ");
      console.log(error);
      return res.send({
        status: FAILED,
        message: error,
      });
    }
  }
);

app.post(
  "/api/fetchResult",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let type = req.body.type;
    let query = req.body.query;
    //verifying if type of user is valid
    if (!validUserTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }
    try {
      // finding results
      let result;
      if (type === validUserTypes[0]) {
        result = await Individual.find({ $text: { $search: query } });
      } else {
        result = await Institute.find({ $text: { $search: query } });
      }
      let maskList = [];
      let accountList = [];
      //Removing repeated accounts
      for (let i in result) {
        if (!maskList.includes(result[i].metamaskId)) {
          let temp;
          if (type === validUserTypes[0]) {
            temp = await Individual.find({
              metamaskId: { $regex: result[i].metamaskId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
          } else {
            temp = await Institute.find({
              metamaskId: { $regex: result[i].metamaskId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
          }
          accountList.push(temp[0]._doc);
          maskList.push(result[i].metamaskId);
        }
      }
      return res.send({
        status: SUCCESS,
        results: accountList,
      });
    } catch (error) {
      console.log("Error in Fetch result: ");
      console.log(error);
      return res.send({
        status: FAILED,
        msg: "Some error occured. Please contact backend",
      });
    }
  }
);

// Common functionalities
app.post("/api/createUser", async (req, res) => {
  let type = req.body.type;
  //verifying if type of user is valid
  if (!validUserTypes.includes(type)) {
    return res.send({
      status: FAILED,
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    //Validation
    let error;
    if (type == validUserTypes[0]) {
      error = validateIndividualJson(req.body);
    } else {
      error = validateInstituteJson(req.body);
    }

    if (error) {
      return res.send({
        status: FAILED,
        message: "Sent data is not valid!",
      });
    }

    let body;
    if (type == validUserTypes[0]) {
      body = {
        metamaskId: req.body.metamaskId,
        name: req.body.name,
        birthDate: req.body.birthDate,
        qualification: req.body.qualification,
        designation: req.body.designation,
        password: req.body.password,
        documentList: req.body.documentList,
        prevId: "0".repeat(64),
      };
    } else {
      body = {
        metamaskId: req.body.metamaskId,
        name: req.body.name,
        foundationDate: req.body.foundationDate,
        ceoId: req.body.ceoId,
        instituteType: req.body.instituteType,
        roles: req.body.roles,
        members: req.body.members,
        password: req.body.password,
        location: req.body.location,
        prevId: "0".repeat(64),
      };
    }
    //Calculating the hash
    let result;
    let digest = hash("sha256").update(JSON.stringify(body)).digest("hex");
    if (type == validUserTypes[0]) {
      result = await Individual.create({ _id: digest, ...body });
    } else {
      result = await Institute.create({ _id: digest, ...body });
    }
    result = await result.save();
    // return result;
    return res.send({
      status: SUCCESS,
      message: "User Created successfully!!",
      hash: digest,
    });
  } catch (err) {
    console.log("Error in Create User");
    console.log(err);
    return res.send({
      status: FAILED,
      message: err,
    });
  }
});

app.post("/api/login", async (req, res) => {
  let hash = req.body.hash;
  let type = req.body.type;
  if (!validUserTypes.includes(type)) {
    return res.send({
      status: FAILED,
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    let result;
    if (type === validUserTypes[0]) {
      result = await Individual.findOne({ _id: hash });
    } else {
      result = await Institute.findOne({ _id: hash });
    }
    if (result) {
      result.comparePassword(req.body.password, (err, isMatch = false) => {
        if (err) {
          return res.send({
            status: FAILED,
            msg: "Wrong Password!!",
          });
        }
        if (isMatch) {
          let authToken = jwt.sign(
            { _id: hash, type: type },
            process.env.JWT_SECRET,
            {
              expiresIn: "2h",
            }
          );
          return res.send({
            status: SUCCESS,
            msg: "Login successful!!",
            auth: authToken,
          });
        }
        return res.send({
          status: FAILED,
          msg: "Wrong Password!!",
        });
      });
    } else {
      return res.send({
        status: FAILED,
        msg: "No Account exists with the given wallet ID",
      });
    }
  } catch (err) {
    console.log("Error in Login: ");
    console.log(err);
    return res.send({
      status: FAILED,
      msg: err,
    });
  }
});

app.post(
  "/api/getName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let hash = req.body.hash;
    let type = req.body.type;
    if (!validUserTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }

    try {
      if (hash.length <= 0) {
        return res.send({
          status: FAILED,
          msg: "Provide atleast one id to find it's name",
        });
      }
    } catch (error) {
      return res.send({
        status: FAILED,
        msg: "hash must be an array of hashes, containing atleast one hash",
      });
    }
    try {
      let results;
      if (type === validUserTypes[0]) {
        results = await Individual.find({ _id: { $in: hash } });
      } else {
        results = await Institute.find({ _id: { $in: hash } });
      }
      if (results) {
        let names = [];
        for (let result in results) {
          names.push(results[result].name);
        }
        return res.send({
          status: SUCCESS,
          names: names,
        });
      }
      return res.send({
        status: FAILED,
        msg: "No Account exists with the given wallet ID",
      });
    } catch (err) {
      console.log("Error in get Name: ");
      console.log(err);
      res.send({
        status: FAILED,
        msg: err,
      });
    }
  }
);

app.post(
  "/api/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let type = req.body.type;
    let hash = req.body.hash;
    if (!validUserTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }
    try {
      // const collection = nodeApp.collection(type);
      let result;
      if (type === validUserTypes[0]) {
        result = await Individual.findOne({ _id: hash });
      } else {
        result = await Institute.findOne({ _id: hash });
      }

      if (result) {
        return res.send({
          status: SUCCESS,
          profile: result,
        });
      }

      return res.send({
        status: FAILED,
        msg: "No Account exists with the given wallet ID",
      });
    } catch (err) {
      console.log("Error in Profile: ");

      console.log(err);
      return res.send({
        status: FAILED,
        msg: "some error occured!!",
      });
    }
  }
);

app.post(
  "/api/updateUser",
  passport.authenticate("jwt", { session: false }),
  async (request, response) => {
    let type = request.body.type;
    //verifying if type of user is valid
    if (!validUserTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }
    try {
      //Validation
      let error;
      if (type == validUserTypes[0]) {
        error = validateIndividualJson(request.body);
      } else {
        error = validateInstituteJson(request.body);
      }

      if (error) {
        return response.send({
          status: FAILED,
          message: "Sent data is not valid!",
        });
      }
      let result;
      let body;
      if (type == validUserTypes[0]) {
        // result = await Individual.findOne({ _id: request.body._id });
        body = body = {
          metamaskId: request.body.metamaskId,
          name: request.body.name,
          birthDate: request.body.birthDate,
          qualification: request.body.qualification,
          designation: request.body.designation,
          password: request.body.password,
          documentList: request.body.documentList,
          prevId: request.body._id,
        };
      } else {
        // result = await Institute.findOne({ _id: request.body._id });
        body = {
          metamaskId: request.body.metamaskId,
          name: request.body.name,
          foundationDate: request.body.foundationDate,
          ceoId: request.body.ceoId,
          instituteType: request.body.instituteType,
          roles: request.body.roles,
          password: request.body.password,
          location: request.body.location,
          prevId: request.body._id,
        };
      }
      //Calculating the hash
      let digest = hash("sha256").update(JSON.stringify(body)).digest("hex");
      if (type == validUserTypes[0]) {
        result = await Individual.create({ _id: digest, ...body });
        result = await result.save();
        await Individual.updateOne(
          { _id: digest },
          { password: request.body.password }
        );
      } else {
        result = await Institute.create({ _id: digest, ...body });
        result = await result.save();
        await Institute.updateOne(
          { _id: digest },
          { password: request.body.password }
        );
      }
      return response.send({
        status: SUCCESS,
        message: "User Updated successfully!!",
        hash: digest,
      });
    } catch (err) {
      console.log("Error in UpdateUser: ");
      console.log(err);
      return response.send({
        status: FAILED,
        message: err,
      });
    }
  }
);

app.post(
  "/api/changePassword",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { type, id, old, confirm } = req.body;
    const newPass = req.body.new;
    //verifying if type of user is valid
    if (!validUserTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }
    //Performing validations on received password
    if (!(old && confirm && newPass)) {
      return res.send({
        status: FAILED,
        msg: "All fields are required",
      });
    } else if (
      old.trim().length <= 0 ||
      newPass.trim().length <= 0 ||
      confirm.trim().length <= 0
    ) {
      return res.send({
        status: FAILED,
        msg: "None of the fields can be empty",
      });
    }
    try {
      //fetching the user data
      let result;
      if (type === validUserTypes[0]) {
        result = await Individual.findOne({ _id: id });
      } else {
        result = await Institute.findOne({ _id: id });
      }
      if (!result) {
        return res.send({
          status: FAILED,
          msg: "No Account exists with the given wallet ID",
        });
      }

      //verifying old password
      let wait = await result.comparePassword(
        req.body.old,
        async (err, isMatch = false) => {
          if (err) {
            return res.send({
              status: FAILED,
              msg: "Some error happened on backend. Please try again later.",
            });
          }
          if (!isMatch) {
            return res.send({
              status: FAILED,
              msg: "Wrong Old Password!!",
            });
          }
          //verify new and confirm password
          if (req.body.new !== req.body.confirm) {
            return res.send({
              status: FAILED,
              msg: "New and Confirm Passwords don't match!!",
            });
          }

          //updating password
          let body;
          if (type === validUserTypes[0]) {
            body = {
              metamaskId: result.metamaskId,
              name: result.name,
              birthDate: result.birthDate,
              qualification: result.qualification,
              designation: result.designation,
              password: req.body.new,
              documentList: result.documentList,
              prevId: result._id,
            };
          } else {
            body = {
              metamaskId: result.metamaskId,
              name: result.name,
              foundationDate: result.foundationDate,
              ceoId: result.ceoId,
              instituteType: result.instituteType,
              roles: result.roles,
              password: req.body.new,
              location: result.location,
              prevId: result._id,
            };
          }
          //Calculating the hash
          let digest = hash("sha256")
            .update(JSON.stringify(body))
            .digest("hex");
          //saving changes to database
          if (type === validUserTypes[0]) {
            result = await Individual.create({ _id: digest, ...body });
          } else {
            result = await Institute.create({ _id: digest, ...body });
          }
          result = await result.save();

          return res.send({
            status: SUCCESS,
            message: "Password Changed successfully!!",
            hash: digest,
          });
        }
      );
    } catch (err) {
      console.log("Error in Change Password: ");
      console.log(err);
      return res.send({
        status: FAILED,
        msg: "some error occured!!",
      });
    }
  }
);

app.post(
  "/api/AddRequest",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { senderId, senderName, receiverId, receiverName, msg, role, type } =
      req.body;

    if (!validRequestTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid request type!!!\nPossbile types are 'Recruiting' or 'Joining'.",
      });
    }

    if (
      !(
        senderId.trim().length &&
        receiverId.trim().length &&
        msg.trim().length &&
        role.trim().length
      )
    ) {
      return res.send({
        status: FAILED,
        msg: "Insufficient information provided!\nPlease provide senderId, receiverId, msg & role as non empty strings",
      });
    }

    let body = {
      senderId,
      senderName,
      receiverId,
      receiverName,
      message: msg,
      role,
      type: type,
      status: RequestStatus.Pending,
    };

    try {
      let result = await Request.create(body);
      result = result.save();
      // return result;
      return res.send({
        status: SUCCESS,
        message: "Request added!",
      });
    } catch (error) {
      console.log("Error in Add Request: ");
      console.log(error);
      return res.send({
        status: FAILED,
        message: error,
      });
    }
  }
);

app.post(
  "/api/updateRequestStatus",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { id, status } = req.body;

    try {
      // checking if document exists
      let result = await Request.findById(id);
      if (!result) {
        return res.send({
          status: FAILED,
          msg: "No Request with given ID",
        });
      }
      //Checking if status is valid
      let valid = false;
      for (let status in RequestStatus) {
        if (RequestStatus[status] === status) {
          valid = true;
        }
      }

      if (!valid) {
        return res.send({
          status: FAILED,
          msg: "Invalid status for a request",
        });
      }
      //updating request
      result.status = status;
      await result.save();
      if (status === RequestStatus.Accepted) {
        let instit, indiv;
        // updating individual
        // updating institute
        // adding work experience
        switch (result.type) {
          case validRequestTypes[0]:
            instit = await Institute.find({
              metamaskId: { $regex: result.senderId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
            indiv = await Individual.find({
              metamaskId: { $regex: result.receiverId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
            instit[0].members.push({ id: indiv[0]._id, role: result.role });
            await instit[0].save();

            indiv[0].designation = result.role;
            await indiv[0].save();
            break;

          case validRequestTypes[1]:
            instit = await Institute.find({
              metamaskId: { $regex: result.receiverId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
            indiv = await Individual.find({
              metamaskId: { $regex: result.senderId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
            instit[0].members.push({ id: indiv[0]._id, role: result.role });
            await instit[0].save();

            indiv[0].designation = result.role;
            await indiv[0].save();
            break;

          case validRequestTypes[2]:
            instit = await Institute.find({
              metamaskId: { $regex: result.receiverId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
            indiv = await Individual.find({
              metamaskId: { $regex: result.senderId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
            instit[0].members.slice(instit[0].members.indexOf(indiv[0]._id), 1);
            await instit[0].save();

            indiv[0].designation = "Unemployed";
            await indiv[0].save();
            break;
          case validRequestTypes[3]:
            instit = await Institute.find({
              metamaskId: { $regex: result.senderId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
            indiv = await Individual.find({
              metamaskId: { $regex: result.receiverId, $options: "i" },
            })
              .sort({
                createdAt: -1,
              })
              .limit(1);
            instit[0].members.slice(instit[0].members.indexOf(indiv[0]._id), 1);
            await instit[0].save();

            indiv[0].designation = "Unemployed";
            await indiv[0].save();
            break;
        }
      }

      return res.send({
        status: SUCCESS,
        message: "Request updated!",
      });
    } catch (error) {
      console.log("Error in Update Request status: ");
      console.log(error);
      return res.send({
        status: FAILED,
        message: error,
      });
    }
  }
);

app.post(
  "/api/getDashboardInfo",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { id, type } = req.body;
    if (!id) {
      return res.send({
        status: FAILED,
        msg: "Please provide an Id to get info",
      });
    }
    try {
      //Fetching received requests
      let received = await Request.find({
        receiverId: { $regex: id, $options: "i" },
        status: RequestStatus.Pending,
      });
      //Fetching sent requests
      let sent = await Request.find({
        senderId: { $regex: id, $options: "i" },
        status: RequestStatus.Pending,
      });
      if (type === validUserTypes[1]) {
        // fetching institute name
        let instit = await Institute.find({
          metamaskId: { $regex: `^${id}$`, $options: "i" },
        })
          .sort({
            createdAt: -1,
          })
          .limit(1);
        //fetching education verification
        let verifyEd = await Education.find({
          $and: [
            {
              $or: [
                {
                  InstituteId: { $regex: id, $options: "i" },
                },
                { InstituteName: instit[0].name },
              ],
            },
            { isVerified: "Pending" },
          ],
        });

        for (let i in verifyEd) {
          let indiv = await Individual.find({
            metamaskId: { $regex: verifyEd[i].DoneBy, $options: "i" },
          })
            .sort({
              createdAt: -1,
            })
            .limit(1);

          let Marksheet = await Documents.findById(verifyEd[i].finalMarksheet);
          verifyEd[i] = {
            DoneByName: indiv[0].name,
            finalMarksheetLink: verifyEd[i].completed ? Marksheet.docUrl : "",
            ...verifyEd[i]._doc,
          };
        }

        //fetching work experience verification
        let verifyWork = await WorkExperience.find({
          $and: [
            {
              $or: [
                {
                  InstituteId: { $regex: id, $options: "i" },
                },
                { InstituteName: instit[0].name },
              ],
            },
            { isVerified: "Pending" },
          ],
        });
        for (let i in verifyWork) {
          let indiv = await Individual.find({
            metamaskId: { $regex: verifyWork[i].DoneBy, $options: "i" },
          })
            .sort({
              createdAt: -1,
            })
            .limit(1);
          let OfferLetter = await Documents.findById(verifyWork[i].OfferLetter);
          if (verifyWork[i].completed) {
            let ReliefLetter = await Documents.findById(
              verifyWork[i].ReliefLetter
            );
            verifyWork[i] = {
              DoneByName: indiv[0].name,
              ReliefLetterLink: ReliefLetter.docUrl,
              OfferLetterLink: OfferLetter.docUrl,
              ...verifyWork[i]._doc,
            };
          } else {
            verifyWork[i] = {
              DoneByName: indiv[0].name,
              OfferLetterLink: OfferLetter.docUrl,
              ...verifyWork[i]._doc,
            };
          }
        }

        return res.send({
          status: SUCCESS,
          received,
          sent,
          verifyEd,
          verifyWork,
        });
      }
      return res.send({
        status: SUCCESS,
        received,
        sent,
      });
    } catch (error) {
      console.log("Error in Get Dashboard Info: ");
      console.log(error);
      return res.send({
        status: FAILED,
        msg: "Some error occured on backend.",
      });
    }
  }
);

// methods specific to institutes only
app.post(
  "/api/getMembers",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let result = await Institute.findOne({ _id: req.body.hash });
      if (!result) {
        return res.send({
          status: FAILED,
          msg: "No Account exists with the given wallet ID",
        });
      }
      let memberIds = result.members.map((e) => e.id);
      let members = await Individual.find({ _id: { $in: memberIds } });
      let memberList = [];
      for (let i in memberIds) {
        memberList.push({
          id: result.members[i].id,
          name: members[i].name,
          role: result.members[i].role,
          metamaskId: members[i].metamaskId,
        });
      }
      return res.send({
        status: SUCCESS,
        members: memberList,
      });
    } catch (err) {
      console.log("Error in Get Members: ");
      console.log(err);
      return res.send({
        status: FAILED,
        msg: "Some error occured!!",
      });
    }
  }
);

app.post(
  "/api/addDocument",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let {
      owner,
      ownerType,
      docId,
      docUrl,
      docName,
      assignedById,
      assignedByIdType,
    } = req.body;
    // verifying owner Id
    let ownerResult;
    if (ownerType === validUserTypes[0]) {
      ownerResult = await Individual.find({
        metamaskId: { $regex: owner, $options: "i" },
      })
        .sort({
          createdAt: -1,
        })
        .limit(1);
    } else {
      ownerResult = await Institute.find({
        metamaskId: { $regex: owner, $options: "i" },
      })
        .sort({
          createdAt: -1,
        })
        .limit(1);
    }
    if (!ownerResult) {
      return res.send({
        status: FAILED,
        msg: "Invalid owner wallet ID",
      });
    }
    // verifying assignBy
    let assignByResult;
    if (assignedByIdType === validUserTypes[0]) {
      assignByResult = await Individual.find({
        metamaskId: { $regex: assignedById, $options: "i" },
      })
        .sort({
          createdAt: -1,
        })
        .limit(1);
    } else {
      assignByResult = await Institute.find({
        metamaskId: { $regex: assignedById, $options: "i" },
      })
        .sort({
          createdAt: -1,
        })
        .limit(1);
    }
    if (!assignByResult) {
      return res.send({
        status: FAILED,
        msg: "Invalid Assign By wallet ID",
      });
    }
    try {
      // Saving Document
      let body = {
        docId,
        owner,
        docName,
        docUrl,
        assignedById,
      };
      let docResult = await Documents.create(body);
      docResult = await docResult.save();
      return res.send({
        status: SUCCESS,
        message: "Document added Successfully",
      });
    } catch (err) {
      console.log("Error in add Document: ");
      console.log(err);
      return res.send({
        status: FAILED,
        msg: "Some error occured!!",
      });
    }
  }
);

app.post(
  "/api/getRoles",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { hash } = req.body;
    try {
      let result = await Institute.findOne({ _id: hash });
      if (!result) {
        return res.send({
          status: FAILED,
          msg: "No Account exists with the given wallet ID",
        });
      }
      return res.send({
        status: SUCCESS,
        roles: result.roles,
      });
    } catch (err) {
      console.log("Error in Get Roles: ");
      console.log(err);
      return res.send({
        status: FAILED,
        msg: "Some error occured!!",
      });
    }
  }
);

app.post(
  "/api/updateRoles",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let id = req.body.hash;
    let { roles } = req.body;
    try {
      let result = await Institute.findOne({ _id: id });
      if (!result) {
        return res.send({
          status: FAILED,
          msg: "No Account exists with the given wallet ID",
        });
      }
      let body = {
        metamaskId: result.metamaskId,
        name: result.name,
        foundationDate: result.foundationDate,
        ceoId: result.ceoId,
        instituteType: result.instituteType,
        roles: roles,
        password: result.password,
        location: result.location,
        prevId: result._id,
      };
      let digest = hash("sha256").update(JSON.stringify(body)).digest("hex");
      let output = await Institute.create({ _id: digest, ...body });
      output = await output.save();
      await Institute.updateOne({ _id: digest }, { password: result.password });
      return res.send({
        status: SUCCESS,
        message: "Roles Updated successfully!!",
        hash: digest,
      });
    } catch (err) {
      console.log("Error in update Roles: ");
      console.log(err);
      return res.send({
        status: FAILED,
        msg: "Some error occured!!",
      });
    }
  }
);

app.post(
  "/api/updateVerification",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { id, type, status } = req.body;
    try {
      let result;
      if (type == "Education") {
        result = await Education.findById(id);
      } else {
        result = await WorkExperience.findById(id);
      }

      await result.update({ isVerified: status });
      return res.send({
        status: SUCCESS,
        msg: "Verification updated!",
      });
    } catch (error) {
      console.log("Error in update Verification: ");
      console.log(err);
      return res.send({
        status: FAILED,
        msg: "Some error occured!!",
      });
    }
  }
);

app.post("/api/getLocation", async (req, res) => {
  let { id } = req.body;
  try {
    let result = await Institute.find({
      metamaskId: { $regex: id, $options: "i" },
    })
      .sort({
        createdAt: -1,
      })
      .limit(1);
    if (!result || result === []) {
      return res.send({
        status: FAILED,
        msg: "No Account exists with the given wallet ID",
      });
    }
    return res.send({
      status: SUCCESS,
      location: result[0].location,
    });
  } catch (err) {
    console.log("Error in Get Location: ");
    console.log(err);
    return res.send({
      status: FAILED,
      msg: "Some error occured!!",
    });
  }
});
// methods specific to individuals
app.post(
  "/api/AddEducation",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let {
      id,
      course,
      instituteId,
      instituteName,
      isVerified,
      startDate,
      completed,
      endDate,
      CreditsGained,
      finalGrade,
      finalGradeUnit,
      finalMarksheet,
    } = req.body;

    try {
      let docResult;
      if (completed) {
        // Saving Document
        let body = {
          docId: finalMarksheet.id,
          owner: id,
          docName: course + "_Final_Marksheet",
          docUrl: finalMarksheet.url,
          assignedById: id,
        };
        docResult = await Documents.create(body);
        docResult = await docResult.save();
      }

      //Saving education
      body = {
        DoneBy: id,
        course,
        InstituteId: instituteId,
        InstituteName: instituteName,
        isVerified,
        completed,
        startDate,
        endDate,
        CreditsGained,
        finalGrade,
        finalGradeUnit,
        finalMarksheet: completed ? docResult._id : null,
      };
      let edResult = await Education.create(body);
      await edResult.save();

      let digest;
      if (completed) {
        //Updating individual
        let indivResult = await Individual.find({
          metamaskId: { $regex: id, $options: "i" },
        })
          .sort({
            createdAt: -1,
          })
          .limit(1);
        indivResult[0].documentList.push(docResult._id);
        body = {
          metamaskId: indivResult[0].metamaskId,
          name: indivResult[0].name,
          birthDate: indivResult[0].birthDate,
          qualification: indivResult[0].qualification,
          designation: indivResult[0].designation,
          password: indivResult[0].password,
          documentList: indivResult[0].documentList,
          prevId: indivResult[0]._id,
        };
        digest = hash("sha256").update(JSON.stringify(body)).digest("hex");
        let result = await Individual.create({ _id: digest, ...body });
        result.save();
        await Individual.updateOne(
          { _id: digest },
          { password: indivResult[0].password }
        );
      }
      return res.send({
        status: SUCCESS,
        message: "Education record added successfully!!",
        hash: digest,
      });
    } catch (error) {
      console.log("Error in AddEducation:");
      console.log(error);
      return res.send({
        status: FAILED,
        msg: error,
      });
    }
  }
);

app.post(
  "/api/AddWorkExperience",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let {
      id,
      instituteId,
      instituteName,
      isVerified,
      completed,
      role,
      startDate,
      endDate,
      offerLetter,
      reliefLetter,
    } = req.body;

    try {
      //saving documents
      let body = {
        docId: offerLetter.id,
        owner: id,
        docName: instituteName + "_" + role + "_offer_Letter",
        docUrl: offerLetter.url,
        assignedById: id,
      };
      let offerResult = await Documents.create(body);
      offerResult = await offerResult.save();
      let reliefResult = "";
      if (completed) {
        let body = {
          docId: offerLetter.id,
          owner: id,
          docName: instituteName + "_" + role + "_relief_Letter",
          docUrl: offerLetter.url,
          assignedById: id,
        };
        reliefResult = await Documents.create(body);
        reliefResult = await reliefResult.save();
      }

      //SAving work experience
      body = {
        DoneBy: id,
        InstituteId: instituteId,
        InstituteName: instituteName,
        completed,
        isVerified,
        startDate,
        endDate,
        role,
        OfferLetter: offerResult._id,
        ReliefLetter: completed ? reliefResult._id : null,
      };
      let result = await WorkExperience.create(body);
      result.save();

      //updating individual
      let indivResult = await Individual.find({
        metamaskId: { $regex: id, $options: "i" },
      })
        .sort({
          createdAt: -1,
        })
        .limit(1);
      indivResult[0].documentList.push(offerResult._id);
      if (reliefLetter.id.trim().length >= 0) {
        indivResult[0].documentList.push(reliefResult._id);
      }
      body = {
        metamaskId: indivResult[0].metamaskId,
        name: indivResult[0].name,
        birthDate: indivResult[0].birthDate,
        qualification: indivResult[0].qualification,
        designation: completed ? indivResult[0].designation : role,
        password: indivResult[0].password,
        documentList: indivResult[0].documentList,
        prevId: indivResult[0]._id,
      };
      let digest = hash("sha256").update(JSON.stringify(body)).digest("hex");

      // indivResult[0].update({documentList:});
      // indivResult.save();
      result = await Individual.create({ _id: digest, ...body });
      result.save();
      await Individual.updateOne(
        { _id: digest },
        { password: indivResult[0].password }
      );

      if (instituteId.trim() !== "") {
        // TODO add a new verification type request
      }
      return res.send({
        status: SUCCESS,
        message: "Work Experience record added successfully!!",
        hash: digest,
      });
    } catch (error) {
      console.log("Error in add Work Experience:");
      console.log(error);
      return res.send({
        status: FAILED,
        msg: error,
      });
    }
  }
);

app.post(
  "/api/getEducation",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let id = req.body.id;
    try {
      let result = await Education.find({ DoneBy: id });
      for (let i in result) {
        let indiv = await Individual.find({
          metamaskId: { $regex: result[i].DoneBy, $options: "i" },
        })
          .sort({
            createdAt: -1,
          })
          .limit(1);

        let Marksheet = await Documents.findById(result[i].finalMarksheet);
        result[i] = {
          DoneByName: indiv[0].name,
          finalMarksheetLink: Marksheet ? Marksheet.docUrl : "",
          ...result[i]._doc,
        };
      }
      return res.send({
        status: SUCCESS,
        result: result,
      });
    } catch (error) {
      console.log("Error in get Education:");
      console.log(error);
      return res.send({
        status: FAILED,
        msg: error,
      });
    }
  }
);
app.post(
  "/api/getWorkExperience",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let id = req.body.id;
    try {
      let result = await WorkExperience.find({
        DoneBy: { $regex: id, $options: "i" },
      });
      for (let i in result) {
        let indiv = await Individual.find({
          metamaskId: { $regex: result[i].DoneBy, $options: "i" },
        })
          .sort({
            createdAt: -1,
          })
          .limit(1);
        let OfferLetter = await Documents.findById(result[i].OfferLetter);
        if (result[i].completed) {
          let ReliefLetter = await Documents.findById(result[i].ReliefLetter);
          result[i] = {
            DoneByName: indiv[0].name,
            ReliefLetterLink: ReliefLetter.docUrl,
            OfferLetterLink: OfferLetter.docUrl,
            ...result[i]._doc,
          };
        } else {
          result[i] = {
            DoneByName: indiv[0].name,
            OfferLetterLink: OfferLetter.docUrl,
            ...result[i]._doc,
          };
        }
      }
      return res.send({
        status: SUCCESS,
        result: result,
      });
    } catch (error) {
      console.log("Error in get Work Experience:");
      console.log(error);
      return res.send({
        status: FAILED,
        msg: error,
      });
    }
  }
);

app.listen(port, () => console.log(`Server started on ${port}`));
