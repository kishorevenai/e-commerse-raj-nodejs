import express from "express";
import { login } from "../Controller/authController";

export const authRoute = express.Router();

authRoute.route("/").get(login());
