class CopilotWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = { loading: false, error: null, answer: "" };

    const style = `
      :host { display:block; height:100%; }
      .wrap { font-family: Segoe UI, Roboto, Arial, sans-serif; display:flex; flex-direction:column; height:100%; }
      h3 { margin: 6px 0 8px; font-weight:600; font-size: 14px; }
      .row { display:flex; gap:8px; }
      textarea { flex: 1; min-height: 64px; resize: vertical; }
      button { white-space: nowrap; padding: 6px 12px; }
      .meta { color:#666; font-size:12px; margin: 6px 0 8px; }
      .answer { margin-top:10px; padding:10px; background:#fafafa; border:1px solid #eee; border-radius:6px; overflow:auto; }
    `;

    const html = `
      <div class="wrap">
        <h3 id="title"></h3>
        <div class="meta" id="meta"></div>
        <div class="row">
          <textarea id="prompt" placeholder="e.g., Explain promotion GM% impact for this slice"></textarea>
          <button id="ask">Ask</button>
        </div>
        <div class="answer" id="answer">Ask a question to see the response here.</div>
      </div>
    `;

    const root = document.createElement('div');
    const styleEl = document.createElement('style');
    styleEl.textContent = style;
    root.innerHTML = html;
    this.shadowRoot.append(styleEl, root);
  }

  connectedCallback() {
    this._titleEl = this.shadowRoot.getElementById('title');
    this._metaEl = this.shadowRoot.getElementById('meta');
    this._answerEl = this.shadowRoot.getElementById('answer');
    this._promptEl = this.shadowRoot.getElementById('prompt');
    this.shadowRoot.getElementById('ask').addEventListener('click', () => this.ask());
    this.render();
  }

  // SAC injects properties through this setter
  onCustomWidgetAfterUpdate(changedProps) { this.render(); }
  onCustomWidgetResize(width, height) { /* optional: adjust layout */ }
  onCustomWidgetDestroy() {}

  get _props() {
    // Exposed via metadata.json
    return {
      Title: this._export_settings?.Title || "Ask Copilot",
      BackendUrl: this._export_settings?.BackendUrl || "",
      Category: this._export_settings?.Category || "",
      Market: this._export_settings?.Market || "",
      Channel: this._export_settings?.Channel || ""
    };
  }

  render() {
    const { Title, Category, Market, Channel } = this._props;
    this._titleEl.textContent = Title;
    const chips = [Category && `Category: ${Category}`, Market && `Market: ${Market}`, Channel && `Channel: ${Channel}`]
      .filter(Boolean)
      .join("  •  ");
    this._metaEl.textContent = chips || "No context set";
  }

  async ask() {
    const { BackendUrl, Category, Market, Channel } = this._props;
    const prompt = this._promptEl.value?.trim();
    if (!BackendUrl) {
      this._answerEl.textContent = "BackendUrl is not configured.";
      return;
    }
    if (!prompt) {
      this._answerEl.textContent = "Type a question to ask Copilot.";
      return;
    }
    this._answerEl.textContent = "Thinking…";
    try {
      const resp = await fetch(BackendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: { Category, Market, Channel } })
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      this._answerEl.innerHTML = json.answerHtml || this.escape(json.answer || "No content");
    } catch (e) {
      this._answerEl.textContent = `Error: ${e.message}`;
    }
  }

  escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
}
customElements.define('sac-copilot-widget', CopilotWidget);
``
