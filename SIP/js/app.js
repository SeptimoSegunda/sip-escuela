document.addEventListener('DOMContentLoaded', () => {

    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const formatDate = (date = new Date()) =>
        date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

    const formatDateTime = (date = new Date()) =>
        date.toLocaleString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const formatNumber = (n) => n.toLocaleString('es-AR');

    const parseCustomDate = (dateStr) => {
        if (!dateStr) return new Date();
        const monthMap = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };
        const parts = dateStr.trim().split(/\s+/);
        if (parts.length >= 3) {
            const day = parseInt(parts[0], 10);
            const mStr = parts[1].toLowerCase().replace('.', '').slice(0, 3);
            const year = parseInt(parts[2], 10);
            return new Date(year, monthMap[mStr] ?? 7, day);
        }
        return new Date(dateStr);
    };

    const monthMap = {
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
    };

    const getLoanMonthKey = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.trim().split(/\s+/);
        if (parts.length >= 3) {
            const monthAbbr = parts[1].toLowerCase().replace('.', '').slice(0, 3);
            const monthNum = monthMap[monthAbbr] || '08';
            const year = parts[2];
            return `${monthNum}-${year}`;
        }
        return '08-2026';
    };

    // ==========================================
    // 1. ESTADO GLOBAL Y PERSISTENCIA LOCALSTORAGE
    // ==========================================
    const DEFAULT_BOOKS = [
        {
            isbn: "978-950-511-356-9",
            titulo: "Cien Años de Soledad",
            autor: "Gabriel García Márquez",
            categoria: "Novela",
            portada: "",
            copiasList: [
                {
                    copiaId: 1,
                    titulo: "Cien Años de Soledad",
                    subtitulo: "Edición Conmemorativa 50 Años",
                    autor: "Gabriel García Márquez",
                    categoria: "Novela",
                    isbn: "978-950-511-356-9",
                    inventario: "INV-102030-A",
                    ubicacion: "Estante 3, Sector A",
                    clasificacion: "863 G216c",
                    libristica: "LIBR-GGM-01",
                    extension: "471",
                    edicion: "4ª Edición",
                    editorial: "Sudamericana",
                    fecha: "1967",
                    lugar: "Buenos Aires",
                    temas: "Realismo Mágico, Familia",
                    terminoMateria: "Narrativa Colombiana",
                    coleccionPersonal: "Privada",
                    coleccionInstitucional: "Nacional",
                    numero: "Tomo Único",
                    notaGeneral: "Tapa dura con detalles dorados.",
                    notaContenido: "Ejemplar en excelente estado.",
                    estado: "disponible"
                },
                {
                    copiaId: 2,
                    titulo: "Cien Años de Soledad",
                    subtitulo: "Edición Bolsillo Escolar",
                    autor: "Gabriel García Márquez",
                    categoria: "Novela",
                    isbn: "978-950-511-356-9",
                    inventario: "INV-102030-B",
                    ubicacion: "Estante 3, Sector A",
                    clasificacion: "863 G216c",
                    libristica: "LIBR-GGM-01",
                    extension: "450",
                    edicion: "Edición Económica",
                    editorial: "Sudamericana",
                    fecha: "1985",
                    lugar: "Buenos Aires",
                    temas: "Realismo Mágico",
                    terminoMateria: "Narrativa Colombiana",
                    coleccionPersonal: "-",
                    coleccionInstitucional: "Colección General",
                    numero: "-",
                    notaGeneral: "Tapa blanda.",
                    notaContenido: "Subrayado en lápiz.",
                    estado: "prestado"
                }
            ]
        },
        {
            isbn: "978-842-492-235-1",
            titulo: "Don Quijote de la Mancha",
            autor: "Miguel de Cervantes",
            categoria: "Clásico",
            portada: "",
            copiasList: [
                {
                    copiaId: 1,
                    titulo: "Don Quijote de la Mancha",
                    subtitulo: "El ingenioso hidalgo",
                    autor: "Miguel de Cervantes",
                    categoria: "Clásico",
                    isbn: "978-842-492-235-1",
                    inventario: "INV-102031-1",
                    ubicacion: "Estante 1, Sector C",
                    clasificacion: "863 C337d",
                    libristica: "LIBR-CER-02",
                    extension: "1056",
                    edicion: "Conmemorativa",
                    editorial: "RAE",
                    fecha: "1605",
                    lugar: "Madrid",
                    temas: "Caballería",
                    terminoMateria: "Literatura Española",
                    coleccionPersonal: "Legado",
                    coleccionInstitucional: "Archivo",
                    numero: "Vol I y II",
                    notaGeneral: "Texto íntegro.",
                    notaContenido: "Incluye glosario final.",
                    estado: "disponible"
                }
            ]
        }
    ];

    const DEFAULT_SOCIOS = [
        { id: "SOC-1001", apellido: "Gómez", nombre: "Carlos", tipo: "estudiante", anio: "5º Año A", turno: "Mañana", email: "carlos@edu.com", estado: "activo" },
        { id: "SOC-1002", apellido: "Martínez", nombre: "Ana", tipo: "estudiante", anio: "3º Año B", turno: "Tarde", email: "ana@edu.com", estado: "activo" },
        { id: "SOC-1003", apellido: "Pérez", nombre: "María", tipo: "docente", anio: "-", turno: "Tarde", email: "maria@edu.com", estado: "activo" }
    ];

    const DEFAULT_LOANS = [
        { id: "#P-1092", libro: "Cien Años de Soledad", socioId: "SOC-1001", socioNombre: "Gómez, Carlos", fechaPrestamo: "14 Ago 2026", fechaLimite: "21 Ago 2026", estado: "prestado" },
        { id: "#P-1093", libro: "Don Quijote de la Mancha", socioId: "SOC-1002", socioNombre: "Martínez, Ana", fechaPrestamo: "20 Ago 2026", fechaLimite: "30 Ago 2026", estado: "prestado" },
        { id: "#P-1094", libro: "Cien Años de Soledad", socioId: "SOC-1003", socioNombre: "Pérez, María", fechaPrestamo: "05 Ago 2026", fechaLimite: "19 Ago 2026", estado: "devuelto" }
    ];

    const DEFAULT_DAMAGES = [
        {
            id: "#D-1001",
            fechaHora: "19 Ago 2026, 11:20:15",
            libro: "Cien Años de Soledad",
            isbn: "978-950-511-356-9",
            inventario: "INV-102030-A",
            copiaId: 1,
            socioId: "SOC-1003",
            socioNombre: "Pérez, María",
            nivel: "Daño leve",
            descripcion: "Dobleces en esquinas de 3 páginas iniciales.",
            admin: "Turno Mañana",
            accionCopia: "disponible"
        }
    ];

    const DEFAULT_AUDIT = [
        {
            id: "LOG-1001",
            fechaHora: "14 Ago 2026, 08:30:00",
            admin: "Turno Mañana",
            categoria: "Préstamos",
            accion: "Nuevo Préstamo",
            descripcion: 'Préstamo #P-1092 de "Cien Años de Soledad" otorgado a Gómez, Carlos.',
            idAfectado: "#P-1092"
        },
        {
            id: "LOG-1002",
            fechaHora: "19 Ago 2026, 11:20:15",
            admin: "Turno Mañana",
            categoria: "Préstamos",
            accion: "Devolución con Daño",
            descripcion: 'Devolución de "Cien Años de Soledad" por Pérez, María con reporte de [Daño leve].',
            idAfectado: "#P-1094"
        },
        {
            id: "LOG-1003",
            fechaHora: "20 Ago 2026, 14:15:30",
            admin: "Turno Tarde",
            categoria: "Préstamos",
            accion: "Nuevo Préstamo",
            descripcion: 'Préstamo #P-1093 de "Don Quijote de la Mancha" otorgado a Martínez, Ana.',
            idAfectado: "#P-1093"
        }
    ];

    let books = JSON.parse(localStorage.getItem('SIP_BOOKS')) || DEFAULT_BOOKS;
    let socios = JSON.parse(localStorage.getItem('SIP_SOCIOS')) || DEFAULT_SOCIOS;
    let loans = JSON.parse(localStorage.getItem('SIP_LOANS')) || DEFAULT_LOANS;
    let damageRecords = JSON.parse(localStorage.getItem('SIP_DAMAGES')) || DEFAULT_DAMAGES;
    let auditLogs = JSON.parse(localStorage.getItem('SIP_AUDIT')) || DEFAULT_AUDIT;
    let currentAdmin = localStorage.getItem('SIP_CURRENT_ADMIN') || 'Turno Mañana';

    function saveData() {
        localStorage.setItem('SIP_BOOKS', JSON.stringify(books));
        localStorage.setItem('SIP_SOCIOS', JSON.stringify(socios));
        localStorage.setItem('SIP_LOANS', JSON.stringify(loans));
        localStorage.setItem('SIP_DAMAGES', JSON.stringify(damageRecords));
        localStorage.setItem('SIP_AUDIT', JSON.stringify(auditLogs));
        localStorage.setItem('SIP_CURRENT_ADMIN', currentAdmin);
    }

    // ==========================================
    // 2. MÓDULO DE ADMINISTRADORES (TURNO MAÑANA / TARDE)
    // ==========================================
    const selectCurrentAdmin = document.getElementById('selectCurrentAdmin');
    const currentAdminName = document.getElementById('currentAdminName');
    const adminAvatar = document.getElementById('adminAvatar');

    function updateAdminUI(adminVal, shouldLog = false) {
        currentAdmin = adminVal;
        localStorage.setItem('SIP_CURRENT_ADMIN', currentAdmin);

        if (currentAdminName) currentAdminName.textContent = currentAdmin;
        if (selectCurrentAdmin) selectCurrentAdmin.value = currentAdmin;

        if (adminAvatar) {
            if (currentAdmin === 'Turno Mañana') {
                adminAvatar.className = 'admin-avatar manana';
                adminAvatar.innerHTML = '<i class="fa-solid fa-sun"></i>';
            } else {
                adminAvatar.className = 'admin-avatar tarde';
                adminAvatar.innerHTML = '<i class="fa-solid fa-cloud-sun"></i>';
            }
        }

        if (shouldLog) {
            logAction('Sistema', 'Cambio de Turno Activo', `Sesión cambiada a Administrador [${currentAdmin}] con control total del sistema.`);
        }
    }

    if (selectCurrentAdmin) {
        selectCurrentAdmin.addEventListener('change', (e) => {
            updateAdminUI(e.target.value, true);
        });
    }

    updateAdminUI(currentAdmin, false);

    // ==========================================
    // 3. MÓDULO DE BITÁCORA Y REGISTRO DE AUDITORÍA
    // ==========================================
    function logAction(categoria, accion, descripcion, idAfectado = '') {
        const newLog = {
            id: `LOG-${Date.now().toString().slice(-6)}`,
            fechaHora: formatDateTime(new Date()),
            admin: currentAdmin,
            categoria: categoria, // 'Libros' | 'Préstamos' | 'Socios' | 'Daños' | 'Sistema'
            accion: accion,
            descripcion: descripcion,
            idAfectado: idAfectado
        };
        auditLogs.unshift(newLog);
        saveData();
        renderAuditLogs();
    }

    const auditTableBody = document.getElementById('auditTableBody');
    const selectAuditAdminFilter = document.getElementById('selectAuditAdminFilter');
    const selectAuditCategoryFilter = document.getElementById('selectAuditCategoryFilter');
    const auditSearchInput = document.getElementById('auditSearchInput');

    function renderAuditLogs() {
        if (!auditTableBody) return;
        auditTableBody.innerHTML = '';

        const adminFilter = selectAuditAdminFilter ? selectAuditAdminFilter.value : 'all';
        const categoryFilter = selectAuditCategoryFilter ? selectAuditCategoryFilter.value : 'all';
        const searchTerm = auditSearchInput ? auditSearchInput.value.trim().toLowerCase() : '';

        // Contadores métricos
        const statAuditTotal = document.getElementById('statAuditTotal');
        const statAuditManana = document.getElementById('statAuditManana');
        const statAuditTarde = document.getElementById('statAuditTarde');

        const totalLogs = auditLogs.length;
        const mananaLogs = auditLogs.filter(l => l.admin === 'Turno Mañana').length;
        const tardeLogs = auditLogs.filter(l => l.admin === 'Turno Tarde').length;

        if (statAuditTotal) statAuditTotal.textContent = totalLogs;
        if (statAuditManana) statAuditManana.textContent = mananaLogs;
        if (statAuditTarde) statAuditTarde.textContent = tardeLogs;

        const filtered = auditLogs.filter(log => {
            const matchAdmin = (adminFilter === 'all' || log.admin === adminFilter);
            const matchCategory = (categoryFilter === 'all' || log.categoria === categoryFilter);
            const matchSearch = !searchTerm || (
                log.accion.toLowerCase().includes(searchTerm) ||
                log.descripcion.toLowerCase().includes(searchTerm) ||
                log.admin.toLowerCase().includes(searchTerm) ||
                log.categoria.toLowerCase().includes(searchTerm) ||
                (log.idAfectado && log.idAfectado.toLowerCase().includes(searchTerm))
            );
            return matchAdmin && matchCategory && matchSearch;
        });

        if (filtered.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No se encontraron registros de auditoría que coincidan con los filtros.</td>`;
            auditTableBody.appendChild(tr);
            return;
        }

        filtered.forEach(log => {
            const tr = document.createElement('tr');
            const adminBadgeClass = log.admin === 'Turno Mañana' ? 'badge-admin-manana' : 'badge-admin-tarde';
            const adminIcon = log.admin === 'Turno Mañana' ? 'fa-sun' : 'fa-cloud-sun';

            tr.innerHTML = `
                <td style="white-space: nowrap; font-size: 0.85rem; color: var(--text-muted);"><i class="fa-regular fa-clock"></i> ${escapeHtml(log.fechaHora)}</td>
                <td><span class="${adminBadgeClass}"><i class="fa-solid ${adminIcon}"></i> ${escapeHtml(log.admin)}</span></td>
                <td><span class="audit-category-tag">${escapeHtml(log.categoria)}</span></td>
                <td><span class="audit-action-title">${escapeHtml(log.accion)}</span></td>
                <td>
                    <div class="audit-action-desc">${escapeHtml(log.descripcion)}</div>
                    ${log.idAfectado ? `<span style="font-size: 0.72rem; background: var(--bg-base); border: 1px solid var(--beige-dark); padding: 0.1rem 0.4rem; border-radius: 4px; color: var(--accent-brown); font-weight: 700; margin-top: 0.2rem; display: inline-block;">Ref: ${escapeHtml(log.idAfectado)}</span>` : ''}
                </td>
            `;
            auditTableBody.appendChild(tr);
        });
    }

    if (selectAuditAdminFilter) selectAuditAdminFilter.addEventListener('change', renderAuditLogs);
    if (selectAuditCategoryFilter) selectAuditCategoryFilter.addEventListener('change', renderAuditLogs);
    if (auditSearchInput) auditSearchInput.addEventListener('input', renderAuditLogs);

    // Exportar Registro de Auditoría
    const btnExportarAuditoria = document.getElementById('btnExportarAuditoria');
    if (btnExportarAuditoria) {
        btnExportarAuditoria.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `auditoria_sip_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    // ==========================================
    // 4. MÓDULO DE DAÑO DE LIBROS Y USUARIOS INFRACTORES
    // ==========================================
    function getDamageBadgeHtml(nivel) {
        if (nivel === 'CATASTROFICO!') {
            return `<span class="badge badge-damage-catastrofico"><i class="fa-solid fa-skull-crossbones"></i> CATASTRÓFICO!</span>`;
        } else if (nivel === 'Daño moderado') {
            return `<span class="badge badge-damage-moderado"><i class="fa-solid fa-triangle-exclamation"></i> Daño Moderado</span>`;
        } else {
            return `<span class="badge badge-damage-leve"><i class="fa-solid fa-leaf"></i> Daño Leve</span>`;
        }
    }

    function registerDamage({ bookTitle, isbn, inventario, copiaId, socioId, socioNombre, damageLevel, description, accionCopia }) {
        const nextIdNum = damageRecords.length > 0 ? parseInt(damageRecords[0].id.replace(/\D/g, '')) + 1 : 1001;
        const newDmg = {
            id: `#D-${nextIdNum}`,
            fechaHora: formatDateTime(new Date()),
            libro: bookTitle,
            isbn: isbn || '',
            inventario: inventario || '',
            copiaId: copiaId || 1,
            socioId: socioId,
            socioNombre: socioNombre,
            nivel: damageLevel, // "Daño leve" | "Daño moderado" | "CATASTROFICO!"
            descripcion: description,
            admin: currentAdmin,
            accionCopia: accionCopia || 'disponible'
        };

        damageRecords.unshift(newDmg);

        // Actualizar estado de la copia del libro si corresponde
        if (accionCopia === 'mantenimiento') {
            const targetBook = books.find(b => b.titulo.toLowerCase() === bookTitle.toLowerCase() || (isbn && b.isbn === isbn));
            if (targetBook) {
                const targetCopy = targetBook.copiasList.find(c => c.inventario === inventario || c.copiaId === copiaId);
                if (targetCopy) {
                    targetCopy.estado = 'mantenimiento';
                }
            }
        }

        // Registrar en Auditoría
        logAction('Daños', 'Reporte de Daño Físico', `Registrado daño [${damageLevel}] a "${bookTitle}" (Ejemplar: ${inventario || 'N/A'}) atribuido a socio ${socioNombre}. Detalle: ${description}`, newDmg.id);

        saveData();
        renderDamageLogs();
        renderSocios();
        renderCatalog();
        updateDashboard();
        return newDmg;
    }

    const damagesTableBody = document.getElementById('damagesTableBody');
    const damageSearchInput = document.getElementById('damageSearchInput');
    let currentDamageFilter = 'all';

    function renderDamageLogs() {
        if (!damagesTableBody) return;
        damagesTableBody.innerHTML = '';

        const statDanosTotal = document.getElementById('statDanosTotal');
        const statDanosLeves = document.getElementById('statDanosLeves');
        const statDanosModerados = document.getElementById('statDanosModerados');
        const statDanosCatastroficos = document.getElementById('statDanosCatastroficos');

        const totalD = damageRecords.length;
        const leves = damageRecords.filter(d => d.nivel === 'Daño leve').length;
        const moderados = damageRecords.filter(d => d.nivel === 'Daño moderado').length;
        const catastroficos = damageRecords.filter(d => d.nivel === 'CATASTROFICO!').length;

        if (statDanosTotal) statDanosTotal.textContent = totalD;
        if (statDanosLeves) statDanosLeves.textContent = leves;
        if (statDanosModerados) statDanosModerados.textContent = moderados;
        if (statDanosCatastroficos) statDanosCatastroficos.textContent = catastroficos;

        const searchTerm = damageSearchInput ? damageSearchInput.value.trim().toLowerCase() : '';

        const filtered = damageRecords.filter(d => {
            const matchFilter = (currentDamageFilter === 'all' || d.nivel === currentDamageFilter);
            const matchSearch = !searchTerm || (
                d.libro.toLowerCase().includes(searchTerm) ||
                d.socioNombre.toLowerCase().includes(searchTerm) ||
                d.socioId.toLowerCase().includes(searchTerm) ||
                (d.inventario && d.inventario.toLowerCase().includes(searchTerm)) ||
                d.descripcion.toLowerCase().includes(searchTerm) ||
                d.id.toLowerCase().includes(searchTerm)
            );
            return matchFilter && matchSearch;
        });

        if (filtered.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="8" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No se encontraron reportes de daños con los criterios seleccionados.</td>`;
            damagesTableBody.appendChild(tr);
            return;
        }

        filtered.forEach(d => {
            const tr = document.createElement('tr');
            const adminBadgeClass = d.admin === 'Turno Mañana' ? 'badge-admin-manana' : 'badge-admin-tarde';
            const adminIcon = d.admin === 'Turno Mañana' ? 'fa-sun' : 'fa-cloud-sun';
            const copyStatusBadge = d.accionCopia === 'mantenimiento'
                ? `<span class="badge" style="background-color:#FFF3E0;color:#E65100;font-size:0.75rem;"><i class="fa-solid fa-wrench"></i> En Mantenimiento</span>`
                : `<span class="badge badge-available" style="font-size:0.75rem;"><i class="fa-solid fa-check"></i> Disponible</span>`;

            tr.innerHTML = `
                <td><strong>${escapeHtml(d.id)}</strong></td>
                <td style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(d.fechaHora)}</td>
                <td>
                    <div style="font-weight: 600; color: var(--accent-brown);">${escapeHtml(d.libro)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(d.inventario ? `Inv: ${d.inventario}` : `Copia #${d.copiaId}`)}</div>
                </td>
                <td>
                    <div style="font-weight: 600;">${escapeHtml(d.socioNombre)}</div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">ID: ${escapeHtml(d.socioId)}</span>
                </td>
                <td>${getDamageBadgeHtml(d.nivel)}</td>
                <td style="max-width: 250px; font-size: 0.85rem;">${escapeHtml(d.descripcion)}</td>
                <td><span class="${adminBadgeClass}"><i class="fa-solid ${adminIcon}"></i> ${escapeHtml(d.admin)}</span></td>
                <td>${copyStatusBadge}</td>
            `;
            damagesTableBody.appendChild(tr);
        });
    }

    document.querySelectorAll('.btn-damage-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-damage-filter').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentDamageFilter = e.currentTarget.dataset.damageFilter;
            renderDamageLogs();
        });
    });

    if (damageSearchInput) damageSearchInput.addEventListener('input', renderDamageLogs);

    // ==========================================
    // 5. NAVEGACIÓN ENTRE VISTAS
    // ==========================================
    const navButtons = document.querySelectorAll('.nav-button');
    const viewSections = document.querySelectorAll('.view-section');

    function switchView(targetId) {
        viewSections.forEach(view => view.classList.remove('active-view'));
        navButtons.forEach(btn => btn.classList.remove('active'));

        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add('active-view');

        const activeBtn = Array.from(navButtons).find(btn => btn.getAttribute('data-target') === targetId);
        if (activeBtn) activeBtn.classList.add('active');

        if (targetId === 'viewInicio') updateDashboard();
        if (targetId === 'viewCatalogo') renderCatalog();
        if (targetId === 'viewPrestamos') renderLoans();
        if (targetId === 'viewSocios') renderSocios();
        if (targetId === 'viewDanos') renderDamageLogs();
        if (targetId === 'viewAuditoria') renderAuditLogs();
        if (targetId === 'viewReportes') renderReports();
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => switchView(button.getAttribute('data-target')));
    });

    const logoHome = document.getElementById('logoHome');
    if (logoHome) logoHome.addEventListener('click', () => switchView('viewInicio'));

    // ==========================================
    // 6. CONTROL DE DASHBOARD Y MÉTRICAS
    // ==========================================
    const statPrestamos = document.getElementById('statPrestamos');
    const statEstanteria = document.getElementById('statEstanteria');
    const statSocios = document.getElementById('statSocios');
    const catalogTableBody = document.getElementById('catalogTableBody');
    const loansTableBody = document.getElementById('loansTableBody');
    const sociosTableBody = document.getElementById('sociosTableBody');
    const totalLibrosCount = document.getElementById('totalLibrosCount');

    const getAvailableCopies = (b) => b.copiasList.filter(c => c.estado === "disponible").length;

    function getLoanStatusInfo(loan) {
        if (loan.estado === "devuelto") {
            return { badgeClass: "badge-available", text: "Devuelto", countdownHtml: "" };
        }
        const now = new Date();
        const limitDate = parseCustomDate(loan.fechaLimite);
        const diffDays = Math.ceil((limitDate.setHours(23, 59, 59, 999) - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            loan.estado = "moroso";
            return { badgeClass: "badge-overdue", text: "Moroso", countdownHtml: "" };
        } else {
            loan.estado = "prestado";
            let cClass = diffDays <= 1 ? "countdown--urgent" : (diffDays <= 3 ? "countdown--warning" : "countdown--ok");
            let cText = diffDays === 0 ? "Vence hoy" : (diffDays === 1 ? "Falta 1 día" : `Faltan ${diffDays} días`);
            let countdownHtml = `<span class="countdown-badge ${cClass}"><i class="fa-regular fa-clock"></i> ${cText}</span>`;
            return { badgeClass: "badge-borrowed", text: "Prestado", countdownHtml };
        }
    }

    function updateDashboard() {
        const totalTitles = books.length;
        const totalPhysicalCopies = books.reduce((acc, b) => acc + b.copiasList.length, 0);
        const activeLoans = loans.filter(l => l.estado === "prestado").length;
        const overdueLoans = loans.filter(l => l.estado === "moroso").length;

        if (statEstanteria) statEstanteria.textContent = formatNumber(totalPhysicalCopies);
        if (statPrestamos) statPrestamos.textContent = activeLoans + overdueLoans;
        if (statSocios) statSocios.textContent = socios.length;

        const dashTotalBooks = document.getElementById('dashTotalBooks');
        const dashTotalCopies = document.getElementById('dashTotalCopies');
        const dashLoansActive = document.getElementById('dashLoansActive');
        const dashLoansOverdue = document.getElementById('dashLoansOverdue');
        const inventoryPercent = document.getElementById('inventoryPercent');
        const inventoryBar = document.getElementById('inventoryBar');

        if (dashTotalBooks) dashTotalBooks.textContent = totalTitles;
        if (dashTotalCopies) dashTotalCopies.textContent = totalPhysicalCopies;
        if (dashLoansActive) dashLoansActive.textContent = activeLoans;
        if (dashLoansOverdue) dashLoansOverdue.textContent = overdueLoans;

        const totalDisp = books.reduce((acc, b) => acc + getAvailableCopies(b), 0);
        const percent = totalPhysicalCopies > 0 ? Math.round((totalDisp / totalPhysicalCopies) * 100) : 100;
        if (inventoryPercent) inventoryPercent.textContent = `${percent}%`;
        if (inventoryBar) inventoryBar.style.setProperty('--bar-width', `${percent}%`);
    }

    // ==========================================
    // 7. GESTIÓN DEL CATÁLOGO DE LIBROS
    // ==========================================
    let currentSearchTerm = "";
    function renderCatalog() {
        if (!catalogTableBody) return;
        catalogTableBody.innerHTML = '';
        const filtered = books.filter(b =>
            !currentSearchTerm ||
            [b.titulo, b.autor, b.isbn, ...b.copiasList.map(c => c.inventario)].some(f => f && f.toLowerCase().includes(currentSearchTerm.toLowerCase()))
        );
        if (totalLibrosCount) totalLibrosCount.textContent = filtered.length;

        filtered.forEach(book => {
            const row = document.createElement('tr');
            const disp = getAvailableCopies(book);
            const total = book.copiasList.length;
            let badge = disp === 0 ? 'badge-borrowed' : (disp === 1 ? 'badge-low' : 'badge-available');
            let text = disp === 0 ? 'Agotado' : `${disp}/${total} Disp.`;

            const portadaHtml = book.portada
                ? `<img src="${book.portada}" class="book-cover-thumb" alt="Portada">`
                : `<div class="book-cover-thumb" style="background:var(--beige-anchor);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.7rem;"><i class="fa-solid fa-book"></i></div>`;

            row.innerHTML = `
                <td><strong>${escapeHtml(book.isbn)}</strong></td>
                <td>
                    <div style="display:flex;align-items:center;gap:0.7rem;">
                        ${portadaHtml}
                        <div>
                            <div style="font-weight:600;color:var(--accent-brown);">${escapeHtml(book.titulo)}</div>
                            <div style="font-size:0.8rem;color:var(--text-muted);">${escapeHtml(book.copiasList[0]?.subtitulo || '')}</div>
                        </div>
                    </div>
                </td>
                <td><div>${escapeHtml(book.autor)}</div><div style="font-size:0.8rem;font-style:italic;">${escapeHtml(book.categoria)}</div></td>
                <td><div>${escapeHtml(book.copiasList[0]?.ubicacion || 'Principal')}</div><div style="font-size:0.8rem;">Inv Base: ${escapeHtml(book.copiasList[0]?.inventario || '-')}</div></td>
                <td><strong>${total} ${total === 1 ? 'copia' : 'copias'}</strong></td>
                <td><span class="badge ${badge}">${text}</span></td>
                <td>
                    <div style="display:flex;gap:0.3rem;">
                        <button class="btn-secondary btnVerFicha" data-isbn="${book.isbn}" style="padding:0.4rem 0.6rem;font-size:0.8rem;" title="Ver y Editar Copias">
                            <i class="fa-solid fa-eye"></i> Ver / Copias
                        </button>
                        <button class="btn-secondary btnDuplicarDirecto" data-isbn="${book.isbn}" style="padding:0.4rem 0.6rem;font-size:0.8rem;" title="Duplicar como Nuevo Libro">
                            <i class="fa-solid fa-copy"></i>
                        </button>
                    </div>
                </td>
            `;
            catalogTableBody.appendChild(row);
        });

        document.querySelectorAll('.btnVerFicha').forEach(btn => {
            btn.onclick = (e) => {
                const b = books.find(bx => bx.isbn === e.currentTarget.dataset.isbn);
                if (b) showBookDetails(b);
            };
        });

        document.querySelectorAll('.btnDuplicarDirecto').forEach(btn => {
            btn.onclick = (e) => {
                const b = books.find(bx => bx.isbn === e.currentTarget.dataset.isbn);
                if (b) duplicarLibro(b);
            };
        });
    }

    const catalogSearch = document.getElementById('catalogSearchInput');
    if (catalogSearch) catalogSearch.oninput = (e) => { currentSearchTerm = e.target.value; renderCatalog(); };

    // Subida de Portada
    const inputPortada = document.getElementById('inputPortadaLibro');
    const inputPortadaBase64 = document.getElementById('inputPortadaBase64');
    const previewContainer = document.getElementById('previewPortadaContainer');
    const imgPreview = document.getElementById('imgPreviewPortada');

    if (inputPortada) {
        inputPortada.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    inputPortadaBase64.value = re.target.result;
                    imgPreview.src = re.target.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // Modales Generales
    const openModal = (m) => m && m.classList.add('active');
    const closeModal = (m) => {
        if (!m) return;
        m.classList.remove('active');
        const f = m.querySelector('form');
        if (f) f.reset();
        if (previewContainer) previewContainer.style.display = 'none';
        if (inputPortadaBase64) inputPortadaBase64.value = '';
    };

    document.querySelectorAll('.close-btn, .btnCancelarModal, .btnCerrarModal').forEach(b => {
        b.onclick = (e) => closeModal(e.target.closest('.modal-overlay'));
    });
    document.querySelectorAll('.modal-overlay').forEach(o => o.onclick = (e) => { if (e.target === o) closeModal(o); });

    const btnAddLibro = document.getElementById('btnAgregarNuevoLibro');
    if (btnAddLibro) {
        btnAddLibro.onclick = () => {
            document.getElementById('modalLibroTituloHeader').textContent = "Añadir Nuevo Libro al Catálogo";
            document.getElementById('editBookOriginalIsbn').value = "";
            document.getElementById('formNuevoLibro').reset();
            if (previewContainer) previewContainer.style.display = 'none';
            if (inputPortadaBase64) inputPortadaBase64.value = '';
            openModal(document.getElementById('modalNuevoLibro'));
        };
    }

    // Alta de Nuevo Libro
    const formNuevoLibro = document.getElementById('formNuevoLibro');
    if (formNuevoLibro) {
        formNuevoLibro.onsubmit = (e) => {
            e.preventDefault();
            const isbnIngresado = document.getElementById('inputIsbn').value.trim();
            const titulo = document.getElementById('inputTituloLibro').value.trim();
            const autor = document.getElementById('inputAutorLibro').value.trim();
            const categoria = document.getElementById('inputCategoriaLibro').value.trim();
            const portada = inputPortadaBase64.value || '';
            const inv = document.getElementById('inputInventario').value || `INV-${Date.now().toString().slice(-5)}`;

            const nuevaCopia = {
                copiaId: 1,
                titulo: titulo,
                subtitulo: document.getElementById('inputSubtituloLibro').value || '',
                autor: autor,
                categoria: categoria,
                isbn: isbnIngresado,
                inventario: inv,
                ubicacion: document.getElementById('inputUbicacion').value || 'Estante Principal',
                clasificacion: document.getElementById('inputClasificacion').value || '',
                libristica: document.getElementById('inputLibristica').value || '',
                extension: document.getElementById('inputExtension').value || '',
                edicion: document.getElementById('inputEdicion').value || '',
                editorial: document.getElementById('inputEditorial').value || '',
                fecha: document.getElementById('inputFechaPublicacion').value || '',
                lugar: document.getElementById('inputLugarPublicacion').value || '',
                temas: document.getElementById('inputTemas').value || '',
                terminoMateria: document.getElementById('inputTerminoMateria').value || '',
                coleccionPersonal: document.getElementById('inputColeccionPersonal').value || '',
                coleccionInstitucional: document.getElementById('inputColeccionInstitucional').value || '',
                numero: document.getElementById('inputNumero').value || '',
                notaGeneral: document.getElementById('inputNotaGeneral').value || '',
                notaContenido: document.getElementById('inputNotaContenido').value || '',
                estado: 'disponible'
            };

            const libroExistente = books.find(b => b.isbn.toLowerCase() === isbnIngresado.toLowerCase());
            if (libroExistente) {
                nuevaCopia.copiaId = libroExistente.copiasList.length + 1;
                libroExistente.copiasList.push(nuevaCopia);
                if (portada) libroExistente.portada = portada;
                logAction('Libros', 'Nueva Copia Añadida', `Añadida copia #${nuevaCopia.copiaId} (Inv: ${inv}) al título "${titulo}".`, isbnIngresado);
            } else {
                books.push({
                    isbn: isbnIngresado,
                    titulo: titulo,
                    autor: autor,
                    categoria: categoria,
                    portada: portada,
                    copiasList: [nuevaCopia]
                });
                logAction('Libros', 'Alta de Libro', `Añadido nuevo título: "${titulo}" por ${autor} (ISBN: ${isbnIngresado}).`, isbnIngresado);
            }

            saveData();
            renderCatalog();
            updateDashboard();
            closeModal(document.getElementById('modalNuevoLibro'));
        };
    }

    // Duplicar Libro
    function duplicarLibro(b) {
        closeModal(document.getElementById('modalDetalleLibro'));
        document.getElementById('modalLibroTituloHeader').textContent = "Duplicar como Nuevo Libro";
        document.getElementById('editBookOriginalIsbn').value = "";

        const c1 = b.copiasList[0] || {};
        document.getElementById('inputTituloLibro').value = `${b.titulo} (Nuevo)`;
        document.getElementById('inputSubtituloLibro').value = c1.subtitulo || '';
        document.getElementById('inputAutorLibro').value = b.autor;
        document.getElementById('inputCategoriaLibro').value = b.categoria;
        document.getElementById('inputIsbn').value = `${b.isbn}-NUEVO`;
        document.getElementById('inputEdicion').value = c1.edicion || '';
        document.getElementById('inputExtension').value = c1.extension || '';
        document.getElementById('inputLibristica').value = c1.libristica || '';
        document.getElementById('inputInventario').value = `INV-${Math.floor(10000 + Math.random() * 90000)}`;
        document.getElementById('inputUbicacion').value = c1.ubicacion || '';
        document.getElementById('inputClasificacion').value = c1.clasificacion || '';
        document.getElementById('inputEditorial').value = c1.editorial || '';
        document.getElementById('inputFechaPublicacion').value = c1.fecha || '';
        document.getElementById('inputLugarPublicacion').value = c1.lugar || '';
        document.getElementById('inputTemas').value = c1.temas || '';
        document.getElementById('inputTerminoMateria').value = c1.terminoMateria || '';
        document.getElementById('inputColeccionPersonal').value = c1.coleccionPersonal || '';
        document.getElementById('inputColeccionInstitucional').value = c1.coleccionInstitucional || '';
        document.getElementById('inputNotaGeneral').value = c1.notaGeneral || '';
        document.getElementById('inputNotaContenido').value = c1.notaContenido || '';

        if (b.portada) {
            inputPortadaBase64.value = b.portada;
            imgPreview.src = b.portada;
            previewContainer.style.display = 'block';
        }

        openModal(document.getElementById('modalNuevoLibro'));
    }

    // Ficha Detalle: Edición Completa por Pestañas
    let currentViewingBook = null;
    let currentSelectedCopyIndex = 0;

    function showBookDetails(b) {
        currentViewingBook = b;
        currentSelectedCopyIndex = 0;

        const portImg = document.getElementById('detailPortadaImg');
        if (b.portada) {
            portImg.src = b.portada;
            portImg.style.display = 'block';
        } else {
            portImg.style.display = 'none';
        }

        document.getElementById('btnDuplicarLibroModal').onclick = () => duplicarLibro(b);

        renderCopyTabs();
        loadCopyFormData();

        // Historial de préstamos
        const historyBody = document.getElementById('bookHistoryTableBody');
        const noHistoryMsg = document.getElementById('noBookHistoryMessage');
        if (historyBody) {
            historyBody.innerHTML = '';
            const bookLoans = loans.filter(l => l.libro.toLowerCase() === b.titulo.toLowerCase());
            if (bookLoans.length === 0) {
                if (noHistoryMsg) noHistoryMsg.style.display = 'block';
            } else {
                if (noHistoryMsg) noHistoryMsg.style.display = 'none';
                bookLoans.forEach(l => {
                    const st = getLoanStatusInfo(l);
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${escapeHtml(l.id)}</strong></td>
                        <td>${escapeHtml(l.socioNombre)}</td>
                        <td>${escapeHtml(l.fechaPrestamo)}</td>
                        <td>${escapeHtml(l.fechaLimite)}</td>
                        <td><span class="badge ${st.badgeClass}">${st.text}</span> ${st.countdownHtml}</td>
                    `;
                    historyBody.appendChild(tr);
                });
            }
        }

        openModal(document.getElementById('modalDetalleLibro'));
    }

    function renderCopyTabs() {
        const tabsBar = document.getElementById('copiesTabsBar');
        if (!tabsBar || !currentViewingBook) return;

        tabsBar.innerHTML = '';
        currentViewingBook.copiasList.forEach((copia, idx) => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = `chrome-tab ${idx === currentSelectedCopyIndex ? 'active' : ''}`;
            const stateIcon = copia.estado === 'mantenimiento' ? '<i class="fa-solid fa-wrench" style="color:#E65100;"></i>' : '<i class="fa-solid fa-book-bookmark"></i>';
            tab.innerHTML = `${stateIcon} Copia #${copia.copiaId}`;
            tab.onclick = () => {
                currentSelectedCopyIndex = idx;
                renderCopyTabs();
                loadCopyFormData();
            };
            tabsBar.appendChild(tab);
        });

        const btnAddTab = document.createElement('button');
        btnAddTab.type = 'button';
        btnAddTab.className = 'btn-add-copy-tab';
        btnAddTab.title = 'Añadir nueva copia a este libro';
        btnAddTab.innerHTML = '+';
        btnAddTab.onclick = () => {
            const base = currentViewingBook.copiasList[0] || {};
            const newId = currentViewingBook.copiasList.length + 1;
            const newInv = `INV-${Math.floor(10000 + Math.random() * 90000)}`;
            const clonedCopy = {
                ...base,
                copiaId: newId,
                inventario: newInv,
                estado: 'disponible',
                notaGeneral: `Ejemplar #${newId}`,
                notaContenido: 'Nuevo ejemplar agregado al stock.'
            };
            currentViewingBook.copiasList.push(clonedCopy);
            currentSelectedCopyIndex = currentViewingBook.copiasList.length - 1;

            logAction('Libros', 'Nueva Copia Añadida', `Añadida copia #${newId} (${newInv}) al libro "${currentViewingBook.titulo}".`, currentViewingBook.isbn);
            saveData();
            renderCopyTabs();
            loadCopyFormData();
            renderCatalog();
            updateDashboard();
        };
        tabsBar.appendChild(btnAddTab);
    }

    function loadCopyFormData() {
        if (!currentViewingBook) return;
        const c = currentViewingBook.copiasList[currentSelectedCopyIndex];
        if (!c) return;

        document.getElementById('editCopyTitulo').value = c.titulo || currentViewingBook.titulo;
        document.getElementById('editCopySubtitulo').value = c.subtitulo || '';
        document.getElementById('editCopyEstado').value = c.estado || 'disponible';
        document.getElementById('editCopyIsbn').value = c.isbn || currentViewingBook.isbn;
        document.getElementById('editCopyInventario').value = c.inventario || '';
        document.getElementById('editCopyUbicacion').value = c.ubicacion || '';
        document.getElementById('editCopyClasificacion').value = c.clasificacion || '';
        document.getElementById('editCopyLibristica').value = c.libristica || '';
        document.getElementById('editCopyAutor').value = c.autor || currentViewingBook.autor;
        document.getElementById('editCopyEditorial').value = c.editorial || '';
        document.getElementById('editCopyFecha').value = c.fecha || '';
        document.getElementById('editCopyLugar').value = c.lugar || '';
        document.getElementById('editCopyEdicion').value = c.edicion || '';
        document.getElementById('editCopyCategoria').value = c.categoria || currentViewingBook.categoria;
        document.getElementById('editCopyExtension').value = c.extension || '';
        document.getElementById('editCopyTemas').value = c.temas || '';
        document.getElementById('editCopyTerminoMateria').value = c.terminoMateria || '';
        document.getElementById('editCopyColeccionPersonal').value = c.coleccionPersonal || '';
        document.getElementById('editCopyColeccionInstitucional').value = c.coleccionInstitucional || '';
        document.getElementById('editCopyNumero').value = c.numero || '';
        document.getElementById('editCopyNotaGeneral').value = c.notaGeneral || '';
        document.getElementById('editCopyNotaContenido').value = c.notaContenido || '';
    }

    const formEdicionCopia = document.getElementById('formEdicionCopia');
    if (formEdicionCopia) {
        formEdicionCopia.onsubmit = (e) => {
            e.preventDefault();
            if (!currentViewingBook) return;
            const c = currentViewingBook.copiasList[currentSelectedCopyIndex];
            if (!c) return;

            c.titulo = document.getElementById('editCopyTitulo').value;
            c.subtitulo = document.getElementById('editCopySubtitulo').value;
            c.estado = document.getElementById('editCopyEstado').value;
            c.isbn = document.getElementById('editCopyIsbn').value;
            c.inventario = document.getElementById('editCopyInventario').value;
            c.ubicacion = document.getElementById('editCopyUbicacion').value;
            c.clasificacion = document.getElementById('editCopyClasificacion').value;
            c.libristica = document.getElementById('editCopyLibristica').value;
            c.autor = document.getElementById('editCopyAutor').value;
            c.editorial = document.getElementById('editCopyEditorial').value;
            c.fecha = document.getElementById('editCopyFecha').value;
            c.lugar = document.getElementById('editCopyLugar').value;
            c.edicion = document.getElementById('editCopyEdicion').value;
            c.categoria = document.getElementById('editCopyCategoria').value;
            c.extension = document.getElementById('editCopyExtension').value;
            c.temas = document.getElementById('editCopyTemas').value;
            c.terminoMateria = document.getElementById('editCopyTerminoMateria').value;
            c.coleccionPersonal = document.getElementById('editCopyColeccionPersonal').value;
            c.coleccionInstitucional = document.getElementById('editCopyColeccionInstitucional').value;
            c.numero = document.getElementById('editCopyNumero').value;
            c.notaGeneral = document.getElementById('editCopyNotaGeneral').value;
            c.notaContenido = document.getElementById('editCopyNotaContenido').value;

            if (currentSelectedCopyIndex === 0) {
                currentViewingBook.titulo = c.titulo;
                currentViewingBook.autor = c.autor;
                currentViewingBook.categoria = c.categoria;
                currentViewingBook.isbn = c.isbn;
            }

            logAction('Libros', 'Modificación de Copia', `Actualizados datos de la Copia #${c.copiaId} (Inv: ${c.inventario}) del libro "${c.titulo}".`, c.inventario);
            saveData();
            alert(`¡Copia #${c.copiaId} actualizada correctamente!`);
            renderCopyTabs();
            renderCatalog();
            updateDashboard();
        };
    }

    // ==========================================
    // 8. PRÉSTAMOS Y DEVOLUCIONES
    // ==========================================
    let currentLoansFilter = "all";
    function renderLoans() {
        if (!loansTableBody) return;
        loansTableBody.innerHTML = '';
        const filtered = loans.filter(l => currentLoansFilter === "all" || l.estado === currentLoansFilter);

        filtered.forEach(l => {
            const st = getLoanStatusInfo(l);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${escapeHtml(l.id)}</strong></td>
                <td style="font-weight: 600; color: var(--accent-brown);">${escapeHtml(l.libro)}</td>
                <td>${escapeHtml(l.socioNombre)}</td>
                <td>${escapeHtml(l.fechaPrestamo)}</td>
                <td><strong style="color: #721C24;">${escapeHtml(l.fechaLimite)}</strong></td>
                <td><span class="badge ${st.badgeClass}">${st.text}</span> ${st.countdownHtml}</td>
            `;
            loansTableBody.appendChild(row);
        });
        updateDashboard();
    }

    // Autocompletado genérico
    function setupAutocomplete(inputId, listId, data, getLabel, getSub, onSelect) {
        const input = document.getElementById(inputId), list = document.getElementById(listId);
        if (!input || !list) return;
        input.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            list.innerHTML = '';
            if (!term) { list.style.display = 'none'; return; }
            const matches = data().filter(i => getLabel(i).toLowerCase().includes(term) || getSub(i).toLowerCase().includes(term));
            if (matches.length > 0) {
                list.style.display = 'block';
                matches.slice(0, 5).forEach(m => {
                    const d = document.createElement('div'); d.className = 'autocomplete-suggestion-item';
                    d.innerHTML = `<span class="suggestion-main">${escapeHtml(getLabel(m))}</span><span class="suggestion-sub">${escapeHtml(getSub(m))}</span>`;
                    d.onclick = () => { input.value = getLabel(m); list.style.display = 'none'; onSelect(m); };
                    list.appendChild(d);
                });
            } else list.style.display = 'none';
        });
    }

    let selectedSocio = null, selectedBook = null;
    setupAutocomplete('inputLibro', 'autocompleteLibroList', () => books, b => b.titulo, b => `ISBN: ${b.isbn} - Disp: ${getAvailableCopies(b)}`, b => selectedBook = b);
    setupAutocomplete('inputSocio', 'autocompleteSocioList', () => socios, s => `${s.apellido}, ${s.nombre}`, s => `ID: ${s.id} - ${s.tipo}`, s => selectedSocio = s);

    document.querySelectorAll('.btnAbrirNuevoPrestamo').forEach(b => b.onclick = () => {
        selectedSocio = null;
        selectedBook = null;
        openModal(document.getElementById('modalPrestamo'));
    });

    const formNuevoPrestamo = document.getElementById('formNuevoPrestamo');
    if (formNuevoPrestamo) {
        formNuevoPrestamo.onsubmit = (e) => {
            e.preventDefault();
            if (!selectedSocio || !selectedBook) { alert('Selecciona socio y libro sugeridos.'); return; }

            const dispCopy = selectedBook.copiasList.find(c => c.estado === "disponible");
            if (!dispCopy) { alert('No hay copias disponibles de este libro.'); return; }

            const nextId = loans.length > 0 ? parseInt(loans[0].id.replace(/\D/g, '')) + 1 : 1000;
            const now = new Date(), limitDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            const newLoan = {
                id: `#P-${nextId}`,
                libro: selectedBook.titulo,
                socioId: selectedSocio.id,
                socioNombre: `${selectedSocio.apellido}, ${selectedSocio.nombre}`,
                fechaPrestamo: formatDate(now),
                fechaLimite: formatDate(limitDate),
                estado: "prestado"
            };

            loans.unshift(newLoan);
            dispCopy.estado = "prestado";

            logAction('Préstamos', 'Nuevo Préstamo Registrado', `Otorgado préstamo #${newLoan.id} de "${selectedBook.titulo}" a ${newLoan.socioNombre} (Vencimiento: ${newLoan.fechaLimite}).`, newLoan.id);

            saveData();
            renderCatalog();
            renderLoans();
            renderSocios();
            closeModal(document.getElementById('modalPrestamo'));
        };
    }

    // Modal Devolución con Chequeo de Daños
    const selectDev = document.getElementById('selectLibroDevolucion');
    const btnDevolucion = document.getElementById('btnDevolucion');
    const checkDevolucionDano = document.getElementById('checkDevolucionDano');
    const panelDetalleDanoDevolucion = document.getElementById('panelDetalleDanoDevolucion');

    if (checkDevolucionDano && panelDetalleDanoDevolucion) {
        checkDevolucionDano.onchange = (e) => {
            panelDetalleDanoDevolucion.style.display = e.target.checked ? 'block' : 'none';
        };
    }

    if (btnDevolucion) {
        btnDevolucion.onclick = () => {
            selectDev.innerHTML = '';
            const actives = loans.filter(l => l.estado !== "devuelto");
            if (actives.length === 0) { alert('No hay préstamos activos pendientes de devolución.'); return; }
            actives.forEach(l => {
                const o = document.createElement('option');
                o.value = l.id;
                o.textContent = `${l.libro} — [Socio: ${l.socioNombre}] (${l.id})`;
                selectDev.appendChild(o);
            });
            if (checkDevolucionDano) checkDevolucionDano.checked = false;
            if (panelDetalleDanoDevolucion) panelDetalleDanoDevolucion.style.display = 'none';
            openModal(document.getElementById('modalDevolucion'));
        };
    }

    const formDevolucion = document.getElementById('formDevolucion');
    if (formDevolucion) {
        formDevolucion.onsubmit = (e) => {
            e.preventDefault();
            const loan = loans.find(lx => lx.id === selectDev.value);
            if (!loan) return;

            loan.estado = "devuelto";
            const book = books.find(bx => bx.titulo.toLowerCase() === loan.libro.toLowerCase());
            let copy = null;
            if (book) {
                copy = book.copiasList.find(c => c.estado === "prestado") || book.copiasList[0];
            }

            const presentsDamage = checkDevolucionDano && checkDevolucionDano.checked;
            if (presentsDamage) {
                const nivel = document.getElementById('selectNivelDanoDevolucion').value;
                const desc = document.getElementById('inputDescripcionDanoDevolucion').value.trim() || 'Daño reportado durante la entrega.';
                const accion = document.getElementById('selectAccionCopiaDevolucion').value;

                if (copy) {
                    copy.estado = (accion === 'mantenimiento') ? 'mantenimiento' : 'disponible';
                }

                registerDamage({
                    bookTitle: loan.libro,
                    isbn: book ? book.isbn : '',
                    inventario: copy ? copy.inventario : '',
                    copiaId: copy ? copy.copiaId : 1,
                    socioId: loan.socioId,
                    socioNombre: loan.socioNombre,
                    damageLevel: nivel,
                    description: desc,
                    accionCopia: accion
                });

                logAction('Préstamos', 'Devolución con Daño Registrado', `Devolución de "${loan.libro}" por ${loan.socioNombre} con reporte de [${nivel}].`, loan.id);
            } else {
                if (copy) copy.estado = "disponible";
                logAction('Préstamos', 'Devolución Conforme', `Devolución de "${loan.libro}" por ${loan.socioNombre} en óptimas condiciones.`, loan.id);
            }

            saveData();
            renderCatalog();
            renderLoans();
            renderSocios();
            renderDamageLogs();
            closeModal(document.getElementById('modalDevolucion'));
        };
    }

    // Modal Registrar Daño Manual Directo
    let selectedDanoBook = null, selectedDanoSocio = null;
    const btnAbrirModalNuevoDano = document.getElementById('btnAbrirModalNuevoDano');
    const modalNuevoDano = document.getElementById('modalNuevoDano');
    const groupDanoCopia = document.getElementById('groupDanoCopia');
    const selectDanoCopia = document.getElementById('selectDanoCopia');

    if (btnAbrirModalNuevoDano) {
        btnAbrirModalNuevoDano.onclick = () => {
            selectedDanoBook = null;
            selectedDanoSocio = null;
            if (groupDanoCopia) groupDanoCopia.style.display = 'none';
            openModal(modalNuevoDano);
        };
    }

    setupAutocomplete('inputDanoLibro', 'autocompleteDanoLibroList', () => books, b => b.titulo, b => `ISBN: ${b.isbn} - Copias: ${b.copiasList.length}`, b => {
        selectedDanoBook = b;
        if (selectDanoCopia && groupDanoCopia) {
            selectDanoCopia.innerHTML = '';
            b.copiasList.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.inventario;
                opt.textContent = `Copia #${c.copiaId} (Inv: ${c.inventario}) - Ubicación: ${c.ubicacion} [${c.estado}]`;
                selectDanoCopia.appendChild(opt);
            });
            groupDanoCopia.style.display = 'block';
        }
    });

    setupAutocomplete('inputDanoSocio', 'autocompleteDanoSocioList', () => socios, s => `${s.apellido}, ${s.nombre}`, s => `ID: ${s.id} - ${s.tipo} (${s.anio})`, s => {
        selectedDanoSocio = s;
    });

    const formNuevoDano = document.getElementById('formNuevoDano');
    if (formNuevoDano) {
        formNuevoDano.onsubmit = (e) => {
            e.preventDefault();
            if (!selectedDanoBook || !selectedDanoSocio) {
                alert('Por favor selecciona un libro y un socio válidos usando los desplegables.');
                return;
            }

            const chosenInv = selectDanoCopia ? selectDanoCopia.value : '';
            const chosenCopy = selectedDanoBook.copiasList.find(c => c.inventario === chosenInv) || selectedDanoBook.copiasList[0];
            const nivel = document.getElementById('selectNivelDanoDirecto').value;
            const desc = document.getElementById('inputDescripcionDanoDirecto').value.trim();
            const accion = document.getElementById('selectAccionCopiaDirecto').value;

            registerDamage({
                bookTitle: selectedDanoBook.titulo,
                isbn: selectedDanoBook.isbn,
                inventario: chosenCopy ? chosenCopy.inventario : '',
                copiaId: chosenCopy ? chosenCopy.copiaId : 1,
                socioId: selectedDanoSocio.id,
                socioNombre: `${selectedDanoSocio.apellido}, ${selectedDanoSocio.nombre}`,
                damageLevel: nivel,
                description: desc,
                accionCopia: accion
            });

            alert(`¡Incidencia de daño registrada correctamente con nivel: ${nivel}!`);
            closeModal(modalNuevoDano);
        };
    }

    // ==========================================
    // 9. GESTIÓN DE SOCIOS / ALUMNOS
    // ==========================================
    function getSocioDamageSummary(socioId) {
        const damages = damageRecords.filter(d => d.socioId === socioId);
        if (damages.length === 0) {
            return `<span class="damage-infractions-badge damage-infractions--clean"><i class="fa-solid fa-check"></i> Sin daños</span>`;
        }
        const hasCatastrophic = damages.some(d => d.nivel === 'CATASTROFICO!');
        const hasModerate = damages.some(d => d.nivel === 'Daño moderado');
        const badgeClass = hasCatastrophic ? 'damage-infractions--danger' : (hasModerate ? 'damage-infractions--warn' : 'damage-infractions--warn');
        const maxLevel = hasCatastrophic ? 'CATASTRÓFICO!' : (hasModerate ? 'Moderado' : 'Leve');

        return `<span class="damage-infractions-badge ${badgeClass}" title="${damages.length} daño(s) registrado(s)"><i class="fa-solid fa-triangle-exclamation"></i> ${damages.length} (${maxLevel})</span>`;
    }

    function renderSocios() {
        if (!sociosTableBody) return;
        sociosTableBody.innerHTML = '';
        socios.forEach(s => {
            const activeCount = loans.filter(l => l.socioId === s.id && (l.estado === "prestado" || l.estado === "moroso")).length;
            const limit = s.tipo === "docente" ? 3 : 1;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${escapeHtml(s.id)}</strong></td>
                <td><strong>${escapeHtml(s.apellido)}, ${escapeHtml(s.nombre)}</strong></td>
                <td style="text-transform:capitalize;">${escapeHtml(s.tipo)}</td>
                <td>${escapeHtml(s.anio)} / ${escapeHtml(s.turno)}</td>
                <td>${escapeHtml(s.email)}</td>
                <td><strong>${activeCount} / ${limit}</strong></td>
                <td>${getSocioDamageSummary(s.id)}</td>
                <td><span class="badge badge-available">Activo</span></td>
                <td>
                    <button class="btn-secondary btnEliminarSocio" data-id="${s.id}" style="color:#721C24; padding: 0.35rem 0.6rem;" title="Eliminar Socio">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            sociosTableBody.appendChild(row);
        });

        document.querySelectorAll('.btnEliminarSocio').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.currentTarget.dataset.id;
                const socioObj = socios.find(s => s.id === id);
                if (confirm(`¿Estás seguro de eliminar al socio ${socioObj ? socioObj.nombre + ' ' + socioObj.apellido : id}?`)) {
                    socios = socios.filter(s => s.id !== id);
                    logAction('Socios', 'Baja de Socio', `Eliminado socio ${socioObj ? socioObj.apellido + ', ' + socioObj.nombre : id} del sistema.`, id);
                    saveData();
                    renderSocios();
                }
            };
        });
        updateDashboard();
    }

    document.querySelectorAll('.btnAbrirNuevoSocio').forEach(b => b.onclick = () => openModal(document.getElementById('modalSocio')));

    const formNuevoSocio = document.getElementById('formNuevoSocio');
    if (formNuevoSocio) {
        formNuevoSocio.onsubmit = (e) => {
            e.preventDefault();
            const id = `SOC-${socios.length > 0 ? parseInt(socios[socios.length - 1].id.split('-')[1]) + 1 : 1001}`;
            const ap = document.getElementById('inputSocioApellido').value.trim();
            const nom = document.getElementById('inputSocioNombre').value.trim();
            const tip = document.getElementById('selectSocioTipo').value;
            const ani = document.getElementById('inputSocioAnio').value.trim() || '-';
            const tur = document.getElementById('inputSocioTurno').value.trim() || '-';
            const em = document.getElementById('inputSocioEmail').value.trim();

            socios.push({
                id,
                apellido: ap,
                nombre: nom,
                tipo: tip,
                anio: ani,
                turno: tur,
                email: em,
                estado: "activo"
            });

            logAction('Socios', 'Alta de Socio', `Registrado nuevo socio: ${ap}, ${nom} (${tip}) con ID ${id}.`, id);

            saveData();
            renderSocios();
            closeModal(document.getElementById('modalSocio'));
        };
    }

    // Filtros de préstamos
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentLoansFilter = e.currentTarget.dataset.filter;
            renderLoans();
        };
    });

    // ==========================================
    // 10. REPORTES Y ESTADÍSTICAS
    // ==========================================
    function renderReports() {
        const monthSelect = document.getElementById('selectReportMonth');
        const selectedPeriod = monthSelect ? monthSelect.value : '08-2026';

        const periodLoans = selectedPeriod === 'all'
            ? loans
            : loans.filter(l => getLoanMonthKey(l.fechaPrestamo) === selectedPeriod);

        const totalPrestamos = periodLoans.length;
        const uniqueBooks = new Set(periodLoans.map(l => l.libro.toLowerCase()));
        const repTotalPrestamosMes = document.getElementById('repTotalPrestamosMes');
        const repLibrosCirculacion = document.getElementById('repLibrosCirculacion');
        const repPrestamosActivos = document.getElementById('repPrestamosActivos');
        const repPrestamosDevueltos = document.getElementById('repPrestamosDevueltos');

        if (repTotalPrestamosMes) repTotalPrestamosMes.textContent = totalPrestamos;
        if (repLibrosCirculacion) repLibrosCirculacion.textContent = uniqueBooks.size;
        if (repPrestamosActivos) repPrestamosActivos.textContent = periodLoans.filter(l => l.estado === 'prestado' || l.estado === 'moroso').length;
        if (repPrestamosDevueltos) repPrestamosDevueltos.textContent = periodLoans.filter(l => l.estado === 'devuelto').length;

        const bookCounts = {};
        periodLoans.forEach(l => { bookCounts[l.libro] = (bookCounts[l.libro] || 0) + 1; });
        const sortedBooks = Object.entries(bookCounts).sort((a, b) => b[1] - a[1]);
        const maxCount = sortedBooks.length > 0 ? sortedBooks[0][1] : 1;

        const topLibrosContainer = document.getElementById('repTopLibrosContainer');
        if (topLibrosContainer) {
            topLibrosContainer.innerHTML = sortedBooks.length === 0
                ? '<p style="color:var(--text-muted);font-size:0.9rem;">Sin datos en este período.</p>'
                : sortedBooks.slice(0, 5).map(([title, count]) => {
                    const pct = Math.round((count / maxCount) * 100);
                    return `<div class="bar-item"><div class="bar-label"><span>${escapeHtml(title)}</span><span>${count}</span></div><div class="bar-track"><div class="bar-fill" style="--bar-width: ${pct}%;"></div></div></div>`;
                }).join('');
        }

        const repTableBody = document.getElementById('repTableBody');
        if (repTableBody) {
            repTableBody.innerHTML = '';
            periodLoans.forEach(l => {
                const st = getLoanStatusInfo(l);
                const tr = document.createElement('tr');
                tr.innerHTML = `<td><strong>${escapeHtml(l.id)}</strong></td><td>${escapeHtml(l.libro)}</td><td>${escapeHtml(l.socioNombre)}</td><td>${escapeHtml(l.fechaPrestamo)}</td><td>${escapeHtml(l.fechaLimite)}</td><td><span class="badge ${st.badgeClass}">${st.text}</span> ${st.countdownHtml}</td>`;
                repTableBody.appendChild(tr);
            });
        }
    }

    const selectReportMonth = document.getElementById('selectReportMonth');
    if (selectReportMonth) selectReportMonth.addEventListener('change', renderReports);

    // Inicialización general
    renderCatalog();
    renderLoans();
    renderSocios();
    renderDamageLogs();
    renderAuditLogs();
    renderReports();
    updateDashboard();
});