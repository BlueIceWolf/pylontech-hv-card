const CARD_VERSION = "0.1.1";

const DEFAULT_CONFIG = {
  name: "Pylontech HV BMS",
  show_modules: true,
  show_cells: false,
  show_diagnostics: true,
};

const IDS = {
  soc: "charge_ah_perc",
  voltage: "volt",
  current: "curr",
  power: "diag_power_w",
  temperature: "temp",
  energy: "charge_wh_wh",
  cellLow: "cell_volt_low",
  cellHigh: "cell_volt_high",
  cellDelta: "diag_cell_delta_v",
  tempLow: "cell_temp_low",
  tempHigh: "cell_temp_high",
  tempDelta: "diag_temp_delta_k",
  warning: "warn_any",
  imbalance: "warn_cell_imbalance",
  tempWarning: "warn_temperature",
  voltageWarning: "warn_cell_voltage",
  bmsWarning: "warn_bms_state",
};

const css = `
  :host { display:block; }
  ha-card {
    overflow:hidden;
    padding:20px;
    border-radius:var(--ha-card-border-radius, 18px);
  }
  .head { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:18px; }
  .title { font-size:20px; font-weight:650; line-height:1.2; }
  .subtitle { color:var(--secondary-text-color); font-size:13px; margin-top:4px; }
  .status {
    padding:7px 11px; border-radius:999px; font-size:12px; font-weight:650;
    background:rgba(var(--rgb-success-color, 67,160,71),.12);
    color:var(--success-color, #43a047); white-space:nowrap;
  }
  .status.warn {
    background:rgba(var(--rgb-error-color, 211,47,47),.12);
    color:var(--error-color, #d32f2f);
  }
  .hero {
    display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,1fr); gap:14px; margin-bottom:14px;
  }
  .panel {
    border:1px solid var(--divider-color);
    border-radius:16px; padding:16px; background:var(--ha-card-background, var(--card-background-color));
  }
  .socrow { display:flex; align-items:center; gap:16px; }
  .battery {
    width:62px; height:92px; border:3px solid var(--primary-text-color); border-radius:10px;
    position:relative; overflow:hidden; flex:0 0 auto; opacity:.9;
  }
  .battery:after {
    content:""; width:24px; height:7px; border-radius:4px 4px 0 0;
    background:var(--primary-text-color); position:absolute; top:-10px; left:16px;
  }
  .fill { position:absolute; left:4px; right:4px; bottom:4px; border-radius:5px; background:var(--success-color,#43a047); min-height:2px; transition:height .3s ease; }
  .soc { font-size:38px; font-weight:700; letter-spacing:-1px; }
  .label { color:var(--secondary-text-color); font-size:13px; }
  .power { font-size:28px; font-weight:700; margin-top:4px; }
  .flow { color:var(--secondary-text-color); margin-top:3px; font-size:13px; }
  .metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:14px; }
  .metric { padding:12px; border-radius:13px; background:var(--secondary-background-color); min-width:0; }
  .metric .v { font-size:17px; font-weight:650; overflow:hidden; text-overflow:ellipsis; }
  .metric .k { font-size:11px; margin-top:4px; color:var(--secondary-text-color); }
  .section { margin-top:14px; }
  .section-title { font-weight:650; margin:0 0 10px 2px; font-size:14px; }
  .cellline { display:grid; grid-template-columns:1fr auto 1fr; gap:10px; align-items:center; }
  .cellbox { padding:12px; background:var(--secondary-background-color); border-radius:13px; }
  .cellbox.right { text-align:right; }
  .delta { text-align:center; font-size:13px; color:var(--secondary-text-color); }
  .delta strong { display:block; color:var(--primary-text-color); font-size:18px; }
  .warning {
    display:flex; gap:10px; align-items:flex-start; padding:13px; border-radius:13px;
    background:rgba(var(--rgb-success-color,67,160,71),.10);
  }
  .warning.active { background:rgba(var(--rgb-error-color,211,47,47),.10); }
  .warning ha-icon { color:var(--success-color,#43a047); }
  .warning.active ha-icon { color:var(--error-color,#d32f2f); }
  .warning-text { font-size:13px; line-height:1.4; }
  .warning-text strong { display:block; margin-bottom:2px; }
  details { margin-top:12px; border-top:1px solid var(--divider-color); padding-top:12px; }
  summary { cursor:pointer; font-weight:650; font-size:14px; user-select:none; }
  .modules { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:10px; }
  .module { background:var(--secondary-background-color); border-radius:12px; padding:11px; }
  .module-head { display:flex; justify-content:space-between; gap:8px; font-weight:650; font-size:13px; }
  .module-data { color:var(--secondary-text-color); font-size:12px; margin-top:5px; }
  .cells { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:6px; margin-top:10px; }
  .cell { background:var(--secondary-background-color); border-radius:9px; padding:8px 6px; text-align:center; font-size:11px; }
  .cell strong { display:block; color:var(--primary-text-color); font-size:12px; }
  .empty { color:var(--secondary-text-color); padding:12px 0 2px; font-size:13px; }
  @media (max-width:600px) {
    ha-card { padding:16px; }
    .hero { grid-template-columns:1fr; }
    .metrics { grid-template-columns:repeat(2,1fr); }
    .modules { grid-template-columns:1fr; }
    .cells { grid-template-columns:repeat(3,minmax(0,1fr)); }
  }
`;

class PylontechHvCard extends HTMLElement {
  static getConfigElement() { return document.createElement("pylontech-hv-card-editor"); }

  static getStubConfig() {
    return { type: "custom:pylontech-hv-card", ...DEFAULT_CONFIG };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._entities = {};
    this._registryLoaded = false;
    this._loadingRegistry = false;
  }

  setConfig(config) {
    if (!config) throw new Error("Configuration required");
    this._config = { ...DEFAULT_CONFIG, ...config };
    this._registryLoaded = false;
    this._entities = {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._registryLoaded && !this._loadingRegistry && this._config?.entity) {
      this._discoverEntities();
    }
    this._render();
  }

  getCardSize() { return this._config?.show_modules ? 6 : 4; }

  async _discoverEntities() {
    if (!this._hass?.connection || !this._config?.entity) return;
    this._loadingRegistry = true;
    try {
      const registry = await this._hass.connection.sendMessagePromise({
        type: "config/entity_registry/list",
      });
      const anchor = registry.find((e) => e.entity_id === this._config.entity);
      if (!anchor) {
        this._entities = {};
        this._registryLoaded = true;
        return;
      }

      const uniqueId = String(anchor.unique_id || "");
      const serial = uniqueId.includes("-") ? uniqueId.substring(uniqueId.lastIndexOf("-") + 1) : "";
      const sameIntegration = registry.filter((e) =>
        e.platform === "pylontech_hv" &&
        (!serial || String(e.unique_id || "").endsWith("-" + serial))
      );

      const map = {};
      for (const entry of sameIntegration) {
        const uid = String(entry.unique_id || "");
        const suffix = serial && uid.endsWith("-" + serial) ? uid.slice(0, -(serial.length + 1)) : uid;
        map[suffix] = entry.entity_id;
      }
      this._entities = map;
      this._registryLoaded = true;
    } catch (err) {
      console.warn("[Pylontech HV Card] Entity discovery failed", err);
      this._entities = {};
      this._registryLoaded = true;
    } finally {
      this._loadingRegistry = false;
      this._render();
    }
  }

  _entity(id) {
    const entityId = this._entities[id];
    return entityId ? this._hass?.states?.[entityId] : undefined;
  }

  _state(id) { return this._entity(id)?.state; }

  _num(id) {
    const v = Number(this._state(id));
    return Number.isFinite(v) ? v : null;
  }

  _fmt(id, digits = 1, unit = "") {
    const v = this._num(id);
    return v === null ? "—" : `${v.toFixed(digits)}${unit ? " " + unit : ""}`;
  }

  _warningInfo() {
    const entity = this._entity(IDS.warning);
    if (!entity) return { active:false, message:"Keine Warnung" };
    const active = entity.state === "on";
    return {
      active,
      message: entity.attributes?.meldung || (active ? "BMS meldet eine Warnung" : "Keine Warnung"),
    };
  }

  _moduleRows() {
    const modules = new Map();
    for (const [key, entityId] of Object.entries(this._entities)) {
      const match = key.match(/^(volt|curr|temp|charge_ah_perc|cell_volt_low|cell_volt_high)_bmu_(.+)$/);
      if (!match) continue;
      const [, sensor, bmu] = match;
      if (!modules.has(bmu)) modules.set(bmu, {});
      modules.get(bmu)[sensor] = entityId;
    }
    return [...modules.entries()].sort((a,b) => Number(a[0]) - Number(b[0]));
  }

  _cellRows() {
    const rows = [];
    for (const [key, entityId] of Object.entries(this._entities)) {
      const match = key.match(/^volt_cell_(.+)_(\d+)$/);
      if (!match) continue;
      rows.push({ bmu: match[1], cell: Number(match[2]) + 1, entityId });
    }
    return rows.sort((a,b) => Number(a.bmu) - Number(b.bmu) || a.cell - b.cell);
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    if (!this._hass) return;

    if (!this._config.entity) {
      this.shadowRoot.innerHTML = `<style>${css}</style><ha-card><div class="empty">Bitte eine Pylontech-Entität auswählen.</div></ha-card>`;
      return;
    }

    const anchor = this._hass.states[this._config.entity];
    if (!anchor) {
      this.shadowRoot.innerHTML = `<style>${css}</style><ha-card><div class="empty">Entität ${this._config.entity} wurde nicht gefunden.</div></ha-card>`;
      return;
    }

    const soc = this._num(IDS.soc);
    const voltage = this._num(IDS.voltage);
    const current = this._num(IDS.current);
    const power = this._num(IDS.power);
    const temp = this._num(IDS.temperature);
    const energy = this._num(IDS.energy);
    const warning = this._warningInfo();

    const flow = power === null ? "Leistung unbekannt" :
      Math.abs(power) < 30 ? "Ruhezustand" :
      power > 0 ? "Laden" : "Entladen";

    const powerText = power === null ? "—" : `${(power / 1000).toFixed(2)} kW`;
    const cellLow = this._num(IDS.cellLow);
    const cellHigh = this._num(IDS.cellHigh);
    const cellDelta = this._num(IDS.cellDelta);
    const tempLow = this._num(IDS.tempLow);
    const tempHigh = this._num(IDS.tempHigh);
    const tempDelta = this._num(IDS.tempDelta);
    const modules = this._moduleRows();
    const cells = this._cellRows();

    const moduleHtml = modules.map(([bmu, values]) => {
      const get = (key, digits, unit) => {
        const st = this._hass.states[values[key]];
        const num = Number(st?.state);
        return Number.isFinite(num) ? `${num.toFixed(digits)} ${unit}` : "—";
      };
      return `<div class="module">
        <div class="module-head"><span>BMU ${bmu}</span><span>${get("charge_ah_perc",0,"%")}</span></div>
        <div class="module-data">${get("volt",2,"V")} · ${get("temp",1,"°C")}</div>
      </div>`;
    }).join("");

    const cellHtml = cells.map((c) => {
      const st = this._hass.states[c.entityId];
      const n = Number(st?.state);
      const v = Number.isFinite(n) ? n.toFixed(3) + " V" : "—";
      return `<div class="cell">BMU ${c.bmu} · Z${c.cell}<strong>${v}</strong></div>`;
    }).join("");

    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <ha-card>
        <div class="head">
          <div>
            <div class="title">${this._config.name}</div>
            <div class="subtitle">Pylontech HV Batterie</div>
          </div>
          <div class="status ${warning.active ? "warn" : ""}">${warning.active ? "Warnung" : "Normal"}</div>
        </div>

        <div class="hero">
          <div class="panel">
            <div class="socrow">
              <div class="battery"><div class="fill" style="height:${Math.max(0,Math.min(100,soc ?? 0)) * .84}px"></div></div>
              <div>
                <div class="soc">${soc === null ? "—" : Math.round(soc) + " %"}</div>
                <div class="label">Ladezustand</div>
                ${energy !== null ? `<div class="label" style="margin-top:7px">${(energy/1000).toFixed(2)} kWh gespeichert</div>` : ""}
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="label">Momentane Leistung</div>
            <div class="power">${powerText}</div>
            <div class="flow">${flow}</div>
            <div class="metrics">
              <div class="metric"><div class="v">${voltage === null ? "—" : voltage.toFixed(1)+" V"}</div><div class="k">Spannung</div></div>
              <div class="metric"><div class="v">${current === null ? "—" : current.toFixed(1)+" A"}</div><div class="k">Strom</div></div>
              <div class="metric"><div class="v">${temp === null ? "—" : temp.toFixed(1)+" °C"}</div><div class="k">Temperatur</div></div>
            </div>
          </div>
        </div>

        <div class="panel section">
          <div class="section-title">Zellgesundheit</div>
          <div class="cellline">
            <div class="cellbox"><div class="label">Niedrigste Zelle</div><strong>${cellLow === null ? "—" : cellLow.toFixed(3)+" V"}</strong></div>
            <div class="delta"><strong>${cellDelta === null ? "—" : Math.round(cellDelta*1000)+" mV"}</strong>Differenz</div>
            <div class="cellbox right"><div class="label">Höchste Zelle</div><strong>${cellHigh === null ? "—" : cellHigh.toFixed(3)+" V"}</strong></div>
          </div>
          <div class="metrics">
            <div class="metric"><div class="v">${tempLow === null ? "—" : tempLow.toFixed(1)+" °C"}</div><div class="k">Zelle kalt</div></div>
            <div class="metric"><div class="v">${tempHigh === null ? "—" : tempHigh.toFixed(1)+" °C"}</div><div class="k">Zelle warm</div></div>
            <div class="metric"><div class="v">${tempDelta === null ? "—" : tempDelta.toFixed(1)+" K"}</div><div class="k">Temperatur-Delta</div></div>
          </div>
        </div>

        ${this._config.show_diagnostics ? `
        <div class="panel section">
          <div class="section-title">Systemzustand</div>
          <div class="warning ${warning.active ? "active" : ""}">
            <ha-icon icon="${warning.active ? "mdi:alert-circle" : "mdi:check-circle"}"></ha-icon>
            <div class="warning-text"><strong>${warning.active ? "BMS-Warnung aktiv" : "Batterie arbeitet normal"}</strong>${warning.message}</div>
          </div>
        </div>` : ""}

        ${this._config.show_modules ? `
        <details>
          <summary>Module anzeigen (${modules.length})</summary>
          <div class="modules">${moduleHtml || '<div class="empty">Keine BMU-Entitäten gefunden.</div>'}</div>
        </details>` : ""}

        ${this._config.show_cells ? `
        <details>
          <summary>Zellen anzeigen (${cells.length})</summary>
          <div class="cells">${cellHtml || '<div class="empty">Keine Zellspannungen gefunden.</div>'}</div>
        </details>` : ""}
      </ha-card>
    `;
  }
}

class PylontechHvCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:"open"});
  }

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...config };
    this._render();
  }

  set hass(hass) {
    const firstRender = !this._hass;
    this._hass = hass;

    if (firstRender) {
      this._render();
      return;
    }

    const picker = this.shadowRoot?.getElementById("entity");
    if (picker) {
      picker.hass = hass;
    }
  }

  _changed(key, value) {
    const config = { ...this._config, [key]: value };
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail:{ config }, bubbles:true, composed:true }));
  }

  _render() {
    if (!this._config || !this._hass) return;
    this.shadowRoot.innerHTML = `
      <style>
        .wrap{display:grid;gap:14px;padding:8px 0}
        .row{display:flex;align-items:center;justify-content:space-between;gap:18px}
        label{font-size:14px}
        input[type=text]{width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color);color:var(--primary-text-color)}
      </style>
      <div class="wrap">
        <ha-entity-picker id="entity" label="Pylontech Entität" allow-custom-entity></ha-entity-picker>
        <input id="name" type="text" value="${this._config.name || ""}" placeholder="Name">
        <div class="row"><label>Module anzeigen</label><ha-switch id="modules" ${this._config.show_modules ? "checked" : ""}></ha-switch></div>
        <div class="row"><label>Zellen anzeigen</label><ha-switch id="cells" ${this._config.show_cells ? "checked" : ""}></ha-switch></div>
        <div class="row"><label>Diagnose anzeigen</label><ha-switch id="diag" ${this._config.show_diagnostics ? "checked" : ""}></ha-switch></div>
      </div>
    `;

    const picker = this.shadowRoot.getElementById("entity");
    picker.hass = this._hass;
    picker.value = this._config.entity || "";
    picker.includeDomains = ["sensor","binary_sensor"];
    picker.addEventListener("value-changed", (e) => this._changed("entity", e.detail.value));

    this.shadowRoot.getElementById("name").addEventListener("change", (e) => this._changed("name", e.target.value));
    this.shadowRoot.getElementById("modules").addEventListener("change", (e) => this._changed("show_modules", e.target.checked));
    this.shadowRoot.getElementById("cells").addEventListener("change", (e) => this._changed("show_cells", e.target.checked));
    this.shadowRoot.getElementById("diag").addEventListener("change", (e) => this._changed("show_diagnostics", e.target.checked));
  }
}

if (!customElements.get("pylontech-hv-card")) customElements.define("pylontech-hv-card", PylontechHvCard);
if (!customElements.get("pylontech-hv-card-editor")) customElements.define("pylontech-hv-card-editor", PylontechHvCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "pylontech-hv-card",
  name: "Pylontech HV Card",
  description: "Modern battery overview for the Pylontech HV BMS integration.",
  preview: true,
});

console.info(`%c PYLONTECH-HV-CARD %c v${CARD_VERSION} `, "background:#263238;color:white;padding:3px 5px;border-radius:3px 0 0 3px", "background:#eceff1;color:#263238;padding:3px 5px;border-radius:0 3px 3px 0");
