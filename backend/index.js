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
} = require("./utilities");
const passport = require("./middlewares/auth");
const Individual = require("./model/Individual");
const Institute = require("./model/Institute");
// const { request } = require("http");

const port = 3002;
const validTypes = ["Individual", "Institute"];

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

app.post("/api/login", async (req, res) => {
  let hash = req.body.hash;
  let type = req.body.type;
  if (!validTypes.includes(type)) {
    return res.send({
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    let result;
    if (type === validTypes[0]) {
      result = await Individual.findOne({ _id: hash });
    } else {
      result = await Institute.findOne({ _id: hash });
    }
    console.log(hash);
    if (result) {
      result.comparePassword(req.body.password, (err, isMatch = false) => {
        if (err) {
          return res.send({
            status: "Failed",
            msg: "Wrong Password!!",
          });
        }
        if (isMatch) {
          let authToken = jwt.sign({ _id: hash }, process.env.JWT_SECRET, {
            expiresIn: "2h",
          });
          return res.send({
            status: "Success",
            msg: "Login successful!!",
            auth: authToken,
          });
        }
        return res.send({
          status: "Failed",
          msg: "Wrong Password!!",
        });
      });
    } else {
      return res.send({
        msg: "No Account exists with the given wallet ID",
      });
    }
  } catch (err) {
    console.log(err);
    // return res.send({
    //     msg:err
    // })
  }
});

// app.post("/api/profile", passport.authenticate("jwt", {}), async (req, res) => {
//   let type = req.body.type;
//   let address = req.body.address;
//   if (!validTypes.includes(type)) {
//     res.send({
//       msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
//     });
//   }
//   try {
//     const collection = nodeApp.collection(type);
//     const result = await collection
//       .findOne({ metamaskId: address })
//       // .then(res => res.json())
//       .catch((err) => {
//         console.log(err);
//         res.status(500).send({
//           msg: "Couldn't connect to database!!",
//         });
//       });
//     console.log(result.password);
//     if (result) {
//       return res.send({
//         name: result,
//       });
//     }
//     return res.send({
//       msg: "No Account exists with the given wallet ID",
//     });
//   } catch (err) {
//     res.send({
//       msg: err,
//     });
//   }
// });

app.post("/api/profile", async (req, res) => {
  let type = req.body.type;
  let hash = req.body.hash;
  if (!validTypes.includes(type)) {
    return res.send({
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    // const collection = nodeApp.collection(type);
    let result;
    if (type === validTypes[0]) {
      result = await Individual.findOne({ _id: hash });
    } else {
      result = await Institute.findOne({ _id: hash });
    }
    if (result) {
      return res.send({
        profile: result,
      });
    }
    console.log(result);

    return res.send({
      msg: "No Account exists with the given wallet ID",
    });
  } catch (err) {
    console.log(err);
    return res.send({
      msg: "some error occured!!",
    });
  }
});

app.post("/api/createUser", async (req, res) => {
  let type = req.body.type;
  //verifying if type of user is valid
  if (!validTypes.includes(type)) {
    return res.send({
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    //Validation
    let error;
    if (type == validTypes[0]) {
      error = validateIndividualJson(req.body);
    } else {
      error = validateInstituteJson(req.body);
    }

    if (error) {
      return res.send({
        status: "Failed",
        message: "Sent data is not valid!",
      });
    }

    let body;
    if (type == validTypes[0]) {
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
        password: req.body.password,
        location: req.body.location,
        prevId: "0".repeat(64),
      };
    }
    //Calculating the hash
    let result;
    let digest = hash("sha256").update(JSON.stringify(body)).digest("hex");
    if (type == validTypes[0]) {
      result = await Individual.create({ _id: digest, ...body });
    } else {
      result = await Institute.create({ _id: digest, ...body });
    }
    result = await result.save();
    // return result;
    console.log(result);
    return res.send({
      status: "Success",
      message: "User Created successfully!!",
      hash: digest,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: "Failed!!",
      message: err,
    });
  }
});

app.post("/api/updateUser", async (request, response) => {
  let type = request.body.type;
  //verifying if type of user is valid
  if (!validTypes.includes(type)) {
    return res.send({
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    //Validation
    let error;
    if (type == validTypes[0]) {
      error = validateIndividualJson(request.body);
    } else {
      error = validateInstituteJson(request.body);
    }

    if (error) {
      return response.send({
        status: "Failed",
        message: "Sent data is not valid!",
      });
    }
    let result;
    let body;
    if (type == validTypes[0]) {
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
    if (type == validTypes[0]) {
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
      status: "Success",
      message: "User Updated successfully!!",
      hash: digest,
    });
  } catch (err) {
    console.log(err);
    return response.send({
      status: "Failed!!",
      message: err,
    });
  }
});

app.post("/api/changePassword", async (req, res) => {
  let type = req.body.type;
  let id = req.body.id;
  //verifying if type of user is valid
  if (!validTypes.includes(type)) {
    return res.send({
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    //fetching the user data
    let result;
    if (type === validTypes[0]) {
      result = await Individual.findOne({ _id: id });
    } else {
      result = await Institute.findOne({ _id: id });
    }
    if (!result) {
      return res.send({
        msg: "No Account exists with the given wallet ID",
      });
    }

    //verifying old password
    let answer = result.comparePassword(
      req.body.old,
      async (err, isMatch = false) => {
        if (err) {
          return res.send({
            status: "Failed",
            msg: "Wrong Password!!",
          });
        }
        if (!isMatch) {
          return res.send({
            status: "Failed",
            msg: "Wrong Old Password!!",
          });
        }
      }
    );
    console.log(answer);
    return;
    //verify new and confirm password
    if (req.body.new !== req.body.confirm) {
      return res.send({
        status: "Failed",
        msg: "New and Confirm Passwords don't match!!",
      });
    }

    //updating password
    let body;
    if (type === validTypes[0]) {
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
    if (type === validTypes[0]) {
      result = await Individual.create({ _id: digest, ...body });
    } else {
      result = await Institute.create({ _id: digest, ...body });
    }
    result = await result.save();
    console.log(result);

    return res.send({
      status: "Success",
      message: "Password Changed successfully!!",
      hash: digest,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      msg: "some error occured!!",
    });
  }
});

app.listen(port, () => console.log(`Server started on ${port}`));
