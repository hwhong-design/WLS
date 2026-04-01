"use client";

import { useState, useEffect } from "react";
import { CaseCard, CaseType, DocAttachment } from "@/lib/types";
import { fmt, daysUntil, getTodayISO } from "@/lib/utils";

interface DetailPanelProps {
  card: CaseCard | null;
  type: CaseType | null;
  columns: string[];
  open: boolean;
  onClose: () => void;
  onStatusChange: (newCol: string) => void;
  onAddTimeline: (dt: string, ti: string, dc: string) => void;
  onAddFollowUp: (dt: string, ti: string) => void;
  onToggleFollowUp: (index: number) => void;
  onSaveAmount: (orig: number, paid: number, extra: number) => void;
  onRename: (name: string, sub: string) => void;
  onDelete: () => void;
  onSaveSolDt: (dt: string) => void;
  onSaveProjUrl: (url: string) => void;
  onAddDoc: (doc: DocAttachment) => void;
  onDeleteDoc: (index: number) => void;
  showToast: (msg: string) => void;
}

export default function DetailPanel({
  card,
  type,
  columns,
  open,
  onClose,
  onStatusChange,
  onAddTimeline,
  onAddFollowUp,
  onToggleFollowUp,
  onSaveAmount,
  onRename,
  onDelete,
  onSaveSolDt,
  onSaveProjUrl,
  onAddDoc,
  onDeleteDoc,
  showToast,
}: DetailPanelProps) {
  const [selectedCol, setSelectedCol] = useState("");
  const [tlDate, setTlDate] = useState(getTodayISO());
  const [tlTitle, setTlTitle] = useState("");
  const [tlContent, setTlContent] = useState("");
  const [fuDate, setFuDate] = useState(getTodayISO());
  const [fuTitle, setFuTitle] = useState("");
  const [amtOrig, setAmtOrig] = useState(0);
  const [amtPaid, setAmtPaid] = useState(0);
  const [amtExtra, setAmtExtra] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSub, setEditSub] = useState("");
  const [solDt, setSolDt] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projUrl, setProjUrl] = useState("");
  const [editingProjUrl, setEditingProjUrl] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");

  useEffect(() => {
    if (card) {
      setSelectedCol(card.col);
      setEditName(card.name);
      setEditSub(card.sub);
      setSolDt(card.solDt || "");
      setProjUrl(card.projUrl || "");
      setEditingName(false);
      setEditingProjUrl(false);
      setShowDeleteConfirm(false);
      setDocTitle("");
      setDocUrl("");
      if (card.amt) {
        setAmtOrig(card.amt.orig || 0);
        setAmtPaid(card.amt.paid || 0);
        setAmtExtra(card.amt.extra || 0);
      } else {
        setAmtOrig(0);
        setAmtPaid(0);
        setAmtExtra(0);
      }
      setTlDate(getTodayISO());
      setFuDate(getTodayISO());
      setTlTitle("");
      setTlContent("");
      setFuTitle("");
    }
  }, [card]);

  if (!open || !card) return null;

  const remain = amtOrig - amtPaid;
  const total = amtPaid + amtExtra;
  const docs = card.docs || [];

  function handleStatusChange() {
    if (selectedCol === card!.col) {
      showToast("이미 해당 단계입니다.");
      return;
    }
    onStatusChange(selectedCol);
  }

  function handleAddTimeline() {
    if (!tlDate || !tlTitle.trim()) {
      showToast("날짜와 제목을 입력해주세요.");
      return;
    }
    onAddTimeline(tlDate, tlTitle.trim(), tlContent.trim());
    setTlTitle("");
    setTlContent("");
  }

  function handleAddFollowUp() {
    if (!fuDate || !fuTitle.trim()) {
      showToast("날짜와 내용을 입력해주세요.");
      return;
    }
    onAddFollowUp(fuDate, fuTitle.trim());
    setFuTitle("");
  }

  function handleSaveAmount() {
    onSaveAmount(amtOrig, amtPaid, amtExtra);
  }

  function handleAddDoc() {
    if (!docTitle.trim() || !docUrl.trim()) {
      showToast("문서 제목과 URL을 모두 입력해주세요.");
      return;
    }
    onAddDoc({ title: docTitle.trim(), url: docUrl.trim() });
    setDocTitle("");
    setDocUrl("");
  }

  return (
    <div
      className="fixed inset-0 z-[400] flex items-stretch"
      style={{
        background: "rgba(0,0,0,.45)",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="ml-auto flex flex-col overflow-y-auto animate-slide-in"
        style={{
          width: 540,
          background: "var(--sf)",
          height: "100vh",
          boxShadow: "-8px 0 40px rgba(0,0,0,.15)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10"
          style={{
            padding: "36px 40px 28px",
            borderBottom: "1px solid var(--bd)",
            background: "var(--sf)",
          }}
        >
          <button
            className="absolute flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--bd)]"
            style={{
              right: 24,
              top: 24,
              background: "var(--bg)",
              border: "1px solid var(--bd)",
              borderRadius: "50%",
              width: 30,
              height: 30,
              fontSize: 14,
              color: "var(--tx3)",
            }}
            onClick={onClose}
          >
            ✕
          </button>

          <div
            className="inline-block font-bold mb-2.5"
            style={{
              fontSize: 10,
              padding: "2px 9px",
              borderRadius: 4,
              letterSpacing: 0.3,
              background: type === "recv" ? "var(--rl)" : "var(--gdl)",
              color: type === "recv" ? "var(--rd)" : "var(--gd)",
            }}
          >
            {type === "recv" ? "미수채권" : "분쟁"}
          </div>

          {editingName ? (
            <div className="mb-4" style={{ paddingRight: 40 }}>
              <input
                type="text"
                className="w-full font-bold outline-none mb-1.5"
                style={{
                  fontSize: 18,
                  letterSpacing: -0.3,
                  padding: "4px 8px",
                  border: "1px solid var(--gn)",
                  borderRadius: "var(--r3)",
                  background: "var(--sf)",
                  color: "var(--tx)",
                }}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
              {type === "disp" && (
                <input
                  type="text"
                  className="w-full outline-none"
                  style={{
                    fontSize: 11,
                    padding: "4px 8px",
                    border: "1px solid var(--bd)",
                    borderRadius: "var(--r3)",
                    background: "var(--sf)",
                    color: "var(--tx2)",
                  }}
                  value={editSub}
                  onChange={(e) => setEditSub(e.target.value)}
                  placeholder="부제/설명"
                />
              )}
              <div className="flex gap-3 mt-3">
                <button
                  className="font-semibold cursor-pointer transition-opacity hover:opacity-85"
                  style={{
                    background: "var(--gn)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--r3)",
                    padding: "5px 12px",
                    fontSize: 11,
                  }}
                  onClick={() => {
                    if (!editName.trim()) {
                      showToast("이름을 입력해주세요.");
                      return;
                    }
                    onRename(editName.trim(), editSub.trim());
                    setEditingName(false);
                  }}
                >
                  저장
                </button>
                <button
                  className="cursor-pointer transition-opacity hover:opacity-85"
                  style={{
                    background: "var(--sf2)",
                    color: "var(--tx2)",
                    border: "1px solid var(--bd)",
                    borderRadius: "var(--r3)",
                    padding: "5px 12px",
                    fontSize: 11,
                  }}
                  onClick={() => {
                    setEditName(card.name);
                    setEditSub(card.sub);
                    setEditingName(false);
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="flex items-center gap-3"
                style={{ paddingRight: 40, marginBottom: 6 }}
              >
                <div
                  className="font-bold"
                  style={{ fontSize: 18, letterSpacing: -0.3 }}
                >
                  {card.name}
                </div>
                <button
                  className="shrink-0 flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--bd)]"
                  style={{
                    width: 24,
                    height: 24,
                    background: "var(--sf2)",
                    border: "1px solid var(--bd)",
                    borderRadius: 4,
                    fontSize: 12,
                    color: "var(--tx3)",
                  }}
                  onClick={() => setEditingName(true)}
                  title="이름 수정"
                >
                  ✏️
                </button>
              </div>
              {type === "disp" && card.sub && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--tx3)",
                    marginBottom: 18,
                  }}
                >
                  {card.sub}
                </div>
              )}
            </>
          )}

          {/* Status change */}
          <div className="flex items-center gap-3 mb-4">
            <select
              className="flex-1 cursor-pointer transition-all outline-none"
              style={{
                padding: "8px 12px",
                border: "1px solid var(--bd)",
                borderRadius: "var(--r3)",
                fontSize: 12,
                fontFamily: "'Noto Sans KR', sans-serif",
                background: "var(--sf)",
                color: "var(--tx)",
              }}
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              className="shrink-0 font-semibold cursor-pointer transition-opacity hover:opacity-85"
              style={{
                background: "var(--gn)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--r3)",
                padding: "8px 16px",
                fontSize: 12,
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
              onClick={handleStatusChange}
            >
              단계 변경
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={card.drv}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{
                fontSize: 11,
                color: "var(--bl)",
                background: "var(--bll)",
                padding: "5px 12px",
                borderRadius: "var(--r3)",
                textDecoration: "none",
              }}
            >
              📁 드라이브 폴더 열기
            </a>

            {editingProjUrl ? (
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  className="outline-none transition-all focus:border-[var(--gn)]"
                  style={{
                    width: 220,
                    padding: "5px 10px",
                    border: "1px solid var(--gn)",
                    borderRadius: "var(--r3)",
                    fontSize: 11,
                    fontFamily: "'Noto Sans KR', sans-serif",
                    background: "var(--sf)",
                    color: "var(--tx)",
                  }}
                  placeholder="https://..."
                  value={projUrl}
                  onChange={(e) => setProjUrl(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSaveProjUrl(projUrl.trim());
                      setEditingProjUrl(false);
                      showToast(projUrl.trim() ? "프로젝트 링크가 저장됐어요." : "프로젝트 링크가 삭제됐어요.");
                    } else if (e.key === "Escape") {
                      setProjUrl(card.projUrl || "");
                      setEditingProjUrl(false);
                    }
                  }}
                />
                <button
                  className="shrink-0 font-semibold cursor-pointer transition-opacity hover:opacity-85"
                  style={{
                    background: "var(--gn)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--r3)",
                    padding: "5px 10px",
                    fontSize: 10,
                  }}
                  onClick={() => {
                    onSaveProjUrl(projUrl.trim());
                    setEditingProjUrl(false);
                    showToast(projUrl.trim() ? "프로젝트 링크가 저장됐어요." : "프로젝트 링크가 삭제됐어요.");
                  }}
                >
                  저장
                </button>
                <button
                  className="shrink-0 cursor-pointer transition-opacity hover:opacity-85"
                  style={{
                    background: "var(--sf2)",
                    color: "var(--tx2)",
                    border: "1px solid var(--bd)",
                    borderRadius: "var(--r3)",
                    padding: "5px 10px",
                    fontSize: 10,
                  }}
                  onClick={() => {
                    setProjUrl(card.projUrl || "");
                    setEditingProjUrl(false);
                  }}
                >
                  취소
                </button>
              </div>
            ) : projUrl ? (
              <div className="flex items-center gap-1.5">
                <a
                  href={projUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
                  style={{
                    fontSize: 11,
                    color: "var(--gn)",
                    background: "var(--gl)",
                    padding: "5px 12px",
                    borderRadius: "var(--r3)",
                    textDecoration: "none",
                  }}
                >
                  🔗 프로젝트 링크 &gt;
                </a>
                <button
                  className="shrink-0 flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--bd)]"
                  style={{
                    width: 22,
                    height: 22,
                    background: "var(--sf2)",
                    border: "1px solid var(--bd)",
                    borderRadius: 4,
                    fontSize: 10,
                    color: "var(--tx3)",
                  }}
                  onClick={() => setEditingProjUrl(true)}
                  title="프로젝트 링크 수정"
                >
                  ✏️
                </button>
              </div>
            ) : (
              <button
                className="inline-flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  fontSize: 11,
                  color: "var(--tx3)",
                  background: "var(--sf2)",
                  padding: "5px 12px",
                  borderRadius: "var(--r3)",
                  border: "1px solid var(--bd)",
                }}
                onClick={() => setEditingProjUrl(true)}
              >
                🔗 프로젝트 링크 추가
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1" style={{ padding: "36px 40px" }}>
          {/* Amount section (recv only) */}
          {type === "recv" && (
            <>
              <SectionTitle>금액 정보</SectionTitle>
              <div
                className="mb-12"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--bd)",
                  borderRadius: "var(--r2)",
                  padding: 26,
                }}
              >
                <div
                  className="font-bold"
                  style={{
                    fontSize: 11,
                    color: "var(--tx2)",
                    marginBottom: 20,
                  }}
                >
                  금액 정보 입력 — 통계에 자동 반영됩니다
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <AmtInput
                    label="최초발생금액"
                    value={amtOrig}
                    onChange={setAmtOrig}
                  />
                  <AmtInput
                    label="원금변제금액"
                    value={amtPaid}
                    onChange={setAmtPaid}
                  />
                  <AmtInput
                    label="지연손해금 등"
                    value={amtExtra}
                    onChange={setAmtExtra}
                  />
                  <div className="flex flex-col gap-1.5">
                    <div
                      className="font-bold uppercase"
                      style={{
                        fontSize: 9,
                        color: "var(--tx3)",
                        letterSpacing: 0.5,
                      }}
                    >
                      미수채권잔액
                    </div>
                    <input
                      className="w-full"
                      style={{
                        padding: "7px 10px",
                        border: "1px solid var(--bd)",
                        borderRadius: "var(--r3)",
                        fontSize: 12,
                        fontFamily: "'DM Mono', monospace",
                        background: "var(--sf2)",
                        color: "var(--tx3)",
                        outline: "none",
                      }}
                      value={remain > 0 ? remain : ""}
                      readOnly
                      placeholder="자동계산"
                    />
                  </div>
                </div>
                <div
                  className="grid grid-cols-2 gap-2.5 mt-4 pt-4"
                  style={{ borderTop: "1px solid var(--bd)" }}
                >
                  <div>
                    <div
                      className="font-semibold"
                      style={{ fontSize: 9, color: "var(--tx3)" }}
                    >
                      변제총액
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--gn)",
                      }}
                    >
                      {total ? `${fmt(total)}원` : "-"}
                    </div>
                  </div>
                  <div>
                    <div
                      className="font-semibold"
                      style={{ fontSize: 9, color: "var(--tx3)" }}
                    >
                      미수채권잔액
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--rd)",
                      }}
                    >
                      {remain > 0 ? `${fmt(remain)}원` : "-"}
                    </div>
                  </div>
                </div>
                <button
                  className="w-full mt-4 font-semibold cursor-pointer transition-opacity hover:opacity-85"
                  style={{
                    background: "var(--gn)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--r3)",
                    padding: "7px 14px",
                    fontSize: 12,
                    fontFamily: "'Noto Sans KR', sans-serif",
                  }}
                  onClick={handleSaveAmount}
                >
                  저장 — 통계에 반영
                </button>
              </div>
            </>
          )}

          {/* 소멸시효 (recv only) */}
          {type === "recv" && (
            <>
              <SectionTitle>소멸시효</SectionTitle>
              <div
                className="mb-12"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--bd)",
                  borderRadius: "var(--r2)",
                  padding: 26,
                }}
              >
                <div
                  className="font-bold"
                  style={{
                    fontSize: 11,
                    color: "var(--tx2)",
                    marginBottom: 12,
                  }}
                >
                  소멸시효 만료일
                </div>
                <div className="flex gap-3">
                  <input
                    type="date"
                    className="flex-1 outline-none transition-all focus:border-[var(--gn)]"
                    style={{
                      padding: "7px 10px",
                      border: "1px solid var(--bd)",
                      borderRadius: "var(--r3)",
                      fontSize: 12,
                      fontFamily: "'DM Mono', monospace",
                      background: "var(--sf)",
                      color: "var(--tx)",
                    }}
                    value={solDt}
                    onChange={(e) => setSolDt(e.target.value)}
                  />
                  <button
                    className="shrink-0 font-semibold cursor-pointer transition-opacity hover:opacity-85"
                    style={{
                      background: "var(--gn)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "var(--r3)",
                      padding: "7px 14px",
                      fontSize: 12,
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                    onClick={() => {
                      onSaveSolDt(solDt);
                      showToast(solDt ? "소멸시효가 저장됐어요." : "소멸시효가 삭제됐어요.");
                    }}
                  >
                    저장
                  </button>
                </div>
                {solDt && (
                  <div
                    className="mt-3 flex items-center gap-2"
                    style={{ fontSize: 11 }}
                  >
                    <span style={{ color: "var(--tx3)" }}>⏳ 만료까지</span>
                    <span
                      className="font-bold"
                      style={{
                        color:
                          daysUntil(solDt) <= 30
                            ? "var(--rd)"
                            : daysUntil(solDt) <= 90
                              ? "var(--og)"
                              : "var(--gn)",
                      }}
                    >
                      {daysUntil(solDt) <= 0
                        ? "만료됨"
                        : `D-${daysUntil(solDt)}`}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Timeline */}
          <SectionTitle>타임라인</SectionTitle>
          <div className="flex flex-col mb-12">
            {card.tl.map((t, i) => (
              <div
                key={i}
                className="flex gap-4 relative"
                style={{
                  paddingBottom: 24,
                }}
              >
                {/* Vertical line */}
                {i < card.tl.length - 1 && (
                  <div
                    className="absolute"
                    style={{
                      left: 6,
                      top: 18,
                      bottom: -4,
                      width: 1,
                      background: "var(--bd)",
                    }}
                  />
                )}
                <div
                  className="shrink-0 rounded-full z-[1]"
                  style={{
                    width: 13,
                    height: 13,
                    background: t.dn ? "var(--tx3)" : "var(--gn)",
                    border: "2px solid var(--sf)",
                    marginTop: 3,
                    boxShadow: t.dn
                      ? "0 0 0 3px var(--sf2)"
                      : "0 0 0 3px var(--gl)",
                  }}
                />
                <div className="flex-1">
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      color: "var(--tx3)",
                      marginBottom: 4,
                    }}
                  >
                    {t.dt}
                  </div>
                  <div
                    className="font-semibold"
                    style={{
                      fontSize: 13,
                      marginBottom: 4,
                      letterSpacing: -0.1,
                    }}
                  >
                    {t.ti}
                  </div>
                  {t.dc && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--tx2)",
                        lineHeight: 1.6,
                      }}
                    >
                      {t.dc}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add timeline form */}
          <FormBox title="+ 기록 추가">
            <div className="flex gap-3 mb-3">
              <input
                type="date"
                className="outline-none transition-all focus:border-[var(--gn)]"
                style={{
                  width: 130,
                  padding: "8px 10px",
                  border: "1px solid var(--bd)",
                  borderRadius: "var(--r3)",
                  fontSize: 12,
                  fontFamily: "'Noto Sans KR', sans-serif",
                  background: "var(--sf)",
                  color: "var(--tx)",
                }}
                value={tlDate}
                onChange={(e) => setTlDate(e.target.value)}
              />
              <input
                type="text"
                className="flex-1 outline-none transition-all focus:border-[var(--gn)]"
                style={{
                  padding: "8px 10px",
                  border: "1px solid var(--bd)",
                  borderRadius: "var(--r3)",
                  fontSize: 12,
                  fontFamily: "'Noto Sans KR', sans-serif",
                  background: "var(--sf)",
                  color: "var(--tx)",
                }}
                placeholder="제목 (예: 지급명령신청)"
                value={tlTitle}
                onChange={(e) => setTlTitle(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <textarea
                className="w-full outline-none transition-all focus:border-[var(--gn)]"
                style={{
                  padding: "8px 10px",
                  border: "1px solid var(--bd)",
                  borderRadius: "var(--r3)",
                  fontSize: 12,
                  fontFamily: "'Noto Sans KR', sans-serif",
                  background: "var(--sf)",
                  color: "var(--tx)",
                  resize: "none",
                  height: 58,
                }}
                placeholder="내용 메모 (선택)"
                value={tlContent}
                onChange={(e) => setTlContent(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="font-semibold cursor-pointer transition-opacity hover:opacity-85"
                style={{
                  background: "var(--gn)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--r3)",
                  padding: "8px 14px",
                  fontSize: 12,
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
                onClick={handleAddTimeline}
              >
                추가
              </button>
            </div>
          </FormBox>

          {/* Documents */}
          <SectionTitle>첨부 문서</SectionTitle>
          <div
            className="mb-12"
            style={{
              background: "var(--gl)",
              border: "1px solid var(--gl2)",
              borderRadius: "var(--r2)",
              padding: 26,
            }}
          >
            <div className="flex flex-col gap-3">
              {docs.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--tx3)", padding: "4px 0" }}>
                  등록된 문서가 없습니다.
                </div>
              ) : (
                docs.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                    style={{
                      background: "var(--sf)",
                      border: "1px solid var(--bd)",
                      borderRadius: "var(--r3)",
                      padding: "12px 18px",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>📄</span>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 font-medium transition-opacity hover:opacity-70"
                      style={{
                        fontSize: 12,
                        color: "var(--bl)",
                        textDecoration: "none",
                      }}
                    >
                      {doc.title} &gt;
                    </a>
                    <button
                      className="shrink-0 flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--rl)]"
                      style={{
                        width: 22,
                        height: 22,
                        background: "var(--sf2)",
                        border: "1px solid var(--bd)",
                        borderRadius: 4,
                        fontSize: 10,
                        color: "var(--tx3)",
                      }}
                      onClick={() => onDeleteDoc(i)}
                      title="문서 삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                borderTop: "1px solid var(--gl2)",
                marginTop: 18,
                paddingTop: 18,
              }}
            >
              <div
                className="font-bold"
                style={{ fontSize: 11, color: "var(--tx2)", marginBottom: 12 }}
              >
                + 문서 추가
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="outline-none transition-all focus:border-[var(--gn)]"
                  style={{
                    width: 130,
                    padding: "8px 10px",
                    border: "1px solid var(--bd)",
                    borderRadius: "var(--r3)",
                    fontSize: 12,
                    fontFamily: "'Noto Sans KR', sans-serif",
                    background: "var(--sf)",
                    color: "var(--tx)",
                  }}
                  placeholder="문서 제목"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
                <input
                  type="url"
                  className="flex-1 outline-none transition-all focus:border-[var(--gn)]"
                  style={{
                    padding: "8px 10px",
                    border: "1px solid var(--bd)",
                    borderRadius: "var(--r3)",
                    fontSize: 12,
                    fontFamily: "'Noto Sans KR', sans-serif",
                    background: "var(--sf)",
                    color: "var(--tx)",
                  }}
                  placeholder="구글 드라이브 URL"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddDoc();
                  }}
                />
                <button
                  className="shrink-0 font-semibold cursor-pointer transition-opacity hover:opacity-85"
                  style={{
                    background: "var(--gn)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--r3)",
                    padding: "8px 14px",
                    fontSize: 12,
                    fontFamily: "'Noto Sans KR', sans-serif",
                  }}
                  onClick={handleAddDoc}
                >
                  추가
                </button>
              </div>
            </div>
          </div>

          {/* Follow-ups */}
          <SectionTitle>팔로업</SectionTitle>
          <div className="flex flex-col gap-4 mb-12">
            {card.fu.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--tx3)", padding: "4px 0" }}>
                등록된 팔로업이 없습니다.
              </div>
            ) : (
              card.fu.map((f, i) => {
                const d = daysUntil(f.dt);
                let cl = "ok";
                let lb = `D-${d}`;
                if (f.dn) {
                  cl = "dn";
                  lb = "완료";
                } else if (d < 0) {
                  cl = "ug";
                  lb = "지남";
                } else if (d <= 3) {
                  cl = "ug";
                  lb = `D-${d}`;
                } else if (d <= 7) {
                  cl = "wn";
                  lb = `D-${d}`;
                }

                const badgeStyles: Record<
                  string,
                  { bg: string; color: string }
                > = {
                  ug: { bg: "var(--rl)", color: "var(--rd)" },
                  wn: { bg: "var(--ol)", color: "var(--og)" },
                  ok: { bg: "var(--gl)", color: "var(--gn)" },
                  dn: { bg: "var(--sf2)", color: "var(--tx3)" },
                };
                const bs = badgeStyles[cl];

                return (
                  <div
                    key={i}
                    className="flex items-center gap-3.5"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--bd)",
                      borderRadius: "var(--r2)",
                      padding: "14px 18px",
                    }}
                  >
                    <div
                      className="shrink-0 flex items-center justify-center cursor-pointer transition-all rounded-full"
                      style={{
                        width: 17,
                        height: 17,
                        border: f.dn
                          ? "2px solid var(--gn)"
                          : "2px solid var(--bd2)",
                        background: f.dn ? "var(--gn)" : "transparent",
                        color: "#fff",
                        fontSize: 9,
                      }}
                      onClick={() => onToggleFollowUp(i)}
                    >
                      {f.dn ? "✓" : ""}
                    </div>
                    <div className="flex-1">
                      <div
                        className="font-medium"
                        style={{
                          fontSize: 12,
                          textDecoration: f.dn ? "line-through" : undefined,
                          color: f.dn ? "var(--tx3)" : undefined,
                        }}
                      >
                        {f.ti}
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10,
                          color: "var(--tx3)",
                          marginTop: 3,
                        }}
                      >
                        {f.dt}
                      </div>
                    </div>
                    <div
                      className="shrink-0 font-bold rounded-md"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 10,
                        padding: "3px 8px",
                        background: bs.bg,
                        color: bs.color,
                      }}
                    >
                      {lb}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add follow-up form */}
          <FormBox title="+ 팔로업 추가">
            <div className="flex gap-3">
              <input
                type="date"
                className="outline-none transition-all focus:border-[var(--gn)]"
                style={{
                  width: 130,
                  padding: "8px 10px",
                  border: "1px solid var(--bd)",
                  borderRadius: "var(--r3)",
                  fontSize: 12,
                  fontFamily: "'Noto Sans KR', sans-serif",
                  background: "var(--sf)",
                  color: "var(--tx)",
                }}
                value={fuDate}
                onChange={(e) => setFuDate(e.target.value)}
              />
              <input
                type="text"
                className="flex-1 outline-none transition-all focus:border-[var(--gn)]"
                style={{
                  padding: "8px 10px",
                  border: "1px solid var(--bd)",
                  borderRadius: "var(--r3)",
                  fontSize: 12,
                  fontFamily: "'Noto Sans KR', sans-serif",
                  background: "var(--sf)",
                  color: "var(--tx)",
                }}
                placeholder="예: 잔금 30% 입금 확인"
                value={fuTitle}
                onChange={(e) => setFuTitle(e.target.value)}
              />
              <button
                className="shrink-0 font-semibold cursor-pointer transition-opacity hover:opacity-85"
                style={{
                  background: "var(--gn)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--r3)",
                  padding: "8px 14px",
                  fontSize: 12,
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
                onClick={handleAddFollowUp}
              >
                추가
              </button>
            </div>
          </FormBox>

          {/* Delete */}
          <SectionTitle>위험 영역</SectionTitle>
          <div
            className="mb-12"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--bd)",
              borderRadius: "var(--r2)",
              padding: 26,
            }}
          >
            {!showDeleteConfirm ? (
              <button
                className="w-full font-semibold cursor-pointer transition-opacity hover:opacity-85"
                style={{
                  background: "var(--rl)",
                  color: "var(--rd)",
                  border: "1px solid var(--rd)",
                  borderRadius: "var(--r3)",
                  padding: "9px 14px",
                  fontSize: 12,
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                🗑️ 이 케이스 삭제
              </button>
            ) : (
              <div>
                <div
                  className="font-semibold mb-3"
                  style={{ fontSize: 12, color: "var(--rd)" }}
                >
                  정말 &ldquo;{card.name}&rdquo; 케이스를 삭제하시겠습니까?
                </div>
                <div
                  className="mb-4"
                  style={{ fontSize: 11, color: "var(--tx3)" }}
                >
                  삭제된 케이스는 복구할 수 없습니다.
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 font-semibold cursor-pointer transition-opacity hover:opacity-85"
                    style={{
                      background: "var(--rd)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "var(--r3)",
                      padding: "8px 14px",
                      fontSize: 12,
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                    onClick={() => {
                      onDelete();
                      setShowDeleteConfirm(false);
                    }}
                  >
                    삭제 확인
                  </button>
                  <button
                    className="flex-1 cursor-pointer transition-opacity hover:opacity-85"
                    style={{
                      background: "var(--sf2)",
                      color: "var(--tx2)",
                      border: "1px solid var(--bd)",
                      borderRadius: "var(--r3)",
                      padding: "8px 14px",
                      fontSize: 12,
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-3 mb-6"
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "var(--tx3)",
      }}
    >
      {children}
      <div className="flex-1" style={{ height: 1, background: "var(--bd)" }} />
    </div>
  );
}

function FormBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mb-12"
      style={{
        background: "var(--bg)",
        border: "1px solid var(--bd)",
        borderRadius: "var(--r2)",
        padding: 26,
      }}
    >
      <div
        className="font-bold"
        style={{ fontSize: 11, color: "var(--tx2)", marginBottom: 18 }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function AmtInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="font-bold uppercase"
        style={{ fontSize: 9, color: "var(--tx3)", letterSpacing: 0.5 }}
      >
        {label}
      </div>
      <input
        type="number"
        className="w-full outline-none transition-all focus:border-[var(--gn)]"
        style={{
          padding: "7px 10px",
          border: "1px solid var(--bd)",
          borderRadius: "var(--r3)",
          fontSize: 12,
          fontFamily: "'DM Mono', monospace",
          background: "var(--sf)",
          color: "var(--tx)",
        }}
        placeholder="0"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}
