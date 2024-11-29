import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Database/dbConfig.js";
import authRouter from "./Router/authRouter.js"

dotenv.config();

const app=express();


app.use(cors())
app.use(express.json())
connectDB();

try {
app.get("/",(req,res)=>{
    res.status(200).send("Welcome to backend")
    })
} catch (error) {
    res.status(500).send("Internal server error")
}
app.use("/api/auth",authRouter)

try {
    const port=process.env.PORT || 4000
    app.listen(port,()=>{
       console.log("Server started successfully and running on port");
       
    })
} catch (error) {
    res.status(500).send("Internal server error")
}
