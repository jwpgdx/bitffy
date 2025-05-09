<template>
  <div
  class="group relative flex min-h-[360px] cursor-pointer flex-col justify-between gap-2 overflow-hidden rounded-lg border border-zinc-800 bg-black p-6"
  >


 





  <div class="flex items-center gap-3 z-10">
    <div
      class="number-text z-10 flex size-11 shrink-0 items-center justify-center self-start rounded-sm border tracking-wide"
      :class="{
        'border-orange-600 text-orange-600': item.status === 'ongoing',
        'border-zinc-600 text-zinc-600': item.status === 'ended',
        'border-green-600 text-green-600': item.status === 'scheduled',
      }"
    >
      {{ numberText(item.startAt) }}
    </div>

<div
  class="flex flex-col"
  :class="{
        ' text-white': item.status === 'ongoing',
        ' text-zinc-500': item.status === 'ended',
        ' text-white': item.status === 'scheduled',
      }"
>
    <div
        class=" flex items-center gap-2 text-xs tracking-wide "
        
      >
      {{ getDdayText(item.startAt, item.endAt, item.status || '') }}

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
      <div class="text-xs">
        

       보상 {{ item.reward || '' }}

      </div>
   
    </div>


    </div>







   
    <div class="z-10 flex gap-2 flex-col items-center">
   
      <div class="w-[90%] text-xl lg:text-base text-center font-semibold">{{ item.title }}</div>
      
      <img
  :src="`/images/icon-${item.exchange || 'bitffy'}.webp`"
  alt="거래소 로고"
  class="h-4 w-fit object-contain"
/>
    </div>











    <img
  :src="item.imageUrl"
  alt="에어드랍 이미지"
  class=" absolute bottom-[18%] right-0 left-0  z-0 m-auto h-auto w-[60%] lg:w-[70%] transition-transform duration-300 ease-in-out group-hover:scale-110"
/>




  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

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
    const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `예정 (D-${diff})`;
  } else if (status === "ongoing") {
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `진행중 (d-${diff})`;
  } else {
    return "종료";
  }
};
</script>

<style lang="css" scoped>
.number-text {
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 0.015em;
  font-family: "Poppins", sans-serif;
}
</style>
