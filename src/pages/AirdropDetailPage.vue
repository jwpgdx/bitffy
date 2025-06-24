<template>
  <div class="container py-8 text-white">
    <div v-if="!airdrop">
      <p>불러오는 중...</p>
    </div>

    <div v-else>
      <!-- 마크다운 렌더링 -->
      <div
        class="prose prose-invert mb-6 max-w-none"
        v-html="renderedDescription"
      ></div>

      <!-- 관리자 버튼 -->
      <div v-if="authStore.isAdmin" class="flex gap-2">
        <button
          @click="goToEdit(airdrop.id!)"
          class="rounded bg-white/80 px-3 py-1 text-sm text-black hover:bg-white"
        >
          수정
        </button>
        <button
          @click="deleteAirdrop(airdrop.id!)"
          class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
        >
          삭제
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAirdropStore } from "@/stores/airdrop-store";
import { useAuthStore } from "@/stores/auth-store";
import { marked } from "marked";
import DOMPurify from "dompurify";

const route = useRoute();
const router = useRouter();
const store = useAirdropStore();
const authStore = useAuthStore();

const airdrop = ref<any | null>(null);
const id = route.params.id as string;

// 마크다운을 안전한 HTML로 변환하는 computed 속성
const renderedDescription = computed(() => {
  if (!airdrop.value?.description) return "";

  // 마크다운을 HTML로 변환 (동기 처리 방식 사용)
  const htmlContent = marked.parse(airdrop.value.description);

  // XSS 공격 방지를 위해 HTML 새니타이즈
  return DOMPurify.sanitize(htmlContent);
});

const fetchDetail = async () => {
  try {
    airdrop.value = await store.fetchAirdropById(id);
  } catch (err) {
    alert("에어드롭 정보를 불러오지 못했습니다.");
  }
};

const goToEdit = (id: string) => {
  router.push(`/airdrop/edit/${id}`);
};

const deleteAirdrop = async (id: string) => {
  const ok = confirm("정말 삭제할까요?");
  if (!ok) return;
  try {
    await store.deleteAirdrop(id);
    alert("삭제 완료");
    router.push("/airdrop");
  } catch (err) {
    alert("삭제 실패");
  }
};

onMounted(() => {
  fetchDetail();
});
</script>

<style lang="scss">
.prose h1 {
  font-size: 2.5rem;
  letter-spacing: -0.01em;
  line-height: 2.875rem;
  font-weight: 500;
  margin: 0 0 1.5rem;
  @include desktop {
    font-size: 3.6rem;
    letter-spacing: -0.01em;
    line-height: 5rem;
  }
}
.prose h2 {
  font-size: 2rem;
  letter-spacing: -0.01em;
  line-height: 2.25rem;
  font-weight: 400;
  margin: 0 0 1.5rem;
  @include desktop {
    font-size: 3rem;
    letter-spacing: -0.01em;
    line-height: 3.25rem;
  }
}
.prose h3 {
  font-size: 1.5rem;
  letter-spacing: -0.01em;
  line-height: 1.75rem;
  font-weight: 400;
  margin: 0 0 1.5rem;
  @include desktop {
    font-size: 2rem;
    letter-spacing: -0.01em;
    line-height: 2.25rem;
  }
}
.prose p {
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.75rem;
  letter-spacing: 0;
  white-space: pre-line;
  margin: 0 0 1.125rem;
}

.prose h5,
.prose p,
.prose p b,
.prose p strong {
  font-size: 1.125rem;
  line-height: 1.75rem;
  letter-spacing: 0;
}

.prose ul {
  padding: 0 0 0 1rem;
  list-style-type: none;
}
.prose li {
  display: list-item;
  unicode-bidi: isolate;
  list-style: none;
  position: relative;
}
</style>
