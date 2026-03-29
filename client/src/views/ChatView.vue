<template>
  <div class="flex h-[calc(100vh-64px)]">
    <!-- Sidebar -->
    <div class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <!-- Model selector -->
      <div class="p-4 border-b border-gray-800">
        <label class="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Model</label>
        <select v-model="selectedModel" class="input text-sm">
          <option value="deepseek-v3">DeepSeek V3 · $0.001/1K</option>
          <option value="deepseek-coder">DeepSeek Coder · $0.001/1K</option>
          <option value="glm-4">GLM-4 · $0.001/1K</option>
          <option value="kimi-k2">Kimi K2 · $0.0015/1K</option>
        </select>
      </div>

      <!-- New chat button -->
      <div class="p-4">
        <button @click="newChat" class="btn-secondary w-full text-sm flex items-center gap-2 justify-center">
          <span>+</span> New Chat
        </button>
      </div>

      <!-- Chat history placeholder -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="text-xs text-gray-600 text-center mt-8">
          Chat history coming soon
        </div>
      </div>

      <!-- Usage info -->
      <div class="p-4 border-t border-gray-800">
        <div class="text-xs text-gray-500 mb-1">Tokens used today</div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div class="h-full bg-indigo-500 rounded-full transition-all" :style="`width: ${usagePercent}%`"></div>
        </div>
        <div class="text-xs text-gray-600 mt-1">{{ tokensUsed.toLocaleString() }} / 100K free</div>
      </div>
    </div>

    <!-- Main chat area -->
    <div class="flex-1 flex flex-col">
      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Empty state -->
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
          <div class="mb-6"><LogoIcon :size="64" /></div>
          <h2 class="text-2xl font-bold mb-2">CodeClaw</h2>
          <p class="text-gray-400 max-w-md">
            AI-powered coding assistant. Powered by DeepSeek, GLM-4, and Kimi — at a fraction of the cost.
          </p>
          <div class="grid grid-cols-2 gap-3 mt-8 max-w-lg">
            <button v-for="prompt in samplePrompts" :key="prompt"
              @click="sendMessage(prompt)"
              class="text-left p-3 rounded-lg border border-gray-800 hover:border-gray-600 text-sm text-gray-400 hover:text-gray-200 transition-colors">
              {{ prompt }}
            </button>
          </div>
        </div>

        <!-- Messages list -->
        <TransitionGroup name="message">
          <div v-for="message in messages" :key="message.id"
            :class="['flex gap-4', message.role === 'user' ? 'flex-row-reverse' : '']">
            <!-- Avatar -->
            <div :class="[
              'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold',
              message.role === 'user' ? 'bg-indigo-600' : 'bg-gray-800'
            ]">
              <span v-if="message.role === 'user'" class="text-white text-xs font-bold">U</span><LogoIcon v-else :size="20" />
            </div>

            <!-- Content -->
            <div :class="[
              'max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed',
              message.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm'
                : 'bg-gray-800 text-gray-100 rounded-tl-sm'
            ]">
              <div v-if="message.role === 'assistant'" v-html="renderMarkdown(message.content)"></div>
              <div v-else>{{ message.content }}</div>
              
              <!-- Token count -->
              <div v-if="message.tokens" class="text-xs opacity-50 mt-1">
                {{ message.tokens }} tokens
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Typing indicator -->
        <div v-if="isLoading" class="flex gap-4">
          <div class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center"><LogoIcon :size="20" /></div>
          <div class="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="p-4 border-t border-gray-800">
        <div class="flex gap-3 items-end max-w-4xl mx-auto">
          <div class="flex-1 relative">
            <textarea
              v-model="inputText"
              @keydown.enter.exact.prevent="handleEnter"
              placeholder="Ask anything... (Enter to send, Shift+Enter for newline)"
              rows="1"
              class="input resize-none py-3 pr-12"
              style="min-height: 48px; max-height: 200px;"
              @input="autoResize"
              ref="inputRef"
            ></textarea>
          </div>
          <button
            @click="handleEnter"
            :disabled="!inputText.trim() || isLoading"
            class="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <span v-if="!isLoading">↑</span>
            <span v-else class="animate-spin">⟳</span>
          </button>
        </div>
        <div class="text-center text-xs text-gray-600 mt-2">
          Using {{ selectedModel }} · {{ estimateCost }} estimated
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LogoIcon from '../components/LogoIcon.vue';
import { ref, computed, nextTick } from 'vue';

import { marked } from 'marked';
import hljs from 'highlight.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
}

const messages = ref<Message[]>([]);
const inputText = ref('');
const isLoading = ref(false);
const selectedModel = ref('deepseek-v3');
const messagesContainer = ref<HTMLElement>();
const inputRef = ref<HTMLTextAreaElement>();
const tokensUsed = ref(0);

const usagePercent = computed(() => Math.min((tokensUsed.value / 100000) * 100, 100));

const estimateCost = computed(() => {
  const chars = inputText.value.length;
  const estimatedTokens = Math.ceil(chars / 4);
  const pricePerToken = selectedModel.value === 'kimi-k2' ? 0.0000015 : 0.000001;
  const cost = estimatedTokens * pricePerToken;
  return cost < 0.001 ? '<$0.001' : `~$${cost.toFixed(4)}`;
});

const samplePrompts = [
  'Explain how async/await works in JavaScript',
  'Write a Python function to parse CSV files',
  'Debug this React component that isn\'t re-rendering',
  'Compare REST vs GraphQL APIs'
];

const renderMarkdown = (content: string) => {
  marked.setOptions({
    highlight: (code, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  } as any);
  return marked.parse(content);
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const autoResize = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = 'auto';
  target.style.height = Math.min(target.scrollHeight, 200) + 'px';
};

const newChat = () => {
  messages.value = [];
};

const sendMessage = async (text: string) => {
  if (!text.trim() || isLoading.value) return;

  const userMessage: Message = {
    id: `msg_${Date.now()}`,
    role: 'user',
    content: text
  };

  messages.value.push(userMessage);
  inputText.value = '';
  isLoading.value = true;
  await scrollToBottom();

  // Reset textarea height
  if (inputRef.value) {
    inputRef.value.style.height = '48px';
  }

  try {
    const response = await apiFetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(
      model: selectedModel.value,
      messages: messages.value.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    const assistantContent = response.data.choices?.[0]?.message?.content || 'No response';
    const tokensInResponse = response.data.usage?.total_tokens || 0;
    
    tokensUsed.value += tokensInResponse;

    const assistantMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: assistantContent,
      tokens: tokensInResponse
    };

    messages.value.push(assistantMessage);
    await scrollToBottom();
  } catch (error: any) {
    const errorMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `Error: ${error.response?.data?.error || error.message}. Please try again.`
    };
    messages.value.push(errorMessage);
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

const handleEnter = () => {
  sendMessage(inputText.value);
};
</script>

<style scoped>
.message-enter-active {
  animation: slideInUp 0.2s ease-out;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
