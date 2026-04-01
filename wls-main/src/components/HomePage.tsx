"use client";

import { CaseCard, CaseType } from "@/lib/types";
import { daysUntil, isStale, getGreeting } from "@/lib/utils";

interface HomePageProps {
  recvData: CaseCard[];
  dispData: CaseCard[];
  onNavigate: (tab: string) => void;
  onOpenDetail: (ty: CaseType, id: string) => void;
}

export default function HomePage({
  recvData,
  dispData,
  onNavigate,
  onOpenDetail,
}: HomePageProps) {
  const recvActive = recvData.filter((c) => c.col !== "추심종료").length;
  const dispActive = dispData.filter((c) => c.col !== "종결").length;

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
    c.fu
      .filter((f) => !f.dn)
      .forEach((f) => {
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

  const recentDocs = [
    { no: "법무팀-083", title: "계약 이행 촉구의 건", date: "03/26" },
    { no: "법무팀-082", title: "소송완결 여부 보정명령", date: "03/26" },
    { no: "법무팀-081", title: "김성진 재산명시결정등본", date: "03/25" },
    {
      no: "법무팀-080",
      title: "맥스인포텍 조정사무수행일통지서",
      date: "03/10",
    },
    { no: "법무팀-079", title: "컨트롤에이 변경기일통지서", date: "03/09" },
  ];

  return (
    <div className="animate-fade-up">
      {/* Top greeting */}
      <div style={{ marginBottom: 48 }}>
        <h1
          className="font-bold mb-1"
          style={{ fontSize: 21, letterSpacing: -0.3 }}
        >
          {getGreeting()}, 희수님 👋
        </h1>
        <p style={{ fontSize: 12, color: "var(--tx3)" }}>
          오늘도 파이팅입니다.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3" style={{ gap: 40, marginBottom: 48 }}>
        <SummaryCard
          color="r"
          label="미수채권 진행중"
          value={recvActive}
          sub="소멸시효 임박 포함"
          onClick={() => onNavigate("recv")}
        />
        <SummaryCard
          color="o"
          label="분쟁 진행중"
          value={dispActive}
          sub="법적대응 포함"
          onClick={() => onNavigate("disp")}
        />
        <SummaryCard
          color="g"
          label="공문 발행 (이번달)"
          value={83}
          sub="누적 발행 이력"
          onClick={() => onNavigate("doc")}
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2" style={{ gap: 40 }}>
        {/* Alerts */}
        <div
          className="overflow-hidden"
          style={{
            background: "var(--sf)",
            border: "1px solid var(--bd)",
            borderRadius: "var(--r)",
            boxShadow: "var(--sh0)",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: "15px 22px",
              borderBottom: "1px solid var(--bd)",
            }}
          >
            <h3
              className="font-bold"
              style={{ fontSize: 12, letterSpacing: -0.1 }}
            >
              ⚡ 긴급 — 기한 임박
            </h3>
            <span
              style={{
                fontSize: 10,
                color: "var(--tx3)",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              D-30 이내
            </span>
          </div>
          {alerts.length === 0 ? (
            <div
              className="text-center py-5"
              style={{ fontSize: 12, color: "var(--tx3)" }}
            >
              긴급 사항 없음 ✓
            </div>
          ) : (
            alerts.slice(0, 6).map((a, i) => {
              const cl = a.st ? "g" : a.d <= 3 ? "r" : a.d <= 14 ? "o" : "g";
              const lb = a.st
                ? "장기미업데이트"
                : a.d === 0
                  ? "D-day"
                  : a.d < 0
                    ? "지남"
                    : `D-${a.d}`;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 cursor-pointer transition-colors hover:bg-[var(--bg)]"
                  style={{
                    padding: "13px 22px",
                    borderBottom: "1px solid var(--bd)",
                  }}
                  onClick={() => onOpenDetail(a.ty, a.id)}
                >
                  <div
                    className={`shrink-0 rounded-full ${cl === "r" ? "animate-blink" : ""}`}
                    style={{
                      width: 7,
                      height: 7,
                      background:
                        cl === "r"
                          ? "var(--rd)"
                          : cl === "o"
                            ? "var(--og)"
                            : "var(--gd)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium" style={{ fontSize: 12 }}>
                      {a.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--tx3)",
                        marginTop: 2,
                      }}
                    >
                      {a.desc}
                    </div>
                  </div>
                  <div
                    className="shrink-0 font-bold rounded-md"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      padding: "3px 8px",
                      background:
                        cl === "r"
                          ? "var(--rl)"
                          : cl === "o"
                            ? "var(--ol)"
                            : "var(--gdl)",
                      color:
                        cl === "r"
                          ? "var(--rd)"
                          : cl === "o"
                            ? "var(--og)"
                            : "var(--gd)",
                    }}
                  >
                    {lb}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recent documents */}
        <div
          className="overflow-hidden"
          style={{
            background: "var(--sf)",
            border: "1px solid var(--bd)",
            borderRadius: "var(--r)",
            boxShadow: "var(--sh0)",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: "15px 22px",
              borderBottom: "1px solid var(--bd)",
            }}
          >
            <h3
              className="font-bold"
              style={{ fontSize: 12, letterSpacing: -0.1 }}
            >
              📄 최근 발행 공문
            </h3>
            <span
              style={{
                fontSize: 10,
                color: "var(--tx3)",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              최근 5건
            </span>
          </div>
          {recentDocs.map((doc, i) => (
            <div
              key={i}
              className="flex items-center gap-3 cursor-pointer transition-colors hover:bg-[var(--bg)]"
              style={{
                padding: "13px 22px",
                borderBottom: "1px solid var(--bd)",
              }}
            >
              <div
                className="shrink-0"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "var(--tx3)",
                  width: 76,
                }}
              >
                {doc.no}
              </div>
              <div
                className="flex-1 font-medium truncate"
                style={{ fontSize: 12 }}
              >
                {doc.title}
              </div>
              <div
                className="shrink-0"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "var(--tx3)",
                }}
              >
                {doc.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  color,
  label,
  value,
  sub,
  onClick,
}: {
  color: "r" | "o" | "g";
  label: string;
  value: number;
  sub: string;
  onClick: () => void;
}) {
  const gradients = {
    r: "linear-gradient(90deg, var(--rd), var(--rd2))",
    o: "linear-gradient(90deg, var(--gd), var(--gd2))",
    g: "linear-gradient(90deg, var(--gn), var(--gn2))",
  };
  const numColors = {
    r: "var(--rd)",
    o: "var(--gd)",
    g: "var(--gn)",
  };

  return (
    <div
      className="relative overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5"
      style={{
        background: "var(--sf)",
        border: "1px solid var(--bd)",
        borderRadius: "var(--r)",
        padding: "36px 38px",
        boxShadow: "var(--sh0)",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--sh1)";
        e.currentTarget.style.borderColor = "var(--bd2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--sh0)";
        e.currentTarget.style.borderColor = "var(--bd)";
      }}
    >
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: 3,
          borderRadius: "var(--r) var(--r) 0 0",
          background: gradients[color],
        }}
      />
      <div
        className="font-bold uppercase"
        style={{
          fontSize: 10,
          letterSpacing: 1,
          color: "var(--tx3)",
          marginBottom: 18,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 34,
          fontWeight: 500,
          lineHeight: 1,
          marginBottom: 10,
          color: numColors[color],
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--tx3)" }}>{sub}</div>
      <div
        className="absolute transition-all"
        style={{
          right: 36,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--bd2)",
          fontSize: 18,
        }}
      >
        →
      </div>
    </div>
  );
}
