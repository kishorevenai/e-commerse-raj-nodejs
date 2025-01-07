import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authRoute } from "./Routes/authRoutes";
import crypto from "crypto";
import sharp from "sharp";

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

app.use("/auth", authRoute);

app.post(
  "/api/posts",
  upload.single("image"),
  async (req: Request, res: Response): Promise<any> => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const alteredBufferImage = await sharp(req.file.buffer)
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

    console.log(params);

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

app.get(
  "/api/get-all-products",
  async (req: Request, res: Response): Promise<any> => {
    const getObjectParams = {
      Bucket: bucket_name!,
      Key: "fdbb6010db4af1140c1cfe53c47fef5ba660b0dc34fe751234a032a9501a18c3personTwo.png", // Correct 'Key' property
    };

    try {
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return res.status(200).json({ data: url });
    } catch (error: any) {
      console.error("S3 GetObject Error:", error.message);
      return res
        .status(400)
        .json({ message: "Failed to fetch object", error: error.message });
    }
  }
);

app.delete(
  "/api/delete-image",
  async (req: Request, res: Response): Promise<any> => {
    const params = {
      Bucket: bucket_name,
      Key: "fdbb6010db4af1140c1cfe53c47fef5ba660b0dc34fe751234a032a9501a18c3personTwo.png", // Correct 'Key' property
    };

    try {
      const command = new DeleteObjectCommand(params);
      await s3.send(command);

      return res.status(200).json({ message: "Image Deleted Successfully" });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Failed to fetch object", error: error });
    }
  }
);

app.listen(PORT, () => {
  console.log(`The server running on port ${PORT}`);
});
