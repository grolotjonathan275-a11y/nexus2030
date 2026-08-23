(function(){
    // ===== CONFIGURATION =====
    const BIRTHDAY_PERSON_ID = "67c85d72-8c15-4ef1-8b21-37994f654043"; // Bertin Noël
    const BIRTHDAY_PERSON_NAME = "Bertin Noël";
    const END_TIME_UTC = new Date("2026-08-24T15:00:00Z"); // 11:00 AM New York (EDT, UTC-4)
    const REPEAT_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
    const NEXUS_BDAY_SUPA_URL = "https://fnuplvbiwfvauwkpxsoc.supabase.co";
    const NEXUS_BDAY_SUPA_KEY = "sb_publishable_QBqdKkpcjDS3_psUdmc4uA_sMCzLqLo";

    function isWithinCampaign(){
        return new Date() < END_TIME_UTC;
    }

    function injectStyles(){
        if(document.getElementById("nexusBdayStyles")) return;
        const style = document.createElement("style");
        style.id = "nexusBdayStyles";
        style.textContent = `
        #nexusBdayOverlay{position:fixed;inset:0;background:rgba(8,20,64,0.72);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1.25rem;animation:nexusBdayFadeIn 0.4s ease;}
        @keyframes nexusBdayFadeIn{from{opacity:0}to{opacity:1}}
        #nexusBdayCard{background:linear-gradient(160deg,#fff,#FFF7ED);border-radius:24px;max-width:440px;width:100%;padding:2rem 1.75rem;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,0.35);border:3px solid #FF7A20;position:relative;overflow:hidden;font-family:'Inter',Arial,sans-serif;}
        #nexusBdayCard.special{border-color:#FFD700;background:linear-gradient(160deg,#fff,#FFF9E6);}
        .nexus-bday-emoji{font-size:3.2rem;margin-bottom:0.5rem;animation:nexusBdayBounce 1.2s ease infinite;}
        @keyframes nexusBdayBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .nexus-bday-title{font-size:1.35rem;font-weight:900;color:#081440;margin-bottom:0.5rem;line-height:1.3;}
        .nexus-bday-name{color:#FF7A20;}
        .nexus-bday-msg{font-size:0.92rem;color:#374151;line-height:1.6;margin-bottom:1.5rem;}
        #nexusBdayOkBtn{background:linear-gradient(135deg,#FF7A20,#EA580C);color:#fff;border:none;padding:0.9rem 2.5rem;border-radius:100px;font-weight:800;font-size:1.05rem;cursor:pointer;box-shadow:0 8px 24px rgba(255,122,32,0.4);transition:transform 0.15s ease;}
        #nexusBdayOkBtn:active{transform:scale(0.95);}
        .nexus-confetti{position:absolute;top:-20px;width:8px;height:14px;opacity:0.9;animation:nexusConfettiFall linear forwards;}
        @keyframes nexusConfettiFall{to{transform:translateY(480px) rotate(540deg);opacity:0;}}
        `;
        document.head.appendChild(style);
    }

    function spawnConfetti(container){
        const colors = ["#FF7A20","#FFD700","#22C55E","#3B82F6","#EC4899","#081440"];
        for(let i=0; i<40; i++){
            const c = document.createElement("div");
            c.className = "nexus-confetti";
            c.style.left = Math.random()*100 + "%";
            c.style.background = colors[Math.floor(Math.random()*colors.length)];
            c.style.animationDuration = (2 + Math.random()*2) + "s";
            c.style.animationDelay = (Math.random()*0.6) + "s";
            container.appendChild(c);
        }
    }

    function playHappyBirthdayTune(durationSec){
        try{
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            // Notes de "Happy Birthday" (melodie simplifiee)
            const notes = [
                {f:392,d:0.35},{f:392,d:0.2},{f:440,d:0.55},{f:392,d:0.55},{f:523,d:0.55},{f:494,d:1.0},
                {f:392,d:0.35},{f:392,d:0.2},{f:440,d:0.55},{f:392,d:0.55},{f:587,d:0.55},{f:523,d:1.0},
                {f:392,d:0.35},{f:392,d:0.2},{f:784,d:0.55},{f:659,d:0.55},{f:523,d:0.55},{f:494,d:0.55},{f:440,d:1.0},
                {f:698,d:0.35},{f:698,d:0.2},{f:659,d:0.55},{f:523,d:0.55},{f:587,d:0.55},{f:523,d:1.2}
            ];
            let t = ctx.currentTime + 0.1;
            const totalDur = notes.reduce((s,n)=>s+n.d,0);
            const loops = Math.max(1, Math.ceil(durationSec / totalDur));
            for(let loop=0; loop<loops; loop++){
                for(const n of notes){
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "sine";
                    osc.frequency.value = n.f;
                    gain.gain.setValueAtTime(0.0001, t);
                    gain.gain.exponentialRampToValueAtTime(0.25, t+0.05);
                    gain.gain.exponentialRampToValueAtTime(0.0001, t+n.d*0.9);
                    osc.connect(gain).connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + n.d);
                    t += n.d;
                }
            }
            setTimeout(() => { try{ ctx.close(); }catch(e){} }, (durationSec+1)*1000);
        }catch(e){}
    }

    function showPopup(isBirthdayPerson){
        if(document.getElementById("nexusBdayOverlay")) return;
        injectStyles();
        const overlay = document.createElement("div");
        overlay.id = "nexusBdayOverlay";

        const card = document.createElement("div");
        card.id = "nexusBdayCard";
        if(isBirthdayPerson) card.className = "special";

        if(isBirthdayPerson){
            card.innerHTML = `
                <div class="nexus-bday-emoji">🎉🎂🎈</div>
                <div class="nexus-bday-title">Joyeux Anniversaire,<br><span class="nexus-bday-name">${BIRTHDAY_PERSON_NAME}</span> !</div>
                <div class="nexus-bday-msg">Toute la famille NEXUS Casa de Cambio et Jonathan Tecnología vous souhaitent une merveilleuse journée remplie de joie, de santé et de succès !</div>
                <button id="nexusBdayOkBtn">🎁 Merci !</button>
            `;
        } else {
            card.innerHTML = `
                <div class="nexus-bday-emoji">🎂</div>
                <div class="nexus-bday-title">C'est l'anniversaire de<br><span class="nexus-bday-name">${BIRTHDAY_PERSON_NAME}</span> !</div>
                <div class="nexus-bday-msg">N'oubliez pas de lui souhaiter un joyeux anniversaire aujourd'hui ! 🎉</div>
                <button id="nexusBdayOkBtn">OK</button>
            `;
        }

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        if(isBirthdayPerson){
            spawnConfetti(card);
            playHappyBirthdayTune(20);
        }

        document.getElementById("nexusBdayOkBtn").addEventListener("click", () => {
            overlay.remove();
        });
    }

    function scheduleRepeats(isBirthdayPerson){
        if(!isWithinCampaign()) return;
        showPopup(isBirthdayPerson);
        const interval = setInterval(() => {
            if(!isWithinCampaign()){ clearInterval(interval); return; }
            showPopup(isBirthdayPerson);
        }, REPEAT_INTERVAL_MS);
    }

    function getCurrentUserIdFromStorage(){
        try{
            for(let i=0; i<localStorage.length; i++){
                const key = localStorage.key(i);
                if(key && key.indexOf("sb-") === 0 && key.indexOf("-auth-token") !== -1){
                    const raw = localStorage.getItem(key);
                    if(!raw) continue;
                    const parsed = JSON.parse(raw);
                    if(parsed && parsed.user && parsed.user.id) return parsed.user.id;
                    if(parsed && parsed.currentSession && parsed.currentSession.user) return parsed.currentSession.user.id;
                }
            }
        }catch(e){}
        return null;
    }

    async function initBirthdayAnnouncement(){
        if(!isWithinCampaign()) return;
        let isBirthdayPerson = false;
        try{
            const userId = getCurrentUserIdFromStorage();
            if(userId === BIRTHDAY_PERSON_ID) isBirthdayPerson = true;
        }catch(e){}
        scheduleRepeats(isBirthdayPerson);
    }

    if(document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded", initBirthdayAnnouncement);
    } else {
        initBirthdayAnnouncement();
    }
})();
