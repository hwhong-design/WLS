"use client";

import { useState, useEffect, useRef } from "react";
import { Debtor } from "@/lib/types";

const DB_KEY = "wls_debtor_db_v1";

function loadDB(): Debtor[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(DB_KEY) || "[]"); } catch { return []; }
}
function saveDB(list: Debtor[]) {
  localStorage.setItem(DB_KEY, JSON.stringify(list));
}
function genId() {
  return "db_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

function maskBiz(v: string) {
  const n = v.replace(/[^0-9]/g, "");
  if (n.length <= 3) return n;
  if (n.length <= 5) return n.slice(0, 3) + "-" + n.slice(3);
  return n.slice(0, 3) + "-" + n.slice(3, 5) + "-" + n.slice(5, 10);
}
function maskRrn(v: string) {
  const n = v.replace(/[^0-9]/g, "");
  if (n.length <= 6) return n;
  return n.slice(0, 6) + "-" + n.slice(6, 13);
}

interface DebtorDBProps {
  onDebtorListChange?: (list: Debtor[]) => void;
}

export default function DebtorDB({ onDebtorListChange }: DebtorDBProps) {
  const [list, setList] = useState<Debtor[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [fType, setFType] = useState<"corp" | "ind">("corp");
  const [fName, setFName] = useState("");
  const [fCeo, setFCeo] = useState("");
  const [fBizNo, setFBizNo] = useState("");
  const [fRrn, setFRrn] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fCaseNo, setFCaseNo] = useState("");
  const [fAmount, setFAmount] = useState("");
  const [fMemo, setFMemo] = useState("");

  useEffect(() => {
    const loaded = loadDB();
    setList(loaded);
    onDebtorListChange?.(loaded);
  }, []);

  function refreshList() {
    const loaded = loadDB();
    setList(loaded);
    onDebtorListChange?.(loaded);
  }

  function openAdd() {
    setEditId(null);
    setFType("corp"); setFName(""); setFCeo(""); setFBizNo("");
    setFRrn(""); setFPhone(""); setFAddress(""); setFCaseNo("");
    setFAmount(""); setFMemo("");
    setModalOpen(true);
  }

  function openEdit(d: Debtor) {
    setEditId(d.id);
    setFType(d.type); setFName(d.name); setFCeo(d.ceo || "");
    setFBizNo(d.biz_no || ""); setFRrn(d.rrn || ""); setFPhone(d.phone || "");
    setFAddress(d.address || ""); setFCaseNo(d.case_no || "");
    setFAmount(d.amount ? Number(d.amount).toLocaleString() : ""); setFMemo(d.memo || "");
    setModalOpen(true);
  }

  function handleSave() {
    if (!fName.trim()) { alert("채무자명은 필수입니다."); return; }
    const all = loadDB();
    const entry: Debtor = {
      id: editId || genId(),
      type: fType,
      name: fName.trim(),
      ceo: fCeo.trim() || undefined,
      biz_no: fBizNo.trim() || undefined,
      rrn: fRrn.trim() || undefined,
      phone: fPhone.trim() || undefined,
      address: fAddress.trim() || undefined,
      case_no: fCaseNo.trim() || undefined,
      amount: fAmount.replace(/[^0-9]/g, "") || undefined,
      memo: fMemo.trim() || undefined,
      updated: new Date().toISOString().slice(0, 10),
    };
    const idx = all.findIndex((x) => x.id === entry.id);
    if (idx >= 0) all[idx] = entry; else all.unshift(entry);
    saveDB(all);
    setModalOpen(false);
    refreshList();
  }

  function handleDelete(id: string) {
    const d = loadDB().find((x) => x.id === id);
    if (!d) return;
    if (!confirm(`「${d.name}」을 삭제하시겠습니까?`)) return;
    saveDB(loadDB().filter((x) => x.id !== id));
    refreshList();
  }

  const filtered = list.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (d.name || "").toLowerCase().includes(q) ||
      (d.biz_no || "").includes(q) ||
      (d.rrn || "").includes(q) ||
      (d.case_no || "").toLowerCase().includes(q) ||
      (d.ceo || "").toLowerCase().includes(q)
    );
  });

  const inp = (style?: React.CSSProperties): React.CSSProperties => ({
    width: "100%",
    padding: "8px 10px",
    border: "1px solid var(--bd)",
    borderRadius: "var(--r3)",
    fontSize: 12,
    fontFamily: "'Noto Sans KR', sans-serif",
    background: "var(--sf)",
    color: "var(--tx)",
    outline: "none",
    ...style,
  });

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <div className="font-bold" style={{ fontSize: 18, letterSpacing: -0.3 }}>
          👥 채무자 정보
        </div>
        <button
          style={{
            background: "var(--gn)", color: "#fff", border: "none",
            borderRadius: "var(--r3)", padding: "8px 16px", fontSize: 12,
            fontWeight: 600, cursor: "pointer",
          }}
          onClick={openAdd}
        >
          + 채무자 등록
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="이름, 사업자번호, 사건번호 검색..."
          style={{ ...inp(), flex: 1 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ fontSize: 11, color: "var(--tx3)", display: "flex", alignItems: "center" }}>
          총 {list.length}명
        </div>
      </div>

      {/* Hint */}
      <div style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 16, padding: "8px 12px", background: "var(--gl)", borderRadius: "var(--r3)", border: "1px solid var(--gn2)" }}>
        💡 채무자명 입력란에서 이름을 타이핑하면 자동완성이 됩니다.
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--sf)", border: "1px solid var(--bd)",
          borderRadius: "var(--r)", overflow: "hidden", boxShadow: "var(--sh0)",
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: "60px 1fr 80px 140px 1fr 110px 120px 100px",
            padding: "10px 16px",
            borderBottom: "1px solid var(--bd)",
            background: "var(--bg)",
            fontSize: 10,
            fontWeight: 700,
            color: "var(--tx3)",
            letterSpacing: 0.5,
          }}
        >
          {["유형", "채무자명/상호", "대표자", "등록번호", "주소", "사건번호", "채권금액", "관리"].map((h) => (
            <div key={h}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8" style={{ fontSize: 12, color: "var(--tx3)" }}>
            {search ? "검색 결과가 없습니다." : "등록된 채무자가 없습니다. + 채무자 등록 버튼을 눌러 추가하세요."}
          </div>
        ) : (
          filtered.map((d) => (
            <div
              key={d.id}
              className="grid items-center hover:bg-[var(--bg)] transition-colors"
              style={{
                gridTemplateColumns: "60px 1fr 80px 140px 1fr 110px 120px 100px",
                padding: "12px 16px",
                borderBottom: "1px solid var(--bd)",
                fontSize: 12,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 10,
                    background: d.type === "corp" ? "var(--bll)" : "var(--gl)",
                    color: d.type === "corp" ? "var(--bl)" : "var(--gn)",
                  }}
                >
                  {d.type === "corp" ? "법인" : "개인"}
                </span>
              </div>
              <div className="font-semibold">{d.name}</div>
              <div style={{ color: "var(--tx2)" }}>{d.ceo || "—"}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--tx2)" }}>
                {d.biz_no || d.rrn || "—"}
              </div>
              <div style={{ color: "var(--tx3)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {d.address || "—"}
              </div>
              <div style={{ color: "var(--tx2)", fontSize: 11 }}>{d.case_no || "—"}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, textAlign: "right", color: "var(--tx2)" }}>
                {d.amount ? `${Number(d.amount).toLocaleString()}원` : "—"}
              </div>
              <div className="flex items-center gap-1">
                <button
                  title="수정"
                  onClick={() => openEdit(d)}
                  style={{
                    background: "var(--sf2)", border: "1px solid var(--bd)", borderRadius: 4,
                    width: 26, height: 26, cursor: "pointer", fontSize: 12,
                  }}
                >✏️</button>
                <button
                  title="삭제"
                  onClick={() => handleDelete(d.id)}
                  style={{
                    background: "var(--rl)", border: "1px solid var(--rd)", borderRadius: 4,
                    width: 26, height: 26, cursor: "pointer", fontSize: 12,
                  }}
                >🗑</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            style={{
              background: "var(--sf)", borderRadius: "var(--r)", padding: 32,
              width: 560, maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,.2)",
            }}
          >
            <div className="font-bold mb-6" style={{ fontSize: 16 }}>
              {editId ? "✏️ 채무자 수정" : "➕ 채무자 등록"}
            </div>

            {/* Type */}
            <div className="flex gap-3 mb-4">
              {(["corp", "ind"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFType(t)}
                  style={{
                    flex: 1, padding: "8px 0", border: `2px solid ${fType === t ? "var(--gn)" : "var(--bd)"}`,
                    borderRadius: "var(--r3)", background: fType === t ? "var(--gl)" : "var(--sf)",
                    color: fType === t ? "var(--gn)" : "var(--tx3)", fontWeight: 600, fontSize: 12, cursor: "pointer",
                  }}
                >
                  {t === "corp" ? "법인" : "개인"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tx3)", display: "block", marginBottom: 4 }}>
                  채무자 상호/성명 <span style={{ color: "var(--rd)" }}>*</span>
                </label>
                <input style={inp()} value={fName} onChange={(e) => setFName(e.target.value)} placeholder="(주)회사명 또는 홍길동" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tx3)", display: "block", marginBottom: 4 }}>대표자</label>
                <input style={inp()} value={fCeo} onChange={(e) => setFCeo(e.target.value)} placeholder="홍길동" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tx3)", display: "block", marginBottom: 4 }}>사업자등록번호</label>
                <input style={inp()} value={fBizNo} onChange={(e) => setFBizNo(maskBiz(e.target.value))} placeholder="000-00-00000" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tx3)", display: "block", marginBottom: 4 }}>주민등록번호</label>
                <input style={inp()} value={fRrn} onChange={(e) => setFRrn(maskRrn(e.target.value))} placeholder="000000-0000000" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tx3)", display: "block", marginBottom: 4 }}>연락처</label>
                <input style={inp()} value={fPhone} onChange={(e) => setFPhone(e.target.value)} placeholder="010-0000-0000" />
              </div>
              <div className="col-span-2">
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tx3)", display: "block", marginBottom: 4 }}>주소</label>
                <input style={inp()} value={fAddress} onChange={(e) => setFAddress(e.target.value)} placeholder="서울특별시 강남구 ..." />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tx3)", display: "block", marginBottom: 4 }}>사건번호</label>
                <input style={inp()} value={fCaseNo} onChange={(e) => setFCaseNo(e.target.value)} placeholder="2024가소000000" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tx3)", display: "block", marginBottom: 4 }}>채권금액 (원)</label>
                <input
                  style={inp()}
                  value={fAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setFAmount(raw ? Number(raw).toLocaleString() : "");
                  }}
                  placeholder="0"
                />
              </div>
              <div className="col-span-2">
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--tx3)", display: "block", marginBottom: 4 }}>메모</label>
                <input style={inp()} value={fMemo} onChange={(e) => setFMemo(e.target.value)} placeholder="특이사항, 담당자 등" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                style={{
                  flex: 1, padding: "10px 0", background: "var(--gn)", color: "#fff",
                  border: "none", borderRadius: "var(--r3)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
                onClick={handleSave}
              >저장</button>
              <button
                style={{
                  padding: "10px 20px", background: "var(--sf2)", color: "var(--tx2)",
                  border: "1px solid var(--bd)", borderRadius: "var(--r3)", fontSize: 13, cursor: "pointer",
                }}
                onClick={() => setModalOpen(false)}
              >취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Export hook for autocomplete */
export function useDebtorList(): Debtor[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(DB_KEY) || "[]"); } catch { return []; }
}

export { loadDB as loadDebtorDB, DB_KEY as DEBTOR_DB_KEY };
