require('dotenv').config();
const { User } = require('./models');

async function makeAdmin(email) {
  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();
    
    console.log(`User ${email} is now an admin!`);
    console.log('User details:', user.toJSON());
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Please provide an email address!');
  console.log('Usage: node admin-script.js <email>');
  process.exit(1);
}

makeAdmin(email); 