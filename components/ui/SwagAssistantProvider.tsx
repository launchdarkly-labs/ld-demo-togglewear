import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { useShopper } from "@/components/ui/ShopperProvider";
import { greetingFor, replyTo, type ChatMessage } from "@/lib/swagAssistant";

// Owns whether the assistant is open and what has been said. Both used to
// live in SwagAssistant itself, which meant two things: the conversation was
// thrown away on every page change, and nothing outside that corner of the
// screen could open it — so the cart's Contact Swag Support link had nowhere
// to point.
//
// The persona is read here rather than taken as a prop, because every page
// was passing the same useShopper() value down and the greeting is the only
// reason the assistant needed it.
type SwagAssistantApi = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  messages: ChatMessage[];
  send: (text: string) => void;
  // Whether the products the assistant recommends show member pricing, which
  // is the same multi-context story the rest of the page tells.
  memberPricing: boolean;
};

const SwagAssistantContext = createContext<SwagAssistantApi | null>(null);

export function SwagAssistantProvider({ children }: { children: ReactNode }) {
  const { persona } = useShopper();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const open = useCallback(() => {
    // Seeded on first open rather than on mount, so switching persona before
    // opening still produces the right greeting.
    setMessages((prev) => (prev.length === 0 ? [greetingFor(persona)] : prev));
    setIsOpen(true);
  }, [persona]);

  const close = useCallback(() => setIsOpen(false), []);

  const send = useCallback((text: string) => {
    const user: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };
    // Once the AI Config is provisioned, replyTo is what gets replaced by a
    // real call.
    setMessages((prev) => [...prev, user, replyTo(text)]);
  }, []);

  return (
    <SwagAssistantContext.Provider
      value={{
        isOpen,
        open,
        close,
        messages,
        send,
        memberPricing: persona === "loyaltyGold",
      }}
    >
      {children}
    </SwagAssistantContext.Provider>
  );
}

export function useSwagAssistant() {
  const assistant = useContext(SwagAssistantContext);
  if (!assistant)
    throw new Error(
      "useSwagAssistant must be used inside SwagAssistantProvider",
    );
  return assistant;
}
