// Example API handlers for the chat functionality
// These would be implemented in your Next.js API routes

import { 
  Conversation, 
  Message, 
  createConversation,
  createMessage,
  getUserConversations,
  getConversationMessages,
  markMessagesAsRead,
  getUnreadMessageCounts
} from '@/models/ChatModel';

// Get conversations for a user
export async function getConversationsHandler(req, res) {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const conversations = await getUserConversations(email);
    
    // Get unread message counts
    const unreadCounts = await getUnreadMessageCounts(email);
    
    // Add unread count to each conversation
    const conversationsWithUnread = conversations.map(conversation => {
      const convoId = conversation._id.toString();
      return {
        ...conversation._doc,
        unread: unreadCounts[convoId] || 0
      };
    });
    
    return res.status(200).json({ 
      success: true, 
      data: conversationsWithUnread 
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get conversations' 
    });
  }
}

// Create a new conversation
export async function createConversationHandler(req, res) {
  try {
    const { name, type, participants, admins, projectId } = req.body;
    
    if (!name || !type || !participants || participants.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    const newConversation = await createConversation({
      name,
      type,
      participants,
      admins,
      projectId
    });
    
    return res.status(201).json({ 
      success: true, 
      data: newConversation 
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create conversation' 
    });
  }
}

// Get messages for a conversation
export async function getMessagesHandler(req, res) {
  try {
    const { conversationId, limit = 50, skip = 0, email } = req.query;
    
    if (!conversationId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Conversation ID is required' 
      });
    }
    
    const messages = await getConversationMessages(
      conversationId,
      parseInt(limit),
      parseInt(skip)
    );
    
    // Mark messages as read if email is provided
    if (email) {
      await markMessagesAsRead(conversationId, email);
    }
    
    return res.status(200).json({ 
      success: true, 
      data: messages.reverse() // Reverse to get chronological order
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get messages' 
    });
  }
}

// Create a new message
export async function createMessageHandler(req, res) {
  try {
    const { 
      conversationId, 
      sender, 
      senderName, 
      content, 
      attachments, 
      metadata 
    } = req.body;
    
    if (!conversationId || !sender || !senderName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Check if content or attachments exist
    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message must have content or attachments' 
      });
    }
    
    const newMessage = await createMessage({
      conversationId,
      sender,
      senderName,
      content,
      attachments,
      metadata
    });
    
    return res.status(201).json({ 
      success: true, 
      data: newMessage 
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create message' 
    });
  }
}

// Mark messages as read
export async function markAsReadHandler(req, res) {
  try {
    const { conversationId, email } = req.body;
    
    if (!conversationId || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Conversation ID and email are required' 
      });
    }
    
    await markMessagesAsRead(conversationId, email);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Messages marked as read' 
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to mark messages as read' 
    });
  }
}

// Get team members (for starting conversations)
export async function getTeamMembersHandler(req, res) {
  try {
    const { projectId } = req.query;
    
    // If projectId is provided, filter by project team
    // Otherwise, get all team members
    
    // This would integrate with your existing TeamAssignment model or User model
    let teamMembers = [];
    
    if (projectId) {
      // Example: Get team members assigned to this project
      const TeamAssignment = require('@/models/TeamAssignment').default;
      const assignments = await TeamAssignment.find({ 
        projectId,
        confirmed: true
      });
      
      teamMembers = assignments.map(assignment => ({
        id: assignment._id,
        email: assignment.email,
        name: assignment.name,
        role: assignment.role
      }));
    } else {
      // Example: Get all team members from the system
      // This would depend on your user model implementation
      const User = require('@/models/User').default;
      const users = await User.find({ active: true });
      
      teamMembers = users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: user.role
      }));
    }
    
    return res.status(200).json({ 
      success: true, 
      data: teamMembers 
    });
  } catch (error) {
    console.error('Error getting team members:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get team members' 
    });
  }
}

// Upload file for attachment
export async function uploadFileHandler(req, res) {
  try {
    // This would integrate with your file storage solution
    // (e.g., AWS S3, Firebase Storage, etc.)
    
    // Process the uploaded file
    // Return the file URL and metadata
    
    // Example (mock implementation):
    const fileUrl = `https://storage.example.com/uploads/${Date.now()}_${req.file.originalname}`;
    
    return res.status(200).json({ 
      success: true, 
      data: {
        name: req.file.originalname,
        url: fileUrl,
        type: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to upload file' 
    });
  }
}