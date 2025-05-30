import { ref } from 'vue'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const SCOPES = 'https://www.googleapis.com/auth/calendar.events'

const loading = ref(false)

declare global {
  interface Window {
    gapi: any
    google: any
  }
}

export function useGoogleCalendar() {
  let tokenClient: any = null

  const loadGapi = () =>
    new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        window.gapi.load('client', {
          callback: resolve,
          onerror: () => reject('gapi client 로딩 실패'),
          timeout: 5000,
          ontimeout: () => reject('gapi client 로딩 타임아웃'),
        })
      }
      script.onerror = () => reject('gapi script 로딩 실패')
      document.head.appendChild(script)
    })

  const loadGIS = () =>
    new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = () => resolve()
      script.onerror = () => reject('google identity script 로딩 실패')
      document.head.appendChild(script)
    })

  const initGapiClient = async () => {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    })
  }

  const getExchangeName = (code: string): string => {
    const map: Record<string, string> = {
      bithumb: '빗썸',
      coinone: '코인원',
      binance: '바이낸스',
      korbit: '코빗',
      upbit: '업비트',
    }
    return map[code] || code
  }

  // 🔧 "2025-05-03T00:00" → "2025-05-03"
  const toDateOnly = (datetimeStr: string): string => {
    return datetimeStr.split('T')[0]
  }

  // ✅ 하루 뒤 날짜 계산 (종료일 포함되도록)
  const addOneDay = (dateStr: string): string => {
    const date = new Date(dateStr)
    date.setDate(date.getDate() + 1)
    return date.toISOString().split('T')[0]
  }

  const addCalendarEvents = async (formData: {
    exchange: string
    title: string
    startAt: string
    endAt: string
    rewardDate: string
  }) => {
    loading.value = true

    try {
      await Promise.all([loadGapi(), loadGIS()])
      await initGapiClient()

      if (!tokenClient) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              window.gapi.client.setToken({ access_token: tokenResponse.access_token })
            } else {
              throw new Error('토큰 발급 실패')
            }
          },
        })
      }

      await new Promise<void>((resolve) => {
        tokenClient.callback = () => resolve()
        tokenClient.requestAccessToken()
      })

      const exchangeName = getExchangeName(formData.exchange)

      const events = [
        {
          summary: `${exchangeName}-${formData.title}`,
          start: {
            date: toDateOnly(formData.startAt),
          },
          end: {
            date: addOneDay(formData.endAt), // 종료일 포함시키려면 +1일
          },
          transparency: 'transparent',
          reminders: { useDefault: false },
        },
        {
          summary: `[🎁보상]${exchangeName}-${formData.title}`,
          start: {
            date: toDateOnly(formData.rewardDate),
          },
          end: {
            date: addOneDay(formData.rewardDate),
          },
          transparency: 'transparent',
          reminders: { useDefault: false },
        },
      ]

      for (const event of events) {
        await window.gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: event,
        })
      }

      alert('✅ 구글 캘린더에 "하루 종일" 일정 등록 완료!')
    } catch (err) {
      console.error('❌ Google Calendar 오류:', err)
      alert('캘린더 등록 실패! 콘솔을 확인하세요.')
    } finally {
      loading.value = false
    }
  }

  return { addCalendarEvents, loading }
}
