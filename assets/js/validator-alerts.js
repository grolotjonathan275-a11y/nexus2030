(function(){
    let alarmActive = false;
    let checkInterval = null;
    let btnEl = null;

    function ensureAlarmButton(){
        if(document.getElementById("nexusAlarmBtn")) return;
        const topbarRight = document.querySelector(".topbar-right");
        if(!topbarRight) return;

        btnEl = document.createElement("button");
        btnEl.id = "nexusAlarmBtn";
        btnEl.style.cssText = "display:none;align-items:center;gap:0.4rem;background:#DC2626;color:#fff;border:none;border-radius:999px;padding:0.45rem 1rem;font-size:0.8rem;font-weight:700;cursor:pointer;margin-right:0.6rem;font-family:'Inter',Arial,sans-serif;animation:nexusAlarmPulse 1s infinite;";
        btnEl.innerHTML = "🔔 Nouvelle(s) transaction(s) — Cliquez pour arreter";
        btnEl.onclick = stopAlarm;
        topbarRight.insertBefore(btnEl, topbarRight.firstChild);

        if(!document.getElementById("nexusAlarmPulseStyle")){
            const style = document.createElement("style");
            style.id = "nexusAlarmPulseStyle";
            style.textContent = "@keyframes nexusAlarmPulse { 0%,100%{opacity:1;} 50%{opacity:0.6;} }";
            document.head.appendChild(style);
        }
    }

    function startAlarm(){
        if(alarmActive) return;
        alarmActive = true;
        ensureAlarmButton();
        if(btnEl) btnEl.style.display = "flex";
        if(typeof nexusStartAlarmLoop === "function") nexusStartAlarmLoop();
    }

    function stopAlarm(){
        alarmActive = false;
        if(btnEl) btnEl.style.display = "none";
        if(typeof nexusStopAlarmLoop === "function") nexusStopAlarmLoop();
    }

    async function checkPendingTransactions(){
        if(typeof supabaseClient === "undefined") return;
        try{
            const { data, error } = await supabaseClient
                .from("mobile_money_transactions")
                .select("id", { count: "exact", head: true })
                .eq("status", "pending_validation");

            if(error) return;

            const { count } = await supabaseClient
                .from("mobile_money_transactions")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending_validation");

            if(count && count > 0){
                startAlarm();
            } else {
                stopAlarm();
            }
        }catch(e){}
    }

    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            checkPendingTransactions();
            checkInterval = setInterval(checkPendingTransactions, 8000);
        }, 1500);
    });
})();