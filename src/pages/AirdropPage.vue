<template>
  <div class="relative min-h-screen">
    <Background :background="3" />
    <div class="container relative z-10">
      <div class="relative mb-10">
        <div class="relative z-10">
          <Flicking
            :options="{
              moveType: 'snap',
              bound: true,
              align: 'center',
              circular: false,
              renderOnlyVisible: false,
              defaultIndex: 0,
            }"
            class="mb-10"
          >
            <AirdropBanner
              v-for="item in latestAirdrops"
              :key="item.id"
              :item="item"
            />
          </Flicking>
        </div>
      </div>
      <!-- 거래소 토글 -->
      <div class="mb-24 flex w-full justify-center gap-3">
        <button
          v-for="code in exchangeList"
          :key="code"
          :class="[
            'flex h-10 items-center justify-center rounded-full px-4 text-[15px]',
            selectedExchange === code
              ? 'bg-black text-white'
              : 'border border-zinc-500 text-zinc-300 hover:bg-white/5',
          ]"
          @click="selectedExchange = code"
        >
          <img
            v-if="code !== 'all'"
            :src="getExchangeMeta(code)?.icon"
            class="h-[18px]"
          />
          <LayoutGrid v-if="code === 'all'" class="size-[18px]" />
        </button>
      </div>
      <!-- 탭 + 등록버튼 -->
      <div class="relative mb-6 flex h-10 w-full items-center justify-between">
        <div class="flex gap-4 text-[13px] uppercase tracking-[0.7px] lg:gap-6">
          <button
            @click="tab = 'all'"
            :class="[
              'px-2 py-2 focus:outline-none',
              tab === 'all'
                ? 'border-b-2 border-orange-500 text-white'
                : 'opacity-50 hover:opacity-70',
            ]"
          >
            ALL
          </button>
          <button
            @click="tab = 'ongoing'"
            :class="[
              'px-2 py-2 focus:outline-none',
              tab === 'ongoing'
                ? 'border-b-2 border-orange-500 text-white'
                : 'opacity-50 hover:opacity-70',
            ]"
          >
            LIVE
          </button>
          <button
            @click="tab = 'ended'"
            :class="[
              'px-2 py-2 focus:outline-none',
              tab === 'ended'
                ? 'border-b-2 border-orange-500 text-white'
                : 'opacity-50 hover:opacity-70',
            ]"
          >
            CLOSED
          </button>
        </div>
        <button
          v-if="authStore.isAdmin"
          @click="goToAdd"
          class="rounded bg-orange-600 px-4 py-1.5 text-sm text-white"
        >
          + 등록하기
        </button>
        <div
          class="absolute bottom-0 left-1/2 h-[1px] w-[100vw] bg-white opacity-10"
          style="transform: translateX(-50%)"
        ></div>
      </div>
      <!-- 카드 목록 -->
      <div class="space-y-6">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ErrorState
            class="col-span-3"
            v-if="filteredList.length === 0 && !isFetching"
            image="airdrop"
            title="이벤트가 없습니다."
            content="새로운 이벤트가 곧 열릴 예정입니다!"
          />
          <div
            v-for="item in filteredList"
            :key="item.id"
            class="group relative cursor-pointer"
          >
            <AirdropCard :item="item" @click="goToDetail(item.id!)" />
            <div v-if="authStore.isAdmin">
              <button
                @click="goToEdit(item.id!)"
                class="rounded bg-white/80 px-2 py-1 text-xs text-black hover:bg-white"
              >
                수정
              </button>
              <button
                @click="deleteAirdrop(item.id!)"
                class="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
        <!-- 로딩 스피너 -->
        <div class="mt-6 flex items-center justify-center" v-if="isFetching">
          <LoaderCircle class="size-6 animate-spin text-orange-500" />
        </div>
        <!-- 감지용 div -->
        <div ref="loadTrigger" class="h-10"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useAirdropStore } from "@/stores/airdrop-store";
import { useAuthStore } from "@/stores/auth-store";
import { LoaderCircle, LayoutGrid } from "lucide-vue-next";
import Flicking from "@egjs/vue3-flicking";
import AirdropBanner from "@/components/airdrop/AirdropBanner.vue";
import AirdropCard from "@/components/airdrop/AirdropCard.vue";
import ErrorState from "@/components/ErrorState.vue";
import Background from "@/components/Background.vue";
import { EXCHANGES, getExchangeName } from "@/composables/useGoogleCalendar";

const router = useRouter();
const store = useAirdropStore();
const authStore = useAuthStore();
const tab = ref<"all" | "ongoing" | "ended">("all");
const selectedExchange = ref("all");

const latestAirdrops = computed(() => store.allAirdrops.slice(0, 3));

const exchangeList = computed(() => ["all", ...EXCHANGES.map((e) => e.code)]);
const getExchangeMeta = (code: string) =>
  EXCHANGES.find((e) => e.code === code);

// 거래소별 필터링
const filteredList = computed(() => {
  let base = [];
  if (tab.value === "ongoing") base = store.ongoingAirdrops;
  else if (tab.value === "ended") base = store.endedAirdrops;
  else base = store.allAirdrops;
  if (selectedExchange.value === "all") return base;
  return base.filter((a) => a.exchange === selectedExchange.value);
});

const loadTrigger = ref<HTMLElement | null>(null);
const isFetching = ref(false);

// 탭 변경 시 초기화
watchEffect(() => {
  if (tab.value === "ongoing") {
    store.fetchOngoingAirdrops(6, false);
  } else if (tab.value === "ended") {
    store.fetchEndedAirdrops(6, false);
  } else if (tab.value === "all") {
    store.fetchAllAirdrops(6, false);
  }
});

// 무한 스크롤 감지
useIntersectionObserver(
  loadTrigger,
  ([{ isIntersecting }]) => {
    if (!isIntersecting || isFetching.value) return;

    isFetching.value = true;

    if (tab.value === "ongoing" && store.hasMoreOngoing) {
      store.fetchOngoingAirdrops(6, true).finally(() => {
        isFetching.value = false;
      });
    } else if (tab.value === "ended" && store.hasMoreEnded) {
      store.fetchEndedAirdrops(6, true).finally(() => {
        isFetching.value = false;
      });
    } else if (tab.value === "all" && store.hasMoreAll) {
      store.fetchAllAirdrops(6, true).finally(() => {
        isFetching.value = false;
      });
    } else {
      isFetching.value = false;
    }
  },
  { threshold: 0.5 },
);

const goToAdd = () => router.push("/airdrop/add");
const goToEdit = (id: string) => router.push(`/airdrop/edit/${id}`);

const deleteAirdrop = async (id: string) => {
  const ok = confirm("정말 삭제할까요?");
  if (!ok) return;
  try {
    await store.deleteAirdrop(id);
    alert("삭제 완료");
  } catch (err) {
    alert("삭제 실패");
  }
};
const goToDetail = (id: string) => {
  router.push(`/airdrop/${id}`);
};
</script>
