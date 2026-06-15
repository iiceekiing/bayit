"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Message } from "@/lib/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

interface Options {
  token: string;
  onNewMessage: (msg: Message) => void;
  onTyping?: (isTyping: boolean, fromId: string) => void;
}

export function useTypingWs({ token, onNewMessage, onTyping }: Options) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(`${SOCKET_URL}/messages`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("newMessage", (msg: Message) => {
      onNewMessage(msg);
    });

    socket.on("typing", ({ fromId, isTyping }: { fromId: string; isTyping: boolean }) => {
      onTyping?.(isTyping, fromId);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const sendTyping = useCallback((toId: string, isTyping: boolean) => {
    socketRef.current?.emit("typing", { toId, isTyping });
  }, []);

  return { sendTyping };
}
