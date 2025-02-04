const bcrypt = require('bcryptjs');

const newPassword = 'yourNewPassword'; // Replace with the new password
const saltRounds = 12; // Use the same salt rounds as in your application

bcrypt.hash(newPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hash);
  }
});