import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { Message, ChatGroup } from '../../models/models.js';
import UserModel from '../../models/userModel.js'; 
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * 📩 Get users & groups for chat
 * Expects: { data: { id: userId } } in body
 * 
 * TODO
 * - get last message from user
 * 
 */
router.post("/users", verifyToken, async (req, res) => {
    const { id } = req.body.data;
    const currentUserId = req.user._id.toString(); // consistent variable name
  
    try {
      // 1. Get all users except current
      const users = await UserModel.find({ _id: { $ne: id } })
        .select("_id name email username image")
        .lean();
  
      const usersWithLastMessages = await Promise.all(
        users.map(async (user) => {
          const lastMessage = await Message.findOne({
            $or: [
              { sender: user._id, receiver: id },
              { sender: id, receiver: user._id },
            ],
          })
            .sort({ createdAt: -1 })
            .select("_id content createdAt sender receiver")
            .populate("sender", "_id name");
  
          return {
            ...user,
            lastMessage: lastMessage || null,
          };
        })
      );
  
      // 2. Get groups the user is part of
      const groups = await ChatGroup.find({ members: id })
        .populate("members", "_id name email username image")
        .select("_id name description members image")
        .lean();
  
      const groupsWithLastMessage = await Promise.all(
        groups.map(async (group) => {
          const lastMessage = await Message.findOne({
            group: group._id,
          })
            .sort({ createdAt: -1 })
            .select("_id content createdAt group sender")
            .populate("sender", "_id name");
  
          return {
            ...group,
            lastMessage: lastMessage || null,
          };
        })
      );
  
      // 3. Unread messages
      const unreadMessages = {};
      const groupIds = await userGroupsOf(currentUserId);
  
      const messageData = await Message.find({
        $or: [
          {
            receiver: currentUserId,
            readStatus: {
              $elemMatch: {
                user: currentUserId,
                status: "unread",
              },
            },
          },
          {
            group: { $in: groupIds },
            readStatus: {
              $elemMatch: {
                user: currentUserId,
                status: "unread",
              },
            },
          },
        ],
      });
  
      messageData.forEach((msg) => {
        const key = msg.group ? msg.group.toString() : msg.sender.toString();
        unreadMessages[key] = (unreadMessages[key] || 0) + 1;
      });
  
      return res.json({
        status: "success",
        message: "data found",
        code: "data_found",
        users: usersWithLastMessages,
        groups: groupsWithLastMessage,
        unreadMessages,
      });
    } catch (error) {
      console.error("Error in /users:", error);
      return res
        .status(500)
        .json({ status: "error", message: "server error", code: "server_error" });
    }
  });
  

router.post("/groups/create", verifyToken, async (req, res) => {
    const { name, description, members, userId } = req.body;
  
    try {
      if (!name || !members || members.length === 0) {
        return res.status(400).json({ message: "Name and members are required" });
      }
  
      // Make sure the creator is also in the group
      const allMembers = [...new Set([...members, userId])];
  
      const newGroup = new ChatGroup({
        user: userId,
        name,
        description: description || "",
        members: allMembers,
      });
  
      await newGroup.save();
  
      const populatedGroup = await newGroup.populate("members", "_id name email profileImage");
  
      return res.status(201).json({
        message: "Group created successfully",
        group: populatedGroup,
      });
  
    } catch (error) {
      console.error("Error creating group:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

// 🔹 Update group
router.put("/groups/:groupId", verifyToken, async (req, res) => {
    const { groupId } = req.params;
    const { name, description, members } = req.body;

    try {
        const updatedGroup = await ChatGroup.findByIdAndUpdate(
            groupId,
            { ...(name && { name }), ...(description && { description }), ...(members && { members }) },
            { new: true }
        ).populate("members", "_id name email");

        if (!updatedGroup) return res.status(404).json({ message: "Group not found" });

        res.status(200).json({ message: "Group updated", group: updatedGroup });
    } catch (error) {
        console.error("Group update error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 Delete group
router.delete("/groups/:groupId", verifyToken, async (req, res) => {
    const { groupId } = req.params;

    try {
        const deleted = await ChatGroup.findByIdAndDelete(groupId);
        if (!deleted) return res.status(404).json({ message: "Group not found" });

        await Message.deleteMany({ group: groupId });

        res.status(200).json({ message: "Group deleted" });
    } catch (error) {
        console.error("Group delete error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 Send message (used by admin or fallback if socket fails)
router.post("/message/send", verifyToken, async (req, res) => {
    const { content, sender, receiver, group, groupMembers = [] } = req.body;

    try {
        if (!content || !sender || (!receiver && !group)) {
            return res.status(400).json({ message: "Missing message data" });
        }

        const readStatus =
            group && groupMembers.length > 0
                ? groupMembers.map((id) => ({
                    userId: id,
                    status: id === sender ? "read" : "unread",
                }))
                : [{ userId: receiver, status: "unread" }];

        const message = new Message({
            content,
            sender,
            receiver: receiver || null,
            group: group || null,
            readStatus,
        });

        await message.save();
        res.status(201).json({ message: "Message sent", data: message });

    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 Get messages (private or group)
router.get("/messages", verifyToken, async (req, res) => {
    let { userId, receiverId, groupId, pageNr=1, limit=0 } = req.query;

    pageNr = parseInt(pageNr);
    limit = parseInt(limit);
    const skip = (pageNr - 1) * limit;

    try {
        let filter = {};

        if(!userId && (!receiverId || !groupId)){
            return res.status(400).json({ message: "Provide groupId or userId + receiverId", code:'invalid_data' });
        }

        if (groupId) {
            filter = { group: groupId };
            // query = await Message.find({ group: groupId })
            //     .sort({ createdAt: 1 });
                // .populate("sender", "_id name email image");
        } else if (userId && receiverId) {
            filter =  {
                $or: [
                    { sender: userId, receiver: receiverId },
                    { sender: receiverId, receiver: userId },
                ],
            }
            // query = await Message.find({
            //     $or: [
            //         { sender: userId, receiver: receiverId },
            //         { sender: receiverId, receiver: userId },
            //     ],
            // }).sort({ createdAt: 1 });
            //   .populate("sender", "_id name email image");
        } else {
            return res.status(400).json({ message: "Provide groupId or userId + receiverId", code:'invalid_data'  });
        }

        const totalRecords = await Message.countDocuments(filter);

        const messages = await Message.find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "_id name email image");


        res.status(200).json({ status:"success", data:messages, currentPage:pageNr, limit, totalRecords });

    } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const userGroupsOf = async (userId) => {
    const groups = await ChatGroup.find({ members: userId }).select('_id');
    return groups.map(g => g._id);
  };

export { router as messengerRouter };
