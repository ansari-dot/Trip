import { whatsAppUrl, WHATSAPP_NUMBER } from "../../lib/site";

export { WHATSAPP_NUMBER };
export const whatsAppHref = (text: string) => whatsAppUrl(text);

export type CustomQuoteForm = {
  name: string;
  email: string;
  whatsappNumber: string;
  destination: string;
  travelDates: string;
  numberOfDays: string;
  travelers: string;
  message: string;
  serviceType: string;
};

export const EMPTY_QUOTE: CustomQuoteForm = {
  name: "",
  email: "",
  whatsappNumber: "",
  destination: "",
  travelDates: "",
  numberOfDays: "",
  travelers: "2",
  message: "",
  serviceType: "Custom Trip (Trip Planner)",
};

export type CustomFieldKey = keyof CustomQuoteForm;

export const CUSTOM_STEPS: { key: CustomFieldKey; label: string; placeholder: string; required?: boolean; type?: "email" | "tel" | "number" | "textarea" }[] = [
  { key: "name", label: "Full name", placeholder: "Your name", required: true },
  { key: "email", label: "Email address", placeholder: "you@email.com", required: true, type: "email" },
  { key: "whatsappNumber", label: "WhatsApp number", placeholder: "+92 300 1234567", required: true, type: "tel" },
  { key: "destination", label: "Destination", placeholder: "e.g. Hunza, Skardu" },
  { key: "travelDates", label: "Travel dates", placeholder: "e.g. June 2026" },
  { key: "numberOfDays", label: "Number of days", placeholder: "e.g. 7", type: "number" },
  { key: "travelers", label: "Number of travelers", placeholder: "2", type: "number" },
  { key: "message", label: "Special requests", placeholder: "Tell us about your dream trip…", type: "textarea" },
];

export type FlowStep =
  | "menu"
  | "pick_type"
  | "pick_place"
  | "place_info"
  | "booking"
  | "custom_field"
  | "custom_review"
  | "done";

export type ChatAction = {
  id: string;
  label: string;
  href?: string;
  external?: boolean;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  actions?: ChatAction[];
};
