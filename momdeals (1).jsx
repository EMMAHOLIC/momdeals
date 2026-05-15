import { useState, useRef, useEffect } from "react";

const COLORS = {
  primary: "#C8472B",
  primaryLight: "#F5EAE7",
  primaryMid: "#E8937A",
  green: "#2D6A4F",
  greenLight: "#D8F0E8",
  blue: "#1A5276",
  blueLight: "#D6EAF8",
  amber: "#7D4E00",
  amberLight: "#FDF3DC",
  purple: "#4A3580",
  purpleLight: "#EDE9F8",
  text: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E8E2DC",
  bg: "#FAF8F5",
  white: "#FFFFFF",
};

const EVENTS = [
  { id: "halloween", icon: "👻", name: "Halloween", date: "Oct 31", color: COLORS.amber, colorLight: COLORS.amberLight, items: ["코스튬", "캔디 바구니", "호박 장식", "야광 스틱"] },
  { id: "thanksgiving", icon: "🦃", name: "Thanksgiving", date: "Nov 27", color: COLORS.primary, colorLight: COLORS.primaryLight, items: ["요리 재료", "감사 카드", "테이블 데코"] },
  { id: "christmas", icon: "🎄", name: "Winter Break", date: "Dec 22", color: COLORS.green, colorLight: COLORS.greenLight, items: ["선물 포장", "크리스마스 카드", "트리 장식"] },
  { id: "valentines", icon: "💝", name: "Valentine's Day", date: "Feb 14", color: "#8B2252", colorLight: "#FDE8F0", items: ["카드 30장", "사탕 봉투", "스티커"] },
  { id: "stpatricks", icon: "🍀", name: "St. Patrick's Day", date: "Mar 17", color: COLORS.green, colorLight: COLORS.greenLight, items: ["초록 옷", "클로버 만들기 재료"] },
  { id: "earthday", icon: "🌍", name: "Earth Day", date: "Apr 22", color: COLORS.green, colorLight: COLORS.greenLight, items: ["재활용 프로젝트 재료", "씨앗/화분"] },
  { id: "backtoschool", icon: "🎒", name: "Back to School", date: "Aug", color: COLORS.blue, colorLight: COLORS.blueLight, items: ["가방", "필통", "공책 15권", "크레용"] },
  { id: "100thday", icon: "💯", name: "100th Day of School", date: "Feb", color: COLORS.purple, colorLight: COLORS.purpleLight, items: ["100개 컬렉션", "코스튬 아이디어"] },
];

const ACTIVITIES = ["수영", "발레", "미술", "태권도", "피아노", "축구", "코딩", "체조", "바이올린", "농구"];
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function MomDeals() {
  const [page, setPage] = useState("landing");
  const [lang, setLang] = useState("ko");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("7");
  const [selectedActs, setSelectedActs] = useState([]);
  const [schedules, setSchedules] = useState([{ day: "수", activity: "", time: "" }]);
  const [location, setLocation] = useState("Irvine, CA");
  const [radius, setRadius] = useState("3");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventAiResponse, setEventAiResponse] = useState("");
  const [eventLoading, setEventLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [checkedItems, setCheckedItems] = useState({});
  const aiRef = useRef(null);

  useEffect(() => {
    if (aiResponse && aiRef.current) {
      aiRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [aiResponse]);

  function toggleAct(a) {
    setSelectedActs(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  function addSchedule() {
    setSchedules(prev => [...prev, { day: "월", activity: "", time: "" }]);
  }

  function updateSchedule(i, field, val) {
    setSchedules(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  }

  async function getAIRecommendations() {
    setLoading(true);
    setAiResponse("");
    setPage("result");

    const schedText = schedules.filter(s => s.activity).map(s => `${s.day}요일 ${s.activity} ${s.time}`).join(", ") || "미입력";
    const actsText = selectedActs.length ? selectedActs.join(", ") : "미선택";

    const prompt = `당신은 미국 한인 엄마들을 위한 할인 정보 도우미입니다. 아래 정보를 바탕으로 맞춤 할인 추천을 해주세요.

아이 정보:
- 이름: ${childName || "아이"}
- 나이: ${childAge}살
- 관심 활동: ${actsText}
- 현재 스케줄: ${schedText}
- 위치: ${location} (반경 ${radius}mi)

다음 형식으로 답변해주세요 (이모지 적극 활용, 따뜻하고 친근한 말투):

1. **빈 시간 분석** (스케줄 보고 언제 시간이 비는지)
2. **맞춤 추천 딜 5개** (각 딜마다: 가게명, 할인내용, 왜 이 아이에게 맞는지 한 줄 이유)
3. **이번 주 장보기 팁** (H마트, 코스트코 등 한인 마트 관련 팁 2-3개)
4. **엄마 꿀팁** (이 지역 한인 커뮤니티에서 인기 있는 정보 1-2개)

짧고 실용적으로, 한국어로 답변해주세요.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "추천 정보를 불러오지 못했어요.";
      setAiResponse(text);
    } catch {
      setAiResponse("네트워크 오류가 발생했어요. 다시 시도해주세요.");
    }
    setLoading(false);
  }

  async function getEventInfo(event) {
    setSelectedEvent(event);
    setEventAiResponse("");
    setEventLoading(true);

    const prompt = `미국 한인 엄마 커뮤니티를 위한 도우미입니다. ${event.name} (${event.date}) 학교 행사 준비를 도와주세요.

위치: ${location || "미국 LA/OC 지역"}
아이 나이: ${childAge}살

다음을 포함해서 한국어로 답변해주세요:

1. **${event.name} 학교 준비물 리스트** (체크리스트 형식, 구체적으로)
2. **근처에서 살 수 있는 곳** (H마트, Target, Walmart, Costco 등 + 예상 가격)
3. **절약 팁** (어떻게 하면 더 싸게 준비할 수 있는지)
4. **한인 엄마 꿀팁** (현지 커뮤니티에서 공유되는 실용적인 팁)

따뜻하고 친근한 말투로, 이모지 사용해서 답변해주세요!`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "정보를 불러오지 못했어요.";
      setEventAiResponse(text);
    } catch {
      setEventAiResponse("오류가 발생했어요. 다시 시도해주세요.");
    }
    setEventLoading(false);
  }

  function toggleCheck(key) {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function formatAI(text) {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
      if (line.startsWith("**") && line.endsWith("**")) {
        return <div key={i} style={{ fontWeight: 600, fontSize: 15, color: COLORS.primary, margin: "14px 0 6px", borderLeft: `3px solid ${COLORS.primary}`, paddingLeft: 10 }}>{line.replace(/\*\*/g, "")}</div>;
      }
      if (line.match(/^\d+\.\s\*\*/)) {
        const cleaned = line.replace(/\*\*/g, "");
        return <div key={i} style={{ fontWeight: 600, fontSize: 15, color: COLORS.primary, margin: "14px 0 6px", borderLeft: `3px solid ${COLORS.primary}`, paddingLeft: 10 }}>{cleaned}</div>;
      }
      const cleaned = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
      return <div key={i} style={{ fontSize: 14, lineHeight: 1.75, color: COLORS.text, paddingLeft: line.startsWith("-") || line.startsWith("•") ? 8 : 0 }} dangerouslySetInnerHTML={{ __html: cleaned }} />;
    });
  }

  const styles = {
    page: { minHeight: "100vh", background: COLORS.bg, fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" },
    nav: { background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, padding: "0 32px", display: "flex", alignItems: "center", height: 56, position: "sticky", top: 0, zIndex: 100 },
    logoBox: { width: 28, height: 28, background: COLORS.primary, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, fontSize: 16 },
    logoText: { fontSize: 17, fontWeight: 700, color: COLORS.text, marginRight: "auto" },
    navBtn: { fontSize: 13, padding: "6px 14px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textMuted, cursor: "pointer", marginLeft: 8 },
    primaryBtn: { fontSize: 13, padding: "6px 16px", borderRadius: 8, border: "none", background: COLORS.primary, color: "#fff", cursor: "pointer", fontWeight: 600, marginLeft: 8 },
    card: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 14 },
    input: { width: "100%", fontSize: 14, padding: "9px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.white, color: COLORS.text, outline: "none" },
    chip: (sel) => ({ fontSize: 12, padding: "5px 12px", borderRadius: 99, border: `1px solid ${sel ? COLORS.primary : COLORS.border}`, background: sel ? COLORS.primaryLight : COLORS.white, color: sel ? COLORS.primary : COLORS.textMuted, cursor: "pointer", fontWeight: sel ? 600 : 400, transition: "all 0.15s" }),
    bigBtn: { width: "100%", padding: "13px", fontSize: 15, fontWeight: 700, background: COLORS.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", marginTop: 8, letterSpacing: 0.3 },
    label: { fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 7, display: "block", letterSpacing: 0.3, textTransform: "uppercase" },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 12 },
    tabBtn: (active) => ({ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: active ? 700 : 400, color: active ? COLORS.primary : COLORS.textMuted, background: "none", border: "none", borderBottom: `2px solid ${active ? COLORS.primary : "transparent"}`, cursor: "pointer", transition: "all 0.15s" }),
  };

  if (page === "landing") return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logoBox}>🏷️</div>
        <span style={styles.logoText}>MomDeals</span>
        <select value={lang} onChange={e => setLang(e.target.value)} style={{ ...styles.navBtn, cursor: "pointer" }}>
          <option value="ko">🇰🇷 한국어</option>
          <option value="en">🇺🇸 English</option>
          <option value="es">🇲🇽 Español</option>
        </select>
        <button style={styles.navBtn} onClick={() => setPage("onboarding")}>로그인</button>
        <button style={styles.primaryBtn} onClick={() => setPage("onboarding")}>무료 시작</button>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: COLORS.primaryLight, color: COLORS.primary, fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 99, marginBottom: 20, letterSpacing: 0.5 }}>
          🇺🇸 LA · OC · 한인 엄마 커뮤니티
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, lineHeight: 1.25, marginBottom: 14 }}>
          아이 스케줄에 맞는<br />
          <span style={{ color: COLORS.primary }}>주변 할인</span>을 AI가 찾아드려요
        </h1>
        <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.8, marginBottom: 32 }}>
          수영, 미술, 학원 스케줄을 입력하면<br />
          빈 시간에 갈 수 있는 근처 딜을 Claude AI가 실시간 추천해요
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 48 }}>
          <button style={{ ...styles.bigBtn, width: "auto", padding: "12px 28px" }} onClick={() => setPage("onboarding")}>지금 시작하기 →</button>
          <button style={{ ...styles.navBtn, padding: "12px 20px", fontSize: 14 }} onClick={() => setPage("onboarding")}>둘러보기</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { icon: "🤖", title: "AI 맞춤 추천", desc: "Claude AI가 아이 정보 분석해서 딱 맞는 딜 추천" },
            { icon: "📍", title: "위치 기반", desc: "내 동네 반경 내 할인 정보만 쏙쏙" },
            { icon: "🎒", title: "학교 캘린더", desc: "Halloween·Earth Day 준비물 자동 알림" },
          ].map(f => (
            <div key={f.title} style={{ ...styles.card, textAlign: "left", marginBottom: 0 }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (page === "onboarding") return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logoBox}>🏷️</div>
        <span style={styles.logoText}>MomDeals</span>
        <button style={styles.navBtn} onClick={() => setPage("landing")}>← 뒤로</button>
      </nav>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ background: COLORS.primaryLight, borderRadius: 10, padding: "10px 14px", marginBottom: 24, fontSize: 13, color: COLORS.primary, fontWeight: 600 }}>
          🤖 정보를 입력하면 Claude AI가 실시간으로 맞춤 할인을 추천해드려요!
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>📍 내 위치</div>
          <label style={styles.label}>도시 / 지역</label>
          <input style={styles.input} value={location} onChange={e => setLocation(e.target.value)} placeholder="예: Irvine, CA" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <div>
              <label style={{ ...styles.label, marginTop: 0 }}>검색 반경</label>
              <select style={styles.input} value={radius} onChange={e => setRadius(e.target.value)}>
                <option value="1">1 mile</option>
                <option value="3">3 miles</option>
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
              </select>
            </div>
            <div>
              <label style={{ ...styles.label, marginTop: 0 }}>언어</label>
              <select style={styles.input} value={lang} onChange={e => setLang(e.target.value)}>
                <option value="ko">🇰🇷 한국어</option>
                <option value="en">🇺🇸 English</option>
                <option value="es">🇲🇽 Español</option>
                <option value="zh">🇨🇳 中文</option>
              </select>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>👧 아이 정보</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={styles.label}>이름</label>
              <input style={styles.input} value={childName} onChange={e => setChildName(e.target.value)} placeholder="예: 지아" />
            </div>
            <div>
              <label style={styles.label}>나이</label>
              <select style={styles.input} value={childAge} onChange={e => setChildAge(e.target.value)}>
                {Array.from({ length: 13 }, (_, i) => i + 2).map(a => <option key={a} value={a}>{a}살</option>)}
              </select>
            </div>
          </div>
          <label style={styles.label}>관심 활동 (해당하는 것 선택)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ACTIVITIES.map(a => (
              <button key={a} style={styles.chip(selectedActs.includes(a))} onClick={() => toggleAct(a)}>{a}</button>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={styles.sectionTitle}>📅 주간 스케줄</div>
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>입력 안 해도 괜찮아요</span>
          </div>
          {schedules.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr 90px", gap: 8, marginBottom: 8 }}>
              <select style={styles.input} value={s.day} onChange={e => updateSchedule(i, "day", e.target.value)}>
                {DAYS.map(d => <option key={d} value={d}>{d}요일</option>)}
              </select>
              <input style={styles.input} value={s.activity} onChange={e => updateSchedule(i, "activity", e.target.value)} placeholder="활동명" />
              <input style={styles.input} value={s.time} onChange={e => updateSchedule(i, "time", e.target.value)} placeholder="시간" />
            </div>
          ))}
          <button onClick={addSchedule} style={{ fontSize: 13, color: COLORS.primary, background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2 }}>+ 스케줄 추가</button>
        </div>

        <button style={styles.bigBtn} onClick={getAIRecommendations}>
          🤖 AI 맞춤 할인 추천 받기
        </button>
      </div>
    </div>
  );

  if (page === "result") return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logoBox}>🏷️</div>
        <span style={styles.logoText}>MomDeals</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>📍 {location}</span>
          <button style={styles.navBtn} onClick={() => setPage("onboarding")}>← 정보 수정</button>
        </div>
      </nav>

      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.white, position: "sticky", top: 56, zIndex: 90 }}>
          {[["feed", "🏠 맞춤 피드"], ["calendar", "📅 학교 캘린더"]].map(([id, label]) => (
            <button key={id} style={styles.tabBtn(activeTab === id)} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </div>

        <div style={{ padding: "24px 24px" }}>
          {activeTab === "feed" && (
            <>
              <div style={{ ...styles.card, background: COLORS.purpleLight, border: `1px solid #C5BCE8` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.purple, marginBottom: 4 }}>
                  🤖 Claude AI 분석 완료 — {childName || "아이"} ({childAge}살) · {location} {radius}mi
                </div>
                <div style={{ fontSize: 12, color: COLORS.purple, opacity: 0.85 }}>
                  {selectedActs.length ? `관심: ${selectedActs.join(", ")}` : "관심 활동 미입력"} · {schedules.filter(s => s.activity).length ? `스케줄 ${schedules.filter(s => s.activity).length}개` : "스케줄 미입력 (기본 추천)"}
                </div>
              </div>

              <div ref={aiRef} style={styles.card}>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: COLORS.primaryLight, color: COLORS.primary, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>AI 추천</span>
                  맞춤 할인 분석 결과
                </div>
                {loading ? (
                  <div style={{ padding: "32px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>🤖</div>
                    <div style={{ fontSize: 14, color: COLORS.textMuted }}>Claude AI가 {childName || "아이"} 정보를 분석 중이에요...</div>
                    <div style={{ marginTop: 14, display: "flex", gap: 6, justifyContent: "center" }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`, opacity: 0.7 }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>{formatAI(aiResponse)}</div>
                )}
              </div>

              {!loading && (
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <button style={{ ...styles.bigBtn, marginTop: 0, flex: 1 }} onClick={getAIRecommendations}>🔄 다시 추천 받기</button>
                  <button style={{ ...styles.bigBtn, marginTop: 0, flex: 1, background: COLORS.green }} onClick={() => setPage("onboarding")}>✏️ 정보 수정</button>
                </div>
              )}
            </>
          )}

          {activeTab === "calendar" && (
            <>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
                🎒 스케줄 입력 없이도 미국 학교 주요 이벤트 준비물과 할인을 AI가 알려드려요. 이벤트를 클릭해보세요!
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 20 }}>
                {EVENTS.map(ev => (
                  <button key={ev.id} onClick={() => getEventInfo(ev)}
                    style={{ background: COLORS.white, border: `1px solid ${selectedEvent?.id === ev.id ? ev.color : COLORS.border}`, borderRadius: 12, padding: "14px 14px", textAlign: "left", cursor: "pointer", transition: "all 0.15s", transform: selectedEvent?.id === ev.id ? "scale(1.02)" : "scale(1)" }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{ev.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{ev.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{ev.date}</div>
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 3 }}>
                      {ev.items.slice(0, 2).map(item => (
                        <span key={item} style={{ fontSize: 10, background: ev.colorLight, color: ev.color, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>{item}</span>
                      ))}
                      {ev.items.length > 2 && <span style={{ fontSize: 10, color: COLORS.textMuted }}>+{ev.items.length - 2}개</span>}
                    </div>
                  </button>
                ))}
              </div>

              {selectedEvent && (
                <div style={styles.card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>{selectedEvent.icon}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{selectedEvent.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{selectedEvent.date} · {location}</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 11, background: COLORS.primaryLight, color: COLORS.primary, padding: "3px 10px", borderRadius: 99, fontWeight: 700 }}>AI 추천</div>
                  </div>
                  {eventLoading ? (
                    <div style={{ padding: "24px 0", textAlign: "center" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
                      <div style={{ fontSize: 13, color: COLORS.textMuted }}>{selectedEvent.name} 준비물 분석 중...</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 14 }}>{formatAI(eventAiResponse)}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>준비물 체크리스트</div>
                        {selectedEvent.items.map(item => (
                          <div key={item} onClick={() => toggleCheck(selectedEvent.id + item)}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: checkedItems[selectedEvent.id + item] ? COLORS.greenLight : COLORS.bg, marginBottom: 6, cursor: "pointer" }}>
                            <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checkedItems[selectedEvent.id + item] ? COLORS.green : COLORS.border}`, background: checkedItems[selectedEvent.id + item] ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {checkedItems[selectedEvent.id + item] && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 13, color: COLORS.text, textDecoration: checkedItems[selectedEvent.id + item] ? "line-through" : "none", opacity: checkedItems[selectedEvent.id + item] ? 0.5 : 1 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.3);opacity:1} }
      `}</style>
    </div>
  );

  return null;
}
