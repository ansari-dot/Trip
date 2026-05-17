import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  LoaderCircle,
  MessageSquare,
  RotateCcw,
  SendHorizontal,
  X,
  Mic,
} from "lucide-react";
import { getApiUrl, parseJsonSafely } from "../lib/api";
import ChatActionBar from "./tripPlanner/ChatActionBar";
import {
  CUSTOM_STEPS,
  EMPTY_QUOTE,
  type ChatMessage,
  type ChatAction,
  type CustomQuoteForm,
  type FlowStep,
  whatsAppHref,
} from "./tripPlanner/constants";
import { useTripCatalog } from "./tripPlanner/useTripCatalog";

const WELCOME =
  "Welcome to North Paradise! I'm your dedicated AI Travel Expert. I'm here to help you find the perfect tour package, plan a custom itinerary, or answer any questions. Where are you dreaming of going?";

type AiPackageSummary = {
  id: string;
  title: string;
  path: string;
};

function actionsFromAiPackages(packages: AiPackageSummary[]): ChatAction[] {
  return [
    { id: "custom_trip", label: "Request a custom quote" },
    { id: "browse_tours", label: "Browse more tour packages" },
  ];
}

const MENU_ACTIONS: ChatAction[] = [
  { id: "browse_tours", label: "Browse more tour packages" },
  { id: "custom_trip", label: "Request a custom quote" },
];

function parseMessageLinks(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      const isExternal = match[2].startsWith("http");
      if (isExternal) {
        return (
          <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
            {match[1]}
          </a>
        );
      }
      return (
        <Link key={i} to={match[2]} className="font-semibold text-blue-600 hover:underline">
          {match[1]}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-2 sm:gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div
          className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 border border-gray-200"
          aria-hidden
        >
          <Bot className="h-5 w-5 text-gray-600" strokeWidth={2} />
        </div>
      )}
      <div
        className={`max-w-[min(100%,18.5rem)] sm:max-w-[18rem] rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed whitespace-pre-wrap break-words ${isUser
            ? "rounded-br-sm bg-gray-900 text-white"
            : "rounded-bl-sm border border-gray-100 bg-white text-gray-800 shadow-sm"
          }`}
      >
        {isUser ? content : parseMessageLinks(content)}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 sm:gap-3">
      <div
        className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 border border-gray-200"
        aria-hidden
      >
        <Bot className="h-5 w-5 text-gray-600" />
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
          <span className="font-medium">Crafting response</span>
          <span className="flex gap-1 pl-1" aria-hidden>
            <span className="h-1 w-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
            <span className="h-1 w-1 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
            <span className="h-1 w-1 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TripPlannerChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [actions, setActions] = useState<ChatAction[]>(MENU_ACTIONS);
  const [flowStep, setFlowStep] = useState<FlowStep>("menu");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [selectedDestId, setSelectedDestId] = useState("");
  const [customForm, setCustomForm] = useState<CustomQuoteForm>({ ...EMPTY_QUOTE });
  const [customStepIndex, setCustomStepIndex] = useState(0);
  const [stepInput, setStepInput] = useState("");
  const [draft, setDraft] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [quoteSending, setQuoteSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const catalog = useTripCatalog(true);
  const [pendingBrowse, setPendingBrowse] = useState(false);

  const appendUser = (text: string) => {
    setMessages((m) => [...m, { role: "user", content: text }]);
  };

  const appendAssistant = (content: string, nextActions: ChatAction[] = []) => {
    setMessages((m) => [...m, { role: "assistant", content, actions: nextActions }]);
    setActions(nextActions);
  };

  const resetChat = useCallback(() => {
    setMessages([{ role: "assistant", content: WELCOME, actions: MENU_ACTIONS }]);
    setActions(MENU_ACTIONS);
    setFlowStep("menu");
    setSelectedType("");
    setSelectedPlace("");
    setSelectedDestId("");
    setCustomForm({ ...EMPTY_QUOTE });
    setCustomStepIndex(0);
    setStepInput("");
    setDraft("");
    setAiLoading(false);
    setError("");
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) resetChat();
  }, [open, messages.length, resetChat]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, actions, flowStep, open, aiLoading]);

  const startCustomTrip = (prefillDest = "") => {
    setFlowStep("custom_form" as any);
    setCustomForm({
      ...EMPTY_QUOTE,
      destination: prefillDest || selectedPlace || customForm.destination,
      serviceType: selectedType
        ? `Custom Trip — ${selectedType}${selectedPlace ? ` — ${selectedPlace}` : ""}`
        : EMPTY_QUOTE.serviceType,
    });
  };

  const showTourTypes = () => {
    if (!catalog.ready) {
      setPendingBrowse(true);
      appendAssistant("Loading tour packages from our website…", []);
      return;
    }

    setFlowStep("pick_type");
    const types = catalog.tourTypes.length
      ? catalog.tourTypes.map((t) => ({
        id: `type_${t.name}`,
        label: `${t.name} tours`,
      }))
      : Array.from(new Set(catalog.packages.map((p) => p.type).filter(Boolean))).map((t) => ({
        id: `type_${t}`,
        label: `${t} tours`,
      }));

    if (!types.length) {
      const pkgLinks = catalog.packages.length ? "\n\n" + catalog.packages.slice(0, 4).map(p => `• [${p.title}](${p.path})`).join("\n") : "";
      appendAssistant(
        catalog.packages.length
          ? `Pick a package below or browse all tours on our site:${pkgLinks}`
          : "Browse all packages on our website, or describe your trip in the message box below.",
        [
          { id: "view_packages", label: "All tour packages", href: "/tour-packages" },
          { id: "custom_trip", label: "Request a custom quote" },
        ]
      );
      return;
    }

    appendAssistant(
      "We offer different styles of tours. Which type interests you?",
      [...types, { id: "view_packages", label: "View all packages", href: "/tour-packages" }]
    );
  };

  useEffect(() => {
    if (!pendingBrowse || !catalog.ready) return;
    setPendingBrowse(false);
    showTourTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBrowse, catalog.ready]);

  const showPlaces = (typeName: string) => {
    setFlowStep("pick_place");
    setSelectedType(typeName);
    const places = catalog.placesForType(typeName);

    if (!places.length) {
      appendAssistant(`Here are our ${typeName} packages on the website:`, [
        {
          id: "filter_type",
          label: `See ${typeName} packages`,
          href: `/tour-packages?type=${encodeURIComponent(typeName)}`,
        },
        { id: "custom_trip", label: "Request a custom quote" },
      ]);
      return;
    }

    appendAssistant(
      `Great choice — ${typeName} tours! Which place would you like to visit?`,
      places.map((p) => ({
        id: `place_${p.name}`,
        label: p.name,
      }))
    );
  };

  const showPlaceInfo = (placeName: string, destId: string) => {
    setFlowStep("place_info");
    setSelectedPlace(placeName);
    setSelectedDestId(destId);
    const pkgs = catalog.packagesFor(selectedType, placeName);

    const pkgLinks = pkgs.length ? "\n\n" + pkgs.slice(0, 4).map(p => `• [${p.title}](${p.path})`).join("\n") : "";

    const waText = `Hi, I'm interested in booking a tour to ${placeName}.`;
    appendAssistant(
      `${placeName} is a wonderful choice! Explore our packages below.${pkgLinks}`,
      [
        { id: "wa_book", label: "Book this package", href: whatsAppHref(waText), external: true },
        { id: "browse_tours", label: "Browse more tour packages" },
        { id: "custom_trip", label: "Request a custom quote" },
      ]
    );
  };

  const showBookingOptions = () => {
    setFlowStep("booking");
    const waText = `Hi, I'm interested in a ${selectedType || "tour"} to ${selectedPlace || "Northern Pakistan"} via North Paradise website.`;
    appendAssistant(
      "Ready to book? Chat with us on WhatsApp, or send a custom quote request.",
      [
        {
          id: "wa_chat",
          label: "Book via WhatsApp",
          href: whatsAppHref(waText),
          external: true,
        },
        { id: "custom_trip", label: "Request a custom quote" },
        { id: "browse_tours", label: "Browse more tour packages" },
      ]
    );
  };



  const submitQuote = async () => {
    setQuoteSending(true);
    setError("");
    try {
      const res = await fetch(getApiUrl("/api/quotes"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customForm.name.trim(),
          email: customForm.email.trim(),
          whatsappNumber: customForm.whatsappNumber.trim(),
          destination: customForm.destination.trim(),
          travelDates: customForm.travelDates.trim(),
          numberOfDays: customForm.numberOfDays ? Number(customForm.numberOfDays) : undefined,
          travelers: customForm.travelers ? Number(customForm.travelers) : 2,
          message: [
            customForm.message.trim(),
            `[Trip Planner] Type: ${selectedType || "—"}, Place: ${selectedPlace || "—"}`,
          ]
            .filter(Boolean)
            .join("\n"),
          serviceType: customForm.serviceType,
        }),
      });
      const data = await parseJsonSafely(res);
      if (!res.ok) {
        setError(data?.message || "Could not send quote.");
        return;
      }
      setFlowStep("done");
      appendAssistant("Thank you for your booking form. Our team will contact you soon.", [
        { id: "wa_chat", label: "WhatsApp us", href: whatsAppHref("Hi, I just sent a quote via the trip planner."), external: true },
        { id: "browse_tours", label: "Browse more tour packages" },
        { id: "menu", label: "Start new chat" },
      ]);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setQuoteSending(false);
    }
  };

  const handleAction = (actionId: string) => {
    if (actionId === "menu") {
      resetChat();
      return;
    }
    if (actionId === "browse_tours") {
      appendUser("Browse more tour packages");
      showTourTypes();
      return;
    }
    if (actionId === "custom_trip") {
      appendUser("Request a custom quote");
      startCustomTrip();
      return;
    }
    if (actionId === "go_booking") {
      appendUser("Book this package");
      showBookingOptions();
      return;
    }
    if (actionId === "talk_advisor") {
      appendUser("Talk to trip advisor");
      showBookingOptions();
      return;
    }
    if (actionId === "send_quote") {
      appendUser("Send quote");
      void submitQuote();
      return;
    }

    if (actionId.startsWith("type_")) {
      const typeName = actionId.replace(/^type_/, "");
      appendUser(`${typeName} tours`);
      showPlaces(typeName);
      return;
    }
    if (actionId.startsWith("place_")) {
      const placeName = actionId.replace(/^place_/, "");
      const place = catalog.placesForType(selectedType).find((p) => p.name === placeName);
      appendUser(placeName);
      showPlaceInfo(placeName, place?.destinationId || "");
      return;
    }
  };



  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    
    const initialDraft = draft ? draft + " " : "";

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setDraft(initialDraft + transcript);
    };
    
    recognition.onerror = (event: any) => {
      setIsRecording(false);
      if (event.error === "not-allowed") {
        setError("Please allow microphone access in your browser to use voice.");
      } else {
        setError("Voice error: " + event.error);
      }
    };
    
    recognition.onend = () => setIsRecording(false);
    
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const sendAiMessage = async () => {
    const text = draft.trim();
    if (!text || aiLoading || quoteSending) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setDraft("");
    setError("");
    appendUser(text);
    setAiLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, messages: history }),
      });
      const body = await parseJsonSafely(res);
      const data = body?.data ?? body;

      if (!res.ok || body?.success === false) {
        const msg =
          body?.message ||
          (res.status === 503
            ? "AI planner is not available right now. Set GROQ_API_KEY on the server, or use the buttons above."
            : res.status === 400
              ? "Please describe your Pakistan tour (destination, days, travelers)."
              : "Could not get a reply. Please try again.");
        setError(msg);
        appendAssistant(msg, MENU_ACTIONS);
        return;
      }

      const reply = String(data?.reply || "").trim();
      const packages = (Array.isArray(data?.matchedPackages) ? data.matchedPackages : []) as AiPackageSummary[];

      let finalReply = reply || "How can I help you plan your trip?";
      if (packages.length) {
        finalReply += "\n\nHere are some tours you might like:\n" + packages.slice(0, 4).map(p => `• [${p.title}](${p.path})`).join("\n");
      }

      appendAssistant(
        finalReply,
        packages.length ? actionsFromAiPackages(packages) : MENU_ACTIONS
      );
    } catch {
      setError("Network error. Check your connection and try again.");
      appendAssistant("I couldn't reach the server. Try again in a moment.", MENU_ACTIONS);
    } finally {
      setAiLoading(false);
    }
  };

  const showMainInput = flowStep !== ("custom_form" as any);

  return (
    <>
      <button
        type="button"
        id="trip-planner-launcher"
        onClick={() => setOpen((v) => !v)}
        className={`group fixed z-[9999] right-4 sm:right-6 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 flex h-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 ${open ? "w-14 max-sm:hidden" : "px-4"}`}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <X className="h-6 w-6 shrink-0" strokeWidth={2} />
        ) : (
          <>
            <MessageSquare className="h-6 w-6 shrink-0" strokeWidth={2} />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 ease-in-out group-hover:max-w-[150px] group-hover:ml-3 group-hover:opacity-100 max-sm:hidden">
              Talk to AI Bot
            </span>
          </>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 top-[var(--site-nav-height)] z-[9998] bg-gray-900/20 backdrop-blur-sm sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="fixed z-[9998] left-0 right-0 bottom-0 top-[var(--site-nav-height)] flex flex-col overflow-hidden bg-gray-50 animate-in slide-in-from-bottom-4 duration-300 sm:left-auto sm:right-6 sm:bottom-[5.5rem] sm:top-auto sm:h-[40rem] sm:w-[min(100%,24rem)] sm:max-h-[calc(100dvh-7rem)] sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl"
            role="dialog"
            aria-label="Trip planner"
          >
            <header className="relative shrink-0 border-b border-gray-200 bg-white px-4 py-3 sm:px-4">
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                    <Bot className="h-5 w-5 text-gray-600" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-900 leading-tight">AI Travel Expert</p>
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Online • Ready to plan your trip
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={resetChat}
                    className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label="Start new chat"
                    title="New chat"
                  >
                    <RotateCcw className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </header>

            <div
              ref={listRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4 space-y-4 bg-gray-50"
            >
              {messages.map((msg, i) => (
                <MessageBubble key={`${i}-${msg.role}`} role={msg.role} content={msg.content} />
              ))}
              {aiLoading && <TypingIndicator />}
            </div>
            <ChatActionBar
              actions={actions}
              onAction={handleAction}
              onNavigate={() => setOpen(false)}
              disabled={quoteSending || aiLoading}
            />

            {error && (
              <p className="mx-3 mb-1 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
                {error}
              </p>
            )}

            {flowStep === ("custom_form" as any) && (
              <div className="absolute inset-0 z-20 flex flex-col bg-gray-50 animate-in slide-in-from-bottom-4">
                <header className="shrink-0 border-b border-gray-200 bg-white px-5 py-4 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-semibold text-gray-900">Custom Trip Request</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Tell us what you're looking for.</p>
                  </div>
                  <button onClick={() => setFlowStep("menu")} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                    <X className="h-5 w-5" strokeWidth={2} />
                  </button>
                </header>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {CUSTOM_STEPS.map((step) => (
                    <div key={step.key} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        {step.label} {step.required && <span className="text-red-500">*</span>}
                      </label>
                      {step.type === "textarea" ? (
                        <textarea
                          value={customForm[step.key]}
                          onChange={(e) => setCustomForm({ ...customForm, [step.key]: e.target.value })}
                          placeholder={step.placeholder}
                          rows={3}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-shadow"
                        />
                      ) : (
                        <input
                          value={customForm[step.key]}
                          onChange={(e) => setCustomForm({ ...customForm, [step.key]: e.target.value })}
                          type={step.type || "text"}
                          placeholder={step.placeholder}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-shadow"
                        />
                      )}
                    </div>
                  ))}
                  <div className="pt-2 pb-6">
                    <button
                      onClick={() => {
                        if (!customForm.name || !customForm.email || !customForm.whatsappNumber) {
                          setError("Please fill in required fields (Name, Email, WhatsApp).");
                          return;
                        }
                        void submitQuote();
                      }}
                      disabled={quoteSending}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-gray-800 disabled:opacity-70 transition-all shadow-md active:scale-[0.98]"
                    >
                      {quoteSending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : "Send Request"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showMainInput && (
              <footer className="shrink-0 bg-white p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-gray-100">
                <div className="flex gap-2 items-end rounded-2xl border border-gray-200 bg-white p-1.5 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-shadow">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void sendAiMessage())}
                    placeholder="Ask about tours or destinations..."
                    disabled={aiLoading}
                    className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-60"
                    aria-label="Message trip advisor"
                  />
                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={aiLoading || quoteSending}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${isRecording ? "bg-red-50 text-red-600 animate-pulse" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"} disabled:opacity-40`}
                    aria-label="Voice input"
                  >
                    <Mic className="h-5 w-5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void sendAiMessage()}
                    disabled={!draft.trim() || aiLoading || quoteSending}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 transition-colors"
                    aria-label="Send message"
                  >
                    {aiLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <SendHorizontal className="h-4 w-4" strokeWidth={2} />}
                  </button>
                </div>
              </footer>
            )}
          </div>
        </>
      )}
    </>
  );
}
