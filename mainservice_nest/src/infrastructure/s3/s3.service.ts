import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      
     
      secretAccessKey: 'admin123',
      s3ForcePathStyle: true, // needed for MinIO
      signatureVersion: 'v4',
    });
  }

  async createBucket(bucketName: string): Promise<void> {
    try {
      await this.s3.createBucket({ Bucket: bucketName }).promise();
      console.log(`Bucket ${bucketName} created successfully`);
      this.logger.log(`Bucket ${bucketName} created successfully`);
    } catch (error) {
      this.logger.error(`Error creating bucket ${bucketName}`, error.stack);
      throw error;
    }
  }

  async uploadFile(bucketName: string, objectName: string, fileContent: Buffer | string): Promise<string> {
    try {
      await this.s3.putObject({
        Bucket: bucketName,
        Key: objectName,
        Body: fileContent,
      }).promise();

      this.logger.log(`File ${objectName} uploaded successfully to ${bucketName}`);

      return this.getFileUrl(bucketName, objectName);
    } catch (error) {
      this.logger.error(`Error uploading file ${objectName} to ${bucketName}`, error.stack);
      throw error;
    }
  }

  async downloadFile(bucketName: string, objectName: string, downloadPath: string): Promise<void> {
    try {
      const data = await this.s3.getObject({
        Bucket: bucketName,
        Key: objectName,
      }).promise();
      require('fs').writeFileSync(downloadPath, data.Body);
      this.logger.log(`File ${objectName} downloaded successfully from ${bucketName}`);
    } catch (error) {
      this.logger.error(`Error downloading file ${objectName} from ${bucketName}`, error.stack);
      throw error;
    }
  }

  getFileUrl(bucketName: string, objectName: string): string {
    return `${this.s3.endpoint.href}${bucketName}/${objectName}`;
  }
}
