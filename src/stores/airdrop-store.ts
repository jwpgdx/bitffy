import { defineStore } from "pinia";
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  Timestamp,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  getDoc
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firestore } from "@/firebase";

export interface AirdropItem {
  id?: string;
  title: string;
  exchange: string;
  reward: string;
  description: string;
  imageUrl: string;
  market: string;
  startAt: Timestamp;
  endAt: Timestamp;
  rewardDate: Timestamp;
  createdAt: Timestamp;
  status?: "scheduled" | "ongoing" | "ended";
}

function toUTCDate(localDatetime: string): Date {
  const local = new Date(localDatetime);
  return new Date(local.getTime() - (new Date().getTimezoneOffset() * 60000));
}

export const useAirdropStore = defineStore("airdropStore", {
  state: () => ({
    ongoingAirdrops: [] as AirdropItem[],
    endedAirdrops: [] as AirdropItem[],
    allAirdrops: [] as AirdropItem[],
    ongoingLast: null,
    endedLast: null,
    allLast: null,
    hasMoreOngoing: true,
    hasMoreEnded: true,
    hasMoreAll: true,
    isUploading: false,
  }),

  actions: {
    async fetchAllAirdrops(limitCount = 6, nextPage = false) {
      const now = Timestamp.now();
      let q = query(
        collection(firestore, "airdrops"),
        orderBy("endAt", "desc"),
        limit(limitCount)
      );

      if (nextPage && this.allLast) {
        q = query(q, startAfter(this.allLast), limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data() as AirdropItem;
        const status: AirdropItem["status"] =
          data.endAt.toMillis() >= now.toMillis() ? "ongoing" : "ended";

        return {
          id: doc.id,
          ...data,
          status,
        };
      });

      if (nextPage) {
        this.allAirdrops.push(...docs);
      } else {
        this.allAirdrops = docs;
      }

      this.allLast = snapshot.docs.at(-1) || null;
      this.hasMoreAll = snapshot.docs.length === limitCount;
    },

    async fetchOngoingAirdrops(limitCount = 6, nextPage = false) {
      const now = Timestamp.now();
      let q = query(
        collection(firestore, "airdrops"),
        where("endAt", ">=", now),
        orderBy("endAt", "asc"),
        limit(limitCount)
      );

      if (nextPage && this.ongoingLast) {
        q = query(q, startAfter(this.ongoingLast), limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: "ongoing",
      })) as AirdropItem[];

      if (nextPage) {
        this.ongoingAirdrops.push(...docs);
      } else {
        this.ongoingAirdrops = docs;
      }

      this.ongoingLast = snapshot.docs.at(-1) || null;
      this.hasMoreOngoing = snapshot.docs.length === limitCount;
    },

    async fetchEndedAirdrops(limitCount = 6, nextPage = false) {
      const now = Timestamp.now();
      let q = query(
        collection(firestore, "airdrops"),
        where("endAt", "<", now),
        orderBy("endAt", "desc"),
        limit(limitCount)
      );

      if (nextPage && this.endedLast) {
        q = query(q, startAfter(this.endedLast), limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: "ended",
      })) as AirdropItem[];

      if (nextPage) {
        this.endedAirdrops.push(...docs);
      } else {
        this.endedAirdrops = docs;
      }

      this.endedLast = snapshot.docs.at(-1) || null;
      this.hasMoreEnded = snapshot.docs.length === limitCount;
    },

    async uploadImageWithBase64(file: File, market: string): Promise<string> {
      if (!file) throw new Error("파일이 없습니다.");
      const functions = getFunctions();
      this.isUploading = true;

      const base64 = await this.fileToBase64(file);
      const uploadAirdropImage = httpsCallable(functions, 'uploadAirdropImage');
      const result = await uploadAirdropImage({ imageBase64: base64, filename: market });
      const data = result.data as any;

      if (!data.success || !data.fileUrl) throw new Error("이미지 업로드 실패");

      this.isUploading = false;
      return data.fileUrl;
    },

    fileToBase64(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    },

    async addAirdrop(payload: {
      title: string;
      description: string;
      exchange: string;
      reward: string;
      imageFile: File;
      market: string;
      startAt: string;
      endAt: string;
      rewardDate: string;
    }) {
      const imageUrl = await this.uploadImageWithBase64(payload.imageFile, payload.market);
      await addDoc(collection(firestore, "airdrops"), {
        title: payload.title,
        description: payload.description,
        exchange: payload.exchange,
        reward: payload.reward,
        imageUrl,
        market: payload.market,
        startAt: Timestamp.fromDate(toUTCDate(payload.startAt)),
        endAt: Timestamp.fromDate(toUTCDate(payload.endAt)),
        rewardDate: Timestamp.fromDate(toUTCDate(payload.rewardDate)),
        createdAt: Timestamp.now(),
      });
      await this.fetchOngoingAirdrops();
    },

    async updateAirdrop(payload: {
      id: string;
      title: string;
      description: string;
      exchange: string;
      reward: string;
      imageFile?: File;
      market: string;
      startAt: string;
      endAt: string;
      rewardDate: string;
    }) {
      const docRef = doc(firestore, "airdrops", payload.id);
      let imageUrl = undefined;

      if (payload.imageFile) {
        imageUrl = await this.uploadImageWithBase64(payload.imageFile, payload.market);
      }

      const updateData: any = {
        title: payload.title ?? '',
        description: payload.description ?? '',
        exchange: payload.exchange ?? '',
        reward: payload.reward ?? '',
        market: payload.market ?? '',
        startAt: Timestamp.fromDate(toUTCDate(payload.startAt)),
        endAt: Timestamp.fromDate(toUTCDate(payload.endAt)),
        rewardDate: Timestamp.fromDate(toUTCDate(payload.rewardDate)),
      };

      if (imageUrl) updateData.imageUrl = imageUrl;

      await updateDoc(docRef, updateData);
      await this.fetchOngoingAirdrops();
    },

    async deleteAirdrop(id: string) {
      try {
        await deleteDoc(doc(firestore, "airdrops", id));
        await this.fetchOngoingAirdrops();
      } catch (error) {
        console.error("삭제 실패:", error);
        throw error;
      }
    },

    async fetchAirdropById(id: string): Promise<AirdropItem | null> {
      try {
        const docRef = doc(firestore, "airdrops", id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          return null;
        }

        return {
          id: snapshot.id,
          ...snapshot.data(),
        } as AirdropItem;
      } catch (error) {
        console.error("에어드롭 상세 조회 실패:", error);
        throw error;
      }
    }
  },
});
