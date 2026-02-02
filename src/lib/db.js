import mongoose from "mongoose";

const connectDb = async () => {
    try{
        const Connection = await mongoose.connect(process.env.MONGO_URL);
        console.log("MONGODB CONNECTED:", Connection.connection.host);
    }catch (error) {
        console.error("ERROR CONNECTION TO MONGODB:", error);
        process.exit(1);
    }
}


export default connectDb;