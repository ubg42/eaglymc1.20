let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  openPWAInstall();
});

async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    /*if (outcome === 'accepted') {
      return;
    } else if (outcome === 'dismissed') {
      return;
    }*/
    closePWAInstall(true);
  }
}

function openPWAInstall() {
  if (localStorage.getItem("noInstallPrompt") === "true") {
    return;
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }
  if (navigator.standalone) {
    return;
  }
  var q = window.location.search;
  q = new URLSearchParams(q);
  var inst = q.get("pwaInstall");
  if (inst=="none" || window.location.hostname.includes("discordsays.com")) {
    return;
  }

  document.querySelector(".pwa-install").style.display = "flex";
  document.body.classList.add("no-scroll");
}

function closePWAInstall(noinstall=false) {
  document.querySelector(".pwa-install").style.display = "none";
  document.body.classList.remove("no-scroll");
  if (noinstall) localStorage.setItem("noInstallPrompt", true);
}