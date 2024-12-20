import express from "express";
import { forgetPassword, loginUser, registerUser, resetPassword } from "../Controllers/authControllers.js";
import { stringtoken } from "../Controllers/authControllers.js";


const router=express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/forget-password",forgetPassword)
router.post("/reset-password/:stringtoken",resetPassword)

export default router;
