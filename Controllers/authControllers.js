import User from "../Models/userModel.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } =req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashPassword, role });
    await newUser.save();
    res
      .status(200)
      .json({ message: "User Registered Successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    user.token = token;
    await user.save();
    res
      .status(200)
      .json({ message: "User Logged In Successfully", token: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//forget password page

export const forgetPassword=async(req,res)=>{
try {
  const {email}=req.body
  const user=await User.findOne({email})
  if(!user){
    return res.status(404).json({message:"User Not Found"})
  }
  const Token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const transporter = nodemailer.createTransport({
    service: "Gmail",
  
    auth: {
      user: process.env.PASS_MAIL,
      pass: process.env.PASS_KEY,
    },
  });
  const mailOption={
    from:process.env.PASS_MAIL,
    to:user.email,
    subject:"password Reset Link",
    text: `That receving message is reset your password and your account.
    Pleace click the link and complete in our browser proceess
    http://localhost:5173/reset-password/${user._id}/${Token}`
   };
   transporter.sendMail(mailOption,function(error,info){
    if(error){
      console.log(error);
      res.status(500).json({message:"Internal server error"})      
    }
    else{
      res.status(200).json({message:"Email Sent Successfully"})
    }
   })
  }
 catch (error) {
  res.status(500).json({message:error.message})
}
};

export const resetPassword=async(req,res)=>{
  const {id,token}= req.params
  const {password} = req.body
  jwt.verify(token,process.env.JWT_SECRET,(error,decoded)=>{
    if(error){
      return res.status(404).json({message:"Invaild token"})
    }
    else{
      bcrypt.hash(password,10)
      .then(hash=>{
        User.findByIdAndUpdate({_id:id},{password:hash})
        .then(ele=>res.send({status:"Success"}))
        .catch(error=>res.send({status:error}))
      })
    }
  })
} 