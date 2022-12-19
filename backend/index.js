const hash = require("crypto").createHash;
const jwt = require("jsonwebtoken");
const { recoverPersonalSignature } = require("@metamask/eth-sig-util");
// const nodeApp = require("./clientConnect").client.db("NodeApp");
const client = require("./mongoDbConnect");
const { app } = require("./expressSetup");
const { toHex, validateIndividualJson } = require("./utilities");
const passport = require("./middlewares/auth");
const Individual = require("./model/Individual");
const Institute = require("./model/Institute");

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
    verified: verifiedNonce === address,
  });
});

app.post("/api/checkId", async (req, res) => {
  let address = req.body.address;
  let type = req.body.type;
  if (!validTypes.includes(type)) {
    res.send({
      status: "Failed!",
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    // const collection = nodeApp.collection(type);
    // const result = await collection
    //   .findOne({ metamaskId: address })
    // .catch((err) =>
    //   res.status(500).send({
    //     status: "Failed!",
    //     msg: "Couldn't connect to database!!",
    //   })
    // );
    // console.log(client);
    // const result = await client
    //   .then(async () => {
    //     let res;
    //     if (type === validTypes[0]) {
    //       res = await Individual.findOne({ metamaskId: address });
    //     } else {
    //       res = await Institute.findOne({ metamaskId: address });
    //     }
    //     return res;
    //   })
    //   .catch((err) =>
    //     res.status(500).send({
    //       status: "Failed!",
    //       msg: "Couldn't connect to database!!",
    //     })
    //   );
    let result;
    if (type === validTypes[0]) {
      result = await Individual.findOne({ metamaskId: address });
    } else {
      result = await Institute.findOne({ metamaskId: address });
    }
    // console.log(result);
    if (result) {
      return res.send({
        Existing: true,
      });
    }
    return res.send({
      Existing: false,
    });
  } catch (err) {
    res.send({
      status: "Failed!",
      msg: err,
    });
  }
});

app.post("/api/getName", async (req, res) => {
  let address = req.body.address;
  let type = req.body.type;
  if (!validTypes.includes(type)) {
    res.send({
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    const collection = nodeApp.collection(type);
    const result = await collection.findOne({ metamaskId: address });
    // .then(res => res.json())
    // .catch((err) => {
    //   console.log(err);
    //   res.status(500).send({
    //     msg: "Couldn't connect to database!!",
    //   });
    // });
    console.log(result.password);
    if (result) {
      return res.send({
        name: result.name,
      });
    }
    return res.send({
      msg: "No Account exists with the given wallet ID",
    });
  } catch (err) {
    res.send({
      msg: err,
    });
  }
});

app.post("/api/login", async (req, res) => {
  let hash = req.body.hash;
  let type = req.body.type;
  if (!validTypes.includes(type)) {
    res.send({
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
    // console.log(result);
    if (result) {
      // let pass = hash("sha512").update(req.body.password).digest("hex");
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
    res.send({
      msg: "Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'.",
    });
  }
  try {
    // const collection = nodeApp.collection(type);
    let result;
    if (type === validTypes[0]) {
      result = await Individual.findOne({ _id: hash });
      if (result) {
        return res.send({
          profile: {
            metamaskId: result.metamaskId,
            name: result.name,
            birthDate: result.birthDate,
            qualification: result.qualification,
            designation: result.designation,
          },
        });
      }
    } else {
      result = await Institute.findOne({ _id: hash });
    }
    console.log(result);
    // const result = await collection
    //   .findOne({ metamaskId: address })
    //   // .then(res => res.json())
    //   .catch((err) => {
    //     console.log(err);
    //     res.status(500).send({
    //       msg: "Couldn't connect to database!!",
    //     });
    //   });

    return res.send({
      msg: "No Account exists with the given wallet ID",
    });
  } catch (err) {
    console.log(err);
    res.send({
      msg: "some error occured!!",
    });
  }
});

// app.post("/api/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.send({
//         msg: "Error logging out",
//         err: err,
//         status: "Failed",
//       });
//     }
//     return res.send({
//       status: "Success",
//       msg: "Successfully Logged out!!",
//     });
//   });
// });

//IndividualUser
app.post("/api/Individual/createUser", async (req, res) => {
  try {
    // console.log(req.body);
    // const data=req.body;
    //Validation
    const error = validateIndividualJson(req.body);

    if (error) {
      res.send({
        status: "Failed",
        message: "Sent data is not valid!",
      });
    }

    let body = {
      metamaskId: req.body.metamaskId,
      name: req.body.name,
      birthDate: req.body.birthDate,
      qualification: req.body.qualification,
      designation: req.body.designation,
      password: req.body.password,
      documentList: req.body.documentList,
    };
    //Calculating the hash
    let digest = hash("sha256").update(JSON.stringify(body)).digest("hex");
    // req.body.password = hash("sha512").update(req.body.password).digest("hex");
    //Saving it in mongo db
    // const Individual = nodeApp.collection("Individual");
    // await Individual.insertOne({ _id: digest, ...req.body });
    // console.log(client);
    // const res = await client.then(async () => {
    //   let res = new Individual.create({ _id: digest, ...body });
    //   res = res.save();
    //   return res;
    // });
    let result = await Individual.create({ _id: digest, ...body });
    result = await result.save();
    // return result;
    console.log(result);
    res.send({
      status: "Success",
      message: "User Created successfully!!",
      hash: digest,
    });
  } catch (err) {
    console.log(err);
    res.send({
      status: "Failed!!",
      message: err,
    });
  }
});

//Institutes
app.post("/api/Institute/createUser", async (req, res) => {
  try {
    // console.log(req.body);
    // const data=req.body;
    //Validation
    const error = validateIndividualJson(req.body);

    if (error) {
      res.send({
        status: "Failed",
        message: "Sent data is not valid!",
      });
    }

    //Calculating the hash
    let digest = hash("sha256").update(JSON.stringify(req.body)).digest("hex");
    req.body.password = hash("sha512").update(req.body.password).digest("hex");
    //Saving it in mongo db
    const Individual = nodeApp.collection("Institute");
    await Individual.insertOne({ _id: digest, ...req.body });
    res.send({
      status: "Success",
      message: "User Created successfully!!",
      hash: digest,
    });
  } catch (err) {
    console.log(err);
    res.send({
      status: "Failed!!",
      message: err,
    });
  }
});

app.listen(port, () => console.log(`Server started on ${port}`));
