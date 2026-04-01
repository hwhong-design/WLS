"use client";

import { useState, useRef } from "react";
import { CaseCard, CaseType } from "@/lib/types";
import { getTodayStr } from "@/lib/utils";

interface SearchResult {
  ty: CaseType;
  c: CaseCard;
}

interface HeaderProps {
  recvData: CaseCard[];
  dispData: CaseCard[];
  onOpenDetail: (ty: CaseType, id: string) => void;
  onNavigate: (tab: string) => void;
}

export default function Header({
  recvData,
  dispData,
  onOpenDetail,
  onNavigate,
}: HeaderProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  function doSearch(v: string) {
    setQuery(v);
    if (!v.trim()) {
      setShowDropdown(false);
      return;
    }
    const q = v.toLowerCase();
    const res: SearchResult[] = [];
    recvData.forEach((c) => {
      if (c.name.includes(q) || c.sub.toLowerCase().includes(q))
        res.push({ ty: "recv", c });
    });
    dispData.forEach((c) => {
      if (c.name.includes(q) || c.sub.toLowerCase().includes(q))
        res.push({ ty: "disp", c });
    });
    setResults(res.slice(0, 6));
    setShowDropdown(true);
  }

  function handleClick(ty: CaseType, id: string) {
    setShowDropdown(false);
    setQuery("");
    onNavigate(ty);
    setTimeout(() => onOpenDetail(ty, id), 100);
  }

  return (
    <header
      className="flex items-center justify-between px-20 sticky top-0 z-[300]"
      style={{
        background: "var(--gn)",
        height: 54,
        boxShadow: "0 1px 0 rgba(255,255,255,.06)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-md"
          style={{
            width: 28,
            height: 28,
            background: "var(--gd2)",
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--gn)",
            letterSpacing: -0.5,
          }}
        >
          W
        </div>
        <div
          className="text-white font-semibold"
          style={{ fontSize: 13, letterSpacing: -0.2 }}
        >
          WLS
        </div>
        <div
          style={{
            width: 1,
            height: 16,
            background: "rgba(255,255,255,.15)",
          }}
        />
        <div
          style={{
            color: "rgba(255,255,255,.4)",
            fontSize: 11,
            fontWeight: 400,
          }}
        >
          위시켓 법무 관리 시스템
        </div>
      </div>

      <div className="relative">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5 transition-all focus-within:bg-white/[.14] focus-within:border-white/25"
          style={{
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <span style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="사건명, 채무자 검색..."
            value={query}
            onChange={(e) => doSearch(e.target.value)}
            onBlur={() => {
              timeoutRef.current = setTimeout(
                () => setShowDropdown(false),
                200
              );
            }}
            onFocus={() => {
              if (query.trim()) setShowDropdown(true);
            }}
            className="bg-transparent border-none outline-none text-white"
            style={{
              fontSize: 12,
              fontFamily: "'Noto Sans KR', sans-serif",
              width: 200,
            }}
          />
        </div>

        {showDropdown && (
          <div
            className="absolute overflow-hidden"
            style={{
              top: 42,
              left: "50%",
              transform: "translateX(-50%)",
              width: 440,
              background: "var(--sf)",
              border: "1px solid var(--bd)",
              borderRadius: "var(--r)",
              boxShadow: "var(--sh2)",
              zIndex: 400,
            }}
          >
            {results.length === 0 ? (
              <div
                className="text-center py-5"
                style={{ fontSize: 12, color: "var(--tx3)" }}
              >
                검색 결과가 없습니다.
              </div>
            ) : (
              results.map((r) => (
                <div
                  key={r.c.id}
                  className="flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-[var(--bg)]"
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--bd)",
                  }}
                  onMouseDown={() => handleClick(r.ty, r.c.id)}
                >
                  <span
                    className="shrink-0 font-bold rounded"
                    style={{
                      fontSize: 9,
                      padding: "2px 7px",
                      letterSpacing: 0.3,
                      background:
                        r.ty === "recv" ? "var(--rl)" : "var(--gdl)",
                      color: r.ty === "recv" ? "var(--rd)" : "var(--gd)",
                    }}
                  >
                    {r.ty === "recv" ? "미수채권" : "분쟁"}
                  </span>
                  <div>
                    <div className="font-semibold" style={{ fontSize: 13 }}>
                      {r.c.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--tx3)" }}>
                      {r.c.sub} · {r.c.col}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: 10,
          color: "rgba(255,255,255,.3)",
        }}
      >
        {getTodayStr()}
      </div>
    </header>
  );
}
