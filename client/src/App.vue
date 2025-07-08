<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and main nav -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <router-link to="/" class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-white font-bold text-sm">MD</span>
                </div>
                <span class="text-xl font-semibold text-gray-900">Machine Dialogues</span>
              </router-link>
            </div>
            
            <!-- Desktop Navigation -->
            <div class="hidden md:block ml-10">
              <div class="flex items-baseline space-x-4">
                <router-link 
                  v-for="item in navigation" 
                  :key="item.name"
                  :to="item.href"
                  class="nav-link"
                  :class="{ 'nav-link-active': $route.path === item.href }"
                >
                  <component :is="item.icon" class="w-4 h-4 mr-2" />
                  {{ item.name }}
                </router-link>
              </div>
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center space-x-4">
            <!-- Status indicator -->
            <div class="flex items-center text-sm text-gray-500">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span>System Online</span>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Bars3Icon v-if="!mobileMenuOpen" class="block h-6 w-6" />
              <XMarkIcon v-else class="block h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 pt-4 pb-3">
          <div class="flex flex-col space-y-1">
            <router-link 
              v-for="item in navigation" 
              :key="item.name"
              :to="item.href"
              class="mobile-nav-link"
              @click="mobileMenuOpen = false"
            >
              <component :is="item.icon" class="w-4 h-4 mr-3" />
              {{ item.name }}
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex items-center text-sm text-gray-500">
            <span>&copy; 2025 Machine Dialogues. Open Source Project.</span>
          </div>
          <div class="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="https://github.com" class="text-gray-400 hover:text-gray-500">
              <span class="sr-only">GitHub</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  QuestionMarkCircleIcon, 
  ChartBarIcon, 
  InformationCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const mobileMenuOpen = ref(false)

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Dialogues', href: '/dialogues', icon: ChatBubbleLeftRightIcon },
  { name: 'Questions', href: '/questions', icon: QuestionMarkCircleIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'About', href: '/about', icon: InformationCircleIcon },
]
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors;
}

.nav-link-active {
  @apply text-blue-600 bg-blue-50;
}

.mobile-nav-link {
  @apply flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100;
}
</style>