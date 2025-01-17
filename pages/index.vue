<!-- pages/index.vue -->
<template>
    <main class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <!-- Hero Section -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div class="text-center">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Build Your Own AI Agents
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            Create, train, and chat with custom AI agents. Harness the power of artificial intelligence to solve your unique challenges.
          </p>
  
          <!-- File Upload Section -->
          <div class="mt-8 flex flex-col items-center gap-4">
            <label class="block text-sm font-medium text-gray-700">
              Train your AI with a text file
            </label>
            <div class="flex items-center gap-4">
              <input
                type="file"
                accept=".txt,.rtf"
                @change="handleFileUpload"
                class="hidden"
                ref="fileInput"
              />
              <button
                @click="$refs.fileInput.click()"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300"
              >
                Select Training File
              </button>
              <span v-if="selectedFile" class="text-sm text-gray-600">
                {{ selectedFile.name }}
              </span>
            </div>
          </div>
  
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <NuxtLink 
              to="/get-started" 
              class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Get Started
              <span class="ml-2">→</span>
            </NuxtLink>
            <NuxtLink 
              to="/learn-more" 
              class="inline-flex items-center px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Learn More
            </NuxtLink>
          </div>
        </div>
      </section>
  
      <!-- Chat Section -->
      <section class="py-24">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AiChat 
            agent-name="Support Agent"
            :training-content="trainingContent"
            @message-sent="handleMessage"
            @error="handleError"
          />
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  const fileInput = ref(null)
  const selectedFile = ref(null)
  const trainingContent = ref('')
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      selectedFile.value = file
      try {
        const text = await file.text()
        trainingContent.value = text
      } catch (error) {
        console.error('Error reading file:', error)
        handleError(error)
      }
    }
  }
  
  const handleMessage = (message) => {
    console.log('Message received:', message)
  }
  
  const handleError = (error) => {
    console.error('Chat error:', error)
    // You could add error handling logic here, like showing a notification
  }
  </script>
  
  <style scoped>
  /* Hide the default file input styling */
  input[type="file"] {
    display: none;
  }
  </style>