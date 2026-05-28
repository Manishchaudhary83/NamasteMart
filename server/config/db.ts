import mongoose from 'mongoose';

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  
  if (!uri || uri.trim() === "" || uri.includes('YOUR_MONGODB_URI')) {
    console.warn('⚠️  MONGODB_URI is not defined or is using a placeholder.');
    console.warn('⚠️  The application will run in a degraded state without database features.');
    return false;
  }

  // Clean raw environment prefix if the user accidentally copied the label itself
  if (uri.startsWith('MONGODB_URI=')) {
    uri = uri.substring('MONGODB_URI='.length).trim();
  } else if (uri.includes('MONGODB_URI=')) {
    uri = uri.substring(uri.indexOf('MONGODB_URI=') + 'MONGODB_URI='.length).trim();
  }

  // Sanitize: Remove accidental surrounding quotes and whitespace
  uri = uri.trim().replace(/^["'](.+)["']$/, '$1').trim();

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.warn('❌ Invalid MONGODB_URI scheme.');
    return false;
  }

  try {
    // Disable command buffering so that operations fail fast if there is no connection
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // Wait only 5 seconds for initial connection
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};
