
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, UserCircle, Bot, X, AlertTriangle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FloatingChatbotProps {
  connections: any[];
  onClose: () => void;
}

type MessageType = {
  id: string;
  text: string;
  sender: "user" | "bot";
  isLoading?: boolean;
  isError?: boolean;
};

type AIProvider = "openai" | "anthropic";

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ connections, onClose }) => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "welcome-message",
      text: "👋 Hello! I'm your Nubble Assistant. Ask me anything about your network!",
      sender: "bot",
    },
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<AIProvider>("anthropic");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: "user" | "bot", isLoading: boolean = false, isError: boolean = false) => {
    const newMessage = {
      id: `message-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      sender,
      isLoading,
      isError,
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, text: string, isLoading: boolean = false, isError: boolean = false) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === id 
          ? { ...message, text, isLoading, isError } 
          : message
      )
    );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    // Add user message
    addMessage(inputValue, "user");
    
    // Clear input and set processing state
    setInputValue("");
    setIsProcessing(true);
    
    // Add a loading message from the bot
    const loadingMessageId = addMessage("Thinking...", "bot", true);
    
    try {
      // Get the current user's session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        updateMessage(loadingMessageId, "Sorry, there was an error with your session. Please try logging in again.", false, true);
        toast.error("Authentication error");
        setIsProcessing(false);
        return;
      }
      
      if (!sessionData?.session) {
        updateMessage(loadingMessageId, "Sorry, you need to be logged in to use the chatbot.", false, true);
        setIsProcessing(false);
        return;
      }
      
      const endpoint = currentProvider === "anthropic" ? 'anthropic-chat' : 'chatbot';
      console.log(`Calling ${currentProvider} edge function...`);
      
      // Call our Edge Function with the user's query
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          query: inputValue,
          accessToken: sessionData.session.access_token,
        },
      });
      
      console.log(`${currentProvider} response:`, data ? "Success" : "No data", error ? "Error" : "No error");
      
      if (error) {
        console.error(`${currentProvider} function error:`, error);
        updateMessage(
          loadingMessageId, 
          `Sorry, I couldn't process your request. Error: ${error.message || "Unknown error"}`, 
          false, 
          true
        );
        
        // If Anthropic fails, try OpenAI as fallback if we're not already using it
        if (currentProvider === "anthropic") {
          tryFallbackProvider(inputValue, sessionData.session.access_token, loadingMessageId);
        } else {
          toast.error("Failed to get a response from the assistant");
        }
      } else if (data.error) {
        console.error(`${currentProvider} API error:`, data.error);
        updateMessage(
          loadingMessageId, 
          `Sorry, I encountered an issue: ${data.error}${data.details ? ` (${data.details})` : ""}`, 
          false, 
          true
        );
        
        // If Anthropic fails, try OpenAI as fallback if we're not already using it
        if (currentProvider === "anthropic") {
          tryFallbackProvider(inputValue, sessionData.session.access_token, loadingMessageId);
        } else {
          toast.error("API error: " + data.error);
        }
      } else if (!data.response) {
        console.error("No response in data:", data);
        updateMessage(
          loadingMessageId, 
          "Sorry, I received an empty response. Please try again.", 
          false, 
          true
        );
        
        // If Anthropic fails, try OpenAI as fallback if we're not already using it
        if (currentProvider === "anthropic") {
          tryFallbackProvider(inputValue, sessionData.session.access_token, loadingMessageId);
        } else {
          toast.error("Received empty response");
        }
      } else {
        // Update the loading message with the actual response
        updateMessage(loadingMessageId, data.response, false);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      updateMessage(
        loadingMessageId, 
        `Sorry, something went wrong: ${error.message || "Unknown error"}`, 
        false, 
        true
      );
      toast.error("An error occurred while processing your message");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const tryFallbackProvider = async (query: string, accessToken: string, messageId: string) => {
    try {
      console.log("Trying fallback provider (OpenAI)...");
      updateMessage(messageId, "The first AI provider failed. Trying an alternative...", true);
      
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: {
          query,
          accessToken,
        },
      });
      
      if (error || data.error || !data.response) {
        console.error("Fallback provider also failed:", error || data.error);
        updateMessage(
          messageId, 
          "Sorry, both AI providers failed to respond. Please try again later.", 
          false, 
          true
        );
        toast.error("All AI providers failed");
      } else {
        updateMessage(messageId, data.response);
      }
    } catch (fallbackError) {
      console.error("Error with fallback provider:", fallbackError);
      updateMessage(
        messageId, 
        "Sorry, both AI providers failed. Please try again later.", 
        false, 
        true
      );
    }
  };

  const toggleProvider = () => {
    setCurrentProvider(prev => prev === "openai" ? "anthropic" : "openai");
    toast.info(`Switched to ${currentProvider === "openai" ? "Anthropic Claude" : "OpenAI"} model`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // If we don't have the OpenAI API functionality yet, use the simple response generator
  const handleFallbackSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;
    
    // Add user message
    addMessage(inputValue, "user");
    setInputValue("");
    setIsProcessing(true);
    
    // Simulate bot response with the local function
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue, connections);
      addMessage(botResponse, "bot");
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-purple-200 flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="p-3 bg-purple-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-medium">Nubble Assistant</h3>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleProvider} 
            className="h-7 w-7 p-0 text-white hover:bg-purple-700 rounded-full"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="h-7 w-7 p-0 text-white hover:bg-purple-700 rounded-full"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <div className="p-2 bg-purple-100 text-xs text-purple-700 flex items-center justify-center">
        Using: {currentProvider === "anthropic" ? "Anthropic Claude" : "OpenAI"}
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 bg-purple-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card className={`max-w-[90%] ${
              message.sender === "user" 
                ? "bg-purple-600 text-white border-purple-700" 
                : message.isError 
                  ? "bg-red-50 border-red-200" 
                  : "bg-white border-purple-200"
            }`}>
              <CardContent className="p-2 text-sm">
                <div className="flex gap-2">
                  <div className="shrink-0 mt-0.5">
                    {message.sender === "user" ? (
                      <UserCircle className="h-4 w-4 text-purple-200" />
                    ) : message.isError ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Bot className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <div className={
                    message.sender === "user" 
                      ? "text-white" 
                      : message.isError 
                        ? "text-red-700" 
                        : "text-purple-800"
                  }>
                    {message.isLoading ? (
                      <span className="flex items-center">
                        <span className="animate-pulse">{message.text}</span>
                      </span>
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-3 border-t border-purple-100 flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question..."
          className="text-sm border-purple-200 h-8"
          disabled={isProcessing}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!inputValue.trim() || isProcessing}
          className="bg-purple-600 hover:bg-purple-700 text-white h-8 w-8 p-0"
          size="sm"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

// Helper function to generate bot responses (fallback if API isn't set up)
function generateBotResponse(userInput: string, connections: any[]): string {
  const input = userInput.toLowerCase();
  
  // Network size
  if (input.includes("how many") && input.includes("connection")) {
    return `You have ${connections.length} connections in your network.`;
  }
  
  // Companies
  if (input.includes("top") && input.includes("compan")) {
    const companies = connections
      .map(c => c.Company)
      .filter(Boolean);
      
    const companyCounts: Record<string, number> = {};
    companies.forEach(company => {
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    });
    
    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count})`);
    
    return `Your top companies are: ${topCompanies.join(", ")}`;
  }
  
  // Locations
  if (input.includes("location") || input.includes("where")) {
    const locations = connections
      .map(c => c.Location)
      .filter(Boolean);
      
    const locationCounts: Record<string, number> = {};
    locations.forEach(location => {
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count})`);
    
    return `Your connections are mostly from: ${topLocations.join(", ")}`;
  }
  
  // Search by name
  if (input.includes("find") || input.includes("search")) {
    // Extract name to search for
    const words = input.split(" ");
    const nameIdx = Math.max(words.indexOf("find"), words.indexOf("search")) + 1;
    if (nameIdx < words.length) {
      const nameToSearch = words.slice(nameIdx).join(" ");
      const found = connections.filter(c => 
        `${c["First Name"]} ${c["Last Name"]}`.toLowerCase().includes(nameToSearch)
      );
      
      if (found.length > 0) {
        return `I found ${found.length} connections matching "${nameToSearch}". The first match is ${found[0]["First Name"]} ${found[0]["Last Name"]} who works at ${found[0].Company || "an unknown company"}.`;
      } else {
        return `I couldn't find any connections matching "${nameToSearch}".`;
      }
    }
  }
  
  // Default responses
  const defaultResponses = [
    "I can help you analyze your network. Try asking about your connections, companies, or locations.",
    "You can ask me to find specific connections, show top companies, or analyze your network by location.",
    "Need help with your network? Ask me about your connections or try 'How many connections do I have?'",
    "I'm your network assistant. I can help you discover insights about your professional connections.",
    "Try asking me questions like 'What are my top companies?' or 'Find John Smith in my network'.",
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}
