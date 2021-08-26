
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");
const _ = require("lodash");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));

mongoose.connect("mongodb://localhost:27017/image-db",{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false});

const schema = new mongoose.Schema({
    fname: String,
    lname: String,
    url: String
});
const image = mongoose.model("images", schema);

const port = process.env.port || 3000;
app.listen(port, ()=>{
    console.log(`server running at port ${port}`);
});


const DIR = "./public/Upload/";

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null,DIR);
    },
    filename: (req,file,cb)=>{
        const fileName = file.originalname.toLocaleLowerCase().split(' ').join('-');
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req,file,cb) =>{
        if(file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "image/jpeg"){
            cb(null, true);
        }else{
            cb(null, false);
            return cb(new Error("Only jpg png and jpeg formet allowed"));
        }
    }
    
});


app.get("/", (req,res)=>{
    res.render("index");
});

app.post("/", upload.single("image"), (req,res)=>{
    const data = new image({
        _id: new mongoose.Types.ObjectId(),
        fname: _.capitalize(req.body.fname),
        lname:_.capitalize(req.body.lname),
        url: req.file.path
    });

    data.save((err)=>{
        console.log(err);
    });
    res.redirect("/");
});

app.get("/find", (req,res)=>{
    res.render("show");
})

app.post("/find", (req,res)=>{
    const person = _.capitalize(req.body.fname);
    // console.log(person);

    image.findOne({fname: person}, function(err,doc){
        if(!err){
            const imgUrl= doc.url.substring(7);
            res.render("result", {FN: doc.fname, LN: doc.lname, IMG: imgUrl, ID: doc.id});
        }else{
            res.redirect("/");
        }
    })
});

app.get("/delete",(req,res)=>{
    res.render("show");
});

app.post("/delete", (req,res)=>{
    const id =req.body.delete;
    const path = "public/" + req.body.Path;
    console.log("path: "+ path);
    image.deleteOne({_id: id}, (err)=>{
        if(err){ console.log(err);}
        console.log("Successfuly deleted");
    });

    fs.unlink(path,(err)=>{
        if(err){ console.log(err + " in unlink method"); }
        console.log("Deleted file");
    });
 
    res.redirect("/find");

});












































// const handleError = (err,res)=>{
//     console.log(err);
//     res
//         .status(500)
//         .contentType("text/plain")
//         .end("opps! something went wrong");
// }
// const type = uploads.fields([{ name: "getfile", maxCount: 15}]);

// console.log(process.env.path);

// app.post("/", uploads.single("getfile"), (req,res)=>{
//     const tempath = req.file.path;
//     const targetPath = path.join(__dirname, "public/Upload/image"+ Math.random()*20);
//     console.log("file path: "+ tempath + " target path: " + targetPath);

//         if(path.extname(req.file.originalname).toLowerCase() === ".png"){
//             fs.rename(tempath,targetPath,err =>{
//                 if(err) return handleError(err,res);
//                     res
//                         .status(200)
//                         .contentType("text/plain")
//                         .end("File uploaded!");
//             });
//         }
//         else{
//             fs.unlink(tempath,err =>{
//                 if(err) return handleError(err,res);
//                     res
//                         .status(200)
//                         .contentType("text/plain")
//                         .end("File uploaded!");
//             })
//         }
// }
// );