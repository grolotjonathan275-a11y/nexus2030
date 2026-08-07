(function(){
    let knownStatuses = {};
    let firstCheck = true;

    async function checkMyTransactionStatuses(){
        if(typeof supabaseClient === "undefined") return;
        const myId = (typeof CASHIER_ID !== "undefined") ? CASHIER_ID : (typeof AGENT_ID !== "undefined" ? AGENT_ID : null);
        if(!myId) return;

        try{
            const { data, error } = await supabaseClient
                .from("mobile_money_transactions")
                .select("id,status")
                .eq("created_by", myId)
                .order("created_at",{ascending:false})
                .limit(30);

            if(error || !data) return;

            if(firstCheck){
                data.forEach(t => { knownStatuses[t.id] = t.status; });
                firstCheck = false;
                return;
            }

            data.forEach(t => {
                const prev = knownStatuses[t.id];
                if(prev !== undefined && prev !== t.status){
                    if(t.status === "approved"){
                        if(typeof nexusPlaySound === "function") nexusPlaySound("approved");
                        if(typeof nexusToast === "function") nexusToast("Transaction approuvee par le validateur!", "success");
                    } else if(t.status === "rejected"){
                        if(typeof nexusPlaySound === "function") nexusPlaySound("rejected");
                        if(typeof nexusToast === "function") nexusToast("Transaction rejetee par le validateur.", "error");
                    } else if(t.status === "wrong_number"){
                        if(typeof nexusPlaySound === "function") nexusPlaySound("wrongnumber");
                        if(typeof nexusToast === "function") nexusToast("Numero signale comme incorrect par le validateur.", "warning");
                    }
                }
                knownStatuses[t.id] = t.status;
            });
        }catch(e){}
    }

    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            checkMyTransactionStatuses();
            setInterval(checkMyTransactionStatuses, 8000);
        }, 1500);
    });
})();