const hamburgerBtn = document.getElementById('hamburgerBtn');
const navMenu = document.getElementById('navMenu');

hamburgerBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  navMenu.classList.toggle('open');
  this.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
});

document.querySelectorAll('#navMenu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburgerBtn.textContent = '☰';
  });
});

document.addEventListener('click', function (e) {
  const header = document.querySelector('header');
  if (!header.contains(e.target) && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    hamburgerBtn.textContent = '☰';
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const video = document.getElementById('bgVideo');
  if (video) {
    video.play().catch(function (error) {
      console.log('Auto-play bloqueado. Aguardando interação...');
      document.addEventListener('click', function playVideo() {
        video.play();
        document.removeEventListener('click', playVideo);
      }, { once: true });
    });
  }

    // CALENDÁRIO DE AULAS

    // Verifica se os elementos do calendário existem
    const calendarioEl = document.getElementById('calendario');
    const diasContainer = document.getElementById('diasContainer');
    const monthYearEl = document.getElementById('monthYear');
    const diaLabel = document.getElementById('diaSelecionadoLabel');
    const aulasContainer = document.getElementById('aulasContainer');

    if (calendarioEl && diasContainer && monthYearEl) {
        console.log('Inicializando calendário...');
        initCalendario();
    } else {
        console.log('Elementos do calendário não encontrados.');
    }

    // ============================================================
    // FUNÇÃO DO CALENDÁRIO
    // ============================================================
    function initCalendario() {
        // ---------- REGRAS DE HORÁRIOS POR DIA DA SEMANA ----------
        const horariosPorDia = {
            1: { // Segunda
                yoga: ['08:00 — 08:45'],
                funcional: ['07:00 — 07:45', '19:00 — 19:45'],
                fitdance: []
            },
            2: { // Terça
                yoga: [],
                funcional: ['07:00 — 07:45', '19:00 — 19:45'],
                fitdance: ['08:00 — 08:45', '18:00 — 18:45']
            },
            3: { // Quarta
                yoga: ['08:00 — 08:45'],
                funcional: ['07:00 — 07:45', '19:00 — 19:45'],
                fitdance: []
            },
            4: { // Quinta
                yoga: [],
                funcional: ['07:00 — 07:45', '19:00 — 19:45'],
                fitdance: ['08:00 — 08:45', '18:00 — 18:45']
            },
            5: { // Sexta
                yoga: ['08:00 — 08:45'],
                funcional: ['07:00 — 07:45', '19:00 — 19:45'],
                fitdance: []
            },
            6: { // Sábado
                yoga: ['09:00 — 09:45'],
                funcional: ['08:00 — 08:45'],
                fitdance: ['10:00 — 10:45']
            },
            0: { // Domingo
                yoga: ['10:00 — 10:45'],
                funcional: ['09:00 — 09:45'],
                fitdance: []
            }
        };

        // ---------- VARIÁVEIS DE ESTADO ----------
        let currentMonth = 8; // (0-indexado)
        let currentYear = 2026;
        let selectedDate = null;

        // ---------- ELEMENTOS DO DOM ----------
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');

        // ---------- FUNÇÕES AUXILIARES ----------
        function getDiasNoMes(year, month) {
            return new Date(year, month + 1, 0).getDate();
        }

        function getPrimeiroDiaSemana(year, month) {
            return new Date(year, month, 1).getDay();
        }

        function formatDateKey(year, month, day) {
            return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }

        // Verifica se uma data já passou
        function isDataPassada(year, month, day) {
            const hoje = new Date();
            const dataComparar = new Date(year, month, day);
            // Zera as horas para comparar apenas a data
            hoje.setHours(0, 0, 0, 0);
            dataComparar.setHours(0, 0, 0, 0);
            return dataComparar < hoje;
        }

        function getAulasPorData(year, month, day) {
            const data = new Date(year, month, day);
            const diaSemana = data.getDay();
            const horarios = horariosPorDia[diaSemana] || horariosPorDia[0];

            const aulas = [];

            if (horarios.yoga && horarios.yoga.length > 0) {
                horarios.yoga.forEach(horario => {
                    aulas.push({
                        modalidade: 'Yoga',
                        horario: horario,
                        status: 'disponivel',
                        icone: 'fa-spa'
                    });
                });
            }

            if (horarios.funcional && horarios.funcional.length > 0) {
                horarios.funcional.forEach(horario => {
                    aulas.push({
                        modalidade: 'Funcional',
                        horario: horario,
                        status: 'disponivel',
                        icone: 'fa-dumbbell'
                    });
                });
            }

            if (horarios.fitdance && horarios.fitdance.length > 0) {
                horarios.fitdance.forEach(horario => {
                    aulas.push({
                        modalidade: 'Fit Dance',
                        horario: horario,
                        status: 'disponivel',
                        icone: 'fa-music'
                    });
                });
            }

            aulas.sort((a, b) => {
                const horaA = parseInt(a.horario.split(':')[0]);
                const horaB = parseInt(b.horario.split(':')[0]);
                return horaA - horaB;
            });

            return aulas;
        }

        function temAula(year, month, day) {
            const aulas = getAulasPorData(year, month, day);
            return aulas.length > 0;
        }

        // ---------- RENDERIZAR CALENDÁRIO ----------
        function renderCalendario() {
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];

            monthYearEl.textContent = `${meses[currentMonth]} ${currentYear}`;

            const diasNoMes = getDiasNoMes(currentYear, currentMonth);
            const primeiroDia = getPrimeiroDiaSemana(currentYear, currentMonth);

            // Ajuste para segunda-feira como primeiro dia
            const ajuste = primeiroDia === 0 ? 6 : primeiroDia - 1;

            let html = '';

            // Dias do mês anterior
            const diasNoMesAnterior = getDiasNoMes(currentYear, currentMonth - 1);
            let diaMesAnterior = diasNoMesAnterior - ajuste + 1;

            for (let i = 0; i < ajuste; i++) {
                html += `<button class="outro-mes">${diaMesAnterior + i}</button>`;
            }

            // Dias do mês atual
            const hoje = new Date();
            const hojeKey = formatDateKey(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

            for (let dia = 1; dia <= diasNoMes; dia++) {
                const dateKey = formatDateKey(currentYear, currentMonth, dia);
                const isToday = dateKey === hojeKey;
                const hasAula = temAula(currentYear, currentMonth, dia);
                const isSelected = dateKey === selectedDate;
                
                // Verifica se a data já passou
                const isPassado = isDataPassada(currentYear, currentMonth, dia);

                let classes = 'dia-btn';
                if (isToday) classes += ' hoje';
                if (isSelected) classes += ' selecionado';
                if (hasAula && !isPassado) classes += ' disponivel';
                if (isPassado) classes += ' passado'; // Classe para dias passados

                // Desabilita o clique se for data passada ou se não tiver aula
                const disabled = isPassado || !hasAula;
                const disabledAttr = disabled ? ' disabled' : '';

                html += `<button class="${classes}" data-date="${dateKey}"${disabledAttr}>${dia}</button>`;
            }

            diasContainer.innerHTML = html;

            // Adicionar eventos aos dias (apenas os que não estão desabilitados)
            document.querySelectorAll('.dia-btn:not(.outro-mes):not([disabled])').forEach(btn => {
                btn.addEventListener('click', function() {
                    const date = this.dataset.date;
                    if (date) {
                        selectedDate = date;
                        renderCalendario();
                        renderAulas();
                    }
                });
            });

            // Se não houver data selecionada ou a data selecionada for passada,
            // selecionar a primeira data disponível a partir de hoje
            if (!selectedDate || isDataPassada(parseInt(selectedDate.split('-')[0]), 
                                               parseInt(selectedDate.split('-')[1]) - 1, 
                                               parseInt(selectedDate.split('-')[2]))) {
                // Procura o primeiro dia disponível a partir de hoje
                const diasDisponiveis = document.querySelectorAll('.dia-btn:not(.outro-mes):not([disabled]).disponivel');
                if (diasDisponiveis.length > 0) {
                    selectedDate = diasDisponiveis[0].dataset.date;
                    renderCalendario();
                    renderAulas();
                } else {
                    // Se não houver dias disponíveis no mês atual
                    diaLabel.textContent = 'NENHUMA AULA DISPONÍVEL';
                    if (aulasContainer) {
                        aulasContainer.innerHTML = `
                            <div style="text-align:center;padding:30px 0;color:#666;">
                                <i class="fas fa-calendar-times" style="font-size:2rem;display:block;margin-bottom:12px;color:#444;"></i>
                                <p style="font-weight:300;">Nenhuma aula disponível a partir de hoje.</p>
                            </div>
                        `;
                    }
                }
            } else {
                renderAulas();
            }
        }

        // ---------- RENDERIZAR AULAS ----------
        function renderAulas() {
            if (!selectedDate) {
                return;
            }

            const [year, month, day] = selectedDate.split('-').map(Number);
            const aulas = getAulasPorData(year, month - 1, day);

            const dataObj = new Date(year, month - 1, day);
            const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

            const diaSemana = diasSemana[dataObj.getDay()];
            const diaFormatado = `${String(day).padStart(2, '0')} ${meses[month - 1]}`;

            if (diaLabel) {
                diaLabel.textContent = `${diaSemana.toUpperCase()} — ${diaFormatado}`;
            }

            if (!aulasContainer) return;

            if (aulas.length === 0) {
                aulasContainer.innerHTML = `
                    <div style="text-align:center;padding:30px 0;color:#666;">
                        <i class="fas fa-calendar-times" style="font-size:2rem;display:block;margin-bottom:12px;color:#444;"></i>
                        <p style="font-weight:300;">Nenhuma aula disponível nesta data.</p>
                    </div>
                `;
                return;
            }

            let html = '<div class="aulas-lista">';
            aulas.forEach((aula) => {
                html += `
                    <div class="aula-item">
                        <div class="aula-nome">
                            <i class="fas ${aula.icone}"></i>
                            ${aula.modalidade}
                        </div>
                        <div class="aula-horario">${aula.horario}</div>
                        <div class="aula-status">🟢 Disponível</div>
                    </div>
                `;
            });
            html += '</div>';

            aulasContainer.innerHTML = html;
        }

        // ---------- NAVEGAÇÃO DE MÊS ----------
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', function() {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                selectedDate = null;
                renderCalendario();
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', function() {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                selectedDate = null;
                renderCalendario();
            });
        }

        // ---------- INICIALIZAR ----------
        renderCalendario();
        console.log('Calendário renderizado com sucesso!');
    }

})();