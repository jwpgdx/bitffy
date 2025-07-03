<template>
  <div
    class="group relative flex h-56 cursor-pointer flex-col justify-between overflow-hidden rounded-lg bg-zinc-900 p-6"
  >
    <div class="flex items-center gap-4">
      <img
        :src="`/images/icon-${item.exchange || 'bitffy'}.webp`"
        alt="거래소 로고"
        class="h-4 w-fit object-contain"
      />
    </div>

    <div class="mt-6 flex h-[132px] w-[70%] items-center justify-between gap-4">
      <div class="z-[10] flex h-full w-0 flex-1 flex-col justify-between">
        <div class="line-clamp-2 h-[52px] text-left text-base font-semibold">
          {{ item.title }}
        </div>

        <div v-if="item.reward" class="flex items-center gap-[6px] text-xs">
          <Coin
            :market="item.market"
            class="size-[14px] rounded-full border border-zinc-700"
          />
          <span class="text-zinc-300">{{ item.reward || "" }}</span>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="number-text flex size-9 shrink-0 items-center justify-center self-start rounded-[10px] border tracking-wide"
            :class="{
              'border-orange-600 text-orange-600': item.status === 'ongoing',
              'border-zinc-600 text-zinc-600': item.status === 'ended',
              'border-green-600 text-green-600': item.status === 'scheduled',
            }"
          >
            {{ numberText(item.startAt) }}
          </div>

          <div
            class="flex flex-col text-[12px] tracking-wide"
            :class="{
              'text-white':
                item.status === 'ongoing' || item.status === 'scheduled',
              'text-zinc-500': item.status === 'ended',
            }"
          >
            <div class="date-text flex items-center gap-2">
              {{ formatDate(item.startAt) }}
              <svg
                class="size-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                fill="currentColor"
                aria-hidden="true"
              >
                <polygon points="32 16 0 7 0 25 32 16" />
              </svg>
              {{ formatDate(item.endAt) }}
            </div>
            <div class="">
              {{ getDdayText(item.startAt, item.endAt, item.status || "") }}
            </div>
          </div>
        </div>
      </div>

      <img
        :src="item.imageUrl"
        alt="에어드랍 이미지"
        class="absolute bottom-[0%] right-[0%] z-0 m-auto h-[80%] w-auto transition-transform duration-300 ease-in-out group-hover:scale-110"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import Coin from "@/components/icons/Coin.vue"; // MD5 해시 생성용 라이브러리

const props = defineProps<{
  item: {
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
