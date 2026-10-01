const CARD_VERSION = "1.0.3";

const DEFAULT_CONFIG = {
  name: "Pylontech HV BMS",
  show_modules: true,
  show_cells: false,
  show_diagnostics: true,
  show_source_bmu: true,
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
  :host { display:block; container-type:inline-size; }
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
  .metric .v { font-size:clamp(15px, 4cqi, 17px); font-weight:650; white-space:nowrap; }
  .metric .k { font-size:11px; margin-top:4px; color:var(--secondary-text-color); }
  .section { margin-top:14px; }
  .section-title { font-weight:650; margin:0 0 10px 2px; font-size:14px; }
  .cellline { display:grid; grid-template-columns:1fr auto 1fr; gap:10px; align-items:center; }
  .cellbox { padding:12px; background:var(--secondary-background-color); border-radius:13px; }
  .cellbox.right { text-align:right; }
  .source { color:var(--secondary-text-color); font-size:10px; margin-top:4px; line-height:1.25; }
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
  @container (max-width:680px) {
    ha-card { padding:16px; }
    .hero { grid-template-columns:1fr; }
    .metrics { grid-template-columns:repeat(3,minmax(0,1fr)); }
    .modules { grid-template-columns:1fr; }
    .cells { grid-template-columns:repeat(3,minmax(0,1fr)); }
  }
  @container (max-width:420px) {
    .metrics { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .cellline { grid-template-columns:1fr; }
    .cellbox.right { text-align:left; }
    .delta { text-align:left; padding:0 2px; }
    .cells { grid-template-columns:repeat(2,minmax(0,1fr)); }
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
    this._structureReady = false;
  }

  setConfig(config) {
    if (!config) throw new Error("Configuration required");
    this._config = { ...DEFAULT_CONFIG, ...config };
    this._registryLoaded = false;
    this._entities = {};
    this._structureReady = false;
    this._render();
  }

  set hass(hass) {
    const firstUpdate = !this._hass;
    this._hass = hass;

    if (!this._registryLoaded && !this._loadingRegistry && this._config?.entity) {
      this._discoverEntities();
    }

    const signature = this._buildStateSignature();
    if (firstUpdate || signature !== this._lastStateSignature) {
      this._lastStateSignature = signature;
      this._render();
    }
  }

  _buildStateSignature() {
    if (!this._hass || !this._config) return "";

    const entityIds = new Set();
    if (this._config.entity) entityIds.add(this._config.entity);
    Object.values(this._entities || {}).forEach((entityId) => entityIds.add(entityId));

    return [...entityIds]
      .sort()
      .map((entityId) => {
        const state = this._hass.states?.[entityId];
        if (!state) return `${entityId}:missing`;
        const attrs = state.attributes || {};
        const relevantAttrs = entityId === this._entities?.[IDS.warning]
          ? {
              meldung: attrs.meldung,
              zell_delta_v: attrs.zell_delta_v,
              temperatur_delta_k: attrs.temperatur_delta_k,
              fehlercode: attrs.fehlercode,
            }
          : {};
        return `${entityId}:${state.state}:${JSON.stringify(relevantAttrs)}`;
      })
      .join("|");
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
      this._structureReady = false;
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

  _findBmuForExtreme(sensorKey, targetValue) {
    if (targetValue === null || targetValue === undefined) return null;

    let best = null;
    let bestDiff = Infinity;

    for (const [key, entityId] of Object.entries(this._entities || {})) {
      const match = key.match(new RegExp("^" + sensorKey + "_bmu_(.+)$"));
      if (!match) continue;

      const value = Number(this._hass?.states?.[entityId]?.state);
      if (!Number.isFinite(value)) continue;

      const diff = Math.abs(value - targetValue);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = match[1];
      }
    }

    // Module values should normally match exactly; allow a tiny rounding tolerance.
    return bestDiff <= 0.005 ? best : null;
  }

  _render() {
    if (!this.shadowRoot || !this._config || !this._hass) return;

    if (!this._config.entity) {
      if (!this._structureReady) {
        this.shadowRoot.innerHTML = `<style>${css}</style><ha-card><div class="empty">Wähle beim Einrichten irgendeinen Datenpunkt vom Pylontech HV BMS aus. Die restlichen Werte werden automatisch erkannt.</div></ha-card>`;
      }
      return;
    }

    const anchor = this._hass.states[this._config.entity];
    if (!anchor) {
      this.shadowRoot.innerHTML = `<style>${css}</style><ha-card><div class="empty">Entität ${this._config.entity} wurde nicht gefunden.</div></ha-card>`;
      this._structureReady = false;
      return;
    }

    if (!this._structureReady) {
      this._renderStructure();
      this._structureReady = true;
    }

    this._updateDom();
  }

  _renderStructure() {
    const modules = this._moduleRows();
    const cells = this._cellRows();

    const moduleHtml = modules.map(([bmu]) => `
      <div class="module" data-bmu="${bmu}">
        <div class="module-head"><span>BMU ${bmu}</span><span data-field="soc">—</span></div>
        <div class="module-data"><span data-field="volt">—</span> · <span data-field="temp">—</span></div>
      </div>
    `).join("");

    const cellHtml = cells.map((cell) => `
      <div class="cell" data-cell="${cell.entityId}">BMU ${cell.bmu} · Z${cell.cell}<strong>—</strong></div>
    `).join("");

    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <ha-card>
        <div class="head">
          <div>
            <div class="title" id="title"></div>
            <div class="subtitle">Pylontech HV Batterie</div>
          </div>
          <div class="status" id="status">Normal</div>
        </div>

        <div class="hero">
          <div class="panel">
            <div class="socrow">
              <div class="battery"><div class="fill" id="battery-fill"></div></div>
              <div>
                <div class="soc" id="soc">—</div>
                <div class="label">Ladezustand</div>
                <div class="label" id="energy" style="margin-top:7px"></div>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="label">Momentane Leistung</div>
            <div class="power" id="power">—</div>
            <div class="flow" id="flow">Leistung unbekannt</div>
            <div class="metrics">
              <div class="metric"><div class="v" id="voltage">—</div><div class="k">Spannung</div></div>
              <div class="metric"><div class="v" id="current">—</div><div class="k">Strom</div></div>
              <div class="metric"><div class="v" id="temperature">—</div><div class="k">BMS-Temperatur</div></div>
            </div>
          </div>
        </div>

        <div class="panel section">
          <div class="section-title">Zellgesundheit</div>
          <div class="cellline">
            <div class="cellbox"><div class="label">Niedrigste Zellspannung</div><strong id="cell-low">—</strong><div class="source" id="cell-low-source"></div></div>
            <div class="delta"><strong id="cell-delta">—</strong>Differenz</div>
            <div class="cellbox right"><div class="label">Höchste Zellspannung</div><strong id="cell-high">—</strong><div class="source" id="cell-high-source"></div></div>
          </div>
          <div class="metrics">
            <div class="metric"><div class="v" id="temp-low">—</div><div class="k">Niedrigste Zelltemperatur</div><div class="source" id="temp-low-source"></div></div>
            <div class="metric"><div class="v" id="temp-high">—</div><div class="k">Höchste Zelltemperatur</div><div class="source" id="temp-high-source"></div></div>
            <div class="metric"><div class="v" id="temp-delta">—</div><div class="k">Zelltemperatur-Differenz</div></div>
          </div>
        </div>

        ${this._config.show_diagnostics ? `
        <div class="panel section">
          <div class="section-title">Systemzustand</div>
          <div class="warning" id="warning-box">
            <ha-icon id="warning-icon" icon="mdi:check-circle"></ha-icon>
            <div class="warning-text"><strong id="warning-title">Batterie arbeitet normal</strong><span id="warning-message">Keine Warnung</span></div>
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

  _setText(id, value) {
    const element = this.shadowRoot.getElementById(id);
    if (element && element.textContent !== value) element.textContent = value;
  }

  _updateDom() {
    const soc = this._num(IDS.soc);
    const voltage = this._num(IDS.voltage);
    const current = this._num(IDS.current);
    const power = this._num(IDS.power);
    const temp = this._num(IDS.temperature);
    const energy = this._num(IDS.energy);
    const cellLow = this._num(IDS.cellLow);
    const cellHigh = this._num(IDS.cellHigh);
    const cellDelta = this._num(IDS.cellDelta);
    const tempLow = this._num(IDS.tempLow);
    const tempHigh = this._num(IDS.tempHigh);
    const tempDelta = this._num(IDS.tempDelta);
    const warning = this._warningInfo();

    const flow = power === null ? "Leistung unbekannt" :
      Math.abs(power) < 30 ? "Ruhezustand" :
      power > 0 ? "Laden" : "Entladen";

    this._setText("title", this._config.name || "Pylontech HV BMS");
    this._setText("status", warning.active ? "Warnung" : "Normal");
    this._setText("soc", soc === null ? "—" : Math.round(soc) + " %");
    this._setText("energy", energy === null ? "" : (energy / 1000).toFixed(2) + " kWh gespeichert");
    this._setText("power", power === null ? "—" : (power / 1000).toFixed(2) + " kW");
    this._setText("flow", flow);
    this._setText("voltage", voltage === null ? "—" : voltage.toFixed(1) + " V");
    this._setText("current", current === null ? "—" : current.toFixed(1) + " A");
    this._setText("temperature", temp === null ? "—" : temp.toFixed(1) + " °C");
    this._setText("cell-low", cellLow === null ? "—" : cellLow.toFixed(3) + " V");
    this._setText("cell-high", cellHigh === null ? "—" : cellHigh.toFixed(3) + " V");
    this._setText("cell-delta", cellDelta === null ? "—" : Math.round(cellDelta * 1000) + " mV");
    this._setText("temp-low", tempLow === null ? "—" : tempLow.toFixed(1) + " °C");
    this._setText("temp-high", tempHigh === null ? "—" : tempHigh.toFixed(1) + " °C");
    this._setText("temp-delta", tempDelta === null ? "—" : tempDelta.toFixed(1) + " K");

    const cellLowBmu = this._findBmuForExtreme("cell_volt_low", cellLow);
    const cellHighBmu = this._findBmuForExtreme("cell_volt_high", cellHigh);
    const tempLowBmu = this._findBmuForExtreme("cell_temp_low", tempLow);
    const tempHighBmu = this._findBmuForExtreme("cell_temp_high", tempHigh);

    const showSourceBmu = this._config.show_source_bmu !== false;
    this._setText("cell-low-source", showSourceBmu && cellLowBmu !== null ? "aus BMU " + cellLowBmu : "");
    this._setText("cell-high-source", showSourceBmu && cellHighBmu !== null ? "aus BMU " + cellHighBmu : "");
    this._setText("temp-low-source", showSourceBmu && tempLowBmu !== null ? "aus BMU " + tempLowBmu : "");
    this._setText("temp-high-source", showSourceBmu && tempHighBmu !== null ? "aus BMU " + tempHighBmu : "");

    const fill = this.shadowRoot.getElementById("battery-fill");
    if (fill) fill.style.height = Math.max(0, Math.min(100, soc ?? 0)) * 0.84 + "px";

    const status = this.shadowRoot.getElementById("status");
    if (status) status.classList.toggle("warn", warning.active);

    const warningBox = this.shadowRoot.getElementById("warning-box");
    const warningIcon = this.shadowRoot.getElementById("warning-icon");
    if (warningBox) warningBox.classList.toggle("active", warning.active);
    if (warningIcon) warningIcon.setAttribute("icon", warning.active ? "mdi:alert-circle" : "mdi:check-circle");
    this._setText("warning-title", warning.active ? "BMS-Warnung aktiv" : "Batterie arbeitet normal");
    this._setText("warning-message", warning.message);

    const modules = this._moduleRows();
    for (const [bmu, values] of modules) {
      const row = this.shadowRoot.querySelector(`.module[data-bmu="${CSS.escape(String(bmu))}"]`);
      if (!row) continue;

      const formatEntity = (entityId, digits, unit) => {
        const value = Number(this._hass.states?.[entityId]?.state);
        return Number.isFinite(value) ? value.toFixed(digits) + " " + unit : "—";
      };

      const socEl = row.querySelector('[data-field="soc"]');
      const voltEl = row.querySelector('[data-field="volt"]');
      const tempEl = row.querySelector('[data-field="temp"]');
      if (socEl) socEl.textContent = formatEntity(values.charge_ah_perc, 0, "%");
      if (voltEl) voltEl.textContent = formatEntity(values.volt, 2, "V");
      if (tempEl) tempEl.textContent = formatEntity(values.temp, 1, "°C");
    }

    for (const cell of this._cellRows()) {
      const row = [...this.shadowRoot.querySelectorAll(".cell")].find((el) => el.dataset.cell === cell.entityId);
      if (!row) continue;
      const value = Number(this._hass.states?.[cell.entityId]?.state);
      const strong = row.querySelector("strong");
      if (strong) strong.textContent = Number.isFinite(value) ? value.toFixed(3) + " V" : "—";
    }
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
        .hint{font-size:13px;line-height:1.45;color:var(--secondary-text-color);padding:10px 12px;border-radius:10px;background:var(--secondary-background-color)}
        .hint strong{color:var(--primary-text-color)}
        .row{display:flex;align-items:center;justify-content:space-between;gap:18px}
        label{font-size:14px}
        input[type=text]{width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color);color:var(--primary-text-color)}
      </style>
      <div class="wrap">
        <div class="hint"><strong>Einfach irgendeinen Datenpunkt auswählen.</strong><br>Wähle eine beliebige Entität vom Pylontech HV BMS. Die Card erkennt automatisch alle weiteren Werte, Module und Warnungen desselben Batteriesystems.</div>
        <ha-entity-picker id="entity" label="Datenpunkt vom Pylontech HV BMS" allow-custom-entity></ha-entity-picker>
        <input id="name" type="text" value="${this._config.name || ""}" placeholder="Name">
        <div class="row"><label>Module anzeigen</label><ha-switch id="modules" ${this._config.show_modules ? "checked" : ""}></ha-switch></div>
        <div class="row"><label>Zellen anzeigen</label><ha-switch id="cells" ${this._config.show_cells ? "checked" : ""}></ha-switch></div>
        <div class="row"><label>Diagnose anzeigen</label><ha-switch id="diag" ${this._config.show_diagnostics ? "checked" : ""}></ha-switch></div>
        <div class="row"><label>BMU-Herkunft anzeigen</label><ha-switch id="sourcebmu" ${this._config.show_source_bmu ? "checked" : ""}></ha-switch></div>
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
    this.shadowRoot.getElementById("sourcebmu").addEventListener("change", (e) => this._changed("show_source_bmu", e.target.checked));
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
