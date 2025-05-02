export function useChatbot(
  onMessage: (chunk: string) => void,
  onDone: () => void,
  onError: () => void
) {
  return async (text: string) => {
    try {
      const res = await fetch("http://localhost:8000/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text }] }],
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim().startsWith("{")) {
              try {
                const json = JSON.parse(line.trim());
                const part = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (part) onMessage(part);
              } catch (e) {
                console.warn("Invalid JSON chunk:", line);
              }
            }
          }
        }
        done = readerDone;
      }

      onDone();
    } catch (error) {
      console.error("Streaming error:", error);
      onError();
    }
  };
}
