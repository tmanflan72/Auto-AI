const db = require('./db');

const verifyLicenseCode = async (licenseCode) => {
  const license = await db.select({
    table: 'licenses',
    where: {
      license_code: licenseCode,
    },
  });

  if (license) {
    return true;
  }

  return false;
};
