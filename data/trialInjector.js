const trials = {
    "yee.pages.dev": "Aj9tT8CHyVMD2O98FOBiy022gWnT0SH7EAZd0fpG002aIwBIIMgjM3Krozd01YilBkGOAGr9FI1mv4aP/dQ3kAAAAABmeyJvcmlnaW4iOiJodHRwczovL3llZS5wYWdlcy5kZXY6NDQzIiwiZmVhdHVyZSI6IldlYkFzc2VtYmx5SlNQcm9taXNlSW50ZWdyYXRpb24iLCJleHBpcnkiOjE3NTMxNDI0MDB9",
    "*.webmc.xyz": "Aj8eV4NDLOGnymFetx49ZRhnVmZoyn0zNpschFTCgBDsSDyW+0c4oZxpvMAYA/BMEzHrlmZaWjU4WM3qJFo2pQ8AAAB1eyJvcmlnaW4iOiJodHRwczovL3dlYm1jLnh5ejo0NDMiLCJmZWF0dXJlIjoiV2ViQXNzZW1ibHlKU1Byb21pc2VJbnRlZ3JhdGlvbiIsImV4cGlyeSI6MTc1MzE0MjQwMCwiaXNTdWJkb21haW4iOnRydWV9",
    "*.yeelauncher.org": "AjB2bSzSSvBehv8//5YUaAjtXhKyfvdrOFE6g2a+NVfmJkKls6dGAenXy+g5+8irh3rKivEgDPrYIhXWYzLGAwIAAAB7eyJvcmlnaW4iOiJodHRwczovL3llZWxhdW5jaGVyLm9yZzo0NDMiLCJmZWF0dXJlIjoiV2ViQXNzZW1ibHlKU1Byb21pc2VJbnRlZ3JhdGlvbiIsImV4cGlyeSI6MTc1MzE0MjQwMCwiaXNTdWJkb21haW4iOnRydWV9",
    "mc.turtleboi.cc": "AtejbdpdT4MLKJrL36fBq7+roJGoREzVtY6HNEhpkeUyZTZTGdxTOWQvJlWU8Ul2ynLQUap7uszEu173/pOssQgAAAB7eyJvcmlnaW4iOiJodHRwczovL21jLnR1cnRsZWJvaS5jYzo0NDMiLCJmZWF0dXJlIjoiV2ViQXNzZW1ibHlKU1Byb21pc2VJbnRlZ3JhdGlvbiIsImV4cGlyeSI6MTc1MzE0MjQwMCwiaXNTdWJkb21haW4iOnRydWV9",
    "d3rsc7j663z58n.cloudfront.net": "ArTVT3eIGvVA1NvhOsVD8MdORvvrIDpjUL8RKjMbpvxk+ZqjCOVPMh0Eqi/28WDpsEeKlOvCAgMlg+IgZz66tgIAAAB2eyJvcmlnaW4iOiJodHRwczovL2QzcnNjN2o2NjN6NThuLmNsb3VkZnJvbnQubmV0OjQ0MyIsImZlYXR1cmUiOiJXZWJBc3NlbWJseUpTUHJvbWlzZUludGVncmF0aW9uIiwiZXhwaXJ5IjoxNzUzMTQyNDAwfQ==",
    "1328505453621280810.discordsays.com": "AqOe7ibEBE/YVqNYeL67OuAKX93H4VKycGDYmd0QCfONKM0M0u6xJqUa91Mno9IrwK1DRF1mS/8EaQgf0joL3gkAAAB8eyJvcmlnaW4iOiJodHRwczovLzEzMjg1MDU0NTM2MjEyODA4MTAuZGlzY29yZHNheXMuY29tOjQ0MyIsImZlYXR1cmUiOiJXZWJBc3NlbWJseUpTUHJvbWlzZUludGVncmF0aW9uIiwiZXhwaXJ5IjoxNzUzMTQyNDAwfQ=="
}

function createMeta(trial) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'origin-trial';
    meta.content = trial;
    return meta;
}

function getTrial(url) {
    const host = url.split(':')[0];
    for (const [url, trial] of Object.entries(trials)) {
        if (host === url || host.includes(url.split('*.').pop())) {
            return trial;
        }
    }
    return null;
}

function injectTrial() {
    document.head.prepend(createMeta(getTrial(location.host)));
}

injectTrial();

function injectIframeTrial(el = document.querySelector('.gameFrame')) {
    const trial = getTrial(location.host);
    const frame = el.contentWindow.document;
    if (!trial || !frame) return;
    frame.head.prepend(createMeta(trial));
}