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
    <div className="flex flex-col h-full bg-[#F5F0E1]">
      {/* Decorative top stripe */}
      <div className="w-full h-2 flex-shrink-0 bg-gradient-to-r from-[#6B7B5E] via-[#8B7355] to-[#6B7B5E]" />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b-2 border-[#E8E2D0]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#5A6A4D]" />
          <span className="text-sm font-bambino font-bold text-[#3A4A2D]">Quick Chat</span>
          <span className="text-[9px] text-[#6B7B5E] bg-[#EFEAD9] px-1.5 py-0.5 rounded-lg font-bambino font-bold border border-[#D4CDB8]">AI</span>
          <button className="text-xs text-[#8B9B7E] hover:text-[#5A6A4D] transition-colors font-bambino font-bold">+ new</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8B9B7E] font-bambino">{messages.length} messages</span>
          <Image
            src="/brand/helmet-logo.png"
            alt=""
            width={16}
            height={16}
            className="opacity-40"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#EFEAD9]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#6B7B5E]/10 rounded-full blur-xl" />
              <Image
                src="/brand/mascot.png"
                alt=""
                width={80}
                height={80}
                className="relative opacity-30 mb-4"
              />
            </div>
            <p className="text-[#6B7B5E] text-sm font-bambino font-bold">Ask me anything about markets</p>
            <p className="text-[#8B9B7E] text-xs mt-1 mb-4 font-bambino">I can search, analyze, and compare</p>

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
                  className="w-full p-2.5 bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-xl text-xs text-[#6B7B5E] hover:text-[#3A4A2D] hover:border-[#6B7B5E] transition-all duration-200 text-left animate-fade-in-up font-bambino"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-[#8B9B7E]" />
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
                <div className="max-w-[80%] bg-[#6B7B5E] border-2 border-[#5A6A4D] rounded-2xl p-3 shadow-lg">
                  <p className="text-sm text-[#F5F0E1] font-bambino">{message.content}</p>
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
                        className="flex items-center gap-1 text-xs text-[#8B9B7E] font-bambino"
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
                  <div className="flex items-center gap-2 text-[#8B9B7E]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-bambino">Thinking...</span>
                  </div>
                )}

                {/* Content with markdown-like formatting */}
                {!message.isLoading && message.content && (
                  <div className="text-sm text-[#3A4A2D] max-w-none bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-2xl p-4">
                    {message.content.split('\n').map((line, i) => {
                      // Handle markdown tables
                      if (line.startsWith('|') && line.endsWith('|')) {
                        return (
                          <pre key={i} className="text-xs text-[#6B7B5E] bg-[#EFEAD9] p-2 rounded-lg overflow-x-auto font-mono">
                            {line}
                          </pre>
                        );
                      }
                      // Handle headers
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={i} className="font-bambino font-bold text-[#3A4A2D] mt-3 mb-1">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      // Handle bullet points
                      if (line.startsWith('- ')) {
                        return (
                          <p key={i} className="text-[#5A6A4D] pl-3 before:content-['•'] before:mr-2 before:text-[#8B9B7E] font-bambino">
                            {line.slice(2)}
                          </p>
                        );
                      }
                      // Regular text
                      return line ? <p key={i} className="text-[#5A6A4D] font-bambino">{line}</p> : <br key={i} />;
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
      <div className="p-3 border-t-2 border-[#E8E2D0] bg-[#F5F0E1]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([])}
            disabled={messages.length === 0}
            className="p-2 text-[#8B9B7E] hover:text-[#C45A4A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
              className="w-full bg-[#EFEAD9] border-2 border-[#D4CDB8] rounded-xl px-4 py-2.5 pr-10 text-sm text-[#3A4A2D] placeholder:text-[#8B9B7E] focus:outline-none focus:border-[#6B7B5E] transition-colors disabled:opacity-50 font-bambino"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#8B9B7E] hover:text-[#5A6A4D] hover:bg-[#E8E2D0] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
