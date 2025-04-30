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
                    const user = await UserModel.findById(userId);
                    if(user){
                        user.isOnline = true;
                        user.onlineTimestamp.startTime = new Date();
                        await user.save();
                    }
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
                                        user: userId,
                                        status: 'unread'
                                    }
                                }
                            }
                        ]
                    });
                    if (unreadCount > 0) {
                        console.log(`📨 User ${userId} has ${unreadCount} unread messages`);
                        const receiverSocketId = onlineUsers.get(userId);
                        io.to(receiverSocketId).emit("unread-messages", unreadCount);
                    }

                    // unread messages
                    // Find all unread messages for the user
                    const unreadMessages = await Message.find({
                        $or: [
                        {
                            receiver: userId,
                            'readStatus': {
                            $elemMatch: {
                                user: userId,
                                status: 'unread',
                            },
                            },
                        },
                        {
                            group: { $in: groupIds },
                            'readStatus': {
                            $elemMatch: {
                                user: userId,
                                status: 'unread',
                            },
                            },
                        },
                        ],
                    });

                    // Group by sender or group
                    const unreadCountMap = {};

                    unreadMessages.forEach((msg) => {
                        const key = msg.group ? msg.group.toString() : msg.sender.toString();
                        unreadCountMap[key] = (unreadCountMap[key] || 0) + 1;
                    });

                    if (Object.keys(unreadCountMap).length > 0) {
                        console.log(`📨 User ${userId} unread breakdown:`, unreadCountMap);
                        const receiverSocketId = onlineUsers.get(userId);
                        io.to(receiverSocketId).emit('unread-user-messages', unreadCountMap);
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
        socket.on("group-message", async (groupId, messageContent, userId,groupMembers, callback) => {
            try{
                console.log("group message", socket.id);
                const message = new Message({
                    content: messageContent,
                    sender: userId,
                    group: groupId,
                    readStatus: groupMembers.map(memberId => ({
                        user: memberId, // Set userId for each member
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
                    callback && callback({ status: 'ok', message: message });
                });
            }catch(err){
                callback && callback({ status: 'error', error: 'Failed to send message', code:'unknown_error' });
            }
        });
        // private message
        socket.on("private-message", async(receiverId, messageContent, senderId, callback) => {
            try{
                console.log("private message", socket.id);
                const message = new Message({
                    content: messageContent, 
                    sender: senderId,
                    receiver: receiverId,
                    status: 'delivered',
                    readStatus: [{ user: receiverId, status: "unread" }], // Initially unread for the receiver
                });
                
                const res = await message.save();
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    console.log('------ emitting----',onlineUsers);
                    io.to(receiverSocketId).emit("receive-private-message", message); 
                }
                callback && callback({ status: 'ok', message: message });
            }catch(err){
                callback && callback({ status: 'error', error: 'Failed to send message', code:'unknown_error' });
            }
            
        });
        // admin send message
        socket.on("admin-send-message", async(userIds, messageContent, adminId, callback) => {
            try{
                console.log("admin message to selected users", socket.id);
                const sentMessageTo = {};
                for (const userId of userIds) {
                    const message = new Message({
                        content: messageContent,
                        sender: adminId,
                        receiver: userId,
                        readStatus: [{ user:userId, status: "unread" }], 
                        status: 'delivered', 
                    });
            
                    await message.save();
                    const userSocketId = onlineUsers.get(userId);
                    if (userSocketId) {
                        io.to(userSocketId).emit("receive-admin-message", message);
                    }
                    sentMessageTo[userId] = message;
                }
                callback && callback({ status: 'ok', data:sentMessageTo });
            }catch(error){
                callback && callback({ status: 'error', error: 'Failed to send message', code:'unknown_error' });
            }
        });
        // admin send message to all
        socket.on("admin-send-to-all", async(messageContent, adminId, callback) => {
            try{

                console.log("message to all", socket.id);
                const allUsers = await UserModel.find({}, "_id"); // Assuming User schema exists
                
                const message = new Message({
                    content: messageContent,
                    sender: adminId,
                    readStatus: allUsers.map((user) => ({
                        user: user._id,
                        status: "unread",
                    })), // All users will initially have unread status
                });
                
                await message.save();
                io.emit('receive-admin-message', message); 
                callback && callback({ status: 'ok', message: message });
            }catch(error){
                callback && callback({ status: 'error', error: 'Failed to send message', code:'unknown_error' });
            }
        });

        // Star or Unstar a message
        socket.on('star-message', async (messageId, userId, callback) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;
            
                const index = message.stars.indexOf(userId);
            
                if (index === -1) {
                    // ⭐ Not starred yet → Star it
                    message.stars.push(userId);
                } else {
                    // ❌ Already starred → Unstar it
                    message.stars.splice(index, 1);
                }
            
                await message.save();
            
                // Notify clients
                
                io.emit('message-stared', message, userId);
                callback && callback({ status: 'ok', message });
            } catch (err) {
                console.error("Error in star-message:", err);
                callback && callback({ status: 'error', error:'', code:'invalid_data' });
            }
        });
  

        // Pin or Unpin a message (Personal or Group)
        socket.on('pin-message', async (messageId, userId, pinType, callback) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;
            
                const isGroupMessage = !!message.group;
            
                // Ensure pinned structure exists
                if (!message.pinned) {
                    message.pinned = { personal: [], group: false };
                }
            
                // --- Personal Pin ---
                if (pinType === 'personal' && !isGroupMessage) {
                    const index = message.pinned.personal.indexOf(userId);
                    if (index === -1) {
                    // Not pinned yet → Pin it
                    message.pinned.personal.push(userId);
                    } else {
                    // Already pinned → Unpin it
                    message.pinned.personal.splice(index, 1);
                    }
                    await message.save();
                    socket.emit('message-pinned', message, pinType);
                }
            
                // --- Group Pin ---
                if (pinType === 'group' && isGroupMessage) {
                    const group = await ChatGroup.findOne({ _id: message.group, members: userId });
                    if (!group) return;
            
                    if (message.pinned.group === true) {
                    // Unpin it
                    message.pinned.group = false;
                    group.pinnedMessages = group.pinnedMessages.filter(
                        (msgId) => msgId.toString() !== message._id.toString()
                    );
                    } else {
                    // Pin it
                    message.pinned.group = true;
                    if (!group.pinnedMessages.includes(message._id)) {
                        group.pinnedMessages.push(message._id);
                    }
                    }
            
                    await message.save();
                    await group.save();
                    io.to(message.group.toString()).emit('message-pinned', message, pinType);
                }
                callback && callback({status:'ok', message});
            } catch (err) {
                callback && callback({status:'error'});
                console.error("Error in pin-message:", err);
            }
        });
  
          

        // Like a message (add or update a like on a message)
        socket.on('like-message', async (messageId, userId, emoji, callback) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;
            
                // Remove existing like from same user (if any)
                message.likes = message.likes.filter(like => like.user.toString() !== userId);
            
                // Add new like
                message.likes.push({ text: emoji, user: userId });
                await message.save();
            
                // Emit to the sender only (if it's a personal message)
                if (message.receiver) {
                    const receiverSocketId = onlineUsers.get(message.receiver.toString());
                    const senderSocketId = onlineUsers.get(message.sender.toString());
                    console.log(senderSocketId);
                    if (receiverSocketId) {
                        console.log(receiverSocketId)
                        io.to(receiverSocketId).emit('message-liked', message, userId, emoji);
                    }
                }
            
                // Emit to the group if it's a group message
                if (message.group) {
                    io.to(message.group.toString()).emit('message-liked', message, userId, emoji);
                }
                callback && callback({status:'ok', message});
            } catch (error) {
                callback && callback({status:'error'});
                console.error("Error in like-message:", error);
            }
        });
  

        // Reply to a message
        socket.on('reply-to-message', async (messageId, replyContent, userId, callback) => {
             try{
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
                callback && callback({status:'ok'});
            }catch(err){
                callback && callback({status:'error'})
            }
        });

        // Backend: Mark message as read for a specific user
        socket.on('mark-message-read', async (messageId, userId, callback) => {
            try{
                const message = await Message.findById(messageId);
    
                // Find the read status for the specific user and update it to 'read'
                const userStatus = message.readStatus.find(status => status.user.toString() === userId.toString());
                if (userStatus && userStatus.status === 'unread') {
                    userStatus.status = 'read';
                    await message.save();
                    
                    // Optionally, emit an event to update the UI on all clients
                    io.emit('message-read', { messageId, userId, status: 'read' });
                }
                callback && callback({status:'ok', message})
            }catch(err){
                callback && callback({status:'error'})
            }
        });

        socket.on('mark-messages-read', async (messageIds, userId, callback) => {
            try{
                const update = await Message.updateMany(
                  { _id: { $in: messageIds }, 'readStatus.user': userId, 'readStatus.status': 'unread' },
                  { $set: { 'readStatus.$.status': 'read' } }
                );
                
                io.emit('messages-read', { messageIds, userId });
                callback && callback({status:'ok'})
            }catch(err){
                callback && callback({status:'error'})
            }
          });


        // logout user
        socket.on("user-disconnected", async() => {
            console.log("❌ User disconnected:", socket.id);
            let disconnectedUserId = null;
            for (let [key, value] of onlineUsers) {
                if (value === socket.id) {
                    disconnectedUserId = key;
                    onlineUsers.delete(key);
                    break;
                }
            }

            if (disconnectedUserId) {
                // Update isOnline status in DB
                try {
                    await UserModel.findByIdAndUpdate(disconnectedUserId, { isOnline: false });
                    console.log(`🔻 User ${disconnectedUserId} set to offline.`);
                } catch (err) {
                    console.error(`⚠️ Failed to update isOnline for user ${disconnectedUserId}:`, err);
                }
            }
            
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