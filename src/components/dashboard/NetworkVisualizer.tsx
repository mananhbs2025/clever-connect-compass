
import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Network, Users, Activity } from "lucide-react";

interface NetworkVisualizerProps {
  connections: any[];
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ connections }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({
    companies: 0,
    industries: 0,
    locations: 0,
  });

  useEffect(() => {
    if (!connections.length) return;
    
    // Calculate stats
    const companies = new Set(connections.map(c => c.Company).filter(Boolean)).size;
    const industries = Math.floor(companies * 0.6); // Simulated for demo
    const locations = new Set(connections.map(c => c.Location).filter(Boolean)).size;
    
    setStats({
      companies,
      industries,
      locations
    });

    // Draw visualization
    drawNetwork();
  }, [connections]);

  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas || !connections.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw visualization
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw central node (user)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#9333ea';
    ctx.fill();
    
    // Draw connections (max 30 for performance)
    const connectionLimit = Math.min(connections.length, 30);
    
    for (let i = 0; i < connectionLimit; i++) {
      const angle = (i / connectionLimit) * Math.PI * 2;
      const distance = 100 + Math.random() * 50;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Draw connecting line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#d8b4fe';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw connection node
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      
      // Color by type (random for demo)
      const colors = ['#c084fc', '#a855f7', '#7e22ce', '#6b21a8'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fill();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="p-4 border-purple-200 bg-purple-50">
          <div className="flex items-center gap-3">
            <div className="bg-purple-200 p-2 rounded-full">
              <Users className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-purple-600">Companies</p>
              <p className="text-xl font-bold text-purple-800">{stats.companies}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-purple-200 bg-purple-50">
          <div className="flex items-center gap-3">
            <div className="bg-purple-200 p-2 rounded-full">
              <Activity className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-purple-600">Industries</p>
              <p className="text-xl font-bold text-purple-800">{stats.industries}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-purple-200 bg-purple-50">
          <div className="flex items-center gap-3">
            <div className="bg-purple-200 p-2 rounded-full">
              <Network className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-purple-600">Locations</p>
              <p className="text-xl font-bold text-purple-800">{stats.locations}</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="bg-white border border-purple-200 rounded-lg shadow-sm p-2 flex justify-center">
        {connections.length === 0 ? (
          <div className="text-center py-12 text-purple-600">
            <Network className="h-10 w-10 mx-auto mb-2 text-purple-300" />
            <p>Import connections to see your network visualization</p>
          </div>
        ) : (
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={400} 
            className="w-full max-h-[400px]"
          />
        )}
      </div>
      
      <p className="text-xs text-purple-600 text-center">
        This visualization shows your direct connections and how they relate to you.
      </p>
    </div>
  );
};
