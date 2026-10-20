// ================================================================
// SMARTGYM — APP SCRIPT
// ================================================================

(function() {
    "use strict";

    // ─── VERIFICA SESSÃO ──────────────────────────────────────────

    function getLoginUrl() {
        const currentPath = window.location.pathname;
        console.log('🔍 App path:', currentPath);

        // Se está em /frontend/user/index.html
        if (currentPath.includes('/frontend/user/')) {
            return '/frontend/public/cliente.html';
        }

        // Se está em /user/index.html
        if (currentPath.includes('/user/')) {
            return '../public/cliente.html';
        }

        // Fallback
        return '../public/cliente.html';
    }

    function checkSession() {
        const session = sessionStorage.getItem("senseactive_user");
        if (!session) {
            const loginUrl = getLoginUrl();
            console.log('🔒 Sessão não encontrada, redirecionando para:', loginUrl);
            window.location.href = loginUrl;
            return false;
        }
        try {
            const data = JSON.parse(session);
            if (!data.loggedIn) {
                const loginUrl = getLoginUrl();
                console.log('🔒 Sessão inválida, redirecionando para:', loginUrl);
                window.location.href = loginUrl;
                return false;
            }
            console.log('✅ Sessão válida para:', data.email);
            return data;
        } catch (_) {
            const loginUrl = getLoginUrl();
            console.log('🔒 Erro na sessão, redirecionando para:', loginUrl);
            window.location.href = loginUrl;
            return false;
        }
    }

    const userData = checkSession();
    if (!userData) return;

    // ─── MOCK DATA ────────────────────────────────────────────────────

    const MOCK_USER = {
        id: 1,
        name: userData.name || "Lucas Almeida",
        email: userData.email || "lucas@email.com",
        avatar: (userData.name || "LA").substring(0, 2).toUpperCase(),
        height: 1.65,
        weight: 64,
        imc: 23.5,
        plan: "Premium",
        statusPlano: "ATIVO",
        planExpiry: "30/09/2026",
        birthDate: "14/03/2000",
    };

    const MOCK_CHECKINS = {
        "2026-08-04": { hora: "07:15", treino: "Treino A" },
        "2026-08-06": { hora: "18:42", treino: "Treino B" },
        "2026-08-07": { hora: "19:05", treino: "Treino C" },
        "2026-08-11": { hora: "07:30", treino: "Treino A" },
        "2026-08-13": { hora: "18:00", treino: "Treino B" },
        "2026-08-15": { hora: "08:15", treino: "Treino C" },
    };

    const MOCK_FREQUENCY = [
        { mes: "Mar", quantidade: 8 },
        { mes: "Abr", quantidade: 10 },
        { mes: "Mai", quantidade: 11 },
        { mes: "Jun", quantidade: 9 },
        { mes: "Jul", quantidade: 13 },
        { mes: "Ago", quantidade: 12 },
    ];

    const MOCK_WEIGHT_HISTORY = [
        { data: "Mar", peso: 68 },
        { data: "Abr", peso: 67 },
        { data: "Mai", peso: 66 },
        { data: "Jun", peso: 65.5 },
        { data: "Jul", peso: 64.8 },
        { data: "Ago", peso: 64 },
    ];

    const MOCK_WORKOUTS = [{
        id: "A",
        nome: "Treino A",
        descricao: "Peito + Tríceps",
        exercicios: [
            { nome: "FLY", series: 3, repeticoes: 12, carga: 30, obs: "", maquina: false },
            { nome: "SUPINO RETO", series: 4, repeticoes: 10, carga: 40, obs: "Controlado na descida", maquina: false },
            { nome: "CRUCIFIXO", series: 3, repeticoes: 12, carga: 14, obs: "", maquina: true },
            { nome: "TRÍCEPS PULLEY", series: 3, repeticoes: 15, carga: 20, obs: "", maquina: false },
            { nome: "TRÍCEPS TESTA", series: 3, repeticoes: 12, carga: 16, obs: "", maquina: false },
            { nome: "MERGULHO", series: 3, repeticoes: 10, carga: 0, obs: "Peso corporal", maquina: false },
        ],
    }, {
        id: "B",
        nome: "Treino B",
        descricao: "Costas + Bíceps",
        exercicios: [
            { nome: "PUXADA FRONTAL", series: 4, repeticoes: 10, carga: 45, obs: "", maquina: false },
            { nome: "REMADA CURVADA", series: 3, repeticoes: 12, carga: 35, obs: "", maquina: false },
            { nome: "REMADA MÁQUINA", series: 3, repeticoes: 12, carga: 40, obs: "", maquina: true },
            { nome: "ROSCA DIRETA", series: 3, repeticoes: 12, carga: 20, obs: "", maquina: false },
            { nome: "ROSCA MARTELO", series: 3, repeticoes: 12, carga: 16, obs: "", maquina: false },
        ],
    }, {
        id: "C",
        nome: "Treino C",
        descricao: "Pernas",
        exercicios: [
            { nome: "AGACHAMENTO", series: 4, repeticoes: 10, carga: 60, obs: "Profundo", maquina: false },
            { nome: "LEG PRESS", series: 4, repeticoes: 12, carga: 120, obs: "", maquina: true },
            { nome: "CADEIRA EXTENSORA", series: 3, repeticoes: 15, carga: 35, obs: "", maquina: true },
            { nome: "MESA FLEXORA", series: 3, repeticoes: 12, carga: 30, obs: "", maquina: true },
            { nome: "PANTURRILHA", series: 4, repeticoes: 20, carga: 50, obs: "", maquina: false },
            { nome: "STIFF", series: 3, repeticoes: 12, carga: 40, obs: "", maquina: false },
            { nome: "ABDUÇÃO DE QUADRIL", series: 3, repeticoes: 15, carga: 25, obs: "", maquina: true },
        ],
    }, ];

    const MOCK_GOALS = [{
        id: 1,
        nome: "Frequência Mensal",
        descricao: "Treinar 15 vezes este mês",
        progresso: 12,
        objetivo: 15,
        status: "em_progresso",
        recompensa: { tipo: "produto", nome: "Whey Protein 900g", icone: "🥤" },
    }, {
        id: 2,
        nome: "Sequência Semanal",
        descricao: "Treinar 4 vezes por semana por 4 semanas",
        progresso: 3,
        objetivo: 4,
        status: "em_progresso",
        recompensa: { tipo: "produto", nome: "Creatina 300g", icone: "💊" },
    }, {
        id: 3,
        nome: "Meta de Peso",
        descricao: "Atingir 62 kg com controle",
        progresso: 1,
        objetivo: 1,
        status: "concluida",
        recompensa: { tipo: "desconto", nome: "Desconto 10% mensalidade", icone: "🏷️" },
    }, ];

    // ─── STATE ────────────────────────────────────────────────────────

    let currentTab = "home";
    let selectedWorkout = null;
    let selectedCheckinDate = null;
    let selectedProfileTab = "perfil";

    // ─── DOM REFS ────────────────────────────────────────────────────

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    const mainContent = $("#mainContent");
    const bottomNav = $("#bottomNav");

    // ─── HELPERS ─────────────────────────────────────────────────────

    function render(html) {
        mainContent.innerHTML = html;
    }

    function setActiveNav(tab) {
        $$(".nav-item").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.tab === tab);
        });
    }

    // ─── LINE CHART ──────────────────────────────────────────────────

    function renderLineChart(data, label, color = "#00e5a0") {
        const W = 280,
            H = 90,
            pad = 24;
        const vals = data.map((d) => d.value);
        const min = Math.min(...vals) - 1;
        const max = Math.max(...vals) + 1;
        const xStep = (W - pad * 2) / (data.length - 1);
        const yScale = (v) => H - pad / 2 - ((v - min) / (max - min)) * (H - pad);
        const pts = data.map((d, i) => ({ x: pad + i * xStep, y: yScale(d.value) }));
        const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
        const areaD = `${pathD} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

        const labels = data.map((d, i) =>
            `<text x="${pad + i * xStep}" y="${H + 2}" text-anchor="middle" font-size="9" fill="#555" font-family="DM Sans">${d.label}</text>`
        ).join("");

        return `
        <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible;max-width:100%;">
            <defs>
                <linearGradient id="grad-${label}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${color}" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="${color}" stop-opacity="0" />
                </linearGradient>
            </defs>
            <path d="${areaD}" fill="url(#grad-${label})" />
            <path d="${pathD}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            ${pts.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${color}" stroke="#111" stroke-width="1.5" />`).join("")}
            ${labels}
        </svg>
        `;
    }

    // ─── PROGRESS BAR ────────────────────────────────────────────────

    function renderProgress(value, total) {
        const pct = Math.min(100, Math.round((value / total) * 100));
        return `
        <div class="progress-track">
            <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="progress-label">
            <span>${value} / ${total}</span>
            <span class="pct">${pct}%</span>
        </div>
        `;
    }

    // ─── SCREENS ─────────────────────────────────────────────────────

    function renderHome() {
        const today = new Date(2026, 7, 13);
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        });
        const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

        const todayWorkout = MOCK_WORKOUTS[1];
        const freqData = MOCK_FREQUENCY.map((f) => ({ label: f.mes, value: f.quantidade }));
        const weightData = MOCK_WEIGHT_HISTORY.map((w) => ({ label: w.data, value: w.peso }));

        const weekHtml = weekDays.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            const dateKey =
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            const hasCheckin = !!MOCK_CHECKINS[dateKey];
            return `
            <div class="week-day">
                <span class="day-label">${dayLabels[i]}</span>
                <div class="day-number ${isToday ? "today" : ""}">${d.getDate()}</div>
                <div class="day-dot ${hasCheckin ? "has-checkin" : ""}"></div>
            </div>
            `;
        }).join("");

        const exercisesHtml = todayWorkout.exercicios.slice(0, 3).map((ex) => `
            <div class="exercise-item">
                <div class="info">
                    <div class="name">${ex.nome}</div>
                    <div class="details">${ex.series} séries × ${ex.repeticoes} rep.</div>
                </div>
                <div class="weight">${ex.carga > 0 ? ex.carga : "—"} <span class="unit">${ex.carga > 0 ? "kg" : ""}</span></div>
            </div>
        `).join("");

        const freqChart = renderLineChart(freqData, "freq");
        const weightChart = renderLineChart(weightData, "weight", "#00c4ff");

        render(`
            <div class="page-content">
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;margin-bottom:4px;">
                    <div>
                        <p style="color:var(--text-muted);font-size:13px;margin-bottom:2px;">Bom dia,</p>
                        <h1 style="font-size:28px;margin:0;">${MOCK_USER.name.split(" ")[0]}!</h1>
                    </div>
                    <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--blue));display:flex;align-items:center;justify-content:center;font-family:var(--font-condensed);font-weight:800;font-size:16px;color:var(--bg-primary);">
                        ${MOCK_USER.avatar}
                    </div>
                </div>
                <p style="color:var(--text-dim);font-size:13px;margin-bottom:24px;">Pronto para treinar hoje?</p>

                <!-- Week -->
                <div class="card" style="padding:14px 10px;">
                    <div class="week-strip">${weekHtml}</div>
                </div>

                <!-- Today's Workout -->
                <div class="card">
                    <div class="section-label">Treino de Hoje</div>
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
                        <div>
                            <h3 style="font-size:22px;margin:0 0 2px;">${todayWorkout.nome}</h3>
                            <p style="color:var(--text-muted);font-size:13px;margin:0;">${todayWorkout.descricao}</p>
                        </div>
                        <span class="badge-green">HOJE</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
                        ${exercisesHtml}
                    </div>
                    <button class="btn-secondary" onclick="window.showWorkoutDetail('${todayWorkout.id}')" style="width:100%;background:none;border:1px solid var(--green);border-radius:var(--radius-sm);padding:12px;color:var(--green);font-size:13px;font-weight:700;letter-spacing:0.1em;font-family:var(--font-condensed);">
                        VER TREINO COMPLETO
                    </button>
                </div>

                <!-- Frequency -->
                <div class="card">
                    <div class="section-label">Minha Frequência</div>
                    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px;">
                        <div>
                            <h3 style="font-size:22px;margin:0 0 2px;">12 treinos</h3>
                            <p style="color:var(--text-muted);font-size:12px;margin:0;">este mês · meta: 15</p>
                        </div>
                        <span style="color:var(--green);font-family:var(--font-condensed);font-weight:700;font-size:18px;">80%</span>
                    </div>
                    ${renderProgress(12, 15)}
                    <div style="margin-top:16px;overflow-x:auto;">${freqChart}</div>
                </div>

                <!-- Evolution -->
                <div class="card">
                    <div class="section-label">Minha Evolução</div>
                    <div class="stat-grid-3" style="margin-bottom:16px;">
                        ${[
                            { label: "Peso atual", value: `${MOCK_USER.weight} kg` },
                            { label: "Altura", value: `${MOCK_USER.height} m` },
                            { label: "IMC", value: `${MOCK_USER.imc}` },
                        ].map(s => `
                            <div class="stat-box">
                                <div class="label">${s.label}</div>
                                <div class="value">${s.value}</div>
                            </div>
                        `).join("")}
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
                        <div style="width:8px;height:8px;border-radius:4px;background:var(--green);"></div>
                        <span style="color:var(--green);font-size:12px;font-family:var(--font-condensed);font-weight:600;">Peso normal</span>
                    </div>
                    <div style="overflow-x:auto;">${weightChart}</div>
                </div>
            </div>
        `);
    }

    function renderCalendar() {
        const year = 2026,
            month = 7;
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro",
            "Outubro", "Novembro", "Dezembro"
        ];
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
        const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
            i < firstDay ? null : i - firstDay + 1
        );

        const gridHtml = cells.map((day, i) => {
            if (!day) return `<div></div>`;
            const dateKey =
                `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasCheckin = !!MOCK_CHECKINS[dateKey];
            const isToday = day === 13;
            const isSelected = selectedCheckinDate === dateKey;
            return `
                <button class="calendar-cell ${hasCheckin ? "has-checkin" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}"
                        onclick="${hasCheckin ? `window.selectCheckin('${dateKey}')` : ''}"
                        ${!hasCheckin ? 'style="cursor:default;"' : ''}>
                    ${day}
                    <div class="cell-dot"></div>
                </button>
            `;
        }).join("");

        const selectedInfo = selectedCheckinDate ? MOCK_CHECKINS[selectedCheckinDate] : null;

        render(`
            <div class="page-content">
                <div style="padding-top:12px;margin-bottom:20px;">
                    <h1 style="font-size:28px;margin:0;">Calendário</h1>
                </div>

                <div class="card">
                    <p style="font-family:var(--font-condensed);font-weight:700;font-size:18px;color:var(--text-primary);text-align:center;margin-bottom:16px;letter-spacing:0.08em;">
                        ${monthNames[month].toUpperCase()} ${year}
                    </p>
                    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px 0;margin-bottom:6px;">
                        ${dayLabels.map(d => `<div style="text-align:center;font-size:11px;color:var(--text-muted);padding-bottom:6px;font-weight:600;">${d}</div>`).join("")}
                    </div>
                    <div class="calendar-grid">${gridHtml}</div>
                </div>

                ${selectedInfo ? `
                    <div class="card fade-slide">
                        <div class="section-label">Check-in Realizado</div>
                        <div class="stat-grid-2">
                            <div class="stat-box">
                                <div class="label">Horário</div>
                                <div class="value">${selectedInfo.hora}</div>
                            </div>
                            <div class="stat-box">
                                <div class="label">Treino</div>
                                <div class="value">${selectedInfo.treino}</div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div style="text-align:center;padding:16px 0;">
                        <p style="color:var(--text-dim);font-size:13px;">Toque em um dia destacado para ver o check-in</p>
                    </div>
                `}
            </div>
        `);
    }

    function selectCheckin(dateKey) {
        selectedCheckinDate = selectedCheckinDate === dateKey ? null : dateKey;
        renderCalendar();
    }

    function renderWorkouts() {
        if (selectedWorkout) {
            renderWorkoutDetail(selectedWorkout);
            return;
        }

        const listHtml = MOCK_WORKOUTS.map((w) => `
            <div class="workout-list-item" onclick="window.showWorkoutDetail('${w.id}')">
                <div class="left">
                    <div class="badge-letter">${w.id}</div>
                    <div class="info">
                        <div class="name">${w.nome}</div>
                        <div class="desc">${w.descricao}</div>
                        <div class="count">${w.exercicios.length} exercícios</div>
                    </div>
                </div>
                <button class="action" onclick="event.stopPropagation();window.showWorkoutDetail('${w.id}')">VER</button>
            </div>
        `).join("");

        render(`
            <div class="page-content">
                <div style="padding-top:12px;margin-bottom:20px;">
                    <h1 style="font-size:28px;margin:0;">Meus Treinos</h1>
                    <p style="color:var(--text-muted);font-size:13px;margin-top:2px;">${MOCK_WORKOUTS.length} planos ativos</p>
                </div>
                ${listHtml}
            </div>
        `);
    }

    function showWorkoutDetail(id) {
        const workout = MOCK_WORKOUTS.find((w) => w.id === id);
        if (!workout) return;
        selectedWorkout = workout;
        renderWorkouts();
    }

    function renderWorkoutDetail(workout) {
        const exercisesHtml = workout.exercicios.map((ex) => `
            <div class="card" style="padding:14px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                            <span style="font-family:var(--font-condensed);font-weight:700;font-size:16px;color:var(--text-primary);letter-spacing:0.04em;">${ex.nome}</span>
                            ${ex.maquina ? `<span style="display:flex;align-items:center;gap:4px;background:var(--green-dim);border-radius:6px;padding:2px 7px;color:var(--green);font-size:10px;font-family:var(--font-condensed);font-weight:700;">🤖 SMART</span>` : ""}
                        </div>
                        <p style="color:var(--text-muted);font-size:12px;margin:0 0 4px;">${ex.series} séries × ${ex.repeticoes} repetições</p>
                        ${ex.obs ? `<p style="color:var(--text-dim);font-size:11px;margin:0;">${ex.obs}</p>` : ""}
                        ${ex.maquina ? `<p style="color:var(--green);font-size:11px;margin:4px 0 0;">Carga configurada automaticamente</p>` : ""}
                    </div>
                    <div style="text-align:right;">
                        <p style="font-family:var(--font-condensed);font-weight:700;font-size:18px;color:${ex.carga > 0 ? "var(--green)" : "var(--text-muted)"};margin:0;">${ex.carga > 0 ? ex.carga : "—"}</p>
                        ${ex.carga > 0 ? `<p style="color:var(--text-muted);font-size:10px;margin:0;">kg</p>` : ""}
                    </div>
                </div>
            </div>
        `).join("");

        render(`
            <div class="page-content">
                <div style="display:flex;align-items:center;gap:12px;padding-top:12px;margin-bottom:20px;">
                    <button class="back-btn" onclick="window.selectedWorkout=null;window.renderWorkouts();">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Voltar
                    </button>
                    <div>
                        <h1 style="font-size:24px;margin:0;">${workout.nome}</h1>
                        <p style="color:var(--text-muted);font-size:13px;margin:0;">${workout.descricao}</p>
                    </div>
                </div>
                ${exercisesHtml}
            </div>
        `);
    }

    function renderProfile() {
        const isPerfil = selectedProfileTab === "perfil";
        const isMetas = selectedProfileTab === "metas";
        const isRecompensas = selectedProfileTab === "recompensas";

        const completedGoal = MOCK_GOALS.find((g) => g.status === "concluida");

        const tabsHtml = `
            <div style="display:flex;margin:16px 0 20px;background:var(--bg-card);border-radius:var(--radius-sm);padding:4px;">
                ${["perfil", "metas", "recompensas"].map(t => `
                    <button onclick="window.selectedProfileTab='${t}';window.renderProfile();"
                            style="flex:1;background:${selectedProfileTab === t ? "var(--green)" : "none"};border:none;border-radius:8px;padding:9px 0;color:${selectedProfileTab === t ? "var(--bg-primary)" : "var(--text-muted)"};font-size:12px;font-family:var(--font-condensed);font-weight:700;letter-spacing:0.08em;cursor:pointer;text-transform:uppercase;transition:all 0.2s;">
                        ${t === "perfil" ? "Perfil" : t === "metas" ? "Metas" : "Recompensas"}
                    </button>
                `).join("")}
            </div>
        `;

        let contentHtml = "";
        if (isPerfil) {
            contentHtml = `
                <div class="stat-grid-3" style="margin-bottom:12px;">
                    ${[
                        { label: "Peso", value: `${MOCK_USER.weight} kg` },
                        { label: "Altura", value: `${MOCK_USER.height} m` },
                        { label: "IMC", value: `${MOCK_USER.imc}` },
                    ].map(s => `
                        <div class="stat-box">
                            <div class="label">${s.label}</div>
                            <div class="value">${s.value}</div>
                        </div>
                    `).join("")}
                </div>
                <div class="card" style="display:flex;align-items:center;gap:8px;padding:12px 16px;margin-bottom:12px;">
                    <div style="width:8px;height:8px;border-radius:4px;background:var(--green);"></div>
                    <span style="color:var(--green);font-size:13px;font-family:var(--font-condensed);font-weight:600;">Peso normal</span>
                </div>

                <div class="card" style="margin-bottom:12px;">
                    <div class="section-label">Informações</div>
                    ${[
                        { label: "Nome completo", value: MOCK_USER.name },
                        { label: "E-mail", value: MOCK_USER.email },
                        { label: "Data de nascimento", value: MOCK_USER.birthDate },
                    ].map((row, i) => `
                        <div class="info-row" style="border-bottom:${i < 2 ? "1px solid var(--bg-secondary)" : "none"};">
                            <span class="label">${row.label}</span>
                            <span class="value">${row.value}</span>
                        </div>
                    `).join("")}
                </div>

                <div class="card" style="background:linear-gradient(135deg, var(--bg-card) 60%, #0d1f1a);">
                    <div class="section-label">Meu Plano</div>
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
                        <div>
                            <h3 style="font-size:22px;margin:0 0 4px;">Plano ${MOCK_USER.plan}</h3>
                            <p style="color:var(--text-muted);font-size:12px;margin:0;">Validade: ${MOCK_USER.planExpiry}</p>
                        </div>
                        <span class="badge-active">${MOCK_USER.statusPlano}</span>
                    </div>
                    <div class="benefit-list">
                        ${["Acesso à academia", "Máquinas inteligentes", "Acompanhamento de evolução", "Sistema de recompensas"].map(b => `
                            <div class="benefit-item">
                                <div class="check"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                                ${b}
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        if (isMetas) {
            contentHtml = `
                <p style="color:var(--text-muted);font-size:13px;margin-bottom:12px;">Metas definidas pelo seu personal</p>
                ${MOCK_GOALS.map(goal => `
                    <div class="card" style="opacity:${goal.status === "concluida" ? 0.7 : 1};">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                            <div style="flex:1;">
                                <p style="font-family:var(--font-condensed);font-weight:700;font-size:17px;color:var(--text-primary);margin:0 0 3px;">${goal.nome}</p>
                                <p style="color:var(--text-muted);font-size:12px;margin:0;">${goal.descricao}</p>
                            </div>
                            ${goal.status === "concluida" ? `<span style="font-size:18px;">🏆</span>` : ""}
                        </div>
                        ${renderProgress(goal.progresso, goal.objetivo)}
                        ${goal.recompensa ? `
                            <div style="margin-top:10px;padding:8px 10px;background:var(--bg-card-alt);border-radius:var(--radius-xs);display:flex;align-items:center;gap:8px;">
                                <span style="font-size:16px;">${goal.recompensa.icone}</span>
                                <span style="color:var(--text-muted);font-size:12px;">Recompensa: <span style="color:var(--text-secondary);">${goal.recompensa.nome}</span></span>
                            </div>
                        ` : ""}
                    </div>
                `).join("")}
            `;
        }

        if (isRecompensas) {
            contentHtml = `
                ${completedGoal ? `
                    <div class="reward-card" style="margin-bottom:16px;">
                        <span class="icon">🏆</span>
                        <div class="title">META CONCLUÍDA</div>
                        <div class="sub">Parabéns! Você atingiu sua meta.</div>
                        <div class="reward-box">
                            <div class="reward-icon">${completedGoal.recompensa?.icone}</div>
                            <div class="reward-name">${completedGoal.recompensa?.nome}</div>
                        </div>
                        <div class="reward-footer">
                            <span class="dot"></span>
                            Disponível para retirada na recepção
                        </div>
                    </div>
                ` : ""}

                ${MOCK_GOALS.filter(g => g.status !== "concluida").map(goal => `
                    <div class="card" style="opacity:0.6;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-size:24px;">${goal.recompensa?.icone}</span>
                            <div style="flex:1;">
                                <p style="font-family:var(--font-condensed);font-weight:700;font-size:15px;color:var(--text-primary);margin:0 0 2px;">${goal.recompensa?.nome}</p>
                                <p style="color:var(--text-muted);font-size:12px;margin:0 0 6px;">${goal.nome}</p>
                                ${renderProgress(goal.progresso, goal.objetivo)}
                            </div>
                        </div>
                    </div>
                `).join("")}
            `;
        }

        render(`
            <div class="page-content">
                <div style="padding-top:12px;text-align:center;">
                    <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--blue));display:flex;align-items:center;justify-content:center;font-family:var(--font-condensed);font-weight:800;font-size:28px;color:var(--bg-primary);margin:0 auto 14px;border:3px solid var(--bg-card);">
                        ${MOCK_USER.avatar}
                    </div>
                    <h1 style="font-size:26px;margin:0 0 4px;">${MOCK_USER.name}</h1>
                    <p style="color:var(--text-muted);font-size:13px;margin:0;">${MOCK_USER.email}</p>
                </div>

                ${tabsHtml}

                <div style="padding:0 0 20px;">
                    ${contentHtml}
                </div>
            </div>
        `);
    }

    // ─── NAVIGATION ──────────────────────────────────────────────────

    function navigateTo(tab) {
        currentTab = tab;
        setActiveNav(tab);
        switch (tab) {
            case "home":
                renderHome();
                break;
            case "calendar":
                renderCalendar();
                break;
            case "workouts":
                selectedWorkout = null;
                renderWorkouts();
                break;
            case "profile":
                selectedProfileTab = "perfil";
                renderProfile();
                break;
        }
    }

    // ─── LOGOUT ──────────────────────────────────────────────────────

    function handleLogout() {
        sessionStorage.removeItem("senseactive_user");
        window.location.href = '../public/cliente.html';
    }

    // ─── EVENTOS ─────────────────────────────────────────────────────

    // Bottom nav
    $$(".nav-item").forEach((btn) => {
        btn.addEventListener("click", () => {
            const tab = btn.dataset.tab;
            if (tab) navigateTo(tab);
        });
    });

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    // ─── EXPOSER FUNÇÕES GLOBAIS ──────────────────────────────────

    window.navigateTo = navigateTo;
    window.renderHome = renderHome;
    window.renderCalendar = renderCalendar;
    window.renderWorkouts = renderWorkouts;
    window.renderProfile = renderProfile;
    window.showWorkoutDetail = showWorkoutDetail;
    window.selectCheckin = selectCheckin;
    window.selectedWorkout = selectedWorkout;
    window.selectedProfileTab = selectedProfileTab;
    window.handleLogout = handleLogout;

    // ─── INIT ────────────────────────────────────────────────────────

    navigateTo("home");

    console.log('✅ SmartGym App iniciado com sucesso!');
    console.log('👤 Usuário:', userData.email);
    console.log('📌 URL atual:', window.location.href);

})();