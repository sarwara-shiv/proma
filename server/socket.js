import { Server as socketIo } from 'socket.io';
import { Message, ChatGroup} from './models/models.js';
import UserModel from './models/userModel.js'; 
let io;
let onlineUsers = new Map();

export const initializeSocket = (server, app) => {
    io = new socketIo(server, {
        transports: ["websocket"],
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    app.set("socket", io); // Store socket instance in Express app

    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id); // Log connection to check

        // Debugging: Log every incoming event
        socket.onAny((event, ...args) => {
            console.log(`🛑 Received event: ${event} with data:`, args);
        });

        socket.on("user-connected", async (userId) => {
            console.log("🎉 Received 'user-connected' event for userId:", userId);

            if(userId){
                onlineUsers.set(userId, socket.id);
                console.log("📌 Online Users Map:", onlineUsers);

                try{
                    // Get user's group IDs
                    const groupIds = await userGroupsOf(userId); // This should return an array of ObjectIds

                    // Count unread messages
                    const unreadCount = await Message.countDocuments({
                        $or: [
                            { receiver: userId, 'readStatus.userId': userId, 'readStatus.status': 'unread' },
                            {
                                group: { $in: groupIds },
                                'readStatus': {
                                    $elemMatch: {
                                        userId: userId,
                                        status: 'unread'
                                    }
                                }
                            }
                        ]
                    });
                    if (unreadCount > 0) {
                        console.log(`📨 User ${userId} has ${unreadCount} unread messages`);
                        socket.emit("unread-messages", unreadCount);
                    }
                    
                }catch(error){
                    console.error(error);
                }
            }

        });

        /**
         * 
         * HANDLING CHATS
         * 
         */
        // group message
        socket.on("group-message", async (groupId, messageContent, userId,groupMembers) => {
            console.log("group message", socket.id);
            const message = new Message({
                content: messageContent,
                sender: userId,
                group: groupId,
                readStatus: groupMembers.map(memberId => ({
                    userId: memberId, // Set userId for each member
                    status: memberId === userId ? 'read' : 'unread', // The sender's status is 'read', others are 'unread'
                })),
            });
    
            await message.save();
            groupMembers.forEach(memberId => {
                const userSocketId = onlineUsers.get(memberId.toString()); // Get socket ID of the member
        
                if (userSocketId) {
                    io.to(userSocketId).emit("receive-group-message", message);
                    console.log(`📢 Message sent to online user: ${memberId}`);
                }
            });
        });
        // private message
        socket.on("private-message", async(receiverId, messageContent, senderId) => {
            console.log("private message", socket.id);
            const message = new Message({
                content: messageContent, 
                sender: senderId,
                receiver: receiverId,
                readStatus: [{ userId: receiverId, status: "unread" }], // Initially unread for the receiver
            });
            
            const res = await message.save();
            const receiverSocketId = onlineUsers.get(receiverId);
            console.log('----------------',res, '-------',receiverId,'=====', receiverSocketId,'######', onlineUsers);
            if (receiverSocketId) {
                console.log('------ emitting----',onlineUsers);
                io.to(receiverSocketId).emit("receive-private-message", message); 
            }
            
        });
        // admin send message
        socket.on("admin-send-message", async(userIds, messageContent, adminId) => {
            console.log("admin message to selected users", socket.id);
            for (const userId of userIds) {
                const message = new Message({
                    content: messageContent,
                    sender: adminId,
                    receiver: userId,
                    readStatus: [{ userId, status: "unread" }], // Each user gets an unread status
                });
        
                await message.save();
                const userSocketId = onlineUsers.get(userId);
                if (userSocketId) {
                    io.to(userSocketId).emit("receive-admin-message", message);
                }
            }
        });
        // admin send message to all
        socket.on("admin-send-to-all", async(messageContent, adminId) => {
            console.log("message to all", socket.id);
            const allUsers = await UserModel.find({}, "_id"); // Assuming User schema exists

            const message = new Message({
                content: messageContent,
                sender: adminId,
                readStatus: allUsers.map((user) => ({
                    userId: user._id,
                    status: "unread",
                })), // All users will initially have unread status
            });
    
            await message.save();
            io.emit('receive-admin-message', message); 
        });

        // Like a message
        socket.on('like-message', async (messageId, userId) => {
            const message = await Message.findById(messageId);

            // Prevent the same user from liking the same message more than once
            if (message && !message.likes.includes(userId)) {
                message.likes.push(userId);
                await message.save();
                io.emit('message-liked', messageId, userId);
            }
        });

        // Pin a message (Personal or Group Pin)
        socket.on('pin-message', async (messageId, userId, pinType) => {
            const message = await Message.findById(messageId);
            const group = await ChatGroup.findOne({ members: userId, _id: message.group });

            if (message) {
                if (pinType === 'personal') {
                    message.pinned = 'personal';
                    await message.save();
                    socket.emit('message-pinned', messageId, pinType);
                } else if (pinType === 'group' && group) {
                    // Group-wide pin logic
                    message.pinned = 'group';
                    await message.save();

                    // Add this message to the group's pinnedMessages array
                    group.pinnedMessages.push(messageId);
                    await group.save();

                    io.to(message.group).emit('message-pinned', messageId, pinType); // Broadcast to group
                }
            }
        });

        // Reply to a message
        socket.on('reply-to-message', async (messageId, replyContent, userId) => {
            const message = await Message.findById(messageId);

            if (message) {
                const replyMessage = new Message({
                    content: replyContent,
                    sender: userId,
                    replyTo: messageId,
                });

                await replyMessage.save();
                io.to(message.group).emit('message-replied', replyMessage); // Notify group about reply
            }
        });

        // Backend: Mark message as read for a specific user
        socket.on('mark-message-read', async (messageId, userId) => {
            const message = await Message.findById(messageId);

            // Find the read status for the specific user and update it to 'read'
            const userStatus = message.readStatus.find(status => status.userId.toString() === userId.toString());
            if (userStatus && userStatus.status === 'unread') {
                userStatus.status = 'read';
                await message.save();
                
                // Optionally, emit an event to update the UI on all clients
                io.emit('message-read', { messageId, userId, status: 'read' });
            }
        });


        // logout user
        socket.on("user-disconnected", () => {
            console.log("❌ User disconnected:", socket.id);
            for (let [key, value] of onlineUsers) {
                if (value === socket.id) {
                    onlineUsers.delete(key);
                }
            }
            console.log("📌 Online Users After Disconnect:", onlineUsers);
        });
    });

    console.log("🚀 Socket server initialized");
    return io;
};

const userGroupsOf = async (userId) => {
    const groups = await ChatGroup.find({ members: userId }).select('_id');
    return groups.map(g => g._id);
  };

export { io, onlineUsers };