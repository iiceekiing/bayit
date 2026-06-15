"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Loader2, Image, Paperclip } from "lucide-react";
import {
  adminGetConversation, adminSendMessage, getAdminToken,
  uploadChatImage, uploadChatDocument,
} from "@/lib/api";
import { useTypingWs } from "@/hooks/useTypingWs";
import type { Message } from "@/lib/types";

interface Props { params: Promise<{ userId: string }> }

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
}

export default function AdminChatPage({ params }: Props) {
  const { userId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const token = getAdminToken();

  const handleNewMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleTypingEvent = useCallback((isTyping: boolean, fromId: string) => {
    if (fromId === userId) setIsUserTyping(isTyping);
  }, [userId]);

  const { sendTyping } = useTypingWs({
    token,
    onNewMessage: handleNewMessage,
    onTyping: handleTypingEvent,
  });

  useEffect(() => {
    if (!token) return;
    adminGetConversation(userId, token).then(setMessages).finally(() => setLoading(false));
  }, [userId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    sendTyping(userId, true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => sendTyping(userId, false), 2000);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    if (!token) return;
    setSending(true);
    setText("");
    sendTyping(userId, false);
    try {
      const msg = await adminSendMessage(userId, { content: t, messageType: "TEXT" }, token);
      setMessages((prev) => [...prev, msg]);
    } finally {
      setSending(false);
    }
  }

  async function handleFile(file: File, type: "image" | "document") {
    if (!token) return;
    setUploading(true);
    try {
      const { url } = type === "image"
        ? await uploadChatImage(file, token)
        : await uploadChatDocument(file, token);
      const msg = await adminSendMessage(userId, {
        content: null,
        messageType: type === "image" ? "IMAGE" : "DOCUMENT",
        fileUrl: url,
        fileName: file.name,
      }, token);
      setMessages((prev) => [...prev, msg]);
    } finally {
      setUploading(false);
    }
  }

  const grouped: { date: string; msgs: Message[] }[] = [];
  messages.forEach((m) => {
    const d = fmtDate(m.createdAt);
    const last = grouped[grouped.length - 1];
    if (last?.date === d) last.msgs.push(m);
    else grouped.push({ date: d, msgs: [m] });
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/admin/messages" className="text-navy-muted hover:text-navy-DEFAULT">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <p className="text-sm font-semibold text-navy-DEFAULT">User Chat</p>
          <p className="text-[10px] text-navy-muted">
            {isUserTyping ? "typing…" : <span className="font-mono">{userId.slice(0, 8)}…</span>}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-canvas px-4 py-4 space-y-1">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-navy-muted">No messages yet. Send the first message.</p>
          </div>
        ) : (
          grouped.map(({ date, msgs }) => (
            <div key={date}>
              <div className="text-center my-4">
                <span className="text-[10px] text-navy-faint bg-white border border-border px-3 py-1 rounded-full">{date}</span>
              </div>
              {msgs.map((m) => {
                const fromAdmin = m.fromAdmin;
                return (
                  <div key={m.id} className={`flex mb-2 ${fromAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      fromAdmin ? "bg-navy-DEFAULT text-white rounded-br-sm" : "bg-white border border-border text-navy-DEFAULT rounded-bl-sm"
                    }`}>
                      {m.messageType === "IMAGE" && m.fileUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.fileUrl} alt="img" className="rounded-xl max-w-full max-h-48 object-cover" />
                      ) : m.messageType === "DOCUMENT" && m.fileUrl ? (
                        <a href={m.fileUrl} target="_blank" rel="noopener noreferrer"
                          className={`text-xs underline ${fromAdmin ? "text-teal-light" : "text-teal-DEFAULT"}`}>
                          {m.fileName ?? "Document"}
                        </a>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                      )}
                      <p className="text-[10px] mt-1 text-navy-faint text-right">
                        {fmtTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator bubble */}
        {isUserTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-navy-faint rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-navy-faint rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-navy-faint rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-border px-4 py-3 shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <input ref={imgRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, "image"); e.target.value = ""; }} />
          <input ref={fileRef} type="file" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, "document"); e.target.value = ""; }} />

          <button type="button" onClick={() => imgRef.current?.click()} disabled={uploading}
            className="p-2 text-navy-faint hover:text-navy-muted shrink-0"><Image size={18} /></button>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="p-2 text-navy-faint hover:text-navy-muted shrink-0"><Paperclip size={18} /></button>

          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e as any); } }}
            placeholder="Reply…"
            rows={1}
            className="flex-1 border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-navy-DEFAULT resize-none"
          />
          <button type="submit" disabled={!text.trim() || sending || uploading}
            className="p-2.5 bg-navy-DEFAULT text-white rounded-full hover:bg-navy-light transition-colors disabled:opacity-40 shrink-0">
            {sending || uploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
