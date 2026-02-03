function isMobile() {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch {
        return false;
    }
}

async function installUserscript(url) {
    const q = new URLSearchParams(window.location.search);
    const dusrscrpts = q.get("disabled-userscripts");
    if (dusrscrpts) {
        try {
            const disabledUserscripts = JSON.parse(atob(dusrscrpts));
            if (Array.isArray(disabledUserscripts)) {
                for (const scr of disabledUserscripts) {
                    if (url.includes(scr)) return;
                }
            }
        } catch {}
    }
    const script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script);
}

if (isMobile()) {
    installUserscript("../../data/userscripts/mobile.user.js");
}
