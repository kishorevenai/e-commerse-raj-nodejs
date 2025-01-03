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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const bucket_name = process.env.BUCKET_NAME;
const bucket_region = process.env.BUCKET_REGION;
const s3_access_key = process.env.S3_ACCESS_KEY;
const s3_access_id = process.env.S3_ACCESS_ID;
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: s3_access_id,
        secretAccessKey: s3_access_key,
    },
    region: bucket_region,
});
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
console.log("CHECKING");
app.post("/api/posts", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const alteredBufferImage = (0, sharp_1.default)(req.file.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();
    const randomImageName = (bcrypt = 32) => crypto_1.default.randomBytes(bcrypt).toString("hex");
    const params = {
        Bucket: bucket_name,
        Key: randomImageName() + req.file.originalname,
        Body: alteredBufferImage,
        ContentType: req.file.mimetype,
    };
    const command = new client_s3_1.PutObjectCommand(params);
    try {
        yield s3.send(command);
        return res.status(200).json({ message: "Uploaded successfully" });
    }
    catch (error) {
        console.error("S3 Upload Error:", error);
        return res
            .status(400)
            .json({ message: "Upload failed", error: error.message });
    }
}));
app.listen(PORT, () => {
    console.log(`The server running on port ${PORT}`);
});
