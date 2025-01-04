import { Request, Response } from "express";
import { pool } from "../Config/DBConn";

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password is required" });
  }

  try {
    const users = await pool.query("SELECT * FROM users");
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(200).json(error);
  }
};
