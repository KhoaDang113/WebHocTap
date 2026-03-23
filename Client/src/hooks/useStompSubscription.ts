import { useEffect, useRef } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface UseStompSubscriptionProps {
  topic: string | undefined;
  onMessage: (message: IMessage) => void;
  enabled?: boolean;
}

export function useStompSubscription({
  topic,
  onMessage,
  enabled = true,
}: UseStompSubscriptionProps) {
  const clientRef = useRef<Client | null>(null);

  // Lưu trữ callback onMessage mới nhất vào ref để tránh gọi lại useEffect khi onMessage thay đổi
  // (ví dụ nếu onMessage được khai báo inline)
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!topic || !enabled) return;

    // Ép kiểu an toàn (unknown sang WebSocket) thay vì dùng any
    const socket = new SockJS("/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket as unknown as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = function (frame) {
      console.log("Connected to WebSocket: ", frame);
      stompClient.subscribe(topic, (message) => {
        onMessageRef.current(message);
      });
    };

    stompClient.onStompError = function (frame) {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [topic, enabled]);

  return clientRef;
}
