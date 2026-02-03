let versions;
let launcher;
let launcherDefault;
let header;
let headerDefault;
let hideBackBtn;
let offlineHTML;
let launcherhistory = [];
let gameFrame;
let discordsays = window.location.hostname.includes("discordsays.com") ? true : false;

document.addEventListener("DOMContentLoaded", async () => {
    launcher = document.querySelector('.launcher');
    launcherDefault = launcher.innerHTML;
    header = document.querySelector('.container h1');
    headerDefault = header.innerHTML;
    savedHistory = localStorage.getItem('launcherhistory');
    if (savedHistory) {
        launcherhistory = JSON.parse(savedHistory);
    }

    initSettings();
    gameFrame = document.querySelector('.gameFrame');
    gameFrame.addEventListener('load', function () {
        injectIframeTrial(this);
        injectIframeScript(this, 'global');
        injectIframeScript(this, 'userscript');
    });


    if (discordsays) {
        const style = document.createElement('style');
        style.innerHTML = `.downloads, .settingsIcon {display: none !important;}`;
        document.head.appendChild(style);
        hideLB();
    }

    await fetch(`${discordsays ? "/.proxy/" : ""}data/data.json`)
        .then(response => response.json())
        .then(data => {
            versions = data;

            processHash();
        });
    var q = window.location.search;
    if (q.toString().startsWith("?")) {
        q = new URLSearchParams(q);
        var dl = q.get("download");
        var dlb = q.get("downloadbundle");
        if (dlb) {
            downloadAllClients(false);
            return;
        }
        if (dl) {
            downloadScreen(atob(decodeURIComponent(dl)), "url", false);
            return;
        }
        var lb = q.get("linksButton");
        if (lb=="none") {
            hideLB();
        }
        var hbb = q.get("backButton");
        if (hbb) {
            hideBackBtn = hbb;
        } else {
            hideBackBtn = false;
        }
    }
    processHash();
    await fetch(`${discordsays ? "/.proxy/" : ""}data/onlineCheck.txt`)
        .then(response => response.text())
        .then(() => {
            if (settings.enableAnalytics.value) {
                addScripts(`
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "393fd759d4954920a2713f73b3d38d58"}'></script>
<!-- End Cloudflare Web Analytics -->
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1WZCB8LHC9"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-1WZCB8LHC9');
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6114346129491087" crossorigin="anonymous"></script>`
                , document.body);
            }
        })
        .catch(error => {
            console.error(error)
            document.querySelector('.errorText').textContent = "Offline";
            document.querySelector('.container h1').classList.add('mobileOffline');
        });
    await fetch('offline.html')
        .then(response => response.text())
        .then(data => offlineHTML = data)
        .catch();
});

function updateState(value, type = "hash") {
    if (type === "hash") {
        location.hash = `/${encodeURIComponent(btoa(value).replaceAll('=', ''))}`;
    } else if (type === "history") {
        if (value === "main") {
            launcherhistory.length = 0;
            launcherhistory.push("main");
        } else {
            launcherhistory.push(value);
        }
        localStorage.setItem("launcherhistory",JSON.stringify(launcherhistory));
    }
}

function processHash() {
    if (location.hash !== "") {
        const k = atob(decodeURIComponent(location.hash.substring(2)));
        const v = findVersion(versions, k);

        if (v && typeof v.data === "string") {
            launchVersion(k, v.data);
        } else if (v && typeof v.data === "object") {
            if (v.sectionName && typeof v.sectionName === "string") {
                openSectionMenu(k);
            } else {
                launchVersion(k, v.data.name);
            }
        } else {
            openMainMenu();
        }
    } else {
        openMainMenu();
    }
    document.querySelector('.container').classList.add('loaded');
}

function openFullscreen(e) {
    const elem = e || document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function openMainMenu() {
    launcher.innerHTML = launcherDefault;
    header.innerHTML = headerDefault;
    updateState("main", "history");
    
    Object.entries(versions).slice().reverse().forEach(([key, value]) => {
        if (typeof value === "object" && value.section && value.data) {
            const sectionBtn = document.createElement("button");
            sectionBtn.textContent = value.section;
            sectionBtn.addEventListener("click", () => {
                openSectionMenu(key);
            });
            if (value.css) {
                sectionBtn.classList.add(value.css);
            }
            launcher.prepend(sectionBtn);
        } else {
            createLaunchButton(key, value, launcher);
        }
    });

    window.location.hash = '';
    history.replaceState("", document.title, window.location.pathname
        + window.location.search);

    /*const checkbox = document.querySelector(".launcher input[type='checkbox']")
    let performanceMode = localStorage.getItem("performanceMode");
    if (!performanceMode) { 
        localStorage.setItem("performanceMode", "true");
        performanceMode = "true";
    }
    checkbox.checked = performanceMode === "true";
    checkbox.addEventListener("change", function() {
        localStorage.setItem("performanceMode", this.checked);
    });*/
}

function openSectionMenu(sectionKey) {
    if (sectionKey === "main") {
        openMainMenu();
        return;
    }
    launcher.innerHTML = "";

    if (launcherhistory[launcherhistory.length - 1] !== sectionKey) {
        updateState(sectionKey, "history");
    }
    
    const { sectionName, data: section } = findVersion(versions, sectionKey);

    header.innerHTML = String(sectionName).charAt(0).toUpperCase() + String(sectionName).slice(1);

    if (!section || typeof section !== "object") {
        openMainMenu();
        return;
    }

    if (!hideBackBtn) {
        const backBtn = document.createElement("button");
        backBtn.textContent = "Back";
        backBtn.addEventListener("click", () => {
            launcherhistory.pop();
            openSectionMenu(launcherhistory[launcherhistory.length - 1] || "main");
        });
        launcher.appendChild(backBtn);
    }
    
    Object.entries(section).slice().reverse().forEach(([subKey, subValue]) => {   
        const mainKey = `${sectionKey}/${subKey}`; 
        if (typeof subValue === "object" && subValue.section && subValue.data) {
            const subSectionBtn = document.createElement("button");
            subSectionBtn.textContent = subValue.section;
            subSectionBtn.addEventListener("click", () => {
                openSectionMenu(mainKey);
            });
            if (subValue.css) {
                subSectionBtn.classList.add(subValue.css);
            }
            launcher.prepend(subSectionBtn);
        } else {
            createLaunchButton(subKey, subValue, launcher, mainKey);
        }
    });

    updateState(sectionKey);
}


function createLaunchButton(versionKey, versionName, container, section) {
    const btn = document.createElement("button");
    let external;
    let dl;
    let dlfolder;
    let more;
    let json;
    let css;
    let vname = versionName;
    try {
        if (typeof versionName === "string") {
            json = JSON.parse(versionName);
        } else {
            json = versionName;
        }
        if (json.name) {
            more = true;
            vname = json.name;
            external = json.url || false;
            dl = json.download || false;
            dlfolder = json.downloadfolder || false;
            css = json.css || false;
        }
    } catch {
        more = false;
        external = false;
        dl = false;
    } finally {
        const name = !more ? versionName : json.name;
        const launch = !dl ? (!external ? `launchVersion("${!section ? versionKey : section}", "${vname}")` : `window.open("${json.url}", "_blank")`) : dl !== "bundle" ? `downloadScreen("${versionKey}", "ui", true);` : "downloadAllClients()";
        btn.textContent = name;
        btn.addEventListener("click", () => {
            eval(launch);
        });
        if (css) {
            btn.classList.add(css);
        }
        container.prepend(btn);
    }
}

function findVersion(obj, key) {
    if (!key) return null;

    const keys = key.split("/");
    let current = obj;
    let sectionName = null;

    for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
            if (typeof current[k] === "object" && "data" in current[k]) {
                sectionName = current[k].section ?? sectionName;
                current = current[k].data;
            } else {
                current = current[k];
            }
        } else {
            return null;
        }
    }

    return { sectionName, data: current };
}

function launchVersion(v, n) {
    const launchStyle = document.createElement('style');
    launchStyle.textContent = `.pwa-install {
        display: none !important;
    }`;
    launchStyle.id = 'launch-style';
    const ver = findVersion(versions, v);
    let dusrscrpts = "";
    if (ver.data && typeof ver.data === "object") {
        if (ver.data["disabled-userscripts"] && typeof ver.data["disabled-userscripts"] === "object") {
            dusrscrpts = `?disabled-userscripts=${btoa(JSON.stringify(ver.data["disabled-userscripts"]))}`;
        }
    }
    if (!document.querySelector('#launch-style')) document.head.appendChild(launchStyle);
    document.body.classList.add('no-scroll');
    launcher = document.querySelector('.launcher');
    if (launcher) launcher.remove();
    document.querySelector('.container h1').textContent = "Loading...";
    gameFrame.src = `${discordsays ? ".proxy/" : ""}games/${v.split('/').pop()}/index.html${dusrscrpts}`;
    gameFrame.contentWindow.focus();
    gameFrame.style.display = 'block';
    if (!document.title.includes(" - ")) document.title = `${document.title} - ${n}`;
    updateState(v);
}

async function downloadParts(file, name, folder, type = "download") {
    if (type === "download") alert(`Downloading ${name} to ${file}`);

    try {
        const data = await getSplits(`${folder}/${file}`);
        if (!data) throw new Error("No data received");

        if (type === "download") {
            saveAs(new Blob([data]), file);
            return true;
        } else {
            return data;
        }
    } catch {
        return null;
    }
}

async function downloadAllClients(mainmenu = true) { //(showalert = false) {
    //if (showalert) alert("Downloading & Compressing ZIP, be patient!");

    const zip = new JSZip();

    const vers = versions?.more?.data?.downloads?.data?.offline?.data;
    if (!versions) return;

    const keys = Object.keys(vers).filter(k => {
        const v = deepFind(vers, k);
        return v && v.download && v.download !== "bundle" && !v.section;
    });

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const version = deepFind(vers, key);

        try {
            const clientData = await downloadScreen(key, (i === keys.length - 1) ? "bundle-last" : "bundle", mainmenu);
            zip.file(version.download, clientData, { binary: true });
        } catch (err) {
            console.warn(`Failed to zip ${key}`, err);
        }
    }

    zip.generateAsync({ type: "blob" }).then((data) => {
        saveAs(data, "clients.zip");
    });
}

function injectIframeScript(frame, script) {
    if (frame.contentWindow.location.href.includes("/games/")) {
        const scriptElm = document.createElement("script");
        scriptElm.src = `${!discordsays ? "../../data/" : "../../../.proxy/data/"}${script}.js`;
        frame.contentWindow.document.head.appendChild(scriptElm);
    }
}

function addScripts(str, elm = document.body) {
    const temp = document.createElement('div');
    temp.innerHTML = str;

    Array.from(temp.childNodes).forEach(node => {
        if (node.nodeName === 'SCRIPT') {
            const scr = document.createElement('script');
            
            for (const attr of node.attributes) {
                scr.setAttribute(attr.name, attr.value);
            }

            if (node.textContent) {
                scr.textContent = node.textContent;
            }

            elm.appendChild(scr);
        } else {
            elm.appendChild(node.cloneNode(true));
        }
    });
}

function hideLB() {
    const style = document.createElement('style');
    style.innerHTML = `.linksButton {display: none !important;}`;
    document.head.appendChild(style);
}

function deepFind(obj, key) {
    if (!obj || typeof obj !== "object") return null;
    for (const [k, v] of Object.entries(obj)) {
        if (k === key && typeof v === "object" && v.download) return v;
        if (typeof v === "object") {
            const found = deepFind(v.data || v, key);
            if (found) return found;
        }
    }
    return null;
}

async function downloadScreen(ver, type, mm = true) {
    launcher = document.querySelector('.launcher');
    if (launcher) launcher.style.display = "none";

    const text = document.querySelector('.container h1');
    const ogText = text.textContent;

    const version = deepFind(versions["more"]["data"]["downloads"]["data"], ver);

    if (!version || typeof version !== "object") {
        text.classList.add("error");
        text.textContent = "An error occured";
        return;
    }

    document.querySelector('.container').style.width = '100%';

    const templateText = `Downloading ${version.name}`;

    text.textContent = templateText;
    
    let data;
    
    let i = 0;
    const interval = setInterval(() => {
        i++;
        text.textContent = templateText + ".".repeat(i % 4);
    }, 500);

    if (version.download && version.downloadfolder) {
        data = await downloadParts(version.download, version.name, version.downloadfolder, "get");
        if (data) {
            text.textContent = `Downloaded ${version.name}`;
        } else {
            text.classList.add("error");
            text.textContent = `Failed to download ${version.name}`;
        }
    }
    clearInterval(interval);


    if (type === "ui" || type === "bundle" || type === "bundle-last" || type === "url") {
        text.classList.remove("error");
        text.textContent = ogText;
        if (type === "ui" || type === "bundle-last" && mm) {
            launcher.style.display = "flex";
            document.querySelector('.container').style.width = "";
        } if (type === "ui" || type === "url") {
            saveAs(new Blob([data]), version.download);
        } if (!mm) {
            text.textContent = "All Done!"
        } if (type === "bundle" || type === "bundle-last") {
            if (typeof data === "string") {
                data = new TextEncoder().encode(data);
            }
            return data || null;
        }
    }
}
