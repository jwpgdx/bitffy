<template>
  <div
    v-if="item"
    class="relative flex w-full cursor-pointer items-start justify-between gap-8 overflow-hidden  p-6 lg:flex-row lg:items-center lg:gap-10"
    @click="onClick(item.id)"
  >
    <!-- 백그라운드 이미지 (Framer 스타일) -->
 
    <!-- 실제 배너 내용 -->
    <div class="relative z-10 flex h-full flex-col gap-4 lg:w-1/2">
      <h1 class="mb-2 text-2xl font-medium lg:text-4xl">
        <span class="font-poppins font-semibold text-orange-600">
          {{
            item.status === "ongoing"
              ? "LIVE"
              : item.status === "scheduled"
                ? "COMING"
                : "CLOSED"
          }}
        </span>
        {{ item.title }}
      </h1>
      <!-- 태그 예시: 보상, 거래소, 상태 등 -->
      <div class="flex flex-wrap gap-2">
        <span class="rounded-full border border-zinc-500 px-3 py-1 text-sm">
          <img
            :src="`/images/icon-${item.exchange || 'bitffy'}.webp`"
            alt="거래소 로고"
            class="h-4 w-fit object-contain"
        /></span>
        <span
          v-if="item.reward"
          class="flex items-center gap-2 rounded-full border border-zinc-500 px-3 py-1 text-sm"
        >
          <Coin
            :market="item.market"
            class="size-[14px] rounded-full border border-zinc-700"
          />{{ item.reward }}</span
        >
      </div>
    </div>
    <!-- 이미지 -->
    <div class="relative z-10 flex w-full justify-center lg:w-1/3">
      <img
        :src="item.imageUrl"
        alt="에어드랍 이미지"
        class="w-full max-w-full object-contain"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { useRouter } from "vue-router";
import Coin from "@/components/icons/Coin.vue";

const props = defineProps<{
  item: {
    id?: string;
    title: string;
    status?: "scheduled" | "ongoing" | "ended";
    market: string;
    description: string;
    exchange: string;
    reward: string;
    imageUrl: string;
    startAt: any;
    endAt: any;
  };
}>();

const router = useRouter();
const onClick = (id: string) => {
  router.push(`/airdrop/${id}`);
};

const formatDate = (ts: any) => {
  const date = ts?.toDate?.();
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
};

const numberText = (ts: any) => {
  const date = ts?.toDate?.();
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}`;
};
const getDdayText = (startAt: any, endAt: any, status: string) => {
  const now = new Date();
  const start = startAt?.toDate?.();
  const end = endAt?.toDate?.();
  if (!start || !end) return "";

  if (status === "scheduled") {
    const diff = Math.ceil(
      (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return `Coming Soon (D-${diff})`;
  } else if (status === "ongoing") {
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return `LIVE (d-${diff})`;
  } else {
    return "CLOSED";
  }
};
</script>

<style lang="css" scoped>
.number-text {
  font-size: 24px;
  font-weight: 400;
  font-family: "NOOA", sans-serif;
}
.date-text {
  font-family: "Poppins", sans-serif;
}
</style>
