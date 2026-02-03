var settings;
var defaultSettings = {
    enableAnalytics: {
        name: "Enable Analytics",
        value: true,
    },
    // moreDefaultServers: {
    //     name: "More Default Servers",
    //     value: false,
    // },
};

async function saveSettings() {
    localStorage.setItem("yeelauncher-settings", JSON.stringify(settings));
}

async function loadSettings() {
    try {
        let stored = JSON.parse(localStorage.getItem("yeelauncher-settings"));
        if (!stored) stored = {};

        settings = {};

        for (const key in defaultSettings) {
            settings[key] = {
                name: defaultSettings[key].name,
                value: key in stored ? stored[key].value : defaultSettings[key].value
            };
        }

        await saveSettings();
    } catch {
        settings = defaultSettings;
        await saveSettings();
    }
}

function initSettings() {
    loadSettings().then(() => {
        const container = document.querySelector('.settings-inner');

        for (const key in defaultSettings) {
            const def = defaultSettings[key];
            const val = settings[key].value;

            if (typeof def.value === "boolean") {
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = val;

                checkbox.addEventListener("change", function () {
                    settings[key].value = this.checked;
                    saveSettings();
                });

                const label = document.createElement("label");
                label.style.display = "block";
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(" " + def.name));
                container.appendChild(label);
            }
        }
    });
}

function showSettings() {
    document.querySelector('.settings-container').style.display = "flex";
    document.body.classList.add("no-scroll");
}

function exitSettings() {
    document.querySelector('.settings-container').style.display = "none";
    document.body.classList.remove("no-scroll");
}
