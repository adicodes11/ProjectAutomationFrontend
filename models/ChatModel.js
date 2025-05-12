import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

// Message Schema
const messageSchema = new Schema(
  {
    conversationId: { 
      type: Schema.Types.ObjectId, 
      ref: "Conversation", 
      required: true 
    },
    sender: { 
      type: String, 
      required: true 
    },
    senderName: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String,
      default: ""
    },
    readBy: [{
      type: String // email addresses of users who have read the message
    }],
    attachments: [{
      name: { type: String },
      url: { type: String },
      type: { type: String }, // 'image', 'document', etc.
      size: { type: Number }
    }],
    metadata: {
      type: Schema.Types.Mixed // For additional data like link previews, etc.
    }
  },
  { timestamps: true }
);

// Conversation Schema
const conversationSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["direct", "group"],
      required: true 
    },
    participants: [{ 
      type: String, 
      required: true 
    }],
    admins: [{ 
      type: String // For group chats, the users who can add/remove participants
    }],
    lastMessage: {
      content: { type: String },
      sender: { type: String },
      timestamp: { type: Date }
    },
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: "Project" 
    }, // Optional: link to project if this is a project-related conversation
    isArchived: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Schema.Types.Mixed // Additional data like group avatar, etc.
    }
  },
  { timestamps: true }
);

// Create indexes for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
conversationSchema.index({ participants: 1 });
conversationSchema.index({ "lastMessage.timestamp": -1 });

// Export models
export const Message = models.Message || model("Message", messageSchema);
export const Conversation = models.Conversation || model("Conversation", conversationSchema);

// Helper function to create a new conversation
export const createConversation = async ({
  name,
  type,
  participants,
  admins = [],
  projectId = null,
}) => {
  try {
    const newConversation = new Conversation({
      name,
      type,
      participants,
      admins: admins.length > 0 ? admins : [participants[0]],
      projectId,
      lastMessage: {
        content: "Conversation created",
        sender: participants[0],
        timestamp: new Date()
      }
    });

    await newConversation.save();
    return newConversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// Helper function to create a new message
export const createMessage = async ({
  conversationId,
  sender,
  senderName,
  content,
  attachments = [],
  metadata = {}
}) => {
  try {
    const newMessage = new Message({
      conversationId,
      sender,
      senderName,
      content,
      attachments,
      metadata,
      readBy: [sender]
    });

    await newMessage.save();
    
    // Update the conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content: content || "Sent an attachment",
        sender,
        timestamp: new Date()
      }
    });

    return newMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
};

// Helper function to get conversations for a user
export const getUserConversations = async (userEmail) => {
  try {
    return await Conversation.find({
      participants: userEmail,
      isArchived: false
    }).sort({ "lastMessage.timestamp": -1 });
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    throw error;
  }
};

// Helper function to get messages for a conversation
export const getConversationMessages = async (conversationId, limit = 50, skip = 0) => {
  try {
    return await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
};

// Helper function to mark messages as read
export const markMessagesAsRead = async (conversationId, userEmail) => {
  try {
    await Message.updateMany(
      { 
        conversationId,
        readBy: { $ne: userEmail }
      },
      { 
        $addToSet: { readBy: userEmail } 
      }
    );
    return true;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Helper function to get unread message counts for a user
export const getUnreadMessageCounts = async (userEmail) => {
  try {
    const conversations = await Conversation.find({
      participants: userEmail,
      isArchived: false
    });
    
    const counts = {};
    
    for (const conversation of conversations) {
      const count = await Message.countDocuments({
        conversationId: conversation._id,
        sender: { $ne: userEmail },
        readBy: { $ne: userEmail }
      });
      
      counts[conversation._id.toString()] = count;
    }
    
    return counts;
  } catch (error) {
    console.error("Error getting unread message counts:", error);
    throw error;
  }
};