"use client";

const APPS_SCRIPT_URL =
  "https://script.google.com/a/macros/wishket.com/s/AKfycbwmgcNzyy9Px1awk4nPAOHk-hmW2WlNpGNVMpTjcXjLtFv7F12LJBFK5fDuVn4Jp0jf/exec";

export default function DocumentPage() {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <div className="font-bold" style={{ fontSize: 18, letterSpacing: -0.3 }}>
          📄 공문 발행 시스템
        </div>
        <a
          href={APPS_SCRIPT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-medium transition-all hover:bg-[var(--gl)]"
          style={{
            fontSize: 12,
            color: "var(--gn)",
            border: "1.5px solid var(--gn)",
            borderRadius: "var(--r3)",
            padding: "7px 14px",
            textDecoration: "none",
          }}
        >
          새 탭에서 열기 ↗
        </a>
      </div>
      <div
        className="flex flex-col items-center justify-center gap-3.5"
        style={{
          background: "var(--sf)",
          border: "1px solid var(--bd)",
          borderRadius: "var(--r)",
          height: 560,
          boxShadow: "var(--sh0)",
        }}
      >
        <div style={{ fontSize: 44 }}>📄</div>
        <div
          className="text-center"
          style={{ fontSize: 13, color: "var(--tx2)", lineHeight: 1.8 }}
        >
          공문 발행 시스템
          <br />
          <span style={{ fontSize: 11, color: "var(--tx3)" }}>
            기존 Apps Script 웹앱과 연동됩니다
          </span>
        </div>
        <a
          href={APPS_SCRIPT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-medium transition-all hover:bg-[var(--gl)]"
          style={{
            fontSize: 12,
            color: "var(--gn)",
            border: "1.5px solid var(--gn)",
            borderRadius: "var(--r3)",
            padding: "7px 14px",
            textDecoration: "none",
          }}
        >
          열기 →
        </a>
      </div>
    </div>
  );
}
