"use client";

import { TabId } from "@/lib/types";

interface NavItem {
  id: TabId;
  icon: string;
  label: string;
  count?: number;
  countRed?: boolean;
}

interface NavigationProps {
  activeTab: TabId;
  onNavigate: (tab: TabId) => void;
  recvCount: number;
  dispCount: number;
}

export default function Navigation({
  activeTab,
  onNavigate,
  recvCount,
  dispCount,
}: NavigationProps) {
  const items: NavItem[] = [
    { id: "home", icon: "🏠", label: "홈" },
    { id: "recv", icon: "⚔️", label: "미수채권", count: recvCount, countRed: true },
    { id: "disp", icon: "🥊", label: "분쟁", count: dispCount },
    { id: "stats", icon: "📊", label: "통계" },
    { id: "doc", icon: "📄", label: "공문 발행" },
    { id: "guide", icon: "📚", label: "업무가이드" },
    { id: "debtors", icon: "👥", label: "채무자 정보" },
  ];

  return (
    <nav
      className="flex"
      style={{
        background: "var(--sf)",
        borderBottom: "1px solid var(--bd)",
        padding: "0 32px",
        boxShadow: "var(--sh0)",
        overflowX: "auto",
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-1.5 cursor-pointer select-none transition-all whitespace-nowrap"
          style={{
            padding: "14px 16px",
            fontSize: 13,
            fontWeight: activeTab === item.id ? 600 : 500,
            color: activeTab === item.id ? "var(--gn)" : "var(--tx3)",
            borderBottom: `2px solid ${activeTab === item.id ? "var(--gn)" : "transparent"}`,
            position: "relative",
            top: 1,
            letterSpacing: -0.1,
          }}
          onClick={() => onNavigate(item.id)}
          onMouseEnter={(e) => {
            if (activeTab !== item.id)
              (e.currentTarget as HTMLDivElement).style.color = "var(--tx)";
          }}
          onMouseLeave={(e) => {
            if (activeTab !== item.id)
              (e.currentTarget as HTMLDivElement).style.color = "var(--tx3)";
          }}
        >
          {item.icon} {item.label}
          {item.count !== undefined && (
            <span
              className="font-semibold"
              style={{
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                padding: "2px 7px",
                borderRadius: 12,
                background: item.countRed ? "var(--rl)" : "var(--gl)",
                color: item.countRed ? "var(--rd)" : "var(--gn)",
              }}
            >
              {item.count}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
