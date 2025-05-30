import { defineStore } from "pinia";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const useGeminiStore = defineStore("geminiStore", {
  state: () => ({}),

  actions: {
    async analyzeDescription(description: string) {
      const genAI = new GoogleGenerativeAI("AIzaSyAegwPprV_6rCk_lxefoEV8cVMmsyqSimc");

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = `
You are an assistant that extracts airdrop event information from HTML content.

Your task is to parse the following HTML and return the extracted data in strict JSON format. Use the following schema:

{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "exchange": { 
      "type": "string",
      "description": "One of the following values ONLY: 'bithumb', 'coinone', 'binance', 'korbit', 'upbit'"
    },
    "reward": { 
      "type": "string",
      "description": "Reward amount and token only (e.g., '100,000,000 ACS'), without any prefix like '총'"
    },
    "market": { 
      "type": "string",
      "description": "The token symbol ONLY (e.g., 'ACS' if it's 'ACS-KRW')"
    },
    "startAt": { 
      "type": "string", 
      "description": "Start datetime in ISO 8601 format: YYYY-MM-DDTHH:MM"
    },
    "endAt": { 
      "type": "string", 
      "description": "End datetime in ISO 8601 format: YYYY-MM-DDTHH:MM"
    },
    "rewardDate": {
      "type": "string",
      "description": "Airdrop reward payout date in ISO 8601 format: YYYY-MM-DDTHH:MM"
    }
  },
  "required": ["title", "exchange", "reward", "market", "startAt", "endAt", "rewardDate"]
}

Rules:
- Do not add any prefix like '총' to reward. Just the numeric value and token.
- For 'market', return only the token symbol before any dash (e.g., 'ACS' from 'ACS-KRW').
- For 'exchange', map names like '빗썸' to the proper value from: 'bithumb', 'coinone', 'binance', 'korbit', 'upbit'.
- Do not include square brackets [] in the title. Return only the plain title text.
- Dates must be formatted as YYYY-MM-DDTHH:MM. If no time is given, default to:
  - startAt → 00:00
  - endAt → 23:59
  - rewardDate → 00:00
- If a field is not clearly present, return an empty string "".
- Return ONLY the JSON — no extra commentary.

Here is the HTML input:
${description}
      `.trim();

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // JSON 추출
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}");
        const jsonString = text.slice(jsonStart, jsonEnd + 1);

        const parsed = JSON.parse(jsonString);

        const applyDefaultTime = (datetime: string, fallback: string) => {
          if (!datetime) return "";
          return datetime.includes("T") ? datetime : `${datetime}T${fallback}`;
        };

        const finalResult = {
          ...parsed,
          startAt: applyDefaultTime(parsed.startAt, "00:00"),
          endAt: applyDefaultTime(parsed.endAt, "23:59"),
          rewardDate: applyDefaultTime(parsed.rewardDate, "00:00"),
        };

        // ✅ 결과 콘솔 출력
        console.log("🔍 Gemini 분석 결과:", finalResult);

        return finalResult;
      } catch (error) {
        console.error("❌ Gemini 분석 실패:", error);
        throw error;
      }
    },
  },
});
