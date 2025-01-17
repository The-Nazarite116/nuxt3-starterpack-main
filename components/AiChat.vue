<template>
    <div class="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <!-- Chat Header -->
      <div class="p-4 border-b">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <div class="w-4 h-4 text-blue-600">🤖</div>
          </div>
          <div>
            <h2 class="font-semibold">{{ agentName }}</h2>
            <p class="text-sm text-gray-500">{{ isTyping ? 'Typing...' : 'Online' }}</p>
          </div>
        </div>
      </div>
   
      <!-- Chat Messages -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="[
            'max-w-[80%] rounded-lg p-3',
            message.isUser ? 
              'ml-auto bg-blue-600 text-white rounded-br-none' : 
              'bg-gray-100 text-gray-900 rounded-bl-none'
          ]"
        >
          <div class="whitespace-pre-wrap">{{ message.content }}</div>
          <div
            :class="[
              'text-xs mt-1',
              message.isUser ? 'text-blue-100' : 'text-gray-500'
            ]"
          >
            {{ message.time }}
          </div>
        </div>
      </div>
   
      <!-- Input Area -->
      <div class="p-4 border-t">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Type your message..."
            class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            :disabled="isTyping"
            @keydown.enter.exact="sendMessage"
            @keydown.enter.shift.exact.prevent="newMessage += '\n'"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!newMessage.trim() || isTyping"
          >
            Send
          </button>
        </form>
      </div>
    </div>
   </template>
   
   <script setup>
   import { ref, onMounted, onUpdated, nextTick, watch, onUnmounted } from 'vue'
   
   const props = defineProps({
    agentName: {
      type: String,
      default: 'AI Assistant',
    },
    trainingContent: {
      type: String,
      default: '',
    },
    initialMessages: {
      type: Array,
      default: () => [],
    },
    maxMessages: {
      type: Number,
      default: 50,
    }
   })
   
   const emit = defineEmits(['message-sent', 'error'])
   
   // Reactive variables
   const newMessage = ref('')
   const isTyping = ref(false)
   const messagesContainer = ref(null)
   const errorState = ref(null)
   
   // Initialize messages with system and welcome message
   const messages = ref([
    {
      role: 'system',
      content: `You are a helpful assistant. ${props.trainingContent}`,
      isUser: false,
      time: new Date().toLocaleTimeString(),
    },
    ...props.initialMessages,
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
      isUser: false,
      time: new Date().toLocaleTimeString(),
    },
   ])
   
   // Watch for training content changes
   watch(() => props.trainingContent, (newContent) => {
    // Update system message when training content changes
    if (messages.value[0].role === 'system') {
      messages.value[0].content = `You are a helpful assistant. ${newContent}`
    }
   })
   
   // Get formatted messages for API
   const getFormattedMessages = () => {
    return messages.value.map((msg) => ({
      role: msg.isUser ? 'user' : msg.role || 'assistant',
      content: msg.content,
    }))
   }
   
   // Handle API response
   const handleApiResponse = async (response) => {
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Unknown error occurred')
    }
    return data
   }
   
   // Simulate AI response
   const simulateResponse = async (userMessage) => {
    isTyping.value = true
    errorState.value = null
   
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: getFormattedMessages(),
          trainingContent: props.trainingContent,
        }),
      })
   
      const data = await handleApiResponse(response)
   
      // Add AI response to messages
      messages.value.push({
        content: data.reply,
        role: 'assistant',
        isUser: false,
        time: new Date().toLocaleTimeString(),
      })
   
      // Trim old messages if exceeding maxMessages
      if (messages.value.length > props.maxMessages) {
        messages.value = [
          messages.value[0], // Keep system message
          ...messages.value.slice(-(props.maxMessages - 1))
        ]
      }
   
    } catch (error) {
      errorState.value = error.message
      messages.value.push({
        content: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
        role: 'assistant',
        isUser: false,
        time: new Date().toLocaleTimeString(),
      })
      emit('error', error)
    } finally {
      isTyping.value = false
    }
   }
   
   // Send message
   const sendMessage = async () => {
    if (!newMessage.value.trim() || isTyping.value) return
   
    const messageContent = newMessage.value.trim()
    newMessage.value = ''
   
    // Add user message
    messages.value.push({
      content: messageContent,
      role: 'user',
      isUser: true,
      time: new Date().toLocaleTimeString(),
    })
   
    emit('message-sent', messageContent)
    await simulateResponse(messageContent)
   }
   
   // Auto-scroll when new messages arrive
   onUpdated(() => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
   })
   
   // Clean up on unmount
   onUnmounted(() => {
    messages.value = []
    errorState.value = null
   })
   </script>
   
   <style scoped>
   .whitespace-pre-wrap {
    white-space: pre-wrap;
   }
   
   /* Optional: Add custom scrollbar styling */
   .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
   }
   
   .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
   }
   
   .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
   }
   
   .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
   }
   </style>