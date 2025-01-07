"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh_token = exports.register_user = exports.login = void 0;
const DBConn_1 = require("../Config/DBConn");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email } = req.body;
    if (!password || !email) {
        return res
            .status(400)
            .json({ message: "Username and password is required" });
    }
    try {
        const { rows } = yield DBConn_1.pool.query(`SELECT * FROM users WHERE email = $1`, [
            email,
        ]);
        const verfiy_password = yield bcrypt_1.default.compare(password, rows[0].password);
        if (verfiy_password) {
            const accessToken = jsonwebtoken_1.default.sign({ userInfo: rows[0] }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
            return res.status(200).json({ accessToken });
        }
        else
            return res.status(401).json({ error: "Unauthorized" });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});
exports.login = login;
const register_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, address, phone } = req.body;
    if (!name || !email || !password || !address || !phone)
        return res.status(400).json({ message: "Please fill the required fields" });
    console.log(name, email, password, address, phone);
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        yield DBConn_1.pool.query("BEGIN");
        const userResult = yield DBConn_1.pool.query(`INSERT INTO users (name,email,password,address,phone) 
         VALUES ($1, $2, $3, $4 ,$5) 
         RETURNING user_id`, [name, email, hashedPassword, address, phone]);
        const userId = userResult.rows[0].id;
        yield DBConn_1.pool.query(`INSERT INTO user_roles (user_id, role_id) 
         VALUES ($1, (SELECT role_id FROM roles WHERE role_name = 'customer'))`, [userId]);
        yield DBConn_1.pool.query("COMMIT");
        return res.status(200).json({ message: "User registered successfully" });
    }
    catch (error) {
        yield DBConn_1.pool.query("ROLLBACK");
        return res.status(400).json({ error: error });
    }
});
exports.register_user = register_user;
const refresh_token = (req, res) => {
    const {} = req.body;
};
exports.refresh_token = refresh_token;
