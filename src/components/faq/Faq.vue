<template>
  <div class="mx-auto w-full space-y-4">
    <div
      v-for="(faq, index) in faqStore.faqs"
      :key="faq.id"
      class="overflow-hidden rounded-lg transition-all duration-300"
      :class="{ 'bg-orange-500': faq.isOpen }"
    >
      <button
        @click="faqStore.toggleFaq(faq.id)"
        class="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <div class="flex items-center gap-3">
          <div
            class="number-text flex h-5 w-5 items-center justify-center rounded-[4px] text-center text-xs"
            :class="{
              'border border-zinc-600': !faq.isOpen,
              'border-black bg-black': faq.isOpen,
            }"
          >
            {{ index + 1 }}
          </div>
          <span class="font-normal" :class="{ 'text-black': faq.isOpen }">{{
            faq.question
          }}</span>
        </div>

        <span
          :class="[
            'transform transition-transform duration-300',
            { 'rotate-[270deg] text-black': faq.isOpen },
          ]"
        >
          <svg viewBox="0 0 8 10" preserveAspectRatio="none" class="size-2">
            <polygon points="0,0 8,5 0,10" fill="currentColor" />
          </svg>
        </span>
      </button>

      <transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-300 ease-in"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-screen"
        leave-from-class="opacity-100 max-h-screen"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-show="faq.isOpen" class="px-12 pb-4 pt-2 font-light text-black">
          {{ faq.answer }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFaqStore } from "@/stores/faq-store";

const faqStore = useFaqStore();
</script>

<style lang="scss" scoped>
.number-text {
  font-family: "NOOA", sans-serif;
}
</style>
