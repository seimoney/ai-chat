import { useState } from "react";
import { Hex } from "viem";
import axios from "axios";

export async function messageAgent(
  threadId: Hex,
  input: string,
  payload?: string,
  file?: File
): Promise<string | null> {
  try {
    const formData = new FormData();

    formData.append("threadId", threadId);
    formData.append("input", input);

    if (payload) formData.append("payload", payload);
    if (file) formData.append("file", file);

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/agent/chat`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200) {
      return typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error communicating with agent:", error);
    return null;
  }
}

function extractFirstLink(text: string): string | undefined {
  const urlRegex =
    /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(\/[^\s<>"]*)?)/gi;

  const match = text.match(urlRegex);
  if (!match) return undefined;

  const seiLink = match.find((u) => u.includes("seimoney.link"));
  let url = seiLink || match[0];
  if (url.startsWith("www.")) {
    url = "https://" + url;
  }

  if (!url.toLowerCase().includes("seimoney.link")) return undefined;

  return url;
}

export function useAgent() {
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "agent" }[]
  >([]);
  const [isThinking, setIsThinking] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);

  const sendMessage = async ({
    threadId,
    input,
    payload,
    file,
  }: {
    threadId: Hex;
    input: string;
    payload?: string;
    file?: File;
  }) => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setIsThinking(true);

    const responseMessage = await messageAgent(threadId, input, payload, file);

    if (responseMessage) {
      const link = extractFirstLink(responseMessage);
      if (link) setPreview(link);

      setMessages((prev) => [
        ...prev,
        { text: responseMessage, sender: "agent" },
      ]);
    }

    setIsThinking(false);
  };

  return { messages, sendMessage, isThinking, preview };
}
