const crypto = require('crypto');

const generateLicenseCode = () => {
  const licenseCode = crypto.randomBytes(16).toString('hex');
  return licenseCode;
};
