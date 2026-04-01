"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CaseCard, CaseType, TabId, Label, LabelColor, DocAttachment, Debtor } from "@/lib/types";
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
import GuidePage from "@/components/GuidePage";
import DebtorPage from "@/components/DebtorPage";
import Toast from "@/components/Toast";

const LS_RECV   = "wls_recv_v1";
const LS_DISP   = "wls_disp_v1";
const LS_LABELS = "wls_labels_v1";
const LS_DEBTORS = "wls_debtors_v1";

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [recvData, setRecvData] = useState<CaseCard[]>(() => loadLS(LS_RECV, initialRecvData));
  const [dispData, setDispData] = useState<CaseCard[]>(() => loadLS(LS_DISP, initialDispData));
  const [allLabels, setAllLabels] = useState<Label[]>(() => loadLS(LS_LABELS, DEFAULT_LABELS));
  const [debtors, setDebtors] = useState<Debtor[]>(() => loadLS(LS_DEBTORS, []));
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCard, setDetailCard] = useState<CaseCard | null>(null);
  const [detailType, setDetailType] = useState<CaseType | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // Auto-save to localStorage
  useEffect(() => { localStorage.setItem(LS_RECV, JSON.stringify(recvData)); }, [recvData]);
  useEffect(() => { localStorage.setItem(LS_DISP, JSON.stringify(dispData)); }, [dispData]);
  useEffect(() => { localStorage.setItem(LS_LABELS, JSON.stringify(allLabels)); }, [allLabels]);
  useEffect(() => { localStorage.setItem(LS_DEBTORS, JSON.stringify(debtors)); }, [debtors]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  // Active counts (excluding closed cases)
  const recvActive = recvData.filter((c) => c.col !== "추심종료").length;
  const dispActive = dispData.filter((c) => c.col !== "종결").length;

  function navigate(tab: string) { setActiveTab(tab as TabId); }

  function openDetail(ty: CaseType, id: string) {
    const cards = ty === "recv" ? recvData : dispData;
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setDetailCard({ ...card });
    setDetailType(ty);
    setDetailOpen(true);
  }

  function updateCard(ty: CaseType, id: string, updater: (c: CaseCard) => CaseCard) {
    const setter = ty === "recv" ? setRecvData : setDispData;
    setter((prev) => {
      const next = prev.map((c) => (c.id === id ? updater({ ...c }) : c));
      const updated = next.find((c) => c.id === id);
      if (updated && detailCard?.id === id) setDetailCard({ ...updated });
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
    const fmtDate = new Date(dt).toLocaleDateString("ko-KR", { year: "numeric", month: "numeric", day: "numeric" });
    updateCard(detailType, detailCard.id, (c) => ({
      ...c, tl: [...c.tl, { dt: fmtDate, ti, dc, dn: false }], lu: getTodayISO(),
    }));
    showToast("기록이 추가됐어요.");
  }

  function handleEditTimeline(index: number, dt: string, ti: string, dc: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c, tl: c.tl.map((t, i) => i === index ? { ...t, dt, ti, dc } : t), lu: getTodayISO(),
    }));
    showToast("타임라인이 수정됐어요.");
  }

  function handleDeleteTimeline(index: number) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c, tl: c.tl.filter((_, i) => i !== index), lu: getTodayISO(),
    }));
    showToast("타임라인이 삭제됐어요.");
  }

  function handleAddFollowUp(dt: string, ti: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, fu: [...c.fu, { dt, ti, dn: false }] }));
    showToast("팔로업이 추가됐어요.");
  }

  function handleEditFollowUp(index: number, dt: string, ti: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c, fu: c.fu.map((f, i) => i === index ? { ...f, dt, ti } : f),
    }));
    showToast("팔로업이 수정됐어요.");
  }

  function handleDeleteFollowUp(index: number) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, fu: c.fu.filter((_, i) => i !== index) }));
    showToast("팔로업이 삭제됐어요.");
  }

  function handleToggleFollowUp(index: number) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({
      ...c, fu: c.fu.map((f, i) => i === index ? { ...f, dn: !f.dn } : f),
    }));
  }

  function handleSaveAmount(orig: number, paid: number, extra: number) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, amt: { orig, paid, extra } }));
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
    updateCard(detailType, detailCard.id, (c) => ({ ...c, solDt: dt || undefined }));
  }

  function handleSaveProjUrl(url: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, projUrl: url || undefined }));
  }

  function handleSaveDriveUrl(url: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, drv: url }));
    showToast("드라이브 링크가 저장됐어요.");
  }

  function handleSaveDebtorInfo(info: CaseCard["debtorInfo"], debtorId?: string) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, debtorInfo: info, debtorId }));
    showToast("채무자 정보가 저장됐어요.");
  }

  function handleAddDoc(doc: DocAttachment) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, docs: [...(c.docs || []), doc] }));
    showToast("문서가 추가됐어요.");
  }

  function handleEditDoc(index: number, doc: DocAttachment) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, docs: (c.docs || []).map((d, i) => i === index ? doc : d) }));
    showToast("문서가 수정됐어요.");
  }

  function handleDeleteDoc(index: number) {
    if (!detailCard || !detailType) return;
    updateCard(detailType, detailCard.id, (c) => ({ ...c, docs: (c.docs || []).filter((_, i) => i !== index) }));
    showToast("문서가 삭제됐어요.");
  }

  /* ── Label management ── */
  const labelIdCounter = useRef(Date.now());

  function handleToggleLabel(ty: CaseType, cardId: string, labelId: string) {
    updateCard(ty, cardId, (c) => ({
      ...c,
      labels: c.labels.includes(labelId) ? c.labels.filter((id) => id !== labelId) : [...c.labels, labelId],
    }));
  }

  function handleCreateLabel(name: string, color: LabelColor) {
    const id = `lb${labelIdCounter.current++}`;
    setAllLabels((prev) => [...prev, { id, name, color }]);
    showToast(`"${name}" 라벨이 생성됐어요.`);
  }

  function handleDeleteLabel(labelId: string) {
    const label = allLabels.find((lb) => lb.id === labelId);
    setAllLabels((prev) => prev.filter((lb) => lb.id !== labelId));
    setRecvData((prev) => prev.map((c) => ({ ...c, labels: c.labels.filter((id) => id !== labelId) })));
    setDispData((prev) => prev.map((c) => ({ ...c, labels: c.labels.filter((id) => id !== labelId) })));
    if (label) showToast(`"${label.name}" 라벨이 삭제됐어요.`);
  }

  /* ── Add card ── */
  const nextIdCounter = useRef(Date.now());

  function handleAddRecvCard(col: string) {
    const id = `r${nextIdCounter.current++}`;
    const newCard: CaseCard = {
      id, name: "새 미수채권", sub: "", col,
      labels: ["lb17"], drv: "https://drive.google.com",
      lu: getTodayISO(), amt: { orig: 0, paid: 0, extra: 0 }, tl: [], fu: [],
    };
    setRecvData((prev) => [...prev, newCard]);
    showToast("새 미수채권 케이스가 추가됐어요.");
    setTimeout(() => openDetail("recv", id), 50);
  }

  function handleAddDispCard(col: string) {
    const id = `d${nextIdCounter.current++}`;
    const newCard: CaseCard = {
      id, name: "새 분쟁", sub: "", col,
      labels: ["lb17"], drv: "https://drive.google.com",
      lu: getTodayISO(), tl: [], fu: [],
    };
    setDispData((prev) => [...prev, newCard]);
    showToast("새 분쟁 케이스가 추가됐어요.");
    setTimeout(() => openDetail("disp", id), 50);
  }

  return (
    <>
      <Header recvData={recvData} dispData={dispData} onOpenDetail={openDetail} onNavigate={navigate} />
      <Navigation activeTab={activeTab} onNavigate={setActiveTab} recvCount={recvActive} dispCount={dispActive} />
      <main style={{ padding: "28px 32px" }}>
        {activeTab === "home" && (
          <HomePage recvData={recvData} dispData={dispData} onNavigate={navigate} onOpenDetail={openDetail} />
        )}
        {activeTab === "doc" && <DocumentPage />}
        {activeTab === "recv" && (
          <KanbanBoard
            cards={recvData} columns={RECV_COLS} type="recv" title="⚔️ 미수채권"
            allLabels={allLabels} onMoveCard={handleMoveRecv}
            onOpenDetail={(id) => openDetail("recv", id)} onAddCard={handleAddRecvCard}
            onToggleLabel={(cardId, labelId) => handleToggleLabel("recv", cardId, labelId)}
            onCreateLabel={handleCreateLabel} onDeleteLabel={handleDeleteLabel}
            debtors={debtors}
          />
        )}
        {activeTab === "disp" && (
          <KanbanBoard
            cards={dispData} columns={DISP_COLS} type="disp" title="🥊 분쟁"
            allLabels={allLabels} onMoveCard={handleMoveDisp}
            onOpenDetail={(id) => openDetail("disp", id)} onAddCard={handleAddDispCard}
            onToggleLabel={(cardId, labelId) => handleToggleLabel("disp", cardId, labelId)}
            onCreateLabel={handleCreateLabel} onDeleteLabel={handleDeleteLabel}
            debtors={debtors}
          />
        )}
        {activeTab === "stats" && (
          <StatsPage recvData={recvData} dispData={dispData} allLabels={allLabels} onOpenDetail={openDetail} />
        )}
        {activeTab === "guide" && <GuidePage />}
        {activeTab === "debtors" && (
          <DebtorPage onDebtorsChange={setDebtors} />
        )}
      </main>
      <DetailPanel
        card={detailCard} type={detailType}
        columns={detailType === "recv" ? RECV_COLS : DISP_COLS}
        open={detailOpen} onClose={() => setDetailOpen(false)}
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
        onSaveDebtorInfo={handleSaveDebtorInfo}
        onAddDoc={handleAddDoc}
        onEditDoc={handleEditDoc}
        onDeleteDoc={handleDeleteDoc}
        showToast={showToast}
        debtors={debtors}
        onNavigateToDebtors={() => { setDetailOpen(false); setActiveTab("debtors"); }}
      />
      <Toast message={toastMsg} visible={toastVisible} />
    </>
  );
}
