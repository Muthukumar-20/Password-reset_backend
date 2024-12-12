import User from "../Models/userModel.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from 'crypto'; 

dotenv.config();

//ganrate the random string for forget password
function ganrateRandomString(){
  return crypto.randomBytes(32).toString("hex")
}
export const stringtoken = ganrateRandomString();


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
      .json({ message: "User Logged In Successfully", token: token ,userid: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//forget password page

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body; 
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    user.randomString = stringtoken;
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const transporter = nodemailer.createTransport({
      service: "Gmail", 
      auth: {
        user: process.env.PASS_MAIL,
        pass: process.env.PASS_KEY, 
      secure: true,
      tls: {
        rejectUnauthorized: false, 
      },
    }});


    const mailOptions = {
      from: process.env.PASS_MAIL,
      to: user.email,
      subject: "Password Reset Link",
      text: `You are receiving this message because you requested a password reset for your account.
    
      Please click on the following link to reset your password:

      https://password-reset-frontend-eight.vercel.app/reset-password/${stringtoken}

      This link will expire in 1 hour. If you did not request a password reset, please ignore this email.

      Sincerely,

     Your friend`, 
    };
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Password reset email sent successfully. Please check your inbox.Email Sent Successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    console.error("Error in forgetPassword:", error);
    res.status(500).json({ message: error.message }); 
  }
};


export const resetPassword=async(req,res)=>{
  const { stringtoken } = req.params;
  const {password} = req.body
  jwt.verify( stringtoken,process.env.JWT_SECRET,(error,decoded)=>{
    if(error){
      return res.status(404).json({message:error.message})
    }
    else{
      bcrypt.hash(password,10)
      .then(hash=>{
        User.findByIdAndUpdate({_id:id},{password:hash},{randomString:""})
        .then(ele=>res.send({status:"Success"}))
        .catch(err => res.status(500).send({ status: err.message }));
      })
    }
  })
 }; 


