

import OpenAI from 'openai'

// It's better to use environment variables for API keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "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"

// Maximum number of tokens to use for the context window
const MAX_CONTEXT_TOKENS = 4000 

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  })

  try {
    // Construct the system message with training content if provided
    const systemMessage = {
      role: 'system',
      content: body.trainingContent 
        ? `You are a helpful AI assistant trained on the following context. Use this information to inform your responses when relevant, but also acknowledge when you're not sure about something or when the answer might not be in the provided context:

           ${body.trainingContent}
           
           When responding to questions:
           1. Always check if the information is present in the context above
           2. If the information is in the context, use it to provide accurate answers
           3. If the information is not in the context, you can provide general knowledge answers
           4. Be clear when you're using information from the context vs general knowledge`
        : 'You are a helpful AI assistant.'
    }

    // Construct messages array with system message and user messages
    const messages = [
      systemMessage,
      ...body.messages
    ]

    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7, // Adjust for creativity vs precision
      max_tokens: 1000, // Adjust based on your needs
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    // Return successful response
    return {
      success: true,
      reply: completion.choices[0].message.content,
    }

  } catch (error) {
    // Log the full error for debugging
    console.error('OpenAI API Error:', error)

    // Return a user-friendly error message
    return {
      success: false,
      error: error.message || 'An error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }
  }
})

  