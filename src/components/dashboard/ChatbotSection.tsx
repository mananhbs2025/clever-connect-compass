
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, UserCircle, Bot, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatbotSectionProps {
  connections: any[];
}

type AIProvider = "openai" | "anthropic";

export const ChatbotSection: React.FC<ChatbotSectionProps> = ({ connections }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user" as const,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue("");
    setIsProcessing(true);
    
    // Add a loading message from the bot
    const loadingMessageId = Date.now() + 1;
    setMessages(prevMessages => [...prevMessages, {
      id: loadingMessageId,
      text: "Thinking...",
      sender: "bot" as const,
      isLoading: true,
    }]);
    
    try {
      // Get the current user's session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        updateBotMessage(loadingMessageId, "Sorry, there was an error with your session. Please try logging in again.", true);
        toast.error("Authentication error");
        return;
      }
      
      if (!sessionData?.session) {
        updateBotMessage(loadingMessageId, "Sorry, you need to be logged in to use the chatbot.", true);
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
        updateBotMessage(
          loadingMessageId, 
          `Sorry, I couldn't process your request. Error: ${error.message || "Unknown error"}`, 
          true
        );
        
        // If Anthropic fails, try OpenAI as fallback if we're not already using it
        if (currentProvider === "anthropic") {
          tryFallbackProvider(inputValue, sessionData.session.access_token, loadingMessageId);
        } else {
          toast.error(`Failed to get a response from the assistant`);
        }
      } else if (data.error) {
        console.error(`${currentProvider} API error:`, data.error);
        updateBotMessage(
          loadingMessageId, 
          `Sorry, I encountered an issue: ${data.error}${data.details ? ` (${data.details})` : ""}`, 
          true
        );
        
        // If Anthropic fails, try OpenAI as fallback if we're not already using it
        if (currentProvider === "anthropic") {
          tryFallbackProvider(inputValue, sessionData.session.access_token, loadingMessageId);
        } else {
          toast.error(`API error: ${data.error}`);
        }
      } else if (!data.response) {
        console.error("No response in data:", data);
        updateBotMessage(
          loadingMessageId, 
          "Sorry, I received an empty response. Please try again.", 
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
        updateBotMessage(loadingMessageId, data.response);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      updateBotMessage(
        loadingMessageId, 
        `Sorry, something went wrong: ${error.message || "Unknown error"}`, 
        true
      );
      toast.error("An error occurred while processing your message");
    } finally {
      setIsProcessing(false);
    }
  };

  const tryFallbackProvider = async (query: string, accessToken: string, messageId: number) => {
    try {
      console.log("Trying fallback provider (OpenAI)...");
      updateBotMessage(messageId, "The first AI provider failed. Trying an alternative...", true);
      
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: {
          query,
          accessToken,
        },
      });
      
      if (error || data.error || !data.response) {
        console.error("Fallback provider also failed:", error || data.error);
        updateBotMessage(
          messageId, 
          "Sorry, both AI providers failed to respond. Please try again later.", 
          true
        );
        toast.error("All AI providers failed");
      } else {
        updateBotMessage(messageId, data.response);
      }
    } catch (fallbackError) {
      console.error("Error with fallback provider:", fallbackError);
      updateBotMessage(
        messageId, 
        "Sorry, both AI providers failed. Please try again later.", 
        true
      );
    }
  };
  
  const updateBotMessage = (id: number, text: string, isError: boolean = false) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === id 
          ? { ...message, text, isLoading: false, isError } 
          : message
      )
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const toggleProvider = () => {
    setCurrentProvider(prev => prev === "openai" ? "anthropic" : "openai");
    toast.info(`Switched to ${currentProvider === "openai" ? "Anthropic Claude" : "OpenAI"} model`);
  };

  const handleFallbackSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;
    
    // Add user message
    const userMessageId = Date.now();
    setMessages(prevMessages => [...prevMessages, {
      id: userMessageId,
      text: inputValue,
      sender: "user" as const,
    }]);
    setInputValue("");
    setIsProcessing(true);
    
    // Simulate bot response with the local function
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue, connections);
      setMessages(prevMessages => [...prevMessages, {
        id: Date.now(),
        text: botResponse,
        sender: "bot" as const,
      }]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-purple-600 flex items-center">
          <Bot className="h-4 w-4 mr-1" />
          Using: {currentProvider === "anthropic" ? "Anthropic Claude" : "OpenAI"}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleProvider} 
          className="h-8 text-xs text-purple-600 hover:bg-purple-50"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Switch Model
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 bg-purple-50 rounded-lg border border-purple-200 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card className={`max-w-[80%] ${
              message.sender === "user" 
                ? "bg-purple-600 text-white border-purple-700" 
                : message.isError
                  ? "bg-red-50 border-red-200" 
                  : "bg-white border-purple-200"
            }`}>
              <CardContent className="p-3">
                <div className="flex gap-2">
                  <div className="shrink-0 mt-1">
                    {message.sender === "user" ? (
                      <UserCircle className="h-5 w-5 text-purple-200" />
                    ) : (
                      <Bot className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div className={message.sender === "user" ? "text-white" : message.isError ? "text-red-600" : "text-purple-800"}>
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
      
      <div className="mt-auto flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your network..."
          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
          disabled={isProcessing}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!inputValue.trim() || isProcessing}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Helper function to generate bot responses (fallback if API isn't working)
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
