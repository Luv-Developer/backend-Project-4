const express = require("express")
const app = express()
const port = 3000
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const path  = require("path")
const connection = require("./config/connection")
const usermodel = require("./model/user")
const {body,validationResult} = require("express-validator")
const cookieParser = require("cookie-parser")
const { hash } = require("crypto")
const { rmSync } = require("fs")
const multer = require("multer")
const crypto = require("crypto")
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")))
app.get("/",(req,res)=>{
    res.render("homepage")
})
app.get("/register",(req,res)=>{
    res.render("register")
})
app.post("/register",async(req,res)=>{
    let {username,email,password} = req.body
    let user = await usermodel.findOne({username})
    if(user){
        res.send("User already Exists")
    }
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
                let user = await usermodel.create({
                    username,
                    email,
                    password:hash
                })
        })
        let token = jwt.sign({email:email},"hehe")
        res.cookie("token",token)
        res.send("Registered")
    })
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/login",async(req,res)=>{
    let {email,password} = req.body
    let user = await usermodel.findOne({email})
    if(!user){
        res.render("register")
    }
    bcrypt.compare(password,user.password,(err,result)=>{
        if(result){
            let token = jwt.sign({email:email},"hehe")
            res.cookie("token",token)
            res.render("homepage")
        }
        else{
            res.send("Something went wrong")
        }
    })
})
app.get("/drive",isloggedin,async(req,res)=>{
    let user = await usermodel.findOne({email:req.user.email})
    console.log(user)
    res.render("drive",{user})
})
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12,(err,bytes)=>{
            let fn = bytes.toString("hex") + path.extname(file.originalname)
            cb(null,fn)
        })
    }
  })
  
const upload = multer({ storage: storage })
app.post("/drive",upload.single("image"),(req,res)=>{
    console.log(req.file)
})
app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.render("login")
})
function isloggedin(req,res,next){
    if(req.cookies.token==""){
        res.render("login")
        next()
    }
    else{
        let data = jwt.verify(req.cookies.token,"hehe")
        req.user = data
        next()
    }
}
app.listen(port,()=>{
    console.log(`App is listening at ${port}`)
})