<template>
  <div class="container">
    <div
      class="relative flex flex-col justify-between gap-8 lg:flex-row lg:gap-16"
    >
      <!-- 왼쪽: 제목/설명 -->
      <div class="relative flex w-full flex-col gap-4 lg:w-[30%]">
        <h1 class="text-3xl font-semibold lg:text-4xl">
          궁금한 점이 있으신가요?
        </h1>
        <div class="text-[15px] text-zinc-200">
          서비스 이용 중 불편 사항이나 문의가 있다면 언제든지 알려주세요.
          피드백도 언제든 환영합니다.
        </div>

        <div class="lex mt-8 flex-col gap-3 text-zinc-400 lg:mt-12">
          <div class="text-[15px]">
            비즈니스 제휴 및 제안 관련 문의는<br />아래 이메일로 연락해 주세요.
          </div>
          <a
            href="mailto:jwpgdev@google.com"
            class="flex items-center w-fit gap-3 px-2 rounded-sm border mt-3 border-zinc-400 h-8 text-sm transition hover:text-zinc-300 "
          >
            이메일로 문의하기 <ChevronRight class="size-4" />
          </a>
        </div>
      </div>

      <!-- 오른쪽: 폼 -->
      <div class="w-full lg:w-[50%]">
        <QuestionForm />
      </div>
    </div>
    <div class="h-12 lg:h-24" />

    <div class="mb-4 text-2xl font-semibold">내 문의 내역</div>
    <QuestionList />
  </div>
</template>

<script lang="ts" setup>
import QuestionForm from "@/components/question/QuestionForm.vue";
import QuestionList from "@/components/question/QuestionList.vue";

import { ChevronRight } from "lucide-vue-next";
</script>

<style lang="scss" scoped></style>
