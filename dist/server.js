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
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const authRoutes_1 = require("./Routes/authRoutes");
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
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
app.use("/auth", authRoutes_1.authRoute);
app.post("/api/posts", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const alteredBufferImage = yield (0, sharp_1.default)(req.file.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();
    const randomImageName = (bcrypt = 32) => crypto_1.default.randomBytes(bcrypt).toString("hex");
    const params = {
        Bucket: bucket_name,
        Key: randomImageName() + req.file.originalname,
        Body: alteredBufferImage,
        ContentType: req.file.mimetype,
    };
    console.log(params);
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
app.get("/api/get-all-products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getObjectParams = {
        Bucket: bucket_name,
        Key: "fdbb6010db4af1140c1cfe53c47fef5ba660b0dc34fe751234a032a9501a18c3personTwo.png", // Correct 'Key' property
    };
    try {
        const command = new client_s3_1.GetObjectCommand(getObjectParams);
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
        return res.status(200).json({ data: url });
    }
    catch (error) {
        console.error("S3 GetObject Error:", error.message);
        return res
            .status(400)
            .json({ message: "Failed to fetch object", error: error.message });
    }
}));
app.delete("/api/delete-image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Bucket: bucket_name,
        Key: "fdbb6010db4af1140c1cfe53c47fef5ba660b0dc34fe751234a032a9501a18c3personTwo.png", // Correct 'Key' property
    };
    try {
        const command = new client_s3_1.DeleteObjectCommand(params);
        yield s3.send(command);
        return res.status(200).json({ message: "Image Deleted Successfully" });
    }
    catch (error) {
        return res
            .status(400)
            .json({ message: "Failed to fetch object", error: error });
    }
}));
app.listen(PORT, () => {
    console.log(`The server running on port ${PORT}`);
});
