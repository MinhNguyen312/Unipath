export function useChatbot(
  onMessage: (chunk: string) => void,
  onFunctionCall: (name: string, args: any) => void,
  onFunctionResponse: (name: string, response: any) => void,
  onDone: () => void,
  onError: () => void,
  onRateLimitError?: () => void
) {
  return async (messages: { content: string | null; isUser: boolean; functionCall: JSON | null; functionResponse: JSON | null }[]) => {
    let shouldStop;
    try {
      const formattedMessages = messages.map((msg) => {
        let role = msg.isUser ? "user" : "model";
        let parts: { text?: string; functionCall?: JSON; functionResponse?: JSON }[] = [];
        
        if (msg.content && msg.content.trim() !== "") {
          parts = [{ text: msg.content }];
        } else if (msg.functionCall) {
          parts = [{ functionCall: msg.functionCall }];
        } else if (msg.functionResponse) {
          role = "user";
          parts = [{ functionResponse: msg.functionResponse }];
        }
  
        return {
          role,
          parts,
        };
      });

      const res = await fetch(`${import.meta.env.VITE_CHATBOT_URL}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedMessages,
        }),
      });

      if (res.status === 429) {
        if (onRateLimitError) onRateLimitError();
        return;
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ")) {
              const data = trimmedLine.replace(/^data: /, "");

              try {
                const json = JSON.parse(data);
                if (json.functionCall) {
                  onFunctionCall(json.functionCall.name, json.functionCall.args);
                  shouldStop = true
                  continue;
                }
                if (json.functionResponse) {
                  onFunctionResponse(
                    json.functionResponse.name, 
                    json.functionResponse.response
                  );
                  continue;
                }
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
      if (shouldStop) {
        onDone();
      } else {
        onError();
      }
    }
  };
}