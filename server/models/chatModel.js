import mongoose, { Schema } from 'mongoose';

const ChatGroupSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Who created the group
    name: { type: String, required: true },
    description: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    pinnedMessages: [{ type: Schema.Types.ObjectId, ref: 'Message' }], // Store pinned messages
}, { timestamps: true });

const LikesSchema = new mongoose.Schema({
    text:{type:String}, user:{type: Schema.Types.ObjectId, ref: 'User'} 
}, {_id:false})
const ReadSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['read', 'unread'], default: 'unread' }, // Track read/unread per user
}, {_id:false})

const MessageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    group: { type: Schema.Types.ObjectId, ref: 'Group', default: null }, 
    receiver: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updateAT: { type: Date, default: Date.now },
    likes: [LikesSchema], // Track users who liked the message
    stars: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Track users who liked the message
    pinned: {
        type: {
          personal: [{ type: Schema.Types.ObjectId, ref: 'User' }],
          group: { type: Boolean, default: false }
        },
        default: { personal: [], group: false }
      },
    readStatus: [ReadSchema],
    status:{type:String, enum:['sent', 'delivered', 'seen'], default:'sent'},
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message', default: null }, // For replies to other messages
}, { timestamps: true });





const ChatGroup = mongoose.model('ChatGroup', ChatGroupSchema);
const Message = mongoose.model('Message', MessageSchema);

export { ChatGroup,Message}