/* =====================================================================
   VMC double flux \u2013 synoptique pour la page web ESPHome (web_server v3)
   Fichier \u00e0 placer dans /config/esphome/ \u00e0 c\u00f4t\u00e9 du .yaml
   ===================================================================== */
(function () {
  "use strict";

  // ---- Code d'acc\u00e8s \u00e0 la page de configuration (protection simple) ----
  const CODE_CONFIG = "admin";

  // ---- Noms des entit\u00e9s ESPHome (doivent correspondre au "name:" du yaml) ----
  const N = {
    text: "T air neuf (ext\u00e9rieur)",
    tins: "T insufflation",
    trep: "T reprise (air extrait)",
    trej: "T rejet",
    vs: "Vitesse soufflage",
    ve: "Vitesse extraction",
    eta: "Rendement moyen 1 h",
    pw: "Puissance r\u00e9cup\u00e9r\u00e9e",
    en: "\u00c9nergie r\u00e9cup\u00e9r\u00e9e",
    ratio: "Rapport d\u00e9bits extraction sur soufflage",
    pres: "Pression r\u00e9seau extraction",
    cons: "Consigne extraction",
    froid: "Air souffl\u00e9 froid",
    givre: "Risque givrage \u00e9changeur",
    filtre: "Filtres \u00e0 changer",
    fj: "Filtres \u2013 jours d'utilisation",
    bp: "By-pass (relais)",
    bpm: "By-pass \u2013 mode",
    ag: "Antigel \u2013 baisse du soufflage",
    qs: "D\u00e9bit soufflage",
    qe: "D\u00e9bit extraction",
    eco: "\u00c9conomie estim\u00e9e",
    mode: "Mode de ventilation",
  };

  const slug = (s) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
     .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const byKey = {};
  Object.entries(N).forEach(([k, n]) => { byKey[n] = k; byKey[slug(n)] = k; });
  const val = {};

  const pale = '<path d="M0,0 C6,-10 20,-22 30,-12 C22,-6 10,-2 0,0Z" fill="#9fb3d1"';
  const fan = (k) => `<circle r="34" fill="#1d2129" stroke="#8a93a6" stroke-width="2"/>
    <g class="rotor" id="rot-${k}">${[0,72,144,216,288].map(a=>pale+` transform="rotate(${a})"/>`).join("")}
    <circle r="6" fill="#d0d7e3"/></g>`;

  // --------------------------------------------------------------------
  //  Dessin SVG
  // --------------------------------------------------------------------
  const svg = `
<svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,Segoe UI,Roboto,sans-serif">
  <defs>
    <marker id="fl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
    <linearGradient id="caisson" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a4150"/><stop offset="1" stop-color="#2a2f3a"/></linearGradient>
  </defs>

  <!-- zones ext\u00e9rieur / maison -->
  <text x="40" y="28" fill="#8ab4f8" font-size="15" font-weight="600">EXT\u00c9RIEUR</text>
  <text x="720" y="28" fill="#f6b26b" font-size="15" font-weight="600" text-anchor="end">MAISON</text>

  <!-- caisson -->
  <rect x="170" y="55" width="420" height="300" rx="14" fill="url(#caisson)" stroke="#5c6475" stroke-width="2"/>
  <text x="380" y="80" fill="#c9d1e0" font-size="14" text-anchor="middle">VMC double flux</text>

  <!-- circulation interne -->
  <polyline points="172,110 300,110 340,165 420,245 470,250 498,170 530,140 590,110" fill="none" stroke="#8ab4f8" stroke-opacity=".35" stroke-width="5" stroke-dasharray="10 8"/>
  <polyline points="590,300 460,300 420,245 340,165 290,160 262,240 230,270 172,300" fill="none" stroke="#f6b26b" stroke-opacity=".35" stroke-width="5" stroke-dasharray="10 8"/>

  <!-- by-pass (cach\u00e9 tant que l'entit\u00e9 n'existe pas) -->
  <g id="bp-g" style="display:none">
    <polyline id="bp-path" points="172,110 300,92 470,92 520,118" fill="none" stroke="#8ab4f8" stroke-width="5" stroke-dasharray="4 6" stroke-opacity=".25"/>
    <text id="bp-txt" x="385" y="104" fill="#8a93a6" font-size="11" text-anchor="middle">by-pass ferm\u00e9</text>
  </g>

  <!-- \u00e9changeur -->
  <g transform="translate(380,205)">
    <path d="M0,-80 L80,0 L0,80 L-80,0Z" fill="#2f3747" stroke="#7d8aa3" stroke-width="2"/>
    <path d="M-56,-24 L24,56 M-40,-40 L40,40 M-24,-56 L56,24" stroke="#56627a" stroke-width="2"/>
    <text y="-4" fill="#c9d1e0" font-size="12" text-anchor="middle">\u00e9changeur</text>
    <text id="v-eta" y="16" fill="#7ee08a" font-size="18" font-weight="700" text-anchor="middle">-- %</text>
  </g>
  <text id="v-mode" x="380" y="318" fill="#c9d1e0" font-size="13" font-weight="600" text-anchor="middle"></text>

  <!-- gaines c\u00f4t\u00e9 ext\u00e9rieur -->
  <g style="color:#8ab4f8">
    <line x1="30" y1="110" x2="168" y2="110" stroke="#8ab4f8" stroke-width="10" stroke-linecap="round"/>
    <line x1="60" y1="110" x2="150" y2="110" stroke="#1d2129" stroke-width="2" marker-end="url(#fl)"/>
  </g>
  <g style="color:#9aa3b5">
    <line x1="30" y1="300" x2="168" y2="300" stroke="#6f7b91" stroke-width="10" stroke-linecap="round"/>
    <line x1="150" y1="300" x2="60" y2="300" stroke="#1d2129" stroke-width="2" marker-end="url(#fl)"/>
  </g>
  <!-- gaines c\u00f4t\u00e9 maison -->
  <g style="color:#f6b26b">
    <line x1="592" y1="110" x2="730" y2="110" stroke="#f6b26b" stroke-width="10" stroke-linecap="round"/>
    <line x1="610" y1="110" x2="700" y2="110" stroke="#1d2129" stroke-width="2" marker-end="url(#fl)"/>
  </g>
  <g style="color:#e6a157">
    <line x1="592" y1="300" x2="730" y2="300" stroke="#c98a4a" stroke-width="10" stroke-linecap="round"/>
    <line x1="700" y1="300" x2="610" y2="300" stroke="#1d2129" stroke-width="2" marker-end="url(#fl)"/>
  </g>

  <!-- ventilateurs -->
  <g transform="translate(530,140)">${fan("s")}</g>
  <text x="530" y="192" fill="#c9d1e0" font-size="12" text-anchor="middle">soufflage</text>
  <text id="v-vs" x="530" y="208" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">-- %</text>

  <g transform="translate(230,270)">${fan("e")}</g>
  <text x="230" y="322" fill="#c9d1e0" font-size="12" text-anchor="middle">extraction</text>
  <text id="v-ve" x="230" y="338" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">-- %</text>

  <!-- \u00e9tiquettes temp\u00e9ratures -->
  <g font-size="12" fill="#c9d1e0">
    <text x="40" y="95">Air neuf</text>
    <text x="40" y="285">Rejet</text>
    <text x="720" y="95" text-anchor="end">Insufflation</text>
    <text x="720" y="285" text-anchor="end">Reprise</text>
  </g>
  <g font-size="20" font-weight="700">
    <text id="v-text" x="40" y="140" fill="#8ab4f8">-- \u00b0C</text>
    <text id="v-trej" x="40" y="330" fill="#9aa3b5">-- \u00b0C</text>
    <text id="v-tins" x="720" y="140" fill="#f6b26b" text-anchor="end">-- \u00b0C</text>
    <text id="v-trep" x="720" y="330" fill="#e6a157" text-anchor="end">-- \u00b0C</text>
  </g>

  <!-- bandeau bas -->
  <g font-size="13" fill="#c9d1e0">
    <text x="40"  y="392">Puissance r\u00e9cup\u00e9r\u00e9e</text>
    <text x="230" y="392">\u00c9nergie r\u00e9cup\u00e9r\u00e9e</text>
    <text x="420" y="392">\u00c9quilibre d\u00e9bits</text>
    <text x="590" y="392">Pression extraction</text>
  </g>
  <g font-size="17" font-weight="700" fill="#ffffff">
    <text id="v-pw" x="40" y="414">-- W</text>
    <text id="v-en" x="230" y="414">-- kWh</text>
    <text id="v-ratio" x="420" y="414">--</text>
    <text id="v-pres" x="590" y="414">-- Pa</text>
  </g>
</svg>`;

  // --------------------------------------------------------------------
  //  Mise en page
  // --------------------------------------------------------------------
  const css = `
  #vmc-syn{max-width:820px;margin:12px auto;padding:14px;background:#171a21;border-radius:16px;
    color:#e6e9ef;box-shadow:0 4px 18px rgba(0,0,0,.35);font-family:system-ui,Segoe UI,Roboto,sans-serif}
  #vmc-syn h1{font-size:20px;margin:0 0 6px 4px;font-weight:650}
  #vmc-syn .rotor{transform-origin:0 0;animation:vmcspin linear infinite;animation-duration:0s}
  @keyframes vmcspin{to{transform:rotate(360deg)}}
  #vmc-alerts{display:flex;flex-wrap:wrap;gap:8px;margin:8px 4px}
  #vmc-alerts span{padding:5px 10px;border-radius:999px;font-size:13px;background:#243024;color:#9fe0a5}
  #vmc-alerts span.bad{background:#3a1f1f;color:#ff9b9b}
  #vmc-alerts span.warn{background:#3a321c;color:#ffd27a}
  #vmc-bar{display:flex;justify-content:space-between;align-items:center;margin:6px 4px 0}
  #vmc-cfg{background:#2b6cb0;color:#fff;border:0;border-radius:10px;padding:9px 16px;font-size:14px;cursor:pointer}
  #vmc-cfg.open{background:#4a5568}
  #vmc-syn small{color:#8a93a6}
  #vmc-mode{display:flex;flex-wrap:wrap;gap:8px;margin:8px 4px;align-items:center}
  #vmc-mode b{font-size:13px;color:#8a93a6;font-weight:500;margin-right:4px}
  #vmc-mode button{background:#243042;color:#c9d1e0;border:1px solid #3a4a63;border-radius:999px;padding:6px 14px;font-size:13px;cursor:pointer}
  #vmc-mode button.on{background:#2b6cb0;border-color:#2b6cb0;color:#fff;font-weight:650}
  #vmc-mode small{margin-left:4px}`;

  function build() {
    if (document.getElementById("vmc-syn")) return;
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    const box = document.createElement("div");
    box.id = "vmc-syn";
    box.innerHTML = `<h1>VMC double flux</h1>${svg}
      <div id="vmc-mode"><b>Mode</b>${MODES.map(m => `<button data-m="${m}">${m}</button>`).join("")}<small id="vmc-mode-info"></small></div>
      <div id="vmc-alerts"></div>
      <div id="vmc-bar"><small id="vmc-maj">connexion\u2026</small>
        <button id="vmc-cfg">\u2699 Configurer</button></div>`;
    document.body.insertBefore(box, document.body.firstChild);
    hideConfig(true);
    document.getElementById("vmc-cfg").onclick = toggleConfig;
    box.querySelectorAll("#vmc-mode button").forEach(b => b.onclick = () => setMode(b.dataset.m));
  }

  // --- Mode de ventilation : seul r\u00e9glage accessible sans code ---
  // Les curseurs des ventilateurs restent dans la configuration (code requis).
  const MODES = ["Manuel", "\u00c9co", "Confort", "Boost"];
  async function setMode(opt) {
    const q = "/set?option=" + encodeURIComponent(opt);
    try {
      let r = await fetch("/select/" + encodeURIComponent(N.mode) + q, { method: "POST" });   // ESPHome r\u00e9cent (par nom)
      if (!r.ok) r = await fetch("/select/" + slug(N.mode) + q, { method: "POST" });           // ancien format (object_id)
      if (!r.ok) throw new Error(r.status);
      val.mode = opt; render();
    } catch (e) { alert("Changement de mode impossible (" + e.message + ")"); }
  }

  // --- page standard ESPHome (liste des entit\u00e9s) masqu\u00e9e par d\u00e9faut ---
  function app() { return document.querySelector("esp-app"); }
  function hideConfig(h) { const a = app(); if (a) a.style.display = h ? "none" : ""; }
  let unlocked = false;
  function toggleConfig() {
    const b = document.getElementById("vmc-cfg");
    const isOpen = b.classList.contains("open");
    if (isOpen) { hideConfig(true); b.classList.remove("open"); b.textContent = "\u2699 Configurer"; return; }
    if (!unlocked) {
      const c = prompt("Code d'acc\u00e8s \u00e0 la configuration :");
      if (c !== CODE_CONFIG) { if (c !== null) alert("Code incorrect"); return; }
      unlocked = true;
    }
    hideConfig(false); b.classList.add("open"); b.textContent = "\u2715 Fermer la configuration";
    app() && app().scrollIntoView({ behavior: "smooth" });
  }

  // --------------------------------------------------------------------
  //  Donn\u00e9es en direct (flux /events de l'ESP)
  // --------------------------------------------------------------------
  const num = (k) => (typeof val[k] === "number" && !isNaN(val[k]) ? val[k] : null);
  const set = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };
  const f1 = (k, u) => (num(k) === null ? "-- " + u : num(k).toFixed(1) + " " + u);

  function spin(k, pct) {
    const rot = document.getElementById("rot-" + k);
    if (!rot) return;
    const p = pct === null ? 0 : pct;
    rot.style.animationDuration = p > 0 ? (60 / (20 + p * 1.2)).toFixed(2) + "s" : "0s";
  }

  function render() {
    set("v-text", f1("text", "\u00b0C")); set("v-tins", f1("tins", "\u00b0C"));
    set("v-trep", f1("trep", "\u00b0C")); set("v-trej", f1("trej", "\u00b0C"));
    set("v-vs", (num("vs") === null ? "-- %" : Math.round(num("vs")) + " %") + (num("qs") === null ? "" : " \u00b7 " + Math.round(num("qs")) + " m\u00b3/h"));
    set("v-ve", (num("ve") === null ? "-- %" : Math.round(num("ve")) + " %") + (num("qe") === null ? "" : " \u00b7 " + Math.round(num("qe")) + " m\u00b3/h"));
    set("v-eta", num("eta") === null ? "-- %" : Math.round(num("eta")) + " %");
    set("v-mode", typeof val.mode === "string" ? "Mode : " + val.mode : "");
    set("v-pw", num("pw") === null ? "-- W" : Math.round(num("pw")) + " W");
    set("v-en", (num("en") === null ? "-- kWh" : (num("en") / 1000).toFixed(2) + " kWh") +
      (num("eco") === null ? "" : " \u00b7 " + num("eco").toFixed(2).replace(".", ",") + " \u20ac"));
    set("v-pres", (num("pres") === null ? "-- Pa" : Math.round(num("pres")) + " Pa")
      + (num("cons") === null ? "" : " / consigne " + Math.round(num("cons"))));
    const r = num("ratio");
    const dT = (num("trep") !== null && num("text") !== null) ? num("trep") - num("text") : null;
    set("v-ratio", r === null ? (dT !== null && dT < 6 ? "-- (doux)" : "calcul\u2026") :
      r.toFixed(2) + (r <= 1.1 ? " \u00e9quilibr\u00e9" : r <= 1.3 ? " d\u00e9pression" : " forte d\u00e9pr."));
    spin("s", num("vs")); spin("e", num("ve"));

    // ---- by-pass ----
    const bpKnown = typeof val.bp === "boolean";
    const g = document.getElementById("bp-g");
    if (g) g.style.display = bpKnown ? "" : "none";
    if (bpKnown) {
      const open = val.bp === true;
      const p = document.getElementById("bp-path");
      p.setAttribute("stroke-opacity", open ? ".95" : ".25");
      p.setAttribute("stroke-dasharray", open ? "10 6" : "4 6");
      const t = document.getElementById("bp-txt");
      t.textContent = open ? "BY-PASS OUVERT (free-cooling)" : "by-pass ferm\u00e9";
      t.setAttribute("fill", open ? "#8ab4f8" : "#8a93a6");
    }

    const al = [];
    const on = (k) => val[k] === true;
    al.push(on("givre") ? ["bad", "\u2744 Risque de givre"] : ["", "\u2744 Givre : normal"]);
    if (num("ag") !== null && num("ag") > 0)
      al.push(["bad", "\u2744 Antigel actif : soufflage -" + Math.round(num("ag")) + " %"]);
    al.push(on("froid") ? ["warn", "\ud83c\udf2c Air souffl\u00e9 froid"] : ["", "\ud83c\udf2c Air souffl\u00e9 : normal"]);
    if (bpKnown) {
      const mode = typeof val.bpm === "string" ? val.bpm.toLowerCase() : "?";
      al.push(val.bp ? ["warn", "\u2194 By-pass ouvert (" + mode + ")"] : ["", "\u2194 By-pass ferm\u00e9 (" + mode + ")"]);
    }
    const j = num("fj") === null ? "--" : Math.round(num("fj"));
    al.push(on("filtre") ? ["bad", "\ud83e\uddf9 Filtres \u00e0 changer (" + j + " j)"] : ["", "\ud83e\uddf9 Filtres : " + j + " j"]);
    document.querySelectorAll("#vmc-mode button").forEach(b => b.classList.toggle("on", b.dataset.m === val.mode));
    set("vmc-mode-info", val.mode === "Manuel" ? "vitesses r\u00e9glables dans \u2699 Configurer" : "");
    document.getElementById("vmc-alerts").innerHTML =
      al.map(([c, t]) => `<span class="${c}">${t}</span>`).join("");
    set("vmc-maj", "Mis \u00e0 jour " + new Date().toLocaleTimeString("fr-FR"));
  }

  function keyOf(d) {
    if (d.name && byKey[d.name]) return byKey[d.name];
    if (d.id) {
      const raw = String(d.id).replace(/^[a-z_]+[-/]/, "");
      return byKey[raw] || byKey[slug(raw)];
    }
    return null;
  }

  function connect() {
    const es = new EventSource("/events");
    es.addEventListener("state", (ev) => {
      let d; try { d = JSON.parse(ev.data); } catch (e) { return; }
      const k = keyOf(d); if (!k) return;
      if (typeof d.value === "boolean") val[k] = d.value;
      else if (typeof d.value === "number") val[k] = d.value;
      else if (d.state === "ON" || d.state === "OFF") val[k] = d.state === "ON";
      else { const x = parseFloat(d.state); val[k] = isNaN(x) ? (typeof d.state === "string" ? d.state : null) : x; }
      render();
    });
    es.onerror = () => set("vmc-maj", "connexion perdue\u2026 nouvelle tentative");
  }

  function start() { build(); render(); connect();
    // la page ESPHome peut se construire apr\u00e8s nous : on re-masque si besoin
    setTimeout(() => { if (!document.getElementById("vmc-cfg").classList.contains("open")) hideConfig(true); }, 800);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
