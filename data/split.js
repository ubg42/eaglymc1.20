const textTypes = [
    "txt",
    "js",
    "html",
    "css",
    "json",
    "xml",
    "md",
    "csv",
    "tsv",
    "log",
    "sh",
    "bat",
    "cmd",
]

async function getSplits(baseName) {
    let chunks = [];
    let text = null;

    let num = await fetch(`${baseName}`);
    num = JSON.parse(await num.text()).parts;

    for (let i = 0; i < num; i++) {
        try {
            let response = await fetch(`${baseName}.${String(i).padStart(2, '0')}.part`);

            let content;

            try {
                if (text === null) text = textTypes.includes(baseName.split(".").pop());
                if (text) {
                    content = await response.text();
                } else {
                    let blob = await response.blob();
                    let arrayBuffer = await blob.arrayBuffer();
                    content = new Uint8Array(arrayBuffer);
                }
            } catch {}

            chunks.push(content);
        } catch {}
    }

    if (chunks.length === 0) {
        return null;
    }

    if (!text) {
        if (!chunks.every(chunk => chunk instanceof Uint8Array)) {
            throw new Error("Unexpected non-binary data.");
        }
        let size = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        let merged = new Uint8Array(size);
        let offset = 0;
        for (let chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }

        return merged;
    } else {
        return chunks.join("");
    }
}