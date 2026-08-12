(function(){
    let searchTimeout = null;
    let dropdownEl = null;

    function ensureSearchBar(){
        const topbarRight = document.querySelector(".topbar-right");
        if(!topbarRight || document.getElementById("nexusGlobalSearchWrap")) return;

        const wrap = document.createElement("div");
        wrap.id = "nexusGlobalSearchWrap";
        wrap.style.cssText = "position:relative;margin-right:0.6rem;";
        wrap.innerHTML = `
            <input id="nexusGlobalSearchInput" type="text" placeholder="🔍 Rechercher un client..."
                style="padding:0.5rem 0.9rem;border-radius:999px;border:1px solid #E2E8F0;font-size:0.82rem;width:100%;max-width:200px;min-width:0;font-family:'Inter',Arial,sans-serif;outline:none;box-sizing:border-box;">
        `;
        topbarRight.insertBefore(wrap, topbarRight.firstChild);

        dropdownEl = document.createElement("div");
        dropdownEl.id = "nexusGlobalSearchDropdown";
        dropdownEl.style.cssText = "position:absolute;top:calc(100% + 6px);left:0;width:320px;max-height:360px;overflow-y:auto;background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.18);z-index:999997;display:none;font-family:'Inter',Arial,sans-serif;";
        wrap.appendChild(dropdownEl);

        const input = document.getElementById("nexusGlobalSearchInput");
        input.addEventListener("input", () => {
            clearTimeout(searchTimeout);
            const q = input.value.trim();
            if(q.length < 2){ dropdownEl.style.display = "none"; return; }
            searchTimeout = setTimeout(() => runSearch(q), 300);
        });

        document.addEventListener("click", (e) => {
            if(!wrap.contains(e.target)) dropdownEl.style.display = "none";
        });
    }

    async function runSearch(q){
        if(typeof SUPA_URL === "undefined" || typeof SUPA_KEY === "undefined") return;
        dropdownEl.innerHTML = `<div style="padding:1rem;color:#94A3B8;font-size:0.85rem">Recherche...</div>`;
        dropdownEl.style.display = "block";

        try{
            const filter = `or=(client_name.ilike.*${encodeURIComponent(q)}*,account_no.ilike.*${encodeURIComponent(q)}*,client_phone.ilike.*${encodeURIComponent(q)}*)`;
            const res = await fetch(`${SUPA_URL}/rest/v1/savings_accounts?${filter}&limit=8`, {
                headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` }
            });
            const data = await res.json();

            if(!Array.isArray(data) || data.length === 0){
                dropdownEl.innerHTML = `<div style="padding:1rem;color:#94A3B8;font-size:0.85rem">Aucun resultat.</div>`;
                return;
            }

            dropdownEl.innerHTML = data.map(c => `
                <div class="nexus-search-result" data-account="${c.account_no}" style="padding:0.7rem 1rem;border-bottom:1px solid #F1F5F9;cursor:pointer;">
                    <div style="font-weight:700;font-size:0.85rem;color:#0F172A">${c.client_name||"-"}</div>
                    <div style="font-size:0.75rem;color:#64748B">${c.account_no||"-"} · ${c.currency||""} · ${c.account_type||""}</div>
                </div>
            `).join("");

            dropdownEl.querySelectorAll(".nexus-search-result").forEach(el => {
                el.addEventListener("mouseenter", () => el.style.background = "#F8FAFC");
                el.addEventListener("mouseleave", () => el.style.background = "#fff");
                el.addEventListener("click", () => {
                    const accNo = el.dataset.account;
                    navigator.clipboard.writeText(accNo).then(() => {
                        if(typeof nexusToast === "function"){
                            nexusToast("Numero de compte copie: " + accNo + " — collez-le dans le formulaire souhaite.", "success");
                        }
                    });
                    dropdownEl.style.display = "none";
                    document.getElementById("nexusGlobalSearchInput").value = "";
                });
            });
        }catch(err){
            dropdownEl.innerHTML = `<div style="padding:1rem;color:#DC2626;font-size:0.85rem">Erreur de recherche.</div>`;
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(ensureSearchBar, 200);
    });
})();