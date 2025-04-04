
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface Connection {
  "First Name": string;
  "Last Name": string;
  "Email Address": string | null;
  Company: string | null;
  Position: string | null;
  Location: string | null;
  "Connected On": string | null;
  URL: string | null;
  id: string;
  user_id: string;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { query, accessToken } = await req.json();
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not found" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!query || !accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing query or access token" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a Supabase client using the provided access token
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://xixicikohbspyfdkatwv.supabase.co';
    const supabase = createClient(supabaseUrl, accessToken);
    
    // Fetch user connections from Supabase
    const { data: connections, error: connectionsError } = await supabase
      .from('User_Connections')
      .select('*');
      
    if (connectionsError) {
      console.error("Error fetching connections:", connectionsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user connections" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare connection data for the AI model
    const connectionSummary = prepareConnectionData(connections as Connection[]);
    
    // Call OpenAI API with the user's query and connection data
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant named "Nubble Assistant" specialized in analyzing professional network data. 
                      You provide personalized insights based on the user's connections.
                      You are friendly, conversational, and always aim to be helpful.
                      Use the connection data provided to answer user questions accurately.
                      Keep responses concise (2-3 sentences when possible) and focused on the user's network. 
                      If you cannot answer based on the provided connection data, politely say so.
                      Here is the user's connection data: ${connectionSummary}`
          },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });
    
    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid response from OpenAI" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const aiResponse = data.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in chatbot function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to prepare connection data for the AI
function prepareConnectionData(connections: Connection[]): string {
  if (!connections || connections.length === 0) {
    return "No connection data available.";
  }
  
  // Create a summary of connections
  const totalConnections = connections.length;
  
  // Count companies
  const companies = connections
    .map(c => c.Company)
    .filter(Boolean);
    
  const companyCounts: Record<string, number> = {};
  companies.forEach(company => {
    if (company) {
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    }
  });
  
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => `${name} (${count})`);
  
  // Count locations
  const locations = connections
    .map(c => c.Location)
    .filter(Boolean);
    
  const locationCounts: Record<string, number> = {};
  locations.forEach(location => {
    if (location) {
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    }
  });
  
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => `${name} (${count})`);
  
  // Compile a concise data summary for the AI
  const summary = `
    Total connections: ${totalConnections}
    Top companies: ${topCompanies.join(', ') || 'None'}
    Top locations: ${topLocations.join(', ') || 'None'}
    
    Detailed connection data (limited to 20 most recent):
    ${connections.slice(0, 20).map(c => 
      `- ${c["First Name"]} ${c["Last Name"]}, ${c.Position || 'No position'} at ${c.Company || 'No company'}, Location: ${c.Location || 'Unknown'}`
    ).join('\n')}
  `;
  
  return summary;
}
