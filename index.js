// /api/copilot
module.exports = async function (context, req) {
  context.res = {
    headers: { "Content-Type": "application/json" }
  };

  try {
    const { prompt = "", context: ctx = {} } = req.body || {};
    const { Category, Market, Channel } = ctx;

    // --- TODO (later): exchange for Entra ID token and call Copilot APIs ---
    // e.g., Retrieval API -> get extracts; Chat API (preview) -> synthesize answer
    // ----------------------------------------------------------------------

    const answer = `**Draft answer (stub):**  
You asked: "${prompt}"

**Current slice**  
- Category: ${Category || "n/a"}  
- Market: ${Market || "n/a"}  
- Channel: ${Channel || "n/a"}  

Once Copilot APIs are wired, this section will include grounded insights and citations.`;

    context.res.body = { answer, answerHtml: markdownToHtml(answer) };
  } catch (e) {
    context.log.error(e);
    context.res.status = 500;
    context.res.body = { error: e.message };
  }
};

function markdownToHtml(md) {
  // ultra-light converter for bold & line breaks (good enough for stub)
  return md
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}
