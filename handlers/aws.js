const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const sharp = require('sharp');
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const s3 = new AWS.S3();
const maxSize = 5 * 1000 * 1000;
/* TODO Resize */
const multerOptions = {
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    bucketPath: 'images',
    acl: 'public-read',
    limits: {
      fileSize: maxSize,
      files: 5,
      fields: 5,
    },
    folder: 'images',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function(req, file, cb) {
      const extension = file.mimetype.split('/')[1]; // gets the extension
      const area = req.body.area;
      fileName = `${area}${uuid.v4()}.${extension}`;
      cb(null, fileName);
    },
    shouldTransform: function(req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: 'original',
        /*         key: function(req, file, cb) {
          const extension = file.mimetype.split('/')[1]; // gets the extension
          const area = req.body.area;
          fileName = `${area}${uuid.v4()}.${extension}`;
          cb(null, fileName);
        }, */
        transform: function(req, file, cb) {
          console.log('transform');
          cb(null, sharp().resize(100));
        },
      },
    ],
  }),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true); // null for error means it worked and it is fine to continue to next()
    } else {
      next({ message: 'Fotos: Tipo de arquivo não suportado!' }, false); // with error
    }
  },
};

exports.upload = multer(multerOptions).array('photos', 5);
