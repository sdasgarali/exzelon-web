import {
  HeartPulse, HardHat, Zap, Scale, Code, Search, FileText, UserPlus, Send,
  UsersRound, Briefcase, Plane, UserCheck, ClipboardCheck, Settings2,
  Heart, ShieldCheck, Gauge, Target, Handshake, BadgeCheck, MapPin, Mail,
  Phone, Star, ArrowRight, ArrowUpRight, Check, Menu, X, ChevronDown,
  Quote, Clock, Building2,
  Sparkles, TrendingUp, Users, Award, MessageCircle, UserRound,
  LayoutDashboard, LogOut, Plus, Pencil, Trash2, Eye, Inbox, Bookmark,
  Filter, ExternalLink, type LucideIcon,
} from "lucide-react";

/** Brand/social glyphs (removed from lucide-react) as lightweight inline SVGs. */
const brandPaths: Record<string, string> = {
  linkedin:
    "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.3a1.75 1.75 0 110-3.5 1.75 1.75 0 010 3.5zM19 19h-3v-4.7c0-1.1-.02-2.5-1.53-2.5s-1.77 1.2-1.77 2.42V19h-3v-9h2.88v1.23h.04a3.16 3.16 0 012.84-1.56C18.34 9.67 19 11.6 19 14.11z",
  facebook:
    "M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z",
  instagram:
    "M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.8.22 2.43.47.66.25 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.63.42 1.36.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.8-.47 2.43a4.9 4.9 0 01-1.15 1.77c-.55.55-1.11.9-1.77 1.15-.63.25-1.36.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.8-.22-2.43-.47a4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77c-.25-.63-.42-1.36-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.8.47-2.43.25-.66.6-1.22 1.15-1.77.55-.55 1.11-.9 1.77-1.15.63-.25 1.36-.42 2.43-.47C8.94 2.01 9.28 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.25a3.25 3.25 0 110-6.5 3.25 3.25 0 010 6.5zM17.5 5.25a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z",
  twitter:
    "M18.9 2h3.4l-7.4 8.5L23.6 22h-6.8l-5.3-7-6.1 7H2l7.9-9.1L1.6 2h7l4.8 6.4L18.9 2zm-1.2 18h1.9L7.1 4H5.1l12.6 16z",
};

function BrandIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={brandPaths[name]} />
    </svg>
  );
}

const map: Record<string, LucideIcon> = {
  "heart-pulse": HeartPulse,
  "hard-hat": HardHat,
  zap: Zap,
  scale: Scale,
  code: Code,
  search: Search,
  "file-text": FileText,
  "user-plus": UserPlus,
  send: Send,
  "users-round": UsersRound,
  briefcase: Briefcase,
  plane: Plane,
  "user-check": UserCheck,
  "clipboard-check": ClipboardCheck,
  "settings-2": Settings2,
  heart: Heart,
  "shield-check": ShieldCheck,
  gauge: Gauge,
  target: Target,
  handshake: Handshake,
  "badge-check": BadgeCheck,
  "map-pin": MapPin,
  mail: Mail,
  phone: Phone,
  star: Star,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  check: Check,
  menu: Menu,
  x: X,
  "chevron-down": ChevronDown,
  quote: Quote,
  clock: Clock,
  "building-2": Building2,
  sparkles: Sparkles,
  "trending-up": TrendingUp,
  users: Users,
  award: Award,
  "message-circle": MessageCircle,
  "user-round": UserRound,
  "layout-dashboard": LayoutDashboard,
  "log-out": LogOut,
  plus: Plus,
  pencil: Pencil,
  "trash-2": Trash2,
  eye: Eye,
  inbox: Inbox,
  bookmark: Bookmark,
  filter: Filter,
  "external-link": ExternalLink,
};

export function Icon({
  name,
  className,
  strokeWidth = 2,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  if (name in brandPaths) return <BrandIcon name={name} className={className} />;
  const Cmp = map[name] ?? Sparkles;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}
