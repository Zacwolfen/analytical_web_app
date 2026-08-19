import { useState } from "react";
import { Bot, CheckCircle2, Code2, Send, Sparkles, User } from "lucide-react";
import type { ChatMessage } from "../types";

const suggestions = [
  "What was median revenue for Paid?",
  "Which region is growing fastest?",
  "Find unusual patterns",
  "Predict next month's revenue"
];

export default function Analyst() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "I have access to the active filtered view. Ask me about your data and I’ll show the computation behind the answer." }
  ]);

  function ask(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "assistant", text: "Revenue is trending upward across the active view. December is the strongest month, while South is the largest regional contributor. In the connected backend this response will be produced from a read-only DuckDB query against the same filtered view used by the dashboard." }
    ]);
    setInput("");
  }

  return (
    <div className="analyst-layout">
      <section className="panel chat-panel">
        <div className="panel-head">
          <div>
            <div className="section-kicker"><Sparkles size={13} /> AI ANALYST</div>
            <h2>Ask questions. See the computation.</h2>
            <p>The UI is ready for the Groundtruth tool-calling backend.</p>
          </div>
          <div className="agent-live"><span className="live-dot" /> READY</div>
        </div>

        <div className="chat-history">
          {messages.map((m, i) => (
            <div className={`message ${m.role}`} key={i}>
              <div className="message-avatar">{m.role === "assistant" ? <Bot size={16} /> : <User size={16} />}</div>
              <div>
                <div className="message-role">{m.role === "assistant" ? "Analytix Analyst" : "You"}</div>
                <p>{m.text}</p>
                {m.role === "assistant" && i > 0 && (
                  <div className="query-card">
                    <div><Code2 size={13} /> SQL computation</div>
                    <code>SELECT median(revenue) FROM filtered_view WHERE channel = 'Paid';</code>
                    <span><CheckCircle2 size={13} /> Query verified · read-only</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="suggestion-row">
          {suggestions.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}
        </div>

        <div className="chat-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the active dataset..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
          />
          <button onClick={() => ask(input)}><Send size={16} /></button>
        </div>
      </section>

      <aside className="panel context-panel">
        <div className="section-kicker">ANALYSIS CONTEXT</div>
        <h3>sample_data</h3>
        <div className="context-stat"><span>Rows</span><strong>288</strong></div>
        <div className="context-stat"><span>Columns</span><strong>7</strong></div>
        <div className="context-stat"><span>Filtered rows</span><strong>288</strong></div>
        <div className="context-stat"><span>Data engine</span><strong>DuckDB</strong></div>
        <div className="context-divider" />
        <div className="section-kicker">ACTIVE FILTERS</div>
        <div className="context-tag">Year = 2024</div>
        <div className="context-tag">Region = All</div>
        <div className="context-tag">Channel = All</div>
        <div className="context-divider" />
        <div className="section-kicker">TOOLS</div>
        <div className="tool-row"><span>run_sql</span><span>read-only</span></div>
        <div className="tool-row"><span>make_chart</span><span>enabled</span></div>
        <div className="tool-row"><span>run_stat_test</span><span>enabled</span></div>
      </aside>
    </div>
  );
}
