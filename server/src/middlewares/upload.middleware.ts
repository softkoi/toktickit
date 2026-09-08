import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import path from 'path';
import fs from 'fs';
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from '../services/attachment.service';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `att-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Unsupported file type') as any;
    err.code = 'UNSUPPORTED_FILE_TYPE';
    cb(err);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
}).single('file');

export function handleFileUpload(req: Request, res: Response, next: NextFunction) {
  upload(req, res, (err: any) => {
    if (err) {
      if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds 5MB limit',
          },
        });
      }

      if (err.code === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(415).json({
          success: false,
          error: {
            code: 'UNSUPPORTED_FILE_TYPE',
            message: 'Unsupported file type. Only JPG, PNG, WEBP, and PDF files are allowed.',
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: err.message || 'File upload error',
        },
      });
    }

    next();
  });
}
