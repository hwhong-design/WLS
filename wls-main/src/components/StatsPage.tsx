"use client";

import { CaseCard, CaseType, Label } from "@/lib/types";
import { fmt, daysUntil, isStale, getYear } from "@/lib/utils";
import { DISP_COLS } from "@/lib/data";

interface StatsPageProps {
  recvData: CaseCard[];
  dispData: CaseCard[];
  allLabels: Label[];
  onOpenDetail: (ty: CaseType, id: string) => void;
}

export default function StatsPage({
  recvData,
  dispData,
  allLabels,
  onOpenDetail,
}: StatsPageProps) {
  const totalOrig = recvData.reduce((a, c) => a + (c.amt?.orig || 0), 0);
  const totalPaid = recvData.reduce((a, c) => a + (c.amt?.paid || 0), 0);
  const totalExtra = recvData.reduce((a, c) => a + (c.amt?.extra || 0), 0);
  const totalPmt = totalPaid + totalExtra;
  const rate = totalOrig > 0 ? ((totalPaid / totalOrig) * 100).toFixed(2) : "0";

  const recvActive = recvData.filter((c) => c.col !== "추심종료").length;
  const dispActive = dispData.filter((c) => c.col !== "종결").length;
  const staleCount = [...recvData, ...dispData].filter(isStale).length;
  const followUpCount = [...recvData, ...dispData].reduce(
    (a, c) => a + c.fu.filter((f) => !f.dn && daysUntil(f.dt) <= 30).length,
    0
  );

  // Type breakdown for receivables (by first label)
  const typeCount: Record<string, number> = {};
  recvData
    .filter((c) => c.col !== "추심종료")
    .forEach((c) => {
      const firstLabel = c.labels[0]
        ? allLabels.find((lb) => lb.id === c.labels[0])
        : null;
      const labelName = firstLabel ? firstLabel.name : "미지정";
      typeCount[labelName] = (typeCount[labelName] || 0) + 1;
    });
  const maxType = Math.max(...Object.values(typeCount), 1);

  // Stage breakdown for disputes
  const stageCount: Record<string, number> = {};
  DISP_COLS.forEach((col) => {
    stageCount[col] = dispData.filter((d) => d.col === col).length;
  });
  const maxStage = Math.max(...Object.values(stageCount), 1);

  // Stale items
  const staleList = [...recvData, ...dispData].filter(isStale);

  // Upcoming follow-ups (D-7)
  const followUps: {
    name: string;
    ti: string;
    d: number;
    ty: CaseType;
    id: string;
  }[] = [];
  [...recvData, ...dispData].forEach((c) => {
    c.fu
      .filter((f) => !f.dn && daysUntil(f.dt) <= 7)
      .forEach((f) => {
        followUps.push({
          name: c.name,
          ti: f.ti,
          d: daysUntil(f.dt),
          ty: c.id[0] === "r" ? "recv" : "disp",
          id: c.id,
        });
      });
  });
  followUps.sort((a, b) => a.d - b.d);

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between" style={{ marginBottom: 40 }}>
        <div
          className="font-bold"
          style={{ fontSize: 18, letterSpacing: -0.3 }}
        >
          📊 통계
        </div>
        <div style={{ fontSize: 11, color: "var(--tx3)" }}>
          카드 금액 입력 시 자동 반영됩니다
        </div>
      </div>

      {/* Settlement main card */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "var(--gn)",
          borderRadius: "var(--r)",
          padding: "40px 44px",
          marginBottom: 40,
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            background: "rgba(255,255,255,.04)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: -60,
            right: 60,
            width: 160,
            height: 160,
            background: "rgba(255,255,255,.03)",
          }}
        />
        <div
          className="font-bold uppercase"
          style={{
            fontSize: 10,
            letterSpacing: 1.5,
            color: "rgba(255,255,255,.5)",
            marginBottom: 6,
          }}
        >
          미수채권 결산
        </div>
        <div
          className="font-semibold"
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,.7)",
            marginBottom: 20,
          }}
        >
          {getYear()}년
        </div>
        <div
          className="relative grid grid-cols-4 z-[1]"
          style={{ gap: 0 }}
        >
          {[
            {
              label: "미수채권 발생",
              value: fmt(totalOrig),
              sub: "원",
              isRate: false,
            },
            {
              label: "회수금액",
              value: fmt(totalPaid),
              sub: "원",
              isRate: false,
            },
            {
              label: "변제총액",
              value: fmt(totalPmt),
              sub: "원 (원금+지연손해금)",
              isRate: false,
            },
            { label: "회수율", value: `${rate}%`, sub: "", isRate: true },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "0 20px 0 0",
                borderRight:
                  i < 3 ? "1px solid rgba(255,255,255,.1)" : "none",
                paddingLeft: i === 0 ? 0 : undefined,
              }}
            >
              <div
                className="font-medium"
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,.5)",
                  marginBottom: 6,
                  letterSpacing: 0.3,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: item.isRate ? 26 : 20,
                  fontWeight: 500,
                  color: item.isRate ? "var(--gd2)" : "#fff",
                  marginBottom: 3,
                }}
              >
                {item.value}
              </div>
              {item.sub && (
                <div
                  style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}
                >
                  {item.sub}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4" style={{ gap: 40, marginBottom: 40 }}>
        {[
          { label: "미수채권 진행중", value: recvActive, color: "r", sub: "건" },
          { label: "분쟁 진행중", value: dispActive, color: "o", sub: "건" },
          { label: "장기 미업데이트", value: staleCount, color: "r", sub: "30일↑" },
          { label: "팔로업 대기", value: followUpCount, color: "g", sub: "D-30 이내" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: "var(--sf)",
              border: "1px solid var(--bd)",
              borderRadius: "var(--r)",
              padding: "32px 34px",
              boxShadow: "var(--sh0)",
            }}
          >
            <div
              className="font-bold uppercase"
              style={{
                fontSize: 10,
                color: "var(--tx3)",
                letterSpacing: 0.8,
                marginBottom: 14,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 26,
                fontWeight: 500,
                color:
                  s.color === "r"
                    ? "var(--rd)"
                    : s.color === "o"
                      ? "var(--gd)"
                      : "var(--gn)",
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "var(--tx3)", marginTop: 4 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Bar charts */}
      <div className="grid grid-cols-2" style={{ gap: 40, marginBottom: 40 }}>
        <BarChart
          title="미수채권 — 유형별"
          data={Object.entries(typeCount)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => ({ label: k, value: v, max: maxType }))}
          color="g"
        />
        <BarChart
          title="분쟁 — 단계별"
          data={DISP_COLS.map((c) => ({
            label: c,
            value: stageCount[c],
            max: maxStage,
          }))}
          color="o"
        />
      </div>

      <div className="grid grid-cols-2" style={{ gap: 40, marginBottom: 40 }}>
        {/* Stale items */}
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
            className="font-bold"
            style={{
              padding: "15px 22px",
              borderBottom: "1px solid var(--bd)",
              fontSize: 12,
              letterSpacing: -0.1,
            }}
          >
            🔕 장기 미업데이트 (30일↑)
          </div>
          {staleList.length === 0 ? (
            <div
              className="text-center py-5"
              style={{ fontSize: 12, color: "var(--tx3)" }}
            >
              없음 ✓
            </div>
          ) : (
            staleList.map((c) => {
              const days = Math.round(
                (Date.now() - new Date(c.lu).getTime()) / 86400000
              );
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-[var(--bg)]"
                  style={{
                    padding: "11px 22px",
                    borderBottom: "1px solid var(--bd)",
                  }}
                  onClick={() =>
                    onOpenDetail(
                      c.id[0] === "r" ? "recv" : "disp",
                      c.id
                    )
                  }
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--tx2)",
                      width: 90,
                      flexShrink: 0,
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    className="flex-1"
                    style={{ fontSize: 11, color: "var(--tx3)" }}
                  >
                    {c.col}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: "var(--tx3)",
                      width: 36,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {days}일
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Upcoming follow-ups */}
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
            className="font-bold"
            style={{
              padding: "15px 22px",
              borderBottom: "1px solid var(--bd)",
              fontSize: 12,
              letterSpacing: -0.1,
            }}
          >
            ⏰ 팔로업 임박 (D-7 이내)
          </div>
          {followUps.length === 0 ? (
            <div
              className="text-center py-5"
              style={{ fontSize: 12, color: "var(--tx3)" }}
            >
              없음 ✓
            </div>
          ) : (
            followUps.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-[var(--bg)]"
                style={{
                  padding: "11px 22px",
                  borderBottom: "1px solid var(--bd)",
                }}
                onClick={() => onOpenDetail(f.ty, f.id)}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--tx2)",
                    width: 90,
                    flexShrink: 0,
                  }}
                >
                  {f.name}
                </div>
                <div
                  className="flex-1"
                  style={{ fontSize: 11, color: "var(--tx3)" }}
                >
                  {f.ti}
                </div>
                <div
                  className="font-bold rounded-md"
                  style={{
                    fontSize: 9,
                    padding: "3px 8px",
                    background: f.d <= 3 ? "var(--rl)" : "var(--ol)",
                    color: f.d <= 3 ? "var(--rd)" : "var(--og)",
                  }}
                >
                  {f.d <= 0 ? "D-day" : `D-${f.d}`}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BarChart({
  title,
  data,
  color,
}: {
  title: string;
  data: { label: string; value: number; max: number }[];
  color: "g" | "o" | "r";
}) {
  const gradients = {
    g: "linear-gradient(90deg, var(--gn), var(--gn2))",
    o: "linear-gradient(90deg, var(--gd), var(--gd2))",
    r: "linear-gradient(90deg, var(--rd), var(--rd2))",
  };

  return (
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
        className="font-bold"
        style={{
          padding: "15px 22px",
          borderBottom: "1px solid var(--bd)",
          fontSize: 12,
          letterSpacing: -0.1,
        }}
      >
        {title}
      </div>
      {data.map((d, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-[var(--bg)]"
          style={{
            padding: "11px 22px",
            borderBottom: "1px solid var(--bd)",
          }}
        >
          <div
            className="shrink-0"
            style={{ fontSize: 11, color: "var(--tx2)", width: 90 }}
          >
            {d.label}
          </div>
          <div
            className="flex-1 overflow-hidden"
            style={{
              height: 7,
              background: "var(--bg)",
              borderRadius: 4,
            }}
          >
            <div
              className="h-full rounded"
              style={{
                width: `${(d.value / d.max) * 100}%`,
                background: gradients[color],
                transition: "width 0.6s cubic-bezier(.2,0,.2,1)",
              }}
            />
          </div>
          <div
            className="shrink-0 text-right"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "var(--tx3)",
              width: 36,
            }}
          >
            {d.value}건
          </div>
        </div>
      ))}
    </div>
  );
}
