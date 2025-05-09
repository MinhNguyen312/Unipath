export function useChatbot(
  onMessage: (chunk: string) => void,
  onFunctionCall: (name: string, args: any) => void,
  onFunctionResponse: (name: string, response: any) => void,
  onDone: () => void,
  onError: () => void
) {
  return async (messages: { content: string; isUser: boolean }[]) => {
    try {
      const formattedMessages = messages.map((msg) => ({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const res = await fetch(`${import.meta.env.VITE_CHATBOT_URL}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedMessages,
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

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ")) {
              const data = trimmedLine.replace(/^data: /, "");

              try {
                const json = JSON.parse(data);
                if (json.functionCall) {
                  const { name, args } = json.functionCall;
                

                  if (name === "search_google" && args.query) {
                    onFunctionCall(name, args);
                  }

                  continue;
                }
                if (json.functionResponse) {
                  const { name, response } = json.functionResponse;
                
                  if (name === "search_google") {
                      console.log("Raw response:", response);
                      let list;
                
                      if (typeof response === "object" && response !== null && "result" in response) {

                        let result = response.result;
                        if (typeof result === "string") {

                          result = result.replace(/'/g, '"');
                          list = JSON.parse(result);
                        } else {
                          list = result;
                        }
                      } else if (typeof response === "string") {

                        const fixedResponse = response.replace(/'/g, '"');
                        list = JSON.parse(fixedResponse);
                      } else {
                        list = response;
                      }
                
                      console.log("Parsed list before adjustment:", list);
                

                      if (Array.isArray(list)) {

                      } else if (list && typeof list === "object" && list.results && Array.isArray(list.results)) {
                        list = list.results;
                        console.log("Extracted results array:", list);
                      } else if (list && typeof list === "object" && !Array.isArray(list)) {
                        list = Object.values(list).filter(Array.isArray).flat();
                        if (!Array.isArray(list) || list.length === 0) {
                          throw new Error("Response does not contain a valid array");
                        }
                        console.log("Converted object to array:", list);
                      } else {
                        throw new Error("Response does not contain a valid array");
                      }
                

                      const formatted = list
                        .map((item: any, i: number) => {
                          // if (!item || typeof item !== "object") {
                          //   return `### Invalid result ${i + 1}(#)\nNo content available`;
                          // }
                          const title = item.title || `Result ${i + 1}`;
                          const href = item.href || "#";
                          const body = item.body || "No description available";
                          const sanitizedTitle = title.replace(/[\]\)\(]/g, "");
                          const sanitizedHref = href.replace(/[()]/g, "");
                          const sanitizedBody = body.replace(/[\n\r]+/g, " ");
                          return `### ${sanitizedTitle}(${sanitizedHref})\n${sanitizedBody}\n`;
                        })
                        .join("\n\n");
                
                        onFunctionResponse(name, formatted);
                  }
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
      onError();
    }
  };
}
