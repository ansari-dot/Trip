import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  MapPin,
  MessageCircle,
  Package,
  PenLine,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ChatAction } from "./constants";

type Props = {
  actions: ChatAction[];
  onAction: (id: string) => void;
  onNavigate?: () => void;
  disabled?: boolean;
};

function iconForAction(id: string, external?: boolean): LucideIcon {
  if (external) return MessageCircle;
  if (id === "browse_tours" || id.startsWith("type_")) return Compass;
  if (id.startsWith("place_") || id === "open_dest") return MapPin;
  if (id.startsWith("pkg_") || id === "view_packages" || id === "filter_type") return Package;
  if (id === "custom_trip" || id === "send_quote" || id === "edit_custom") return PenLine;
  if (id === "menu") return RotateCcw;
  return Sparkles;
}

const pillBase =
  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors touch-manipulation min-h-[2.5rem]";

export default function ChatActionBar({ actions, onAction, onNavigate, disabled }: Props) {
  if (!actions.length) return null;

  return (
    <div className="shrink-0 px-3 pb-2 pt-1">
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => {
          const Icon = iconForAction(a.id, a.external);
          const className = a.external
            ? `${pillBase} border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300`
            : a.href
              ? `${pillBase} border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300`
              : `${pillBase} border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50`;

          const inner = (
            <>
              <Icon className="h-4 w-4 shrink-0 text-gray-500" strokeWidth={2} />
              <span className="leading-tight">{a.label}</span>
              {a.href && !a.external ? <ArrowRight className="h-3.5 w-3.5 opacity-50" /> : null}
            </>
          );

          if (a.external && a.href) {
            return (
              <a key={a.id} href={a.href} target="_blank" rel="noopener noreferrer" className={className}>
                {inner}
              </a>
            );
          }

          if (a.href) {
            return (
              <Link key={a.id} to={a.href} onClick={onNavigate} className={className}>
                {inner}
              </Link>
            );
          }

          return (
            <button key={a.id} type="button" disabled={disabled} onClick={() => onAction(a.id)} className={className}>
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
