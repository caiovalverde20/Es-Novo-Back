const path = require('path');
const fs = require('fs');
const mime = require('mime');
const aws = require('aws-sdk');

const multerConfig = require('../middlewares/Multer');

const client = new aws.S3({region: process.env.AWS_DEFAULT_REGION});


module.exports = {
   async saveFile(filename, directory) {
      const originalPath = path.resolve(multerConfig.directory, filename);
    
      const ContentType = mime.getType(originalPath);

      if (!ContentType) {
         throw new Error('File not found');
      }
       
      const fileContent = await fs.promises.readFile(originalPath);

      const key = directory + filename;

      client.putObject({
         Bucket: process.env.AWS_BUCKET_NAME,
         Key: key,
         ACL: 'public-read',
         Body: fileContent,
         ContentType,
      }).promise();

      await fs.promises.unlink(originalPath);

      const [type, ] = ContentType.split('/')

      const media = {
         url: process.env.AWS_BUCKET_URL + key,
         key: key,
         type,
      }

      return media;
   },

   async saveFiles(array, directory) {
      const medias = [];

      for (let { filename } of array) {
         let media = await this.saveFile(filename, directory);
         medias.push(media);
      }
      
      return medias;
   },

   async deleteFile(key) {
      await client.deleteObject({
         Bucket: process.env.AWS_BUCKET_NAME,
         Key: key,
      }).promise();
   }
}