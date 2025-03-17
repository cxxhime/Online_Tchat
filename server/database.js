import mongoose from'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING);
    try {
        const conn = await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error("Erreur de connexion à MongoDB :", error);
        process.exit(1);
    }
};

export default connectDB;