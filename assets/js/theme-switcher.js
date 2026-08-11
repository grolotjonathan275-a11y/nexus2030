(function(){
    const THEMES = [
        { id: "simple", label: "Simple", icon: "◻️" },
        { id: "pro", label: "Pro", icon: "💼" },
        { id: "premium", label: "Premium", icon: "👑" },
        { id: "claire", label: "Claire", icon: "☀️" },
        { id: "sombre", label: "Sombre", icon: "🌙" },
        { id: "arcenciel", label: "Arc-en-ciel", icon: "🌈" },
        { id: "led", label: "Lumiere LED", icon: "💡" },
        { id: "natcash", label: "NatCash", icon: "🟠" },
        { id: "trading", label: "Trading Pro", icon: "📈" },
        { id: "gridmod", label: "Grid Moderne", icon: "🔷" }
    ];
    const EFFECTS = [
        { id: "none", label: "Aucun", icon: "🚫" },
        { id: "particules", label: "Particules", icon: "✨" },
        { id: "degrade", label: "Degrade anime", icon: "🎨" },
        { id: "vagues", label: "Vagues", icon: "🌊" },
        { id: "etoiles", label: "Etoiles", icon: "⭐" },
        { id: "brand", label: "Nexus Casa de Cambio", icon: "🏷️" }
    ];

    let currentEffectCleanup = null;

    function applyTheme(themeId){
        document.documentElement.setAttribute("data-theme", themeId);
        localStorage.setItem("nexus_theme", themeId);
    }

    function clearEffect(){
        document.body.classList.remove("nexus-effect-degrade","nexus-effect-vagues");
        document.querySelectorAll(".nexus-brand-float").forEach(el => el.remove());
        document.querySelectorAll(".nexus-particle, .nexus-star").forEach(el => el.remove());
        if(currentEffectCleanup){ clearInterval(currentEffectCleanup); currentEffectCleanup = null; }
    }

    function applyEffect(effectId){
        clearEffect();
        localStorage.setItem("nexus_effect", effectId);

        if(effectId === "degrade"){
            document.body.classList.add("nexus-effect-degrade");
        } else if(effectId === "vagues"){
            document.body.classList.add("nexus-effect-vagues");
        } else if(effectId === "particules"){
            for(let i=0;i<25;i++){
                const p = document.createElement("div");
                p.className = "nexus-particle";
                const size = 4 + Math.random()*8;
                p.style.width = size+"px";
                p.style.height = size+"px";
                p.style.left = Math.random()*100+"vw";
                p.style.top = Math.random()*100+"vh";
                p.style.background = ["#7C3AED","#0EA5E9","#10B981","#F59E0B"][Math.floor(Math.random()*4)];
                p.style.animationDuration = (4+Math.random()*4)+"s";
                p.style.animationDelay = (Math.random()*4)+"s";
                document.body.appendChild(p);
            }
        } else if(effectId === "etoiles"){
            for(let i=0;i<40;i++){
                const s = document.createElement("div");
                s.className = "nexus-star";
                const size = 2 + Math.random()*3;
                s.style.width = size+"px";
                s.style.height = size+"px";
                s.style.left = Math.random()*100+"vw";
                s.style.top = Math.random()*100+"vh";
                s.style.animationDelay = (Math.random()*2.5)+"s";
                document.body.appendChild(s);
            }
        } else if(effectId === "brand"){
            for(let i=0;i<10;i++){
                const b = document.createElement("div");
                b.className = "nexus-brand-float";
                b.textContent = "NEXUS CASA DE CAMBIO";
                const size = 0.9 + Math.random()*1.6;
                b.style.fontSize = size+"rem";
                b.style.left = Math.random()*80+"vw";
                b.style.top = Math.random()*90+"vh";
                b.style.animationDuration = (7+Math.random()*5)+"s";
                b.style.animationDelay = (Math.random()*4)+"s";
                document.body.appendChild(b);
            }
        }
    }

    function buildPanel(){
        const btn = document.createElement("button");
        btn.id = "nexusThemeBtn";
        btn.innerHTML = "🎨";
        btn.style.cssText = "position:fixed;bottom:20px;right:20px;width:52px;height:52px;border-radius:50%;background:#7C3AED;color:#fff;border:none;font-size:1.4rem;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.3);z-index:99999;";

        const panel = document.createElement("div");
        panel.id = "nexusThemePanel";
        panel.style.cssText = "position:fixed;bottom:82px;right:20px;width:260px;max-height:70vh;overflow-y:auto;background:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,0.25);z-index:99999;display:none;padding:1rem;font-family:Arial,sans-serif;";

        function renderPanelContent(){
            const currentTheme = localStorage.getItem("nexus_theme") || "simple";
            const currentEffect = localStorage.getItem("nexus_effect") || "none";
            panel.innerHTML = `
                <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.5rem;color:#0F172A">🎨 Theme</div>
                <div id="nexusThemeList" style="display:flex;flex-direction:column;gap:0.35rem;margin-bottom:1rem"></div>
                <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.5rem;color:#0F172A">✨ Effet d'ecran</div>
                <div id="nexusEffectList" style="display:flex;flex-direction:column;gap:0.35rem"></div>
            `;
            const themeList = panel.querySelector("#nexusThemeList");
            THEMES.forEach(t => {
                const item = document.createElement("button");
                item.textContent = t.icon + " " + t.label;
                item.style.cssText = "text-align:left;padding:0.5rem 0.7rem;border-radius:8px;border:1px solid " + (t.id===currentTheme?"#7C3AED":"#E2E8F0") + ";background:" + (t.id===currentTheme?"#F5F3FF":"#fff") + ";color:#0F172A;cursor:pointer;font-size:0.85rem;font-family:inherit;";
                item.onclick = () => { applyTheme(t.id); renderPanelContent(); };
                themeList.appendChild(item);
            });
            const effectList = panel.querySelector("#nexusEffectList");
            EFFECTS.forEach(e => {
                const item = document.createElement("button");
                item.textContent = e.icon + " " + e.label;
                item.style.cssText = "text-align:left;padding:0.5rem 0.7rem;border-radius:8px;border:1px solid " + (e.id===currentEffect?"#7C3AED":"#E2E8F0") + ";background:" + (e.id===currentEffect?"#F5F3FF":"#fff") + ";color:#0F172A;cursor:pointer;font-size:0.85rem;font-family:inherit;";
                item.onclick = () => { applyEffect(e.id); renderPanelContent(); };
                effectList.appendChild(item);
            });
        }

        btn.onclick = () => {
            panel.style.display = panel.style.display === "none" ? "block" : "none";
            if(panel.style.display === "block") renderPanelContent();
        };

        document.addEventListener("click", (e) => {
            if(!panel.contains(e.target) && e.target !== btn){
                panel.style.display = "none";
            }
        });

        document.body.appendChild(btn);
        document.body.appendChild(panel);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const savedTheme = localStorage.getItem("nexus_theme") || "simple";
        const savedEffect = localStorage.getItem("nexus_effect") || "none";
        applyTheme(savedTheme);
        applyEffect(savedEffect);
        buildPanel();
    });
})();