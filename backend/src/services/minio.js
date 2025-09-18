const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
});

const BUCKETS = {
  AVATARS: 'avatars',
  CHAT_MEDIA: 'chat-media',
  TTS_AUDIO: 'tts-audio',
  FANTASY_MEDIA: 'fantasy-media',
  BACKUPS: 'backups',
  TEMP: 'temp'
};

// Initialize MinIO buckets
async function initializeMinIO() {
  try {
    console.log('Initializing MinIO buckets...');
    
    for (const [name, bucket] of Object.entries(BUCKETS)) {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        console.log(`Created bucket: ${bucket}`);
        
        // Set bucket policy for avatars and public content
        if (bucket === BUCKETS.AVATARS) {
          const policy = {
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`]
            }]
          };
          await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
        }
      } else {
        console.log(`Bucket exists: ${bucket}`);
      }
    }
    
    console.log('✅ MinIO initialization complete');
    return true;
  } catch (error) {
    console.error('MinIO initialization failed:', error);
    throw error;
  }
}

// Upload file to MinIO
async function uploadFile(bucketName, objectName, fileStream, size, metadata = {}) {
  try {
    const result = await minioClient.putObject(bucketName, objectName, fileStream, size, metadata);
    console.log(`File uploaded: ${bucketName}/${objectName}`);
    return result;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

// Get presigned URL for file access
async function getPresignedUrl(bucketName, objectName, expiry = 24 * 60 * 60) {
  try {
    const url = await minioClient.presignedGetObject(bucketName, objectName, expiry);
    return url;
  } catch (error) {
    console.error('Failed to generate presigned URL:', error);
    throw error;
  }
}

// Get presigned URL for file upload
async function getPresignedUploadUrl(bucketName, objectName, expiry = 60 * 60) {
  try {
    const url = await minioClient.presignedPutObject(bucketName, objectName, expiry);
    return url;
  } catch (error) {
    console.error('Failed to generate presigned upload URL:', error);
    throw error;
  }
}

// Delete file from MinIO
async function deleteFile(bucketName, objectName) {
  try {
    await minioClient.removeObject(bucketName, objectName);
    console.log(`File deleted: ${bucketName}/${objectName}`);
    return true;
  } catch (error) {
    console.error('File deletion failed:', error);
    throw error;
  }
}

// List files in bucket
async function listFiles(bucketName, prefix = '', recursive = false) {
  try {
    const objects = [];
    const stream = minioClient.listObjects(bucketName, prefix, recursive);
    
    return new Promise((resolve, reject) => {
      stream.on('data', obj => objects.push(obj));
      stream.on('error', reject);
      stream.on('end', () => resolve(objects));
    });
  } catch (error) {
    console.error('Failed to list files:', error);
    throw error;
  }
}

// Get file info
async function getFileInfo(bucketName, objectName) {
  try {
    const stat = await minioClient.statObject(bucketName, objectName);
    return stat;
  } catch (error) {
    console.error('Failed to get file info:', error);
    throw error;
  }
}

// Copy file within MinIO
async function copyFile(sourceBucket, sourceObject, destBucket, destObject) {
  try {
    await minioClient.copyObject(destBucket, destObject, `${sourceBucket}/${sourceObject}`);
    console.log(`File copied: ${sourceBucket}/${sourceObject} -> ${destBucket}/${destObject}`);
    return true;
  } catch (error) {
    console.error('File copy failed:', error);
    throw error;
  }
}

// Generate unique filename
function generateUniqueFilename(originalName, userId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${userId}/${timestamp}-${random}.${extension}`;
}

// Validate file type
function validateFileType(mimetype, allowedTypes) {
  return allowedTypes.includes(mimetype);
}

// Get file size limit based on type
function getFileSizeLimit(fileType) {
  const limits = {
    image: 10 * 1024 * 1024,   // 10MB
    audio: 50 * 1024 * 1024,   // 50MB
    video: 100 * 1024 * 1024,  // 100MB
    document: 25 * 1024 * 1024 // 25MB
  };
  return limits[fileType] || limits.document;
}

module.exports = {
  minioClient,
  BUCKETS,
  initializeMinIO,
  uploadFile,
  getPresignedUrl,
  getPresignedUploadUrl,
  deleteFile,
  listFiles,
  getFileInfo,
  copyFile,
  generateUniqueFilename,
  validateFileType,
  getFileSizeLimit
};