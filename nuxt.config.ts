// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/d-korea-law/' : '/',
    head: {
      title: 'Lawyer Dom | 대한민국 국가법령 검색 서비스',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Lawyer Dom은 대한민국 법제처 API와 실시간 연동하여 국가법령 및 판례, 해석례 등을 편리하게 검색하고 조문을 확인할 수 있는 법률 검색 솔루션입니다. 소액 민사 분쟁 상황을 입력하면 관련 법률 근거와 단계별 대응 전략을 AI가 실시간으로 분석해 드립니다.' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'Lawyer Dom | 대한민국 국가법령 검색 서비스' },
        { property: 'og:description', content: '법제처 API 실시간 법령 조회 및 AI 기반 소액 민사 분쟁(임대차 보증금, 임금 체불, 사이버 사기) 단계별 대응 가이드' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://hdomi.github.io/d-korea-law/' },
        { property: 'og:image', content: '/d-korea-law/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Lawyer Dom | 대한민국 국가법령 검색 서비스' },
        { name: 'twitter:description', content: '법제처 API 실시간 법령 조회 및 AI 기반 소액 민사 분쟁 단계별 대응 가이드' },
        { name: 'twitter:image', content: '/d-korea-law/og-image.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  devServer: {
    port: 3005
  },
  nitro: {
    output: {
      publicDir: 'dist'
    }
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL
    }
  }
})


