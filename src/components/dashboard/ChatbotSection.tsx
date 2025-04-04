
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, UserCircle, Bot } from "lucide-react";

interface ChatbotSectionProps {
  connections: any[];
}

export const ChatbotSection: React.FC<ChatbotSectionProps> = ({ connections }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm your Nubble Assistant. Ask me anything about your network!",
      sender: "bot",
    },
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user" as const,
    };
    
    setMessages([...messages, userMessage]);
    setInputValue("");
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue, connections);
      setMessages(prevMessages => [...prevMessages, {
        id: Date.now(),
        text: botResponse,
        sender: "bot" as const,
      }]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto mb-4 bg-purple-50 rounded-lg border border-purple-200 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card className={`max-w-[80%] ${
              message.sender === "user" 
                ? "bg-purple-600 text-white border-purple-700" 
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
                  <div className={message.sender === "user" ? "text-white" : "text-purple-800"}>
                    {message.text}
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
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!inputValue.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Helper function to generate bot responses
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
