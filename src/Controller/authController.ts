import { Request, Response } from "express";
import { pool } from "../Config/DBConn";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const { password, email } = req.body;
  if (!password || !email) {
    return res
      .status(400)
      .json({ message: "Username and password is required" });
  }

  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    const verfiy_password = await bcrypt.compare(password, rows[0].password);

    if (verfiy_password) {
      const accessToken = jwt.sign(
        { userInfo: rows[0] },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
      );
      return res.status(200).json({ accessToken });
    } else return res.status(401).json({ error: "Unauthorized" });
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const register_user = async (req: Request, res: Response) => {
  const { name, email, password, address, phone } = req.body;

  if (!name || !email || !password || !address || !phone)
    return res.status(400).json({ message: "Please fill the required fields" });

  console.log(name, email, password, address, phone);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query("BEGIN");

    const userResult = await pool.query(
      `INSERT INTO users (name,email,password,address,phone) 
         VALUES ($1, $2, $3, $4 ,$5) 
         RETURNING user_id`,
      [name, email, hashedPassword, address, phone]
    );

    const userId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO user_roles (user_id, role_id) 
         VALUES ($1, (SELECT role_id FROM roles WHERE role_name = 'customer'))`,
      [userId]
    );
    await pool.query("COMMIT");

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    await pool.query("ROLLBACK");
    return res.status(400).json({ error: error });
  }
};

export const refresh_token = (req: Request, res: Response) => {
  const {} = req.body;
};
