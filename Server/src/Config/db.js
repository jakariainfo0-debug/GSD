const mongoose = require('mongoose');

const dbconnect = async () => {
  await mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('db is connect sucessfully');
    })
    .catch(e => {
      console.log('db is not connect: ', e.message);
    });
};

module.exports = dbconnect;
