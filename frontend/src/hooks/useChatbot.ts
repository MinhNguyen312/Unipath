export function useChatbot(
  onMessage: (chunk: string) => void,
  onDone: () => void,
  onError: () => void
) {
  return async (text: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_CHATBOT_URL}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: text }] }],
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

          const lines = buffer.split("\n\n"); // mỗi event kết thúc bằng 2 dòng xuống dòng
          buffer = lines.pop() || ""; // giữ phần chưa hoàn chỉnh

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ")) {
              const data = trimmedLine.replace(/^data: /, "");

              try {
                const json = JSON.parse(data);
                const part = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (part) onMessage(part);
              } catch (e) {
                console.warn("Invalid JSON chunk:", data);
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
