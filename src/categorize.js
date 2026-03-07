import Anthropic from '@anthropic-ai/sdk'

export const CATEGORY_ORDER = [
  'Frukt & grönt',
  'Mejeri & ägg',
  'Kött & chark',
  'Fisk & skaldjur',
  'Bröd & bageri',
  'Fryst',
  'Skafferi',
  'Dryck',
  'Hygien & hälsa',
  'Hushåll',
  'Övrigt',
]

const CATEGORIES_LIST = CATEGORY_ORDER.join('\n')

let client = null

function getClient() {
  if (!client) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
if (!apiKey) return null
    // dangerouslyAllowBrowser krävs för att använda SDK i webbläsaren.
    // API-nyckeln är synlig i appens bundle — okej för privat app.
    client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  }
  return client
}

export async function categorize(text) {
  const c = getClient()
  if (!c) return 'Övrigt'

  try {
    const response = await c.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 20,
      messages: [
        {
          role: 'user',
          content: `Du kategoriserar matvaror för en inköpslista. Varan kan vara felstavad.
Välj den mest passande kategorin från listan nedan och svara med ENBART kategorinamnet, ingenting annat.

Kategorier:
${CATEGORIES_LIST}

Vara: "${text}"`,
        },
      ],
    })

    const result = response.content[0]?.text?.trim()
    return CATEGORY_ORDER.includes(result) ? result : 'Övrigt'
  } catch (err) {
    console.error('Categorize error:', err)
    return 'Övrigt'
  }
}
