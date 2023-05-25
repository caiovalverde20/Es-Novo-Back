const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp', 'uploads');
const maxSizeImg = 3 * 1024 * 1024;

module.exports = {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, tmpFolder);
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        const filename = `${hash.toString('hex')}-${file.originalname}`;

        cb(null, filename);
      });
    },
  }),
  limits: {
    fileSize: maxSizeImg
  },
  fileFilter: (req, file, cb) => {
    const fileSize = parseInt(req.headers['content-length']);
    const query = req.query.allowedType;
    
    let allowedMimes = verifyMime(query);

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  }
};

function verifyMime(query) {
  const imageType = ["image/jpeg", "image/pjpeg", "image/png"];

  allowedMimes = imageType;

  return allowedMimes;
}