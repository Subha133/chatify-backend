import express from "express";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDb from "./lib/db.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";
dotenv.config();
// const app = express();
const _dirname = path.resolve();
app.set("trust proxy", true);


app.use(cookieParser());
app.use(express.json({ limit: "5mb"}));
app.use(cors({
  origin: process.env.CLIENT_URL, // Vite frontend
  credentials: true
}));

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

//make ready for deployment
if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(_dirname, "../chatify/dist")))

    app.get("*",(_, res)=>{
        res.sendFile(path.join(_dirname, "../chatify","dist","index.html"));
    })
}


const PORT = process.env.PORT || 3000;


server.listen(PORT,()=>{
    connectDb();
    console.log("app is running on port : "+PORT);
})

