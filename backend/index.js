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
  validInstitTypes,
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

app.post(
  "/api/fetchAll",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let type = req.body.type;
    //verifying if type of user is valid
    if (!validInstitTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }

    try {
      let result;
      if (type === validInstitTypes[0]) {
        result = await Individual.find();
      } else {
        let subType = req.body.subType;
        if (!subType || subType.trim().length <= 0) {
          result = await Institute.find();
        } else {
          result = await Institute.find({ instituteType: subType });
        }
      }

      return res.send({
        status: SUCCESS,
        result,
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

app.post("/api/createUser", async (req, res) => {
  let type = req.body.type;
  //verifying if type of user is valid
  if (!validInstitTypes.includes(type)) {
    return res.send({
      status: FAILED,
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    //Validation
    let error;
    if (type == validInstitTypes[0]) {
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
    if (type == validInstitTypes[0]) {
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
    if (type == validInstitTypes[0]) {
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
  if (!validInstitTypes.includes(type)) {
    return res.send({
      status: FAILED,
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    let result;
    if (type === validInstitTypes[0]) {
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
    if (!validInstitTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }

    try {
      if (hash.length < 0) {
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
      if (type === validInstitTypes[0]) {
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
  "/api/getLatestHashes",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let Id = req.body.Id;
    let type = req.body.type;
    if (!validInstitTypes.includes(type)) {
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
        if (type === validInstitTypes[0]) {
          results.push(
            await Individual.find({ metamaskId: Id[id] })
              .sort({
                createdAt: -1,
              })
              .limit(1)
          );
        } else {
          results.push(
            await Institute.find({ metamaskId: Id[id] })
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
  "/api/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let type = req.body.type;
    let hash = req.body.hash;
    if (!validInstitTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }
    try {
      // const collection = nodeApp.collection(type);
      let result;
      if (type === validInstitTypes[0]) {
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
    if (!validInstitTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }
    try {
      //Validation
      let error;
      if (type == validInstitTypes[0]) {
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
      if (type == validInstitTypes[0]) {
        result = await Individual.findOne({ _id: request.body._id });
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
        result = await Institute.findOne({ _id: request.body._id });
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
      if (type == validInstitTypes[0]) {
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
    if (!validInstitTypes.includes(type)) {
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
      if (type === validInstitTypes[0]) {
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
      let answer = await result.comparePassword(
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
        }
      );
      //verify new and confirm password
      if (req.body.new !== req.body.confirm) {
        return res.send({
          status: FAILED,
          msg: "New and Confirm Passwords don't match!!",
        });
      }

      //updating password
      let body;
      if (type === validInstitTypes[0]) {
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
      let digest = hash("sha256").update(JSON.stringify(body)).digest("hex");
      //saving changes to database
      if (type === validInstitTypes[0]) {
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
  "/api/fetchResult",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let type = req.body.type;
    let query = req.body.query;
    //verifying if type of user is valid
    if (!validInstitTypes.includes(type)) {
      return res.send({
        status: FAILED,
        msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
      });
    }
    try {
      // finding results
      let result;
      if (type === validInstitTypes[0]) {
        result = await Individual.find({ $text: { $search: query } });
      } else {
        result = await Institute.find({ $text: { $search: query } });
      }
      return res.send({
        status: SUCCESS,
        results: result,
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

      if (status === RequestStatus.Rejected) {
        //updating document
        result.status = status;
        await result.save();
      } else {
        // updating individual
        // updating institute
        // updating request
        // adding work experience
        if (result.type === validRequestTypes[0]) {
        } else {
          //
        }
      }

      return res.send({
        status: SUCCESS,
        message: "Request updated!",
      });
    } catch (error) {
      console.log("Error in Update Request status: ");
      console.log(err);
      return res.send({
        status: FAILED,
        message: err,
      });
    }
  }
);

app.post(
  "/api/getDashboardInfo",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let id = req.body.id;
    if (!id) {
      return res.send({
        status: FAILED,
        msg: "Please provide an Id to get info",
      });
    }
    try {
      //Fetching received requests
      let received = await Request.find({
        receiverId: id,
        status: RequestStatus.Pending,
      });
      //Fetching sent requests
      let sent = await Request.find({
        senderId: id,
        status: RequestStatus.Pending,
      });

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
      let result = await Institute.findOne({ _id: req.hash });
      if (!result) {
        return res.send({
          status: FAILED,
          msg: "No Account exists with the given wallet ID",
        });
      }
      let memberIds = [result.members.map((e) => e.id)];
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
      // Saving Document
      let body = {
        docId: finalMarksheet.id,
        owner: id,
        docName: course + "_Final_Marksheet",
        docUrl: finalMarksheet.url,
        assignedById: id,
      };
      let docResult = await Documents.create(body);
      docResult = await docResult.save();
      console.log(docResult._id);

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
        finalMarksheet: docResult._id,
      };
      let edResult = await Education.create(body);
      await edResult.save();

      //Updating individual
      let indivResult = await Individual.find({ metamaskId: id })
        .sort({
          createdAt: -1,
        })
        .limit(1);
      console.log(indivResult);
      indivResult[0].documentList.push(docResult._id);
      console.log(indivResult[0].documentList);
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
      let digest = hash("sha256").update(JSON.stringify(body)).digest("hex");
      let result = await Individual.create({ _id: digest, ...body });
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
      let indivResult = await Individual.find({ metamaskId: id })
        .sort({
          createdAt: -1,
        })
        .limit(1);
      console.log(indivResult);
      indivResult[0].documentList.push(offerResult._id);
      if (reliefLetter.id.trim().length >= 0) {
        indivResult[0].documentList.push(reliefResult._id);
      }
      console.log(indivResult[0].documentList);
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

app.listen(port, () => console.log(`Server started on ${port}`));
