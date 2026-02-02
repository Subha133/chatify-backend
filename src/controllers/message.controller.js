import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../lib/socket.js";


export const getAllContacts = async (req, res) => {

try{
 const loggedInUserId = req.user._id;
 const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password");
 res.status(200).json(filteredUsers)
} catch(err) {
    console.log("Error in getAllContacts:", err);
    res.status(500).json({ message: "Server error" });
}
};

export const getMessagesByUserId = async (req, res) => {
    
    try{
        const myId = req.user._id;
        const {id:userToChatId} = req.params;
        const messages = await Message.find({
            $or: [
                {senderId:myId, receiverId:userToChatId},
                {receiverId:myId, senderId:userToChatId},
            ]
            
        });
         res.status(200).json(messages);

    } catch (err) {
         console.log("Error in getMessages controller: ", err.message);
         res.status(500).json({ error: "Internal server error" });
    }
};
  
export const sendMessage = async (req, res) => {
    try{
        const senderId = req.user._id;
        const {image, text} = req.body;
        const {id:receiverId} = req.params;

        if (!text && !image) {
            return res.status(400).json({message:"Text or image is required."})
        }
        if(senderId.equals(receiverId)) {
            return res.status(400).json({message:"cannot send message to yourself."})
        }
        const receiverExists = await User.exists({_id:receiverId});
        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver not found." });
        };
        let imageUrl;
        if(image) {
            
            const uploadRespons = await cloudinary.uploader.upload(image);
            imageUrl = uploadRespons.secure_url;

        }
        const newMessage = new Message ({
            senderId,
            receiverId,
            text,
            image : imageUrl
        });

        await newMessage.save();

         const receiverSocketIds = getReceiverSocketId(receiverId);
         if (receiverSocketIds) {
            receiverSocketIds.forEach(socketId => {
            io.to(socketId).emit("newMessage", newMessage);
         });
}
         res.status(201).json(newMessage);

    } catch (err) {
         console.log("Error in sendMessage controller: ", err.message);
         res.status(500).json({ error: "Internal server error" });
    }
}

export const getChatPartners = async (req, res) => {
    try {
        const myId = req.user._id;
        const chats = await Message.find({
            $or: [
                {senderId:myId}, {receiverId:myId}

            ]
        });
        const chatPartnersIds = chats.map((mess) => mess.receiverId.toString() === myId.toString() ? mess.senderId.toString() : mess.receiverId.toString())
        const uniqueIds = [...new Set(chatPartnersIds)];
        const objectIds = uniqueIds.map((id)=>new mongoose.Types.ObjectId(id));
        const chatPartners = await User.find({_id:{$in:objectIds}}).select("-password");
        res.status(200).json(chatPartners);
        
    } catch (err) {
        console.error("Error in getChatPartners: ", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
}