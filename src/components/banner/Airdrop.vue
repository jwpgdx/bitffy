<template>
  <div
    @click="goToRouter('Airdrop')"
    class="cursor-pointer flex flex-col items-center justify-between gap-10 lg:flex-row lg:items-start"
  >
    <!-- 텍스트 컨텐츠 -->
    <div class="w-full lg:w-[50%]">
      <h1 class="mb-4 text-3xl font-semibold lg:text-5xl">
        <span class="font-poppins font-semibold text-orange-600">LIVE</span>
        에어드랍 이벤트
      </h1>
      <p class="mb-8 text-base lg:text-base">
        지금 진행 중인 모든 에어드랍 이벤트를 확인하세요!<br />
        <span class="font-mono text-zinc-400">매일 업데이트</span>
      </p>

      <!-- 이벤트 태그 목록 -->
      <div class="flex flex-wrap gap-2">
        <span class="rounded-full bg-zinc-700/50 px-3 py-1 text-sm"
          >NFT 드랍</span
        >
        <span class="rounded-full bg-zinc-700/50 px-3 py-1 text-sm"
          >신규 프로젝트</span
        >
        <span class="rounded-full bg-zinc-700/50 px-3 py-1 text-sm"
          >거래 보상</span
        >
      </div>
    </div>
    <div class="w-[80%] lg:w-[30%]">
      <img
        src="/images/banner-airdrop.webp"
        alt="에어드랍 코인 이미지"
        class="h-auto w-full"
      />
    </div>
    <!-- 화살표 아이콘 -->
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const goToRouter = (val: string) => {
  router.push({ name: val });
};
</script>
