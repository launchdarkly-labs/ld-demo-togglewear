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
  // Back to the state it has on first open, greeting and suggested prompts
  // included, so the same demo can be run again for the next prospect
  // without reloading the page.
  reset: () => void;
  // Whether the panel is at its larger size. Kept here rather than in the
  // panel so it survives both closing and a page change, for the same reason
  // the conversation does.
  expanded: boolean;
  toggleExpanded: () => void;
  // Whether the products the assistant recommends show member pricing, which
  // is the same multi-context story the rest of the page tells.
  memberPricing: boolean;
};

const SwagAssistantContext = createContext<SwagAssistantApi | null>(null);

export function SwagAssistantProvider({ children }: { children: ReactNode }) {
  const { persona } = useShopper();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
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

  // Straight back to one greeting rather than to nothing, because a single
  // message is also what makes the panel offer its suggested prompts again.
  const reset = useCallback(() => {
    setMessages([greetingFor(persona)]);
  }, [persona]);

  const toggleExpanded = useCallback(
    () => setExpanded((open) => !open),
    [],
  );

  return (
    <SwagAssistantContext.Provider
      value={{
        isOpen,
        open,
        close,
        messages,
        send,
        reset,
        expanded,
        toggleExpanded,
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
