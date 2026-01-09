'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Send, Trash2, Plus, ChevronRight, MessageSquare, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string[];
  isLoading?: boolean;
}

export function QuickChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      reasoning: ['Analyzing your query...', 'Searching prediction markets...'],
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: data.response || 'Sorry, I could not process your request.',
                reasoning: data.reasoning,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: 'Sorry, there was an error processing your request. Please try again.',
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const toggleReasoning = (messageId: string) => {
    const newExpanded = new Set(expandedReasoning);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedReasoning(newExpanded);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Animated texture accent bar */}
      <div
        className="w-full h-3 flex-shrink-0 animate-texture-scroll"
        style={{
          backgroundImage: 'url(/brand/pixel-texture.jpeg)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">Quick Chat</span>
          <span className="text-[9px] text-[#888] bg-[#1a1a1a] px-1.5 py-0.5 rounded">AI</span>
          <button className="text-xs text-[#555] hover:text-white transition-colors">+ new</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#555]">{messages.length} messages</span>
          <Image
            src="/brand/icon.png"
            alt=""
            width={14}
            height={14}
            className="opacity-30"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <Image
              src="/brand/mascot.png"
              alt=""
              width={100}
              height={140}
              className="opacity-20 mb-4 animate-float"
            />
            <p className="text-[#666] text-sm">Ask me anything about markets</p>
            <p className="text-[#444] text-xs mt-1 mb-4">I can search, analyze, and compare</p>

            {/* Suggested Questions */}
            <div className="space-y-2 w-full max-w-sm">
              {[
                "What's the current probability of Bitcoin hitting $100k?",
                "Compare the Super Bowl winner odds",
                "Which AI company is leading in prediction markets?",
                "What markets have the highest volume today?",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="w-full p-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-xs text-[#666] hover:text-white hover:border-[#333] transition-all duration-200 text-left animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-[#444]" />
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className="animate-fade-in-up">
            {message.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-3">
                  <p className="text-sm text-white">{message.content}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Reasoning */}
                {message.reasoning && (
                  <div className="space-y-1">
                    {message.reasoning.map((reason, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 text-xs text-[#555]"
                      >
                        {message.isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Loading indicator */}
                {message.isLoading && (
                  <div className="flex items-center gap-2 text-[#555]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}

                {/* Content with markdown-like formatting */}
                {!message.isLoading && message.content && (
                  <div className="text-sm text-white prose prose-invert prose-sm max-w-none">
                    {message.content.split('\n').map((line, i) => {
                      // Handle markdown tables
                      if (line.startsWith('|') && line.endsWith('|')) {
                        return (
                          <pre key={i} className="text-xs text-[#888] bg-[#0a0a0a] p-2 rounded overflow-x-auto">
                            {line}
                          </pre>
                        );
                      }
                      // Handle headers
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={i} className="font-semibold text-white mt-3 mb-1">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      // Handle bullet points
                      if (line.startsWith('- ')) {
                        return (
                          <p key={i} className="text-[#888] pl-3 before:content-['•'] before:mr-2 before:text-[#555]">
                            {line.slice(2)}
                          </p>
                        );
                      }
                      // Regular text
                      return line ? <p key={i} className="text-[#888]">{line}</p> : <br key={i} />;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([])}
            disabled={messages.length === 0}
            className="p-2 text-[#555] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isLoading ? 'Waiting for response...' : 'Ask about markets, crypto, sports, politics...'}
              disabled={isLoading}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#333] transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#555] hover:text-white hover:bg-[#1a1a1a] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
