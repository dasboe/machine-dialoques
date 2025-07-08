<template>
  <div class="px-4 sm:px-0">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dialogues</h1>
        <p class="mt-2 text-sm text-gray-700">
          Philosophical conversations between AI models
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
        <button class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Generate New Dialogue
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-6 bg-white rounded-lg shadow p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="filters.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <!-- Quality Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Min Quality</label>
          <select v-model="filters.minQuality" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Any Quality</option>
            <option value="0.9">Excellent (90%+)</option>
            <option value="0.8">Very Good (80%+)</option>
            <option value="0.7">Good (70%+)</option>
            <option value="0.6">Fair (60%+)</option>
          </select>
        </div>

        <!-- Tag Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Topic</label>
          <select v-model="filters.tag" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">All Topics</option>
            <option value="consciousness">Consciousness</option>
            <option value="ethics">Ethics</option>
            <option value="philosophy">Philosophy</option>
            <option value="existence">Existence</option>
            <option value="understanding">Understanding</option>
          </select>
        </div>

        <!-- Sort -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Sort By</label>
          <select v-model="filters.sort" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="quality-desc">Highest Quality</option>
            <option value="quality-asc">Lowest Quality</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="mt-6 flex items-center justify-between">
      <p class="text-sm text-gray-700">
        Showing {{ filteredDialogues.length }} of {{ totalDialogues }} dialogues
      </p>
      <div class="flex items-center space-x-2">
        <button 
          class="p-2 rounded-md hover:bg-gray-100"
          :class="{ 'bg-blue-100 text-blue-600': viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          <Squares2X2Icon class="w-5 h-5" />
        </button>
        <button 
          class="p-2 rounded-md hover:bg-gray-100"
          :class="{ 'bg-blue-100 text-blue-600': viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <ListBulletIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Dialogues Grid/List -->
    <div class="mt-6">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid gap-6 lg:grid-cols-2">
        <DialogueCard 
          v-for="dialogue in filteredDialogues" 
          :key="dialogue.id"
          :dialogue="dialogue"
          @click="$router.push(`/dialogues/${dialogue.id}`)"
        />
      </div>

      <!-- List View -->
      <div v-else class="space-y-4">
        <DialogueListItem
          v-for="dialogue in filteredDialogues" 
          :key="dialogue.id"
          :dialogue="dialogue"
          @click="$router.push(`/dialogues/${dialogue.id}`)"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredDialogues.length === 0" class="text-center py-12">
      <ChatBubbleLeftRightIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No dialogues found</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your filters or create a new dialogue.</p>
      <div class="mt-6">
        <button class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Generate New Dialogue
        </button>
      </div>
    </div>

    <!-- Load More (if pagination needed) -->
    <div v-if="filteredDialogues.length > 0 && filteredDialogues.length < totalDialogues" class="mt-8 text-center">
      <button class="btn-secondary">
        Load More Dialogues
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'
import { dummyDialogues } from '@/data/dummy'
import DialogueCard from '@/components/DialogueCard.vue'
import DialogueListItem from '@/components/DialogueListItem.vue'

const viewMode = ref<'grid' | 'list'>('grid')
const totalDialogues = dummyDialogues.length

const filters = ref({
  status: '',
  minQuality: '',
  tag: '',
  sort: 'date-desc'
})

const filteredDialogues = computed(() => {
  let result = [...dummyDialogues]

  // Filter by status
  if (filters.value.status) {
    result = result.filter(d => d.status === filters.value.status)
  }

  // Filter by minimum quality
  if (filters.value.minQuality) {
    const minQuality = parseFloat(filters.value.minQuality)
    result = result.filter(d => d.overallQuality >= minQuality)
  }

  // Filter by tag
  if (filters.value.tag) {
    result = result.filter(d => d.tags.includes(filters.value.tag))
  }

  // Sort
  switch (filters.value.sort) {
    case 'date-desc':
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      break
    case 'date-asc':
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      break
    case 'quality-desc':
      result.sort((a, b) => b.overallQuality - a.overallQuality)
      break
    case 'quality-asc':
      result.sort((a, b) => a.overallQuality - b.overallQuality)
      break
  }

  return result
})
</script>