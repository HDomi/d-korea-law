import { defineEventHandler, getQuery, createError } from 'h3';
import type { LawDetail, Article } from '../../app/types';

export default defineEventHandler(async (event): Promise<LawDetail> => {
  const queryParams = getQuery(event);
  const mst = (queryParams.mst as string) || '';
  const id = (queryParams.id as string) || '';
  
  // Resolve OC key (인증키):
  // 1. From NUXT_KOREA_LAW_API_KEY environment variable.
  // 2. If NUXT_KOREA_LAW_API_KEY is not set or is set to the default placeholder 'domi_api_key_korea_statute',
  //    fallback to the prefix of NUXT_KOREA_LAW_USER_ID (e.g., 'hwangjae1139' from 'hwangjae1139@gmail.com').
  let oc = process.env.NUXT_KOREA_LAW_API_KEY || '';
  if (!oc || oc === 'domi_api_key_korea_statute') {
    const userId = process.env.NUXT_KOREA_LAW_USER_ID || '';
    if (userId) {
      oc = (userId.includes('@') ? userId.split('@')[0] : userId) || '';
    }
  }
  if (!oc) {
    oc = 'hwangjae1139'; // Last resort default
  }

  console.log(`[API Detail] mst: "${mst}", id: "${id}"`);

  if (!mst && !id) {
    throw createError({
      statusCode: 400,
      statusMessage: '법령일련번호(mst) 또는 법령ID(id)가 필요합니다.'
    });
  }

  try {
    const url = `https://www.law.go.kr/DRF/lawService.do?OC=${oc}&target=law&MST=${mst || id}&type=JSON`;
    
    const response = await $fetch<any>(url, {
      timeout: 7000,
      parseResponse: (txt) => {
        if (txt.trim().startsWith('<?xml')) {
          if (txt.includes('인증오류') || txt.includes('인증 실패') || txt.includes('유효하지 않은')) {
            throw new Error('국가법령 API 인증에 실패했습니다 (유효하지 않은 OC Key).');
          }
          throw new Error('국가법령 API가 XML 에러 메시지를 반환했습니다.');
        }
        return JSON.parse(txt);
      }
    });

    if (response && response.LawService) {
      const lawData = response.LawService;
      const title = lawData['법령명한글'] || lawData['법령명_한글'] || '알 수 없는 법령';
      const department = lawData['소관부처명'] || lawData['소관부처'] || '소관부처 미상';
      const date = lawData['공포일자'] || '';
      const effectiveDate = lawData['시행일자'] || '';
      const idNumber = lawData['법령ID'] || '';

      // Extract articles
      let articles: Article[] = [];
      const rawArticlesWrap = lawData['조문'] || {};
      let rawArticles = rawArticlesWrap['조문단위'] || [];
      
      if (!Array.isArray(rawArticles)) {
        rawArticles = rawArticles ? [rawArticles] : [];
      }

      articles = rawArticles.map((art: any): Article => {
        const artId = art['조문번호'] ? `제${art['조문번호']}조` : '';
        const artTitle = art['조문제목'] ? `제${art['조문번호']}조(${art['조문제목']})` : `제${art['조문번호']}조`;
        const artContent = art['조문내용'] || '';
        return {
          id: artId,
          title: artTitle,
          content: artContent.trim()
        };
      }).filter((art: Article) => art.content);

      return {
        source: 'api',
        mst: mst || idNumber,
        idNumber,
        title,
        type: lawData['제개정구분명'] || '일부개정',
        date,
        effectiveDate,
        department,
        articles
      };
    } else if (response && (response.msg || response.result)) {
      throw new Error(response.msg || response.result);
    } else {
      throw new Error('상세 법령 정보를 받아오는 데 실패했습니다.');
    }
  } catch (error: any) {
    console.error('[API Detail] Error:', error.message);
    throw createError({
      statusCode: 502,
      statusMessage: error.message || '국가법령 API 상세 조회 중 오류가 발생했습니다.'
    });
  }
});
