import {
  Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { v2 as cloudinary } from 'cloudinary';
import * as multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' | 'raw' = 'image',
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: `bayit/${folder}`, resource_type: resourceType },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      )
      .end(buffer);
  });
}

@Controller('api/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post('image')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const result = await uploadToCloudinary(file.buffer, 'properties', 'image');
    return result;
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  }))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const result = await uploadToCloudinary(file.buffer, 'videos', 'video');
    return result;
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  }))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const result = await uploadToCloudinary(file.buffer, 'documents', 'raw');
    return result;
  }

  @Post('receipt')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const result = await uploadToCloudinary(file.buffer, 'receipts', 'image');
    return result;
  }

  @Post('chat/image')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadChatImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return uploadToCloudinary(file.buffer, 'chat/images', 'image');
  }

  @Post('chat/video')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 30 * 1024 * 1024 },
  }))
  async uploadChatVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return uploadToCloudinary(file.buffer, 'chat/videos', 'video');
  }

  @Post('chat/voice')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadChatVoice(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return uploadToCloudinary(file.buffer, 'chat/voice', 'video');
  }

  @Post('chat/document')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
  }))
  async uploadChatDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return uploadToCloudinary(file.buffer, 'chat/documents', 'raw');
  }
}
