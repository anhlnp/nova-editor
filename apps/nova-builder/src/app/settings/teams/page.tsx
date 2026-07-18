"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UI_VARS as C } from "@/lib/uiTheme";


type Team = { id: string; name: string; owner_id: string; plan: string; seats: number; myRole: string };
type Member = { id: string; email: string; role: string; status: string };
type Billing = { plan: string; seats: number; usedSeats: number; seatPrice: number; monthlyTotal: number; billingCycle: string };

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState("");

  const loadTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teams");
      const json = await res.json() as { teams: Team[] };
      setTeams(json.teams);
      if (json.teams.length && !activeTeam) setActiveTeam(json.teams[0]);
    } finally { setLoading(false); }
  }, [activeTeam]);

  useEffect(() => { loadTeams(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTeamDetail = useCallback(async (teamId: string) => {
    const [mRes, bRes] = await Promise.all([
      fetch(`/api/teams/${teamId}/members`),
      fetch(`/api/teams/${teamId}/billing`),
    ]);
    setMembers((await mRes.json()).members ?? []);
    setBilling(await bRes.json());
  }, []);

  useEffect(() => { if (activeTeam) loadTeamDetail(activeTeam.id); }, [activeTeam, loadTeamDetail]);

  const createTeam = async () => {
    if (!newTeamName.trim()) return;
    const res = await fetch("/api/teams", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName }),
    });
    const json = await res.json();
    if (res.ok) { setNewTeamName(""); await loadTeams(); setActiveTeam({ ...json.team, myRole: "owner" }); }
  };

  const invite = async () => {
    if (!activeTeam || !inviteEmail.trim()) return;
    setError("");
    const res = await fetch(`/api/teams/${activeTeam.id}/members`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Failed"); return; }
    setInviteEmail("");
    loadTeamDetail(activeTeam.id);
  };

  const removeMember = async (memberId: string) => {
    if (!activeTeam) return;
    await fetch(`/api/teams/${activeTeam.id}/members`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    loadTeamDetail(activeTeam.id);
  };

  const changeSeats = async (delta: number) => {
    if (!activeTeam || !billing) return;
    const seats = Math.max(billing.usedSeats, billing.seats + delta);
    const res = await fetch(`/api/teams/${activeTeam.id}/billing`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seats, plan: billing.plan === "free" ? "team" : billing.plan }),
    });
    if (res.ok) loadTeamDetail(activeTeam.id);
  };

  const isOwnerOrAdmin = activeTeam && (activeTeam.myRole === "owner" || activeTeam.myRole === "admin");

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.push("/projects")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>←</button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Team Workspaces</h1>
        </div>

        {loading && <div style={{ color: C.textMuted, fontSize: 13 }}>Loading…</div>}

        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
            {/* Team list */}
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {teams.map((t) => (
                  <button key={t.id} onClick={() => setActiveTeam(t)}
                    style={{
                      textAlign: "left", padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                      border: `1px solid ${activeTeam?.id === t.id ? "rgba(124,58,237,0.5)" : C.border}`,
                      background: activeTeam?.id === t.id ? "rgba(124,58,237,0.1)" : C.card,
                      color: C.text, fontSize: 12, fontWeight: 600, fontFamily: C.font,
                    }}>
                    {t.name}
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, fontWeight: 400 }}>{t.myRole} · {t.plan}</div>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="New team"
                  onKeyDown={(e) => { if (e.key === "Enter") createTeam(); }}
                  style={{ flex: 1, padding: "6px 8px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, fontFamily: C.font, outline: "none" }} />
                <button onClick={createTeam} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "rgba(124,58,237,0.8)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+</button>
              </div>
            </div>

            {/* Team detail */}
            <div>
              {!activeTeam ? (
                <div style={{ color: C.textMuted, fontSize: 13, padding: "40px 0", textAlign: "center" }}>
                  Create a team to invite collaborators and share projects.
                </div>
              ) : (
                <>
                  {/* Billing / seats */}
                  {billing && (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em" }}>SEATS & BILLING</div>
                        <span style={{ fontSize: 12, color: "#c4b5fd", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 20, padding: "2px 10px", textTransform: "capitalize" }}>{billing.plan}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{billing.usedSeats}/{billing.seats}</div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>seats used</div>
                        </div>
                        {isOwnerOrAdmin && (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button onClick={() => changeSeats(-1)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 14 }}>−</button>
                            <button onClick={() => changeSeats(1)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 14 }}>+</button>
                          </div>
                        )}
                        <div style={{ flex: 1 }} />
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>${billing.monthlyTotal}/mo</div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>${billing.seatPrice}/seat · {billing.billingCycle}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Members */}
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em" }}>MEMBERS</div>
                    {members.map((m) => (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: C.text }}>{m.email}</div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>{m.role} · {m.status}</div>
                        </div>
                        {m.role !== "owner" && isOwnerOrAdmin && (
                          <button onClick={() => removeMember(m.id)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 15 }}>×</button>
                        )}
                      </div>
                    ))}
                    {isOwnerOrAdmin && (
                      <div style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
                        <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="teammate@email.com"
                          onKeyDown={(e) => { if (e.key === "Enter") invite(); }}
                          style={{ flex: 1, padding: "7px 10px", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12, fontFamily: C.font, outline: "none" }} />
                        <button onClick={invite} style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: "rgba(124,58,237,0.8)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Invite</button>
                      </div>
                    )}
                    {error && <div style={{ padding: "0 16px 12px", color: C.danger, fontSize: 13 }}>{error}</div>}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
