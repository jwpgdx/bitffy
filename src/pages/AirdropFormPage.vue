<template>
  <div class="container">
    <form @submit.prevent="submitForm">
      <input
        v-model="formData.title"
        placeholder="제목"
        class="input"
        required
      />
      <textarea
        v-model="formData.description"
        placeholder="내용 (HTML 가능)"
        class="input"
        rows="4"
        required
      >

     
</textarea>

<button type="button" @click="analyzeWithAI" :disabled="loading">
  {{ loading ? '분석 중...' : 'AI로 정리' }}
</button>

      <select v-model="formData.exchange" class="input" required>
        <option disabled value="">거래소 선택</option>
        <option value="bithumb">Bithumb</option>
        <option value="coinone">Coinone</option>
        <option value="binance">Binance</option>
        <option value="korbit">Korbit</option>
        <option value="upbit">Upbit</option>
      </select>

      <input
        v-model="formData.reward"
        placeholder="reward"
        class="input"
      />
  
      <input type="file" @change="handleFileChange" accept="image/*" />
      <input
        v-model="formData.market"
        placeholder="Market"
        class="input"
        required
      />
      <input
        type="datetime-local"
        v-model="formData.startAt"
        class="input"
        required
      />
      startAt: {{ formData.startAt }}
      <input
        type="datetime-local"
        v-model="formData.endAt"
        class="input"
        required
      />
      endAt: {{ formData.endAt }}<br />

      <input
        type="datetime-local"
        v-model="formData.rewardDate"
        class="input"
        required
      />
      rewardDate: {{ formData.rewardDate }}<br />

      <button type="submit" class="rounded bg-orange-600 px-4 py-2 text-white">
        {{ isEditMode ? "수정하기" : "등록하기" }}
      </button>
      <button
  type="button"
  @click="onClickCalendar"
  class="rounded bg-blue-600 px-4 py-2 text-white mt-2"
>
  📅 구글 캘린더에 등록
</button>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAirdropStore } from "@/stores/airdrop-store";
import { useGeminiStore } from '@/stores/gemini-store'
import { useGoogleCalendar } from '@/composables/useGoogleCalendar' // 🔥 추가
const { addCalendarEvents } = useGoogleCalendar() // 🔥 훅 사용
const onClickCalendar = () => {
  if (!formData.value.exchange || !formData.value.title || !formData.value.startAt || !formData.value.endAt || !formData.value.rewardDate) {
    alert('캘린더 등록을 위해 필수 항목을 모두 입력하세요.');
    return;
  }

  addCalendarEvents({
    exchange: formData.value.exchange,
    title: formData.value.title,
    startAt: formData.value.startAt,
    endAt: formData.value.endAt,
    rewardDate: formData.value.rewardDate,
  });
};
const loading = ref(false)


const geminiStore = useGeminiStore()
const airdropStore = useAirdropStore();
const route = useRoute();
const id = route.params.id as string | undefined;

const isEditMode = ref(!!id);

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");

const defaultDate = `${yyyy}-${mm}-${dd}`;

const formData = ref({
  id: "",
  title: "",
  description: "",
  exchange: "bithumb",
  reward: "",
  imageFile: null as File | null,
  market: "",
  startAt: `${defaultDate}T00:00`,
  endAt: `${defaultDate}T23:59`,
  rewardDate: `${defaultDate}T00:00`,

});
onMounted(async () => {
  if (isEditMode.value && id) {
    const data = await airdropStore.fetchAirdropById(id);
    console.log("data::", data);
    if (data) {
      const toLocalISOString = (date: Date) => {
        const local = new Date(date.getTime() + new Date().getTimezoneOffset() * -60000);
        return local.toISOString().slice(0, 16);
      };

      formData.value = {
        id: data.id || "",
        title: data.title,
        description: data.description,
        exchange: data.exchange,
        reward: data.reward,
        imageFile: null, // 이미지 파일은 직접 다시 업로드해야 함
        market: data.market,
        startAt: data.startAt?.toDate
          ? toLocalISOString(data.startAt.toDate())
          : `${defaultDate}T00:00`,
        endAt: data.endAt?.toDate
          ? toLocalISOString(data.endAt.toDate())
          : `${defaultDate}T23:59`,
        rewardDate: data.rewardDate?.toDate
          ? toLocalISOString(data.rewardDate.toDate())
          : `${defaultDate}T00:00`,
      };
    }
  }
});


const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    formData.value.imageFile = target.files[0];
  }
};


const analyzeWithAI = async () => {
  loading.value = true;
  console.log("formData.value.description::", formData.value.description);
  try {
    const result = await geminiStore.analyzeDescription(formData.value.description);

    // ✅ 콘솔에서 결과 확인
    console.log("🔍 Gemini 분석 결과:", result);

    // ✅ formData에 직접 반영 (실제 form에 보이도록)
    formData.value.title = result.title || "";
    formData.value.description = result.content || ""; // 🔥 HTML을 마크다운으로 변환된 content로 교체
    formData.value.exchange = result.exchange || "";
    formData.value.reward = result.reward || "";
    formData.value.market = result.market || "";
    formData.value.startAt = result.startAt?.slice(0, 16) || `${defaultDate}T00:00`;
    formData.value.endAt = result.endAt?.slice(0, 16) || `${defaultDate}T23:59`;
    formData.value.rewardDate = result.rewardDate?.slice(0, 16) || `${defaultDate}T00:00`;
    
    // airdropStore에도 반영 (필요하다면)
  } catch (error) {
    console.error("AI 분석 오류:", error);
  } finally {
    loading.value = false;
  }
};

const submitForm = async () => {
  try {
    const payload = {
      ...formData.value,
      startAt: formData.value.startAt + ":00",
      endAt: formData.value.endAt + ":00",
      rewardDate: formData.value.rewardDate + ":00",

      
    };

    if (isEditMode.value && payload.id) {
      await airdropStore.updateAirdrop(payload);
      alert("수정 완료!");
    } else {
      await airdropStore.addAirdrop(payload);
      alert("등록 완료!");
    }
  } catch (error) {
    console.error(error);
    alert("오류 발생!");
  }
};
</script>

<style scoped>
.input {
  @apply w-full rounded border bg-black p-2 text-sm text-white;
}
</style>
