import express from "express";
import {
  login,
  register_user,
  refresh_token,
} from "../Controller/authController";

export const authRoute = express.Router();

//@ts-ignore
authRoute.route("/register").post(register_user);
//@ts-ignore
authRoute.route("/login").post(login);

authRoute.route("/refresh").get(refresh_token);
