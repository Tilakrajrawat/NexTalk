import mongoose from 'mongoose';

export const connectDB = async (mongoUri) => {
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
  return mongoose.connection;
};
