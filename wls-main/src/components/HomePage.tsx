"use client";

import { useState } from "react";
import { CaseCard, CaseType } from "@/lib/types";
import { daysUntil, isStale, getGreeting } from "@/lib/utils";

interface HomePageProps {
  recvData: CaseCard[];
  dispData: CaseCard[];
  onNavigate: (tab: string) => void;
  onOpenDetail: (ty: CaseType, id: string) => void;
}

const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const DAYS = ["일","월","화","수","목","금","토"];

export default function HomePage({
  recvData,
  dispData,
  onNavigate,
  onOpenDetail,
}: HomePageProps) {
  const recvActive = recvData.filter((c) => c.col !== "추심종료").length;
  const dispActive = dispData.filter((c) => c.col !== "종결").length;

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Build calendar events from followups and timelines
  const calEvents: Record<string, { name: string; type: "fu" | "sol"; ty: CaseType; id: string }[]> = {};

  const addEvent = (dateStr: string, name: string, type: "fu" | "sol", ty: CaseType, id: string) => {
    if (!dateStr) return;
    // Normalize date to YYYY-MM-DD
    let key = dateStr;
    if (dateStr.includes(".")) {
      // "2026.03.27" -> "2026-03-27"
      key = dateStr.replace(/\./g, "-");
    }
    if (!calEvents[key]) calEvents[key] = [];
    calEvents[key].push({ name, type, ty, id });
  };

  [...recvData, ...dispData].forEach((c) => {
    const ty: CaseType = c.id[0] === "r" ? "recv" : "disp";
    c.fu.filter((f) => !f.dn).forEach((f) => addEvent(f.dt, `${c.name}: ${f.ti}`, "fu", ty, c.id));
    if (c.solDt) addEvent(c.solDt, `${c.name} 소멸시효`, "sol", ty, c.id);
  });

  // Calendar grid
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Build alerts
  const alerts: {
    name: string;
    desc: string;
    d: number;
    ty: CaseType;
    id: string;
    st?: boolean;
  }[] = [];

  [...recvData, ...dispData].forEach((c) => {
    c.fu.filter((f) => !f.dn).forEach((f) => {
      const d = daysUntil(f.dt);
      if (d <= 30) {
        alerts.push({
          name: c.name,
          desc: f.ti,
          d,
          ty: c.id[0] === "r" ? "recv" : "disp",
          id: c.id,
        });
      }
    });
    if (isStale(c)) {
      alerts.push({
        name: c.name,
        desc: "30일 이상 미업데이트",
        d: 999,
        ty: c.id[0] === "r" ? "recv" : "disp",
        id: c.id,
        st: true,
      });
    }
  });
  alerts.sort((a, b) => a.d - b.d);

  return (
    <div className="animate-fade-up">
      {/* Greeting */}
      <div style={{ marginBottom: 40 }}>
        <h1 className="font-bold mb-1" style={{ fontSize: 21, letterSpacing: -0.3 }}>
          {getGreeting()}, 희수님 👋
        </h1>
        <p style={{ fontSize: 12, color: "var(--tx3)" }}>오늘도 파이팅입니다.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3" style={{ gap: 40, marginBottom: 48 }}>
        <SummaryCard color="r" label="미수채권 진행중" value={recvActive} sub="소멸시효 임박 포함" onClick={() => onNavigate("recv")} />
        <SummaryCard color="o" label="분쟁 진행중" value={dispActive} sub="법적대응 포함" onClick={() => onNavigate("disp")} />
        <SummaryCard color="g" label="공문 발행 (이번달)" value={83} sub="누적 발행 이력" onClick={() => onNavigate("doc")} />
      </div>

      {/* Two columns: alerts + calendar */}
      <div className="grid grid-cols-2" style={{ gap: 40 }}>
        {/* Alerts */}
        <div
          className="overflow-hidden"
          style={{ background: "var(--sf)", border: "1px solid var(--bd)", borderRadius: "var(--r)", boxShadow: "var(--sh0)" }}
        >
          <div className="flex items-center justify-between" style={{ padding: "15px 22px", borderBottom: "1px solid var(--bd)" }}>
            <h3 className="font-bold" style={{ fontSize: 12, letterSpacing: -0.1 }}>⚡ 긴급 — 기한 임박</h3>
            <span style={{ fontSize: 10, color: "var(--tx3)", fontFamily: "'DM Mono', monospace" }}>D-30 이내</span>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-5" style={{ fontSize: 12, color: "var(--tx3)" }}>긴급 사항 없음 ✓</div>
          ) : (
            alerts.slice(0, 7).map((a, i) => {
              const cl = a.st ? "g" : a.d <= 3 ? "r" : a.d <= 14 ? "o" : "g";
              const lb = a.st ? "장기미업데이트" : a.d === 0 ? "D-day" : a.d < 0 ? "지남" : `D-${a.d}`;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 cursor-pointer transition-colors hover:bg-[var(--bg)]"
                  style={{ padding: "12px 22px", borderBottom: "1px solid var(--bd)" }}
                  onClick={() => onOpenDetail(a.ty, a.id)}
                >
                  <div className={`shrink-0 rounded-full ${cl === "r" ? "animate-blink" : ""}`}
                    style={{ width: 7, height: 7, background: cl === "r" ? "var(--rd)" : cl === "o" ? "var(--og)" : "var(--gd)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium" style={{ fontSize: 12 }}>{a.name}</div>
                    <div style={{ fontSize: 10, color: "var(--tx3)", marginTop: 2 }}>{a.desc}</div>
                  </div>
                  <div className="shrink-0 font-bold rounded-md"
                    style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, padding: "3px 8px",
                      background: cl === "r" ? "var(--rl)" : cl === "o" ? "var(--ol)" : "var(--gdl)",
                      color: cl === "r" ? "var(--rd)" : cl === "o" ? "var(--og)" : "var(--gd)" }}>
                    {lb}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Calendar */}
        <div
          className="overflow-hidden"
          style={{ background: "var(--sf)", border: "1px solid var(--bd)", borderRadius: "var(--r)", boxShadow: "var(--sh0)" }}
        >
          {/* Calendar header */}
          <div className="flex items-center justify-between" style={{ padding: "15px 22px", borderBottom: "1px solid var(--bd)" }}>
            <h3 className="font-bold" style={{ fontSize: 12, letterSpacing: -0.1 }}>📅 일정 캘린더</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { let m = calMonth - 1; let y = calYear; if (m < 0) { m = 11; y--; } setCalMonth(m); setCalYear(y); }}
                style={{ background: "none", border: "1px solid var(--bd)", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 12, color: "var(--tx3)" }}
              >‹</button>
              <span style={{ fontSize: 12, fontWeight: 600, minWidth: 60, textAlign: "center" }}>{calYear}. {MONTHS[calMonth]}</span>
              <button
                onClick={() => { let m = calMonth + 1; let y = calYear; if (m > 11) { m = 0; y++; } setCalMonth(m); setCalYear(y); }}
                style={{ background: "none", border: "1px solid var(--bd)", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 12, color: "var(--tx3)" }}
              >›</button>
            </div>
          </div>

          <div style={{ padding: "12px 14px" }}>
            {/* Day headers */}
            <div className="grid grid-cols-7" style={{ marginBottom: 6 }}>
              {DAYS.map((d, i) => (
                <div key={d} className="text-center" style={{ fontSize: 10, fontWeight: 600, color: i === 0 ? "var(--rd)" : i === 6 ? "var(--bl)" : "var(--tx3)", padding: "2px 0" }}>{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7" style={{ gap: 1 }}>
              {cells.map((day, idx) => {
                if (day === null) return <div key={`e-${idx}`} />;
                const key = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const events = calEvents[key] || [];
                const isToday = key === todayKey;
                const isWeekend = (idx % 7) === 0 || (idx % 7) === 6;
                return (
                  <div key={key} style={{ minHeight: 44, padding: "3px 2px", borderRadius: 4, background: isToday ? "var(--gl)" : "transparent", border: isToday ? "1px solid var(--gn2)" : "1px solid transparent" }}>
                    <div className="text-center" style={{ fontSize: 10, fontWeight: isToday ? 700 : 400, color: isToday ? "var(--gn)" : isWeekend ? (idx % 7 === 0 ? "var(--rd)" : "var(--bl)") : "var(--tx2)", marginBottom: 2 }}>{day}</div>
                    {events.slice(0, 2).map((ev, ei) => (
                      <div
                        key={ei}
                        className="cursor-pointer rounded truncate"
                        style={{ fontSize: 8, padding: "1px 3px", marginBottom: 1, background: ev.type === "sol" ? "var(--ol)" : ev.ty === "recv" ? "var(--rl)" : "var(--gl)", color: ev.type === "sol" ? "var(--og)" : ev.ty === "recv" ? "var(--rd)" : "var(--gn)", fontWeight: 500 }}
                        onClick={() => onOpenDetail(ev.ty, ev.id)}
                        title={ev.name}
                      >
                        {ev.name.length > 6 ? ev.name.slice(0, 6) + "…" : ev.name}
                      </div>
                    ))}
                    {events.length > 2 && <div style={{ fontSize: 8, color: "var(--tx3)", paddingLeft: 3 }}>+{events.length - 2}</div>}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-3" style={{ fontSize: 9, color: "var(--tx3)", paddingTop: 8, borderTop: "1px solid var(--bd)" }}>
              <div className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--rl)", display: "inline-block" }} />미수채권</div>
              <div className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--gl)", display: "inline-block" }} />분쟁</div>
              <div className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--ol)", display: "inline-block" }} />소멸시효</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ color, label, value, sub, onClick }: { color: "r" | "o" | "g"; label: string; value: number; sub: string; onClick: () => void }) {
  const gradients = { r: "linear-gradient(90deg, var(--rd), var(--rd2))", o: "linear-gradient(90deg, var(--gd), var(--gd2))", g: "linear-gradient(90deg, var(--gn), var(--gn2))" };
  const numColors = { r: "var(--rd)", o: "var(--gd)", g: "var(--gn)" };
  return (
    <div
      className="relative overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5"
      style={{ background: "var(--sf)", border: "1px solid var(--bd)", borderRadius: "var(--r)", padding: "36px 38px", boxShadow: "var(--sh0)" }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--sh1)"; e.currentTarget.style.borderColor = "var(--bd2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--sh0)"; e.currentTarget.style.borderColor = "var(--bd)"; }}
    >
      <div className="absolute top-0 left-0 right-0" style={{ height: 3, borderRadius: "var(--r) var(--r) 0 0", background: gradients[color] }} />
      <div className="font-bold uppercase" style={{ fontSize: 10, letterSpacing: 1, color: "var(--tx3)", marginBottom: 18 }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 34, fontWeight: 500, lineHeight: 1, marginBottom: 10, color: numColors[color] }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--tx3)" }}>{sub}</div>
      <div className="absolute transition-all" style={{ right: 36, top: "50%", transform: "translateY(-50%)", color: "var(--bd2)", fontSize: 18 }}>→</div>
    </div>
  );
}
