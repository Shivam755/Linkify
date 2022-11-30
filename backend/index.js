// import client from "./mongoDbConnect";
const hash = require("crypto").createHash;
const {recoverPersonalSignature} = require("@metamask/eth-sig-util");
const nodeApp = require("./mongoDbConnect").client.db("NodeApp");
const {app} = require("./expressSetup")
const {toHex, validateIndividualJson} = require("./utilities");

const port = 3002;
const validTypes = ["Individual","Institute"]

//methods for digital signature
app.get("/nonce",(req,res)=>{
    const generatedNonce = Math.floor(Math.random()*1000000).toString();

    return res.send({
        nonce: generatedNonce,
    });
});

app.post("/verifySignature",(req,res)=>{
    const ogNonce = req.body.ogNonce;
    const sig = req.body.signature;
    const address = req.body.address;

    const verifiedNonce = recoverPersonalSignature({
        data: `0x${toHex(ogNonce)}`,
        signature: sig,
    });

    return res.send({
        verified: (verifiedNonce === address),
    });
});

app.post("/api/checkId",async(req,res)=>{
    let address = req.body.address;
    let type = req.body.type;
    if (!validTypes.includes(type)){
        res.send({
            status:"Failed!",
            msg:"Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'."
        })
    }
    try{
        const collection = nodeApp.collection(type);
        const result = await collection.findOne({metamaskId: address})
        .catch(err=>res.status(500).send({
            status:"Failed!",
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
            status:"Failed!",
            msg:err
        })
    }
})

app.post("/api/getName",async(req,res) =>{
    let address = req.body.address;
    let type = req.body.type;
    if (!validTypes.includes(type)){
        res.send({
            msg:"Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'."
        })
    }
    try{
        const collection = nodeApp.collection(type);
        const result = await collection.findOne({metamaskId: address})
        // .then(res => res.json())
        .catch(err=>{
            console.log(err);
            res.status(500).send({
                msg:"Couldn't connect to database!!",
            })
        });
        console.log(result.password);
        if (result){
            return res.send({
                "name":res.name,
            })
        }
        return res.send({
            "msg":"No Account exists with the given wallet ID",
        })
    }catch(err){
        res.send({
            msg:err
        })
    }
})

app.post("/api/login",async(req,res)=>{
    let address = req.body.address;
    let type = req.body.type;
    if (!validTypes.includes(type)){
        res.send({
            msg:"Invalid account type!!!\nPossbile types are 'Individual' or 'Institute'."
        })
    }
    try{
        const collection = nodeApp.collection(type);
        const result = await collection.findOne({metamaskId: address})

        if (result){
            let pass = hash("sha512").update(req.body.password).digest("hex");
            if (pass === result.password){
                return res.send({
                    "status":"Success",
                    msg:"Login successful!!"
                })
            }
            return res.send({
                status: "Failed",
                msg:"Wrong Password!!"
            })
        }
        return res.send({
            "msg":"No Account exists with the given wallet ID",
        })
    }catch(err){
        console.log(err)
        // return res.send({
        //     msg:err
        // })
    }
})
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
        req.body.password = hash("sha512").update(req.body.password).digest("hex");
        //Saving it in mongo db
        const Individual = nodeApp.collection("Individual");
        await Individual.insertOne({_id:digest,...req.body});
        res.send({
                "status":"Success",
                "message":"User Created successfully!!",
                "hash":digest
            });
        
    }catch(err){
        console.log(err);
        res.send({
            "status":"Failed!!",
            "message":err
        });
    }
})

//Institutes
app.post("/api/Institute/createUser",async(req,res)=>{
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
        req.body.password = hash("sha512").update(req.body.password).digest("hex");
        //Saving it in mongo db
        const Individual = nodeApp.collection("Institute");
        await Individual.insertOne({_id:digest,...req.body});
        res.send({
                "status":"Success",
                "message":"User Created successfully!!",
                "hash":digest
            });
        
    }catch(err){
        console.log(err);
        res.send({
            "status":"Failed!!",
            "message":err
        });
    }
})



app.listen(port,()=>console.log(`Server started on ${port}`));
