import OpenAI from 'openai'

// Singleton — reused across server invocations in the same process
let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

/** Shared chat completion helper with sensible defaults */
export async function chat(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: Partial<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming>
): Promise<string> {
  const client = getOpenAIClient()

  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 1000,
    ...options,
    messages,
  })

  return res.choices[0]?.message?.content ?? ''
}
