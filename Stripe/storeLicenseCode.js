const db = require('./db');

const storeLicenseCode = async (licenseCode) => {
  await db.insert({
    table: 'licenses',
    values: {
      license_code: licenseCode,
      user_id: 'YOUR_USER_ID',
    },
  });
};
