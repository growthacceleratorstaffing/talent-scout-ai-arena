import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, UserX, Briefcase, Bot, ClipboardCheck } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Briefcase },
    { path: '/ads', label: 'Job Ads', icon: Sparkles },
    { path: '/applicants', label: 'Applicants', icon: Users },
    { path: '/ai-interview', label: 'AI Interview', icon: Bot },
    { path: '/assessment', label: 'Assessment', icon: ClipboardCheck },
    { path: '/talent-pool', label: 'Talent Pool', icon: UserX }
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              {/* Custom Logo */}
              <img
                src="/lovable-uploads/0008ba7e-a588-452c-8c88-bfc190c9e49e.png"
                alt="Growth Accelerator Logo"
                className="w-8 h-8 rounded-lg object-contain bg-transparent"
                style={{ background: 'transparent' }}
              />
              <span className="text-xl font-bold text-gray-900">Growth Accelerator</span>
              {/* Remove Beta badge, or keep if still needed */}
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center gap-2 ${
                        isActive 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge className="bg-green-100 text-green-800">
              Azure AI Connected
            </Badge>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
