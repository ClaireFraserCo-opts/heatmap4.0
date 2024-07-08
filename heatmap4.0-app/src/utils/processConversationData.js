// src/utils/processConversationData.js: Processes the conversation data, which may include logic for handling top frequent words.

const processConversationData = (conversationData) => {
    // Process and manipulate conversationData as needed
    // Example:
    const processedData = conversationData.map((item) => ({
      id: item.id,
      text: item.text,
      score: item.score,
      // Additional processing logic
    }));
  
    return processedData;
  };
  
  export default processConversationData;
  