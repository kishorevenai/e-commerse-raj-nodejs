import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import sharp, { fit } from "sharp";
import sharp from "sharp";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const bucket_name = process.env.BUCKET_NAME;
const bucket_region = process.env.BUCKET_REGION;
const s3_access_key = process.env.S3_ACCESS_KEY;
const s3_access_id = process.env.S3_ACCESS_ID;

const s3 = new S3Client({
  credentials: {
    accessKeyId: s3_access_id!,
    secretAccessKey: s3_access_key!,
  },
  region: bucket_region!,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cookieParser());
app.use(express.json());

console.log("CHECKING");

app.post(
  "/api/posts",
  upload.single("image"),
  async (req: Request, res: Response): Promise<any> => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const alteredBufferImage = sharp(req.file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();

    const randomImageName = (bcrypt = 32) =>
      crypto.randomBytes(bcrypt).toString("hex");

    const params = {
      Bucket: bucket_name!,
      Key: randomImageName() + req.file.originalname,
      Body: alteredBufferImage,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    try {
      await s3.send(command);
      return res.status(200).json({ message: "Uploaded successfully" });
    } catch (error) {
      console.error("S3 Upload Error:", error);
      return res
        .status(400)
        .json({ message: "Upload failed", error: (error as Error).message });
    }
  }
);

app.listen(PORT, () => {
  console.log(`The server running on port ${PORT}`);
});
