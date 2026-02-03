const konamiDefault = {
    code: ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright"],
    time: 300,
    func: () => {
        alert("Konami Code activated!");
    }
}

if (typeof konami === "undefined") {
    konami = konamiDefault;
}

let konamiPos = 0;
let konamiTime = Date.now();

document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === konami.code[konamiPos]) {
        event.preventDefault;
        
        const now = Date.now()

        if (now - konamiTime > konami.time) {
            konamiPos = 0;
        }
        
        konamiTime = now;
        
        konamiPos++;

        if (konamiPos === konami.code.length) {
            konami.func();
            konamiPos = 0;
        }
    } else {
        konamiPos = 0;
    }
});

function keyTester() {
    console.log("Key Tester Activated.")
    document.addEventListener("keydown", (event) => {
        console.log(`Key Pressed: ${event.key.toLowerCase()}`)
    });
}