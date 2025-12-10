// AI summarization provider (mock and real)

import { Message } from "@/types";

export interface AIProvider {
  summarize(messages: Message[], maxWords?: number): Promise<string>;
}

/**
 * Mock AI provider for development
 */
export class MockAIProvider implements AIProvider {
  async summarize(messages: Message[], maxWords: number = 100): Promise<string> {
    // Deterministic mock summary
    const count = messages.length;
    if (count === 0) {
      return "No messages to summarize.";
    }

    const firstMessage = messages[0];
    const preview = firstMessage.contentBody.substring(0, 50);
    const lastMessage = messages[messages.length - 1];
    const lastPreview = lastMessage.contentBody.substring(0, 30);

    return `Summary of ${count} messages. First message: "${preview}...". Last message: "${lastPreview}...". Topics discussed include ${firstMessage.tags.join(", ") || "general discussion"}.`;
  }
}

/**
 * Real AI provider using OpenAI-compatible API
 */
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async summarize(messages: Message[], maxWords: number = 100): Promise<string> {
    const content = messages
      .map((msg, idx) => `Message ${idx + 1} (${new Date(msg.timestamp).toISOString()}): ${msg.contentBody}`)
      .join("\n\n");

    const prompt = `Please provide a concise summary of the following messages in approximately ${maxWords} words:\n\n${content}`;

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: Math.ceil(maxWords * 1.5), // Rough estimate
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`AI API error: ${response.status} ${error}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "Failed to generate summary.";
    } catch (error) {
      console.error("AI summarization error:", error);
      throw error;
    }
  }
}

/**
 * Get the appropriate AI provider based on environment
 */
export function getAIProvider(): AIProvider {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;

  if (apiKey) {
    return new OpenAIProvider(apiKey, apiUrl);
  }

  return new MockAIProvider();
}

