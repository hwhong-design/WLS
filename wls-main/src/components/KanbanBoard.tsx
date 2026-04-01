"use client";

import { useRef, useState, useEffect } from "react";
import { CaseCard, CaseType, Label, LabelColor } from "@/lib/types";
import { fmt, daysUntil, isStale } from "@/lib/utils";

const LABEL_COLOR_MAP: Record<LabelColor, { bg: string; color: string }> = {
  r:  { bg: "var(--rl)",  color: "var(--rd)" },
  o:  { bg: "var(--ol)",  color: "var(--og)" },
  g:  { bg: "var(--gdl)", color: "var(--gd)" },
  gr: { bg: "var(--gl)",  color: "var(--gn)" },
  b:  { bg: "var(--bll)", color: "var(--bl)" },
  gy: { bg: "var(--sf2)", color: "var(--tx3)" },
  pk: { bg: "#fce4ec", color: "#c62828" },
  rs: { bg: "#fde0e8", color: "#ad1457" },
  cr: { bg: "#fff3e0", color: "#e65100" },
  tn: { bg: "#fff8e1", color: "#f57f17" },
  cy: { bg: "#e0f7fa", color: "#00838f" },
  sk: { bg: "#e1f5fe", color: "#0277bd" },
  nv: { bg: "#e8eaf6", color: "#283593" },
  vl: { bg: "#ede7f6", color: "#4527a0" },
  lv: { bg: "#f3e5f5", color: "#7b1fa2" },
  mg: { bg: "#fce4ec", color: "#880e4f" },
  lm: { bg: "#f1f8e9", color: "#558b2f" },
  mn: { bg: "#e8f5e9", color: "#2e7d32" },
  br: { bg: "#efebe9", color: "#4e342e" },
  sl: { bg: "#eceff1", color: "#455a64" },
};

const COLOR_OPTIONS: { key: LabelColor; name: string }[] = [
  { key: "r",  name: "빨강" },
  { key: "pk", name: "핑크" },
  { key: "rs", name: "로즈" },
  { key: "mg", name: "마젠타" },
  { key: "o",  name: "주황" },
  { key: "cr", name: "코랄" },
  { key: "tn", name: "탠저린" },
  { key: "g",  name: "금색" },
  { key: "lm", name: "라임" },
  { key: "mn", name: "민트" },
  { key: "gr", name: "초록" },
  { key: "cy", name: "청록" },
  { key: "sk", name: "하늘" },
  { key: "b",  name: "파랑" },
  { key: "nv", name: "남색" },
  { key: "vl", name: "보라" },
  { key: "lv", name: "라벤더" },
  { key: "br", name: "갈색" },
  { key: "sl", name: "슬레이트" },
  { key: "gy", name: "회색" },
];

interface KanbanBoardProps {
  cards: CaseCard[];
  columns: string[];
  type: CaseType;
  title: string;
  allLabels: Label[];
  onMoveCard: (id: string, newCol: string) => void;
  onOpenDetail: (id: string) => void;
  onAddCard: (col: string) => void;
  onToggleLabel: (cardId: string, labelId: string) => void;
  onCreateLabel: (name: string, color: LabelColor) => void;
  onDeleteLabel: (labelId: string) => void;
}

export default function KanbanBoard({
  cards,
  columns,
  type,
  title,
  allLabels,
  onMoveCard,
  onOpenDetail,
  onAddCard,
  onToggleLabel,
  onCreateLabel,
  onDeleteLabel,
}: KanbanBoardProps) {
  const dragRef = useRef<{ id: string; dragging: boolean }>({
    id: "",
    dragging: false,
  });
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, id: string) {
    dragRef.current = { id, dragging: true };
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).style.opacity = "0.35";
    (e.currentTarget as HTMLElement).style.transform = "rotate(1.5deg)";
  }

  function handleDragEnd(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).style.opacity = "";
    (e.currentTarget as HTMLElement).style.transform = "";
    setDragOverCol(null);
    setTimeout(() => {
      dragRef.current.dragging = false;
    }, 50);
  }

  function handleDrop(col: string) {
    const { id } = dragRef.current;
    if (id) {
      const card = cards.find((c) => c.id === id);
      if (card && card.col !== col) {
        onMoveCard(id, col);
      }
    }
    setDragOverCol(null);
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div
          className="font-bold"
          style={{ fontSize: 18, letterSpacing: -0.3 }}
        >
          {title}
        </div>
        <div className="flex items-center gap-3">
          <div style={{ fontSize: 11, color: "var(--tx3)" }}>
            드래그하거나 상세에서 단계 변경 가능
          </div>
          <button
            className="flex items-center gap-1.5 cursor-pointer transition-all"
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              background: "var(--gn)",
              border: "none",
              borderRadius: "var(--r3)",
            }}
            onClick={() => onAddCard(columns[0])}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gn2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--gn)";
            }}
          >
            + 새 케이스 추가
          </button>
        </div>
      </div>
      <div
        className="flex gap-2.5 overflow-x-auto pb-2 items-start"
        style={{ scrollbarWidth: "thin" }}
      >
        {columns.map((col) => {
          const colCards = cards.filter((c) => c.col === col);
          const isOver = dragOverCol === col;
          return (
            <div key={col} className="shrink-0" style={{ width: 218 }}>
              <div
                className="flex items-center justify-between"
                style={{
                  padding: "9px 12px",
                  background: "var(--sf2)",
                  border: "1px solid var(--bd)",
                  borderBottom: "none",
                  borderRadius: "var(--r2) var(--r2) 0 0",
                }}
              >
                <div
                  className="font-bold"
                  style={{
                    fontSize: 11,
                    color: "var(--tx2)",
                    letterSpacing: -0.1,
                  }}
                >
                  {col}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    background: "var(--sf)",
                    border: "1px solid var(--bd)",
                    color: "var(--tx3)",
                    padding: "1px 7px",
                    borderRadius: 10,
                  }}
                >
                  {colCards.length}
                </div>
              </div>
              <div
                className="flex flex-col gap-2 transition-all"
                style={{
                  border: "1px solid var(--bd)",
                  borderTop: "none",
                  borderRadius: "0 0 var(--r2) var(--r2)",
                  minHeight: 80,
                  padding: 8,
                  background: isOver ? "var(--gl)" : "var(--bg)",
                  borderColor: isOver ? "var(--gn)" : undefined,
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col);
                }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(col);
                }}
              >
                {colCards.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    type={type}
                    allLabels={allLabels}
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (!dragRef.current.dragging) onOpenDetail(card.id);
                    }}
                    onToggleLabel={onToggleLabel}
                    onCreateLabel={onCreateLabel}
                    onDeleteLabel={onDeleteLabel}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Label Modal ── */

function LabelModal({
  card,
  allLabels,
  onToggleLabel,
  onCreateLabel,
  onDeleteLabel,
  onClose,
}: {
  card: CaseCard;
  allLabels: Label[];
  onToggleLabel: (cardId: string, labelId: string) => void;
  onCreateLabel: (name: string, color: LabelColor) => void;
  onDeleteLabel: (labelId: string) => void;
  onClose: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<LabelColor>("b");
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filtered = allLabels.filter((lb) =>
    lb.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    if (newName.trim()) {
      onCreateLabel(newName.trim(), newColor);
      setNewName("");
      setCreating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.35)" }}
      onClick={onClose}
    >
      <div
        ref={ref}
        className="animate-fade-up"
        style={{
          background: "var(--sf)",
          border: "1px solid var(--bd)",
          borderRadius: "var(--r)",
          boxShadow: "var(--sh2)",
          width: 320,
          maxHeight: 460,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--bd)",
          }}
        >
          <div className="font-bold" style={{ fontSize: 13, letterSpacing: -0.1 }}>
            라벨 관리
          </div>
          <button
            className="cursor-pointer"
            style={{
              background: "none",
              border: "none",
              fontSize: 16,
              color: "var(--tx3)",
              lineHeight: 1,
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "10px 18px 6px" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="라벨 검색..."
            className="w-full"
            style={{
              fontSize: 12,
              padding: "7px 10px",
              border: "1px solid var(--bd)",
              borderRadius: "var(--r3)",
              background: "var(--bg)",
              outline: "none",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gn2)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--bd)"; }}
          />
        </div>

        {/* Label list */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: "4px 18px 8px", scrollbarWidth: "thin" }}
        >
          {filtered.length === 0 && (
            <div
              className="text-center"
              style={{ fontSize: 12, color: "var(--tx3)", padding: "16px 0" }}
            >
              {search ? "검색 결과 없음" : "라벨이 없습니다"}
            </div>
          )}
          {filtered.map((lb) => {
            const isSelected = card.labels.includes(lb.id);
            const lc = LABEL_COLOR_MAP[lb.color] || LABEL_COLOR_MAP.gy;
            return (
              <div
                key={lb.id}
                className="flex items-center gap-2.5 cursor-pointer transition-colors rounded-md"
                style={{
                  padding: "8px 10px",
                  marginBottom: 2,
                  background: isSelected ? "var(--bg)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "var(--bg)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "transparent";
                }}
                onClick={() => onToggleLabel(card.id, lb.id)}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    border: isSelected
                      ? "none"
                      : "1.5px solid var(--bd2)",
                    background: isSelected ? "var(--gn)" : "var(--sf)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {isSelected ? "✓" : ""}
                </div>
                {/* Label chip */}
                <span
                  className="font-bold rounded"
                  style={{
                    fontSize: 10,
                    padding: "3px 10px",
                    background: lc.bg,
                    color: lc.color,
                    letterSpacing: 0.2,
                    flex: 1,
                  }}
                >
                  {lb.name}
                </span>
                {/* Delete button */}
                <button
                  className="cursor-pointer transition-opacity opacity-0 group-hover:opacity-100"
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 12,
                    color: "var(--tx3)",
                    padding: "0 2px",
                    opacity: 0.4,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.color = "var(--rd)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.4";
                    e.currentTarget.style.color = "var(--tx3)";
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLabel(lb.id);
                  }}
                  title="라벨 삭제"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Create new label */}
        <div
          style={{
            padding: "10px 18px 14px",
            borderTop: "1px solid var(--bd)",
          }}
        >
          {creating ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="새 라벨 이름"
                className="w-full"
                autoFocus
                style={{
                  fontSize: 12,
                  padding: "7px 10px",
                  border: "1px solid var(--bd)",
                  borderRadius: "var(--r3)",
                  background: "var(--bg)",
                  outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gn2)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--bd)"; }}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              />
              <div className="flex gap-1.5 flex-wrap">
                {COLOR_OPTIONS.map((co) => {
                  const lc = LABEL_COLOR_MAP[co.key];
                  return (
                    <button
                      key={co.key}
                      title={co.name}
                      className="cursor-pointer transition-all"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border:
                          newColor === co.key
                            ? `2.5px solid ${lc.color}`
                            : "2px solid var(--bd)",
                        background: lc.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: lc.color,
                      }}
                      onClick={() => setNewColor(co.key)}
                    >
                      {newColor === co.key ? "✓" : ""}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-1.5">
                <button
                  className="flex-1 cursor-pointer"
                  style={{
                    padding: "5px 0",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#fff",
                    background: "var(--gn)",
                    border: "none",
                    borderRadius: "var(--r3)",
                  }}
                  onClick={handleCreate}
                >
                  생성
                </button>
                <button
                  className="cursor-pointer"
                  style={{
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--tx3)",
                    background: "var(--sf2)",
                    border: "1px solid var(--bd)",
                    borderRadius: "var(--r3)",
                  }}
                  onClick={() => { setCreating(false); setNewName(""); }}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              className="w-full cursor-pointer transition-all"
              style={{
                padding: "7px 0",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--gn)",
                background: "var(--gl)",
                border: "1px solid var(--gn2)",
                borderRadius: "var(--r3)",
              }}
              onClick={() => setCreating(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--gn)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--gl)";
                e.currentTarget.style.color = "var(--gn)";
              }}
            >
              + 새 라벨 만들기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Card Item ── */

function CardItem({
  card,
  type,
  allLabels,
  onDragStart,
  onDragEnd,
  onClick,
  onToggleLabel,
  onCreateLabel,
  onDeleteLabel,
}: {
  card: CaseCard;
  type: CaseType;
  allLabels: Label[];
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onClick: () => void;
  onToggleLabel: (cardId: string, labelId: string) => void;
  onCreateLabel: (name: string, color: LabelColor) => void;
  onDeleteLabel: (labelId: string) => void;
}) {
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const sl = isStale(card);
  const nf = card.fu.filter((f) => !f.dn);
  const nr = nf.find((f) => daysUntil(f.dt) <= 7);
  const borderClass = sl
    ? "stale"
    : nr && daysUntil(nr.dt) <= 3
      ? "alert"
      : nr
        ? "warn"
        : "";

  const amt = card.amt;
  const remain = amt ? amt.orig - (amt.paid || 0) : null;
  const total = amt && amt.paid ? amt.paid + (amt.extra || 0) : null;

  const cardLabels = card.labels
    .map((lid) => allLabels.find((lb) => lb.id === lid))
    .filter(Boolean) as Label[];

  return (
    <div
      className="relative select-none cursor-grab active:cursor-grabbing transition-all group"
      style={{
        background: "var(--sf)",
        border: "1px solid var(--bd)",
        borderRadius: "var(--r2)",
        padding: "13px 13px 11px",
        boxShadow: "var(--sh0)",
        borderLeft:
          borderClass === "alert"
            ? "3px solid var(--rd)"
            : borderClass === "warn"
              ? "3px solid var(--og)"
              : borderClass === "stale"
                ? "3px solid var(--tx3)"
                : undefined,
      }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--gn2)";
        e.currentTarget.style.boxShadow = "var(--sh1)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--bd)";
        e.currentTarget.style.boxShadow = "var(--sh0)";
        e.currentTarget.style.transform = "";
      }}
    >
      {/* Drive link */}
      <a
        href={card.drv}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          right: 9,
          top: 9,
          fontSize: 11,
          color: "var(--tx3)",
          background: "var(--sf2)",
          borderRadius: 4,
          padding: "2px 5px",
          textDecoration: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        📁
      </a>

      <div
        className="font-bold"
        style={{ fontSize: 12, marginBottom: 3, letterSpacing: -0.1 }}
      >
        {card.name}
      </div>

      {type === "disp" && card.sub && (
        <div
          style={{
            fontSize: 10,
            color: "var(--tx3)",
            marginBottom: 8,
            lineHeight: 1.4,
          }}
        >
          {card.sub}
        </div>
      )}

      {/* Amount info for recv */}
      {amt && amt.orig ? (
        <div
          className="flex flex-col gap-0.5 mb-2 rounded-md"
          style={{ background: "var(--bg)", padding: "7px 8px" }}
        >
          <AmtRow label="최초발생금액" value={`${fmt(amt.orig)}원`} />
          {amt.paid ? (
            <AmtRow
              label="원금변제금액"
              value={`${fmt(amt.paid)}원`}
              highlight
            />
          ) : null}
          {total ? (
            <AmtRow label="변제총액" value={`${fmt(total)}원`} highlight />
          ) : null}
          <div
            style={{ height: 1, background: "var(--bd)", margin: "4px 0" }}
          />
          <AmtRow label="미수채권잔액" value={`${fmt(remain)}원`} red />
        </div>
      ) : null}

      {/* 소멸시효 for recv */}
      {type === "recv" && card.solDt && (
        <div
          className="flex items-center gap-1 mb-1.5"
          style={{ fontSize: 9, color: "var(--og)" }}
        >
          ⏳ 소멸시효 {card.solDt}
          {daysUntil(card.solDt) <= 90 && (
            <span
              className="font-bold rounded"
              style={{
                padding: "1px 5px",
                background: daysUntil(card.solDt) <= 30 ? "var(--rl)" : "var(--ol)",
                color: daysUntil(card.solDt) <= 30 ? "var(--rd)" : "var(--og)",
              }}
            >
              D-{Math.max(0, daysUntil(card.solDt))}
            </span>
          )}
        </div>
      )}

      {/* Footer: labels + status */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {cardLabels.map((lb) => {
            const lc = LABEL_COLOR_MAP[lb.color] || LABEL_COLOR_MAP.gy;
            return (
              <span
                key={lb.id}
                className="font-bold rounded"
                style={{
                  fontSize: 9,
                  padding: "2px 7px",
                  letterSpacing: 0.2,
                  background: lc.bg,
                  color: lc.color,
                }}
              >
                {lb.name}
              </span>
            );
          })}
          <span
            className="rounded cursor-pointer transition-opacity hover:opacity-80"
            style={{
              fontSize: 9,
              padding: "2px 5px",
              border: "1px dashed var(--bd2)",
              color: "var(--tx3)",
              lineHeight: 1,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setLabelModalOpen(true);
            }}
            title="라벨 편집"
          >
            +
          </span>
        </div>
        <div className="flex items-center gap-1">
          {nr && (
            <div
              className="flex items-center gap-0.5"
              style={{ fontSize: 9, color: "var(--og)" }}
            >
              📅 D-{daysUntil(nr.dt) <= 0 ? "day" : daysUntil(nr.dt)}
            </div>
          )}
          {sl && (
            <div style={{ fontSize: 9, color: "var(--tx3)" }}>
              🔕 장기미업데이트
            </div>
          )}
        </div>
      </div>

      {labelModalOpen && (
        <LabelModal
          card={card}
          allLabels={allLabels}
          onToggleLabel={onToggleLabel}
          onCreateLabel={onCreateLabel}
          onDeleteLabel={onDeleteLabel}
          onClose={() => setLabelModalOpen(false)}
        />
      )}
    </div>
  );
}

function AmtRow({
  label,
  value,
  highlight,
  red,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  red?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <div
        className="font-semibold"
        style={{ fontSize: 9, color: "var(--tx3)", letterSpacing: 0.3 }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: red ? "var(--rd)" : highlight ? "var(--gn)" : "var(--tx2)",
          fontWeight: highlight || red ? 500 : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}
