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

    // ===== GLOBAL ALERT OVERRIDE (transforme tous les alert() en toast) =====
    const nexusOriginalAlert = window.alert;
    window.alert = function(message){
        const msg = String(message);
        let type = "info";
        if(/erreur|error/i.test(msg)) type = "error";
        else if(/succes|reussi|effectue|approuve|confirme|cree|ajoute|envoye|soumis/i.test(msg)) type = "success";
        else if(/attention|avertissement|insuffisant/i.test(msg)) type = "warning";
        window.nexusToast(msg, type);
    };

    // ===== SOUND ENGINE (Web Audio API - aucun fichier externe) =====
    let nexusAudioCtx = null;
    function getAudioCtx(){
        if(!nexusAudioCtx){
            const AC = window.AudioContext || window.webkitAudioContext;
            nexusAudioCtx = new AC();
        }
        if(nexusAudioCtx.state === "suspended") nexusAudioCtx.resume();
        return nexusAudioCtx;
    }

    function playTone(freq, duration, type, delay, volume){
        try{
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || "sine";
            osc.frequency.value = freq;
            const startTime = ctx.currentTime + (delay || 0);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(volume || 0.15, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration + 0.05);
        }catch(e){}
    }

    const NEXUS_SOUNDS = {
        success: () => { playTone(660,0.12,"sine",0,0.15); playTone(880,0.16,"sine",0.1,0.15); },
        error: () => { playTone(300,0.18,"sawtooth",0,0.12); playTone(220,0.22,"sawtooth",0.12,0.12); },
        warning: () => { playTone(500,0.14,"triangle",0,0.13); playTone(400,0.14,"triangle",0.15,0.13); },
        notification: () => { playTone(740,0.1,"sine",0,0.12); },
        ding: () => { playTone(988,0.25,"sine",0,0.14); },
        alarm: () => { playTone(880,0.18,"square",0,0.18); playTone(660,0.18,"square",0.2,0.18); },
        approved: () => { playTone(523,0.1,"sine",0,0.15); playTone(659,0.1,"sine",0.1,0.15); playTone(784,0.2,"sine",0.2,0.15); },
        rejected: () => { playTone(392,0.2,"sawtooth",0,0.13); playTone(311,0.25,"sawtooth",0.15,0.13); },
        wrongnumber: () => { playTone(600,0.1,"triangle",0,0.14); playTone(600,0.1,"triangle",0.15,0.14); playTone(600,0.1,"triangle",0.3,0.14); }
    };

    window.nexusPlaySound = function(type){
        const fn = NEXUS_SOUNDS[type] || NEXUS_SOUNDS.notification;
        fn();
    };

    let nexusAlarmInterval = null;
    window.nexusStartAlarmLoop = function(){
        if(nexusAlarmInterval) return;
        window.nexusPlaySound("alarm");
        nexusAlarmInterval = setInterval(() => window.nexusPlaySound("alarm"), 1800);
    };
    window.nexusStopAlarmLoop = function(){
        if(nexusAlarmInterval){ clearInterval(nexusAlarmInterval); nexusAlarmInterval = null; }
    };

    // Debloque le contexte audio au premier clic (requis par les navigateurs)
    document.addEventListener("click", function unlockAudio(){
        try{ getAudioCtx(); }catch(e){}
        document.removeEventListener("click", unlockAudio);
    }, { once:true });

    // ===== LIVE TICKER (Pouls du Systeme - effet visuel uniquement) =====
    const NEXUS_TICKER_SYMBOLS = ["Σ","%","√","Δ","π","∞","∑","÷","≈","∫"];
    const NEXUS_TICKER_CURRENCIES = ["HTG","DOP","USD"];

    function nexusRandomTickerItem(){
        const roll = Math.random();
        const isUp = Math.random() > 0.45;
        const arrow = isUp ? "▲" : "▼";
        const cssClass = isUp ? "nexus-ticker-up" : "nexus-ticker-down";

        if(roll < 0.4){
            const amount = (Math.random()*9000 + 50).toFixed(2);
            const curr = NEXUS_TICKER_CURRENCIES[Math.floor(Math.random()*NEXUS_TICKER_CURRENCIES.length)];
            return `<span class="nexus-ticker-item ${cssClass}">${arrow} ${Number(amount).toLocaleString("fr-FR",{minimumFractionDigits:2})} ${curr}</span>`;
        } else if(roll < 0.7){
            const pct = (Math.random()*12).toFixed(2);
            return `<span class="nexus-ticker-item ${cssClass}">${arrow} ${pct}%</span>`;
        } else {
            const sym = NEXUS_TICKER_SYMBOLS[Math.floor(Math.random()*NEXUS_TICKER_SYMBOLS.length)];
            const val = (Math.random()*100).toFixed(1);
            return `<span class="nexus-ticker-item nexus-ticker-neutral">${sym} = ${val}</span>`;
        }
    }

    function nexusBuildTickerContent(){
        let html = "";
        for(let i=0;i<24;i++){
            html += nexusRandomTickerItem();
        }
        return html;
    }

    function nexusInitLiveTicker(){
        const track = document.getElementById("nexusLiveTickerTrack");
        if(!track || track.dataset.nexusInit) return;
        track.dataset.nexusInit = "1";
        const content = nexusBuildTickerContent();
        track.innerHTML = content + content;

        setInterval(() => {
            if(Math.random() > 0.5){
                const items = track.querySelectorAll(".nexus-ticker-item");
                if(items.length > 4){
                    const idx = Math.floor(Math.random() * (items.length/2));
                    items[idx].outerHTML = nexusRandomTickerItem();
                }
            }
        }, 900);
    }

    // ===== INIT =====
    document.addEventListener("DOMContentLoaded", () => {
        setupSidebarCollapse();
        setupSessionBadge();
        setTimeout(autoAnimateKpis, 400);
        setTimeout(nexusInitLiveTicker, 400);

        const observer = new MutationObserver(() => {
            clearTimeout(window._nexusKpiTimer);
            window._nexusKpiTimer = setTimeout(autoAnimateKpis, 300);
            nexusInitLiveTicker();
        });
        observer.observe(document.body, { childList:true, subtree:true });
    });

})();