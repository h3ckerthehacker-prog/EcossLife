/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Plus, 
  X, 
  MessageSquare, 
  Globe, 
  Shield, 
  Zap,
  Menu,
  ChevronRight,
  Send,
  Sparkles,
  History,
  Bookmark,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { chatWithClide } from './services/geminiService';
import { Message, Tab } from './types';

const INITIAL_TABS: Tab[] = [
  { id: '1', url: 'https://eacoss.life/welcome', title: 'Welcome to Eacoss Life' }
];

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState<string>(INITIAL_TABS[0].id);
  const [urlInput, setUrlInput] = useState<string>(INITIAL_TABS[0].url);
  const [isClideOpen, setIsClideOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'model', 
      content: "Hello! I'm Clide, your AI assistant. How can I help you navigate the web today?", 
      timestamp: Date.now() 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let newUrl = urlInput;
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      if (newUrl.includes('.') && !newUrl.includes(' ')) {
        newUrl = `https://${newUrl}`;
      } else {
        newUrl = `https://www.google.com/search?q=${encodeURIComponent(newUrl)}`;
      }
    }
    
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: newUrl, title: newUrl } : t));
    setUrlInput(newUrl);
  };

  const addTab = () => {
    const newTab: Tab = {
      id: Math.random().toString(36).substr(2, 9),
      url: 'https://eacoss.life/new-tab',
      title: 'New Tab'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput(newTab.url);
  };

  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[0].id);
      setUrlInput(newTabs[0].url);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const response = await chatWithClide(inputValue, history);
    
    const clideMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: response,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, clideMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0A0A0A] text-white font-sans overflow-hidden">
      {/* Main Browser Area */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300 ease-in-out",
        isClideOpen ? "mr-0" : "mr-0"
      )}>
        {/* Tab Bar */}
        <div className="flex items-center bg-[#141414] px-2 pt-2 border-b border-white/5">
          <div className="flex flex-1 overflow-x-auto no-scrollbar gap-1">
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setUrlInput(tab.url);
                }}
                className={cn(
                  "group flex items-center min-w-[140px] max-w-[200px] h-9 px-3 rounded-t-lg cursor-pointer transition-colors",
                  activeTabId === tab.id 
                    ? "bg-[#1E1E1E] text-white border-x border-t border-white/10" 
                    : "text-white/50 hover:bg-white/5"
                )}
              >
                <Globe className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                <span className="text-xs truncate flex-1">{tab.title}</span>
                <button 
                  onClick={(e) => removeTab(tab.id, e)}
                  className="ml-2 p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button 
              onClick={addTab}
              className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 px-4">
            <button className="p-1.5 text-white/50 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center h-12 px-4 bg-[#1E1E1E] border-b border-white/5 gap-4">
          <div className="flex items-center gap-1">
            <button className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleNavigate} className="flex-1 relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <div className="w-px h-3 bg-white/10" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-[#2A2A2A] border border-white/5 rounded-full py-1.5 pl-12 pr-10 text-sm focus:outline-none focus:border-white/20 focus:bg-[#323232] transition-all"
              placeholder="Search or enter URL"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsClideOpen(!isClideOpen)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                isClideOpen 
                  ? "bg-white text-black" 
                  : "bg-white/5 text-white hover:bg-white/10"
              )}
            >
              <Sparkles className={cn("w-4 h-4", isClideOpen ? "text-black" : "text-indigo-400")} />
              Clide
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white relative overflow-hidden">
          {activeTab.url.includes('eacoss.life/welcome') ? (
            <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
              >
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-4 tracking-tight">Eacoss Life</h1>
                <p className="text-xl text-white/60 mb-12">
                  The next generation of web browsing, powered by intelligence.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <Zap className="w-6 h-6 text-amber-400 mb-4" />
                    <h3 className="font-semibold mb-2">Lightning Fast</h3>
                    <p className="text-sm text-white/50">Optimized engine for the modern web.</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <Shield className="w-6 h-6 text-emerald-400 mb-4" />
                    <h3 className="font-semibold mb-2">Privacy First</h3>
                    <p className="text-sm text-white/50">Built-in tracking protection and ad blocking.</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <Sparkles className="w-6 h-6 text-indigo-400 mb-4" />
                    <h3 className="font-semibold mb-2">AI Assistant</h3>
                    <p className="text-sm text-white/50">Clide is always here to help you browse smarter.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : activeTab.url.includes('eacoss.life/new-tab') ? (
            <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col p-12">
              <div className="max-w-4xl mx-auto w-full">
                <h2 className="text-2xl font-semibold mb-8 text-white/40">Quick Access</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                  {[
                    { name: 'Google', url: 'https://google.com', icon: Search },
                    { name: 'YouTube', url: 'https://youtube.com', icon: Globe },
                    { name: 'GitHub', url: 'https://github.com', icon: Globe },
                    { name: 'Twitter', url: 'https://twitter.com', icon: Globe },
                    { name: 'Reddit', url: 'https://reddit.com', icon: Globe },
                    { name: 'News', url: 'https://news.google.com', icon: Globe },
                  ].map((site) => (
                    <button 
                      key={site.name}
                      onClick={() => {
                        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: site.url, title: site.name } : t));
                        setUrlInput(site.url);
                      }}
                      className="flex flex-col items-center gap-3 group"
                    >
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <site.icon className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs text-white/40 group-hover:text-white transition-colors">{site.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-white flex flex-col items-center justify-center text-black p-8">
              <iframe 
                src={activeTab.url} 
                className="w-full h-full border-none"
                title={activeTab.title}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
              {/* Fallback overlay if iframe fails (CORS) */}
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <Globe className="w-16 h-16 text-black/20 mb-6" />
                <h2 className="text-2xl font-bold mb-2">Viewing External Content</h2>
                <p className="text-black/60 max-w-md">
                  Some websites restrict being viewed inside other applications. 
                  Clide can still help you summarize or analyze this page if you provide the content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clide Sidebar */}
      <AnimatePresence>
        {isClideOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[400px] bg-[#141414] border-l border-white/10 flex flex-col z-50 shadow-2xl"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1E1E1E]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Clide</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsClideOpen(false)}
                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none"
                  )}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/20 mt-1.5 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#1E1E1E] border-t border-white/5">
              <form 
                onSubmit={handleSendMessage}
                className="relative"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Clide anything..."
                  className="w-full bg-[#2A2A2A] border border-white/5 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-300 disabled:text-white/10 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <div className="mt-3 flex items-center justify-between px-1">
                <div className="flex gap-2">
                  <button className="p-1.5 text-white/30 hover:text-white/60 transition-colors">
                    <History className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-white/30 hover:text-white/60 transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] text-white/20 font-medium uppercase tracking-widest">
                  Powered by Gemini
                </span>
              </div>
              <div className="mt-4">
                <button 
                  onClick={async () => {
                    if (isLoading) return;
                    setIsLoading(true);
                    const summary = await chatWithClide(`Please summarize the current page: ${activeTab.url}`);
                    const clideMessage: Message = {
                      id: Date.now().toString(),
                      role: 'model',
                      content: summary,
                      timestamp: Date.now()
                    };
                    setMessages(prev => [...prev, clideMessage]);
                    setIsLoading(false);
                  }}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/60 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  Summarize Current Page
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle (when closed) */}
      {!isClideOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsClideOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-500 transition-colors z-50"
        >
          <Sparkles className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}
