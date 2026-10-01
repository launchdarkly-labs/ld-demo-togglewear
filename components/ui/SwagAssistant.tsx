import { useState } from "react";
import ChatLauncher from "@/components/ui/ChatLauncher";
import ChatPanel from "@/components/ui/ChatPanel";
import { greetingFor, replyTo, type ChatMessage } from "@/lib/swagAssistant";
import { type AnnouncementPersona } from "@/components/layout/AnnouncementBar";

// Owns the open/closed state and the conversation. The launcher and the panel
// occupy the same corner, so only one is mounted at a time.
//
// The persona drives both the greeting and whether recommended products show
// member pricing, which is the same multi-context story the rest of the page
// tells. Once the AI Config is provisioned, replyTo is what gets replaced by
// a real call.
export default function SwagAssistant({
  persona,
}: {
  persona: AnnouncementPersona;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function open() {
    // Seed the greeting on first open so that switching persona before
    // opening still produces the right one.
    if (messages.length === 0) setMessages([greetingFor(persona)]);
    setIsOpen(true);
  }

  function send(text: string) {
    const user: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, user, replyTo(text)]);
  }

  if (!isOpen) return <ChatLauncher onClick={open} />;

  return (
    <ChatPanel
      messages={messages}
      memberPricing={persona === "loyaltyGold"}
      onSend={send}
      onClose={() => setIsOpen(false)}
    />
  );
}
