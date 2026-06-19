// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Lawyer Dom | 대한민국 국가법령 검색 서비스',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Lawyer Dom은 대한민국 법제처 API와 실시간 연동하여 국가법령 및 판례, 해석례 등을 편리하게 검색하고 조문을 확인할 수 있는 법률 검색 솔루션입니다.' },
        { property: 'og:title', content: 'Lawyer Dom | 대한민국 국가법령 검색 서비스' },
        { property: 'og:description', content: '실시간 국가법령 검색 및 법률 조문 조회 서비스' },
        { property: 'og:type', content: 'website' }
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
  }
})


