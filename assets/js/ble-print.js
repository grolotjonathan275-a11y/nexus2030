const NEXUS_BLE_SERVICE = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
const NEXUS_BLE_CHAR = '49535343-8841-43f4-a8d4-ecbe34729bb3';

function nexusStripAccents(s){
    let r = (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    r = r.replace(/[\u00A0\u202F\u2009\u2007]/g, " ");
    return r;
}

function nexusBuildReceiptBytes(lines){
    const bytes = [];
    bytes.push(0x1B, 0x40);
    for(const line of lines){
        const align = line.align === "center" ? 1 : line.align === "right" ? 2 : 0;
        bytes.push(0x1B, 0x61, align);
        let mode = 0;
        if(line.bold) mode |= 0x08;
        if(line.big) mode |= 0x30;
        bytes.push(0x1B, 0x21, mode);
        const text = nexusStripAccents(line.text || "") + "\n";
        for(let i=0;i<text.length;i++){
            bytes.push(text.charCodeAt(i) & 0xFF);
        }
    }
    bytes.push(0x0A,0x0A,0x0A);
    bytes.push(0x1D, 0x56, 0x00);
    return new Uint8Array(bytes);
}

async function nexusPrintBLE(lines, btnEl){
    let originalHtml;
    if(btnEl){ originalHtml = btnEl.innerHTML; btnEl.innerHTML = "Connexion..."; btnEl.disabled = true; }
    try{
        const data = nexusBuildReceiptBytes(lines);
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [NEXUS_BLE_SERVICE]
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(NEXUS_BLE_SERVICE);
        const characteristic = await service.getCharacteristic(NEXUS_BLE_CHAR);

        const chunkSize = 20;
        for(let i = 0; i < data.length; i += chunkSize){
            const chunk = data.slice(i, i + chunkSize);
            await characteristic.writeValueWithoutResponse(chunk);
            await new Promise(r => setTimeout(r, 30));
        }
        if(btnEl){
            btnEl.innerHTML = "Imprime!";
            setTimeout(()=>{btnEl.innerHTML=originalHtml;btnEl.disabled=false;}, 2000);
        }
    }catch(err){
        alert("Erreur impression Bluetooth: " + err.message + "\n\nUtilisez le bouton Imprimer classique si le probleme persiste.");
        if(btnEl){ btnEl.innerHTML = originalHtml; btnEl.disabled = false; }
    }
}