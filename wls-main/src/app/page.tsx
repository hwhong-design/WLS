"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CaseCard, CaseType, TabId, Label, LabelColor, DocAttachment } from "@/lib/types";
import {
  initialRecvData,
  initialDispData,
  RECV_COLS,
  DISP_COLS,
  DEFAULT_LABELS,
} from "@/lib/data";
import { getTodayISO } from "@/lib/utils";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import HomePage from "@/components/HomePage";
import DocumentPage from "@/components/DocumentPage";
import KanbanBoard from "@/components/KanbanBoard";
import StatsPage from "@/components/StatsPage";
import DetailPanel from "@/components/DetailPanel";
import Toast from "@/components/Toast";

/* ── localStorage helpers ── */
function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  // ── 데이터: localStorage에서 초기화 ──
  const [recvData, setRecvData] = useState<CaseCard[]>(() =>
    loadStorage("wls_recv", initialRecvData)
  );
  const [dispData, setDispData] = useState<CaseCard[]>(() =>
    loadStorage("wls_disp", initialDispData)
  );
  const [allLabels, setAllLabels] = useState<Label[]>(() =>
    loadStorage("wls_labels", DEFAULT_LABELS)
  );

  // ── 변경 시 localStorage 자동 저장 ──
  useEffect(() => { saveStorage("wls_recv", recvData); }, [recvData]);
  useEffect(() => { saveStorage("wls_disp", dispData); }, [dispData]);
  useEffect(() => { saveStorage("wls_labels", allLabels); }, [allLabels]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCard, setDetailCard] = useState<CaseCard | null>(null);
  const [detailType, setDetailType] = useState<CaseType | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const recvActive = recvData.filter((c) => c.col !== "추심종료").length;
  const dispActive = dispData.filter((c) => c.col !== "종결").length;

  function navigate(tab: string) {
    setActiveTab(tab as TabId);
  }

  function openDetail(ty: CaseType, id: string) {
    const cards = ty === "recv" ? recvData : dispData;
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setDetailCard({ ...card });
    setDetailType(ty);
    setDetailOpen(true);
  }

  function updateCard(
    ty: CaseType,
    id: string,
    updater: (c: CaseCard) => CaseCard
  ) {
    const setter = ty === "recv" ? setRecvData : setDispData;
    setter((prev) => {
      const next = prev.map((c) => (c.id === id ? updater({ ...c }) : c));
      const updated = next.find((c) => c.id === id);
      if (updated && detailCard?.id === id) {
        setDetailCard({ ...updated });
      }
      return next;
    });
  }

  function handleMoveRecv(id: string, newCol: string) {
    updateCard("recv", id, (c) => ({ ...c, col: newCol, lu: getTodayISO() }));
    const card = recvData.find((c) => c.id === id);
    showToast(`"${card?.name}" → ${newCol} 이동 완료`);
  }

  function handleMoveDisp(id: string, newCol: string) {
    updateCard("disp", id, (c) => ({ ...c, col: newCol, lu: getTodayISO() }));
    const card = dispData.find((c) => c.id === id);
    showToast(`"${card?.name}" → ${newCol} 이동 완료`);
  }

  function handleStatusChange(newCol: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, col: newCol, lu: getTodayISO() }));
    showToast(`"${detailCard.name}" → ${newCol} 이동 완료`);
  }

  function handleAddTimeline(dt: string, ti: string, dc: string) {
    if (!detailCard || !detailType) return;
    const fmtDate = new Date(dt).toLocaleDateString("ko-KR", {
      year: "numeric", month: "numeric", day: "numeric",
    });
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      tl: [...c.tl, { dt: fmtDate, ti, dc, dn: false }],
      lu: getTodayISO(),
    }));
    showToast("기록이 추가됐어요.");
  }

  // ── 타임라인 수정 ──
  function handleEditTimeline(index: number, dt: string, ti: string, dc: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      tl: c.tl.map((entry, i) =>
        i === index ? { ...entry, dt, ti, dc } : entry
      ),
      lu: getTodayISO(),
    }));
    showToast("타임라인이 수정됐어요.");
  }

  // ── 타임라인 삭제 ──
  function handleDeleteTimeline(index: number) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      tl: c.tl.filter((_, i) => i !== index),
      lu: getTodayISO(),
    }));
    showToast("타임라인이 삭제됐어요.");
  }

  function handleAddFollowUp(dt: string, ti: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      fu: [...c.fu, { dt, ti, dn: false }],
    }));
    showToast("팔로업이 추가됐어요.");
  }

  // ── 팔로업 수정 ──
  function handleEditFollowUp(index: number, dt: string, ti: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      fu: c.fu.map((f, i) => (i === index ? { ...f, dt, ti } : f)),
    }));
    showToast("팔로업이 수정됐어요.");
  }

  // ── 팔로업 삭제 ──
  function handleDeleteFollowUp(index: number) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      fu: c.fu.filter((_, i) => i !== index),
    }));
    showToast("팔로업이 삭제됐어요.");
  }

  function handleToggleFollowUp(index: number) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      fu: c.fu.map((f, i) => (i === index ? { ...f, dn: !f.dn } : f)),
    }));
  }

  function handleSaveAmount(orig: number, paid: number, extra: number) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      amt: { orig, paid, extra },
    }));
    showToast("금액 정보가 저장됐어요. 통계에 반영됩니다.");
  }

  function handleRename(name: string, sub: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, name, sub }));
    showToast("이름이 변경됐어요.");
  }

  function handleDelete() {
    if (!detailCard || !detailType) return;
    const setter = detailType === "recv" ? setRecvData : setDispData;
    setter((prev) => prev.filter((c) => c.id !== detailCard.id));
    setDetailOpen(false);
    showToast(`"${detailCard.name}" 케이스가 삭제됐어요.`);
  }

  function handleSaveSolDt(dt: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      solDt: dt || undefined,
    }));
  }

  function handleSaveProjUrl(url: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      projUrl: url || undefined,
    }));
  }

  // ── 드라이브 URL 수정 ──
  function handleSaveDriveUrl(url: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      drv: url,
    }));
    showToast("드라이브 링크가 저장됐어요.");
  }

  function handleAddDoc(doc: DocAttachment) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      docs: [...(c.docs || []), doc],
    }));
    showToast("문서가 추가됐어요.");
  }

  function handleDeleteDoc(index: number) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      docs: (c.docs || []).filter((_, i) => i !== index),
    }));
    showToast("문서가 삭제됐어요.");
  }

  // ── 첨부문서 수정 ──
  function handleEditDoc(index: number, doc: DocAttachment) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c,
      docs: (c.docs || []).map((d, i) => (i === index ? doc : d)),
    }));
    showToast("문서가 수정됐어요.");
  }

  /* ── Label management ── */
  const labelIdCounter = useRef(
    loadStorage<number>("wls_label_counter", 100)
  );

  function handleToggleLabel(ty: CaseType, cardId: string, labelId: string) {
    updateCard(ty, cardId, (c) => ({
      ...c,
      labels: c.labels.includes(labelId)
        ? c.labels.filter((id) => id !== labelId)
        : [...c.labels, labelId],
    }));
  }

  function handleCreateLabel(name: string, color: LabelColor) {
    const id = `lb${labelIdCounter.current++}`;
    saveStorage("wls_label_counter", labelIdCounter.current);
    setAllLabels((prev) => [...prev, { id, name, color }]);
    showToast(`"${name}" 라벨이 생성됐어요.`);
  }

  function handleDeleteLabel(labelId: string) {
    const label = allLabels.find((lb) => lb.id === labelId);
    setAllLabels((prev) => prev.filter((lb) => lb.id !== labelId));
    setRecvData((prev) =>
      prev.map((c) => ({ ...c, labels: c.labels.filter((id) => id !== labelId) }))
    );
    setDispData((prev) =>
      prev.map((c) => ({ ...c, labels: c.labels.filter((id) => id !== labelId) }))
    );
    if (label) showToast(`"${label.name}" 라벨이 삭제됐어요.`);
  }

  /* ── Add card ── */
  const nextIdCounter = useRef(
    loadStorage<number>("wls_id_counter", 100)
  );

  function handleAddRecvCard(col: string) {
    const id = `r${nextIdCounter.current++}`;
    saveStorage("wls_id_counter", nextIdCounter.current);
    const newCard: CaseCard = {
      id,
      name: "새 미수채권",
      sub: "",
      col,
      labels: ["lb17"],
      drv: "https://drive.google.com",
      lu: getTodayISO(),
      amt: { orig: 0, paid: 0, extra: 0 },
      tl: [],
      fu: [],
    };
    setRecvData((prev) => [...prev, newCard]);
    showToast("새 미수채권 케이스가 추가됐어요.");
    setTimeout(() => openDetail("recv", id), 50);
  }

  function handleAddDispCard(col: string) {
    const id = `d${nextIdCounter.current++}`;
    saveStorage("wls_id_counter", nextIdCounter.current);
    const newCard: CaseCard = {
      id,
      name: "새 분쟁",
      sub: "",
      col,
      labels: ["lb17"],
      drv: "https://drive.google.com",
      lu: getTodayISO(),
      tl: [],
      fu: [],
    };
    setDispData((prev) => [...prev, newCard]);
    showToast("새 분쟁 케이스가 추가됐어요.");
    setTimeout(() => openDetail("disp", id), 50);
  }

  return (
    <>
      <Header
        recvData={recvData}
        dispData={dispData}
        onOpenDetail={openDetail}
        onNavigate={navigate}
      />
      <Navigation
        activeTab={activeTab}
        onNavigate={setActiveTab}
        recvCount={recvActive}
        dispCount={dispActive}
      />
      <main style={{ padding: "28px 32px" }}>
        {activeTab === "home" && (
          <HomePage
            recvData={recvData}
            dispData={dispData}
            onNavigate={navigate}
            onOpenDetail={openDetail}
          />
        )}
        {activeTab === "doc" && <DocumentPage />}
        {activeTab === "recv" && (
          <KanbanBoard
            cards={recvData}
            columns={RECV_COLS}
            type="recv"
            title="⚔️ 미수채권"
            allLabels={allLabels}
            onMoveCard={handleMoveRecv}
            onOpenDetail={(id) => openDetail("recv", id)}
            onAddCard={handleAddRecvCard}
            onToggleLabel={(cardId, labelId) =>
              handleToggleLabel("recv", cardId, labelId)
            }
            onCreateLabel={handleCreateLabel}
            onDeleteLabel={handleDeleteLabel}
          />
        )}
        {activeTab === "disp" && (
          <KanbanBoard
            cards={dispData}
            columns={DISP_COLS}
            type="disp"
            title="🥊 분쟁"
            allLabels={allLabels}
            onMoveCard={handleMoveDisp}
            onOpenDetail={(id) => openDetail("disp", id)}
            onAddCard={handleAddDispCard}
            onToggleLabel={(cardId, labelId) =>
              handleToggleLabel("disp", cardId, labelId)
            }
            onCreateLabel={handleCreateLabel}
            onDeleteLabel={handleDeleteLabel}
          />
        )}
        {activeTab === "stats" && (
          <StatsPage
            recvData={recvData}
            dispData={dispData}
            allLabels={allLabels}
            onOpenDetail={openDetail}
          />
        )}
      </main>
      <DetailPanel
        card={detailCard}
        type={detailType}
        columns={detailType === "recv" ? RECV_COLS : DISP_COLS}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStatusChange={handleStatusChange}
        onAddTimeline={handleAddTimeline}
        onEditTimeline={handleEditTimeline}
        onDeleteTimeline={handleDeleteTimeline}
        onAddFollowUp={handleAddFollowUp}
        onEditFollowUp={handleEditFollowUp}
        onDeleteFollowUp={handleDeleteFollowUp}
        onToggleFollowUp={handleToggleFollowUp}
        onSaveAmount={handleSaveAmount}
        onRename={handleRename}
        onDelete={handleDelete}
        onSaveSolDt={handleSaveSolDt}
        onSaveProjUrl={handleSaveProjUrl}
        onSaveDriveUrl={handleSaveDriveUrl}
        onAddDoc={handleAddDoc}
        onDeleteDoc={handleDeleteDoc}
        onEditDoc={handleEditDoc}
        showToast={showToast}
      />
      <Toast message={toastMsg} visible={toastVisible} />
    </>
  );
}
