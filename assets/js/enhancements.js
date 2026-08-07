(function(){

    // ===== TOAST NOTIFICATIONS =====
    function ensureToastContainer(){
        let c = document.getElementById("nexusToastContainer");
        if(!c){
            c = document.createElement("div");
            c.id = "nexusToastContainer";
            document.body.appendChild(c);
        }
        return c;
    }

    window.nexusToast = function(message, type){
        type = type || "info";
        const icons = { success:"✅", error:"❌", warning:"⚠️", info:"ℹ️" };
        const container = ensureToastContainer();
        const toast = document.createElement("div");
        toast.className = "nexus-toast " + type;
        toast.innerHTML = `
            <div class="nexus-toast-icon">${icons[type]||icons.info}</div>
            <div class="nexus-toast-text">${message}</div>
            <div class="nexus-toast-close">✕</div>
        `;
        toast.querySelector(".nexus-toast-close").onclick = () => removeToast(toast);
        container.appendChild(toast);
        setTimeout(() => removeToast(toast), 5000);
    };

    function removeToast(toast){
        if(!toast || !toast.parentNode) return;
        toast.classList.add("closing");
        setTimeout(() => toast.remove(), 250);
    }

    // ===== CONFIRM MODAL =====
    function ensureConfirmModal(){
        if(document.getElementById("nexusConfirmOverlay")) return;
        const overlay = document.createElement("div");
        overlay.id = "nexusConfirmOverlay";
        overlay.innerHTML = `
            <div id="nexusConfirmBox">
                <h3 id="nexusConfirmTitle">Confirmer</h3>
                <p id="nexusConfirmMsg"></p>
                <div class="nexus-confirm-actions">
                    <button id="nexusConfirmCancel">Annuler</button>
                    <button id="nexusConfirmOk">Confirmer</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    window.nexusConfirm = function(message, title){
        ensureConfirmModal();
        return new Promise((resolve) => {
            const overlay = document.getElementById("nexusConfirmOverlay");
            document.getElementById("nexusConfirmTitle").textContent = title || "Confirmer";
            document.getElementById("nexusConfirmMsg").textContent = message;
            overlay.style.display = "flex";

            const okBtn = document.getElementById("nexusConfirmOk");
            const cancelBtn = document.getElementById("nexusConfirmCancel");

            const cleanup = (result) => {
                overlay.style.display = "none";
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                resolve(result);
            };

            okBtn.onclick = () => cleanup(true);
            cancelBtn.onclick = () => cleanup(false);
        });
    };

    // ===== KPI ANIMATED COUNTER =====
    window.nexusAnimateNumber = function(el, endValue, opts){
        if(!el) return;
        opts = opts || {};
        const duration = opts.duration || 900;
        const decimals = opts.decimals || 0;
        const prefix = opts.prefix || "";
        const suffix = opts.suffix || "";
        const startValue = 0;
        const startTime = performance.now();

        function frame(now){
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * eased;
            el.textContent = prefix + current.toLocaleString("fr-FR",{minimumFractionDigits:decimals,maximumFractionDigits:decimals}) + suffix;
            if(progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    };

    function autoAnimateKpis(){
        document.querySelectorAll(".kpi-number, .stat-number").forEach(el => {
            if(el.dataset.nexusAnimated) return;
            const raw = el.textContent.trim();
            const num = parseFloat(raw.replace(/[^\d.,-]/g,"").replace(",", "."));
            if(isNaN(num)) return;
            el.dataset.nexusAnimated = "1";
            el.classList.add("nexus-kpi-animated");
            const decimals = raw.includes(",") || raw.includes(".") ? 2 : 0;
            window.nexusAnimateNumber(el, num, { decimals: decimals });
        });
    }

    // ===== SIDEBAR COLLAPSE =====
    function setupSidebarCollapse(){
        const sidebar = document.querySelector(".sidebar");
        if(!sidebar || document.getElementById("nexusCollapseBtn")) return;

        const btn = document.createElement("button");
        btn.id = "nexusCollapseBtn";
        btn.innerHTML = "«";
        btn.title = "Reduire le menu";
        sidebar.appendChild(btn);

        const saved = localStorage.getItem("nexus_sidebar_collapsed") === "1";
        if(saved){ sidebar.classList.add("nexus-collapsed"); btn.innerHTML = "»"; }

        btn.onclick = () => {
            sidebar.classList.toggle("nexus-collapsed");
            const isCollapsed = sidebar.classList.contains("nexus-collapsed");
            btn.innerHTML = isCollapsed ? "»" : "«";
            localStorage.setItem("nexus_sidebar_collapsed", isCollapsed ? "1" : "0");
        };
    }

    // ===== SESSION BADGE (visuel, non fonctionnel de deconnexion auto) =====
    function setupSessionBadge(){
        const topbarRight = document.querySelector(".topbar-right");
        if(!topbarRight || document.getElementById("nexusSessionBadge")) return;
        const badge = document.createElement("div");
        badge.id = "nexusSessionBadge";
        badge.innerHTML = `<span class="nexus-session-dot"></span> Session securisee`;
        topbarRight.insertBefore(badge, topbarRight.firstChild);
    }

    // ===== INIT =====
    document.addEventListener("DOMContentLoaded", () => {
        setupSidebarCollapse();
        setupSessionBadge();
        setTimeout(autoAnimateKpis, 400);

        const observer = new MutationObserver(() => {
            clearTimeout(window._nexusKpiTimer);
            window._nexusKpiTimer = setTimeout(autoAnimateKpis, 300);
        });
        observer.observe(document.body, { childList:true, subtree:true });
    });

})();