// import client from "./mongoDbConnect";
const hash = require("crypto").createHash;
const {recoverPersonalSignature} = require("@metamask/eth-sig-util");
const nodeApp = require("./mongoDbConnect").client.db("NodeApp");
const {app} = require("./expressSetup")
const {toHex, validateIndividualJson} = require("./utilities");

const port = 3002;

//methods for digital signature
app.get("/nonce",(req,res)=>{
    const generatedNonce = Math.floor(Math.random()*1000000).toString();

    return res.send({
        nonce: generatedNonce,
    });
});

app.post("/verifySignature",(req,res)=>{
    console.log("verify signature called");
    const ogNonce = req.body.ogNonce;
    const sig = req.body.signature;
    const address = req.body.address;

    const verifiedNonce = recoverPersonalSignature({
        data: `0x${toHex(ogNonce)}`,
        signature: sig,
    });
    console.log("verify signature ended");

    return res.send({
        verified: (verifiedNonce === address),
    });
});

//IndividualUser
app.post("/api/Individual/createUser",async(req,res)=>{
    try{
        // console.log(req.body);
        // const data=req.body;
        //Validation
        const error = validateIndividualJson(req.body);

        if (error){
            res.send({
                "status":"Failed",
                "message":"Sent data is not valid!"
            })
        }

        //Calculating the hash
        let digest = hash("sha256").update(JSON.stringify(req.body)).digest("hex");

        //Saving it in mongo db
        const IndividualUsers = nodeApp.collection("IndividualUsers");
        await IndividualUsers.insertOne({_id:digest,...req.body})
        res.send({
                "status":"Success",
                "message":"User Created successfully!!",
                "hash":digest
            });
        
    }catch(err){
        res.send({
            "status":"Failed!!",
            "message":err
        });
    }
})

app.post("/api/Individual/login",(req,res)=>{

})

//Institutes
app.post("/api/Institute/createUser",async(req,res)=>{
    const Institutes = nodeApp.collection("Institutes");
    console.log(req.body);
    await Institutes.insertOne(req.body).catch(res=>{
        console.log(object);
    });
    res.send({
        "Status":"Success!!"
    })
})

app.post("/api/Individual/checkId",async(req,res)=>{
    let address = req.body.address;
    try{
        const IndividualUsers = nodeApp.collection("Individual");
        const result = await IndividualUsers.findOne({metamaskId: address})
        .catch(err=>res.status(500).send({
            msg:"Couldn't connect to database!!",

        }));
        console.log(result);
        if (result){
            return res.send({
                "Existing":true
            })
        }
        return res.send({
            "Existing":false
        })
    }catch(err){
        res.status(500).send({
            msg:err
        })
    }
})
app.post("/api/Institute/checkId",async(req,res)=>{
    let address = req.body.address;
    try{
        const Institute = nodeApp.collection("Institute");
        const result = await Institute.findOne({metamaskId: address})
        .catch(err=>res.status(500).send({
            msg:"Couldn't connect to database!!",

        }));
        console.log(result);
        if (result){
            return res.send({
                "Existing":true
            })
        }
        return res.send({
            "Existing":false
        })
    }catch(err){
        res.send({
            msg:err
        })
    }
})

app.listen(port,()=>console.log(`Server started on ${port}`));
