import { defineEventHandler, getQuery, createError } from 'h3';
import type { LawSearchResponse, LawItem } from '../../app/types';

export default defineEventHandler(async (event): Promise<LawSearchResponse> => {
  const queryParams = getQuery(event);
  const query = (queryParams.query as string) || '';
  const target = (queryParams.target as string) || 'law';
  
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

  console.log(`[API Search] query: "${query}", target: "${target}"`);

  if (!query.trim()) {
    return {
      source: 'api',
      totalCount: 0,
      laws: []
    };
  }

  try {
    const url = `https://www.law.go.kr/DRF/lawSearch.do?OC=${oc}&target=${target}&type=JSON&query=${encodeURIComponent(query)}`;
    
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

    if (response && response.LawSearch) {
      const totalCount = parseInt(response.LawSearch.totalCnt || '0', 10);
      let lawList = response.LawSearch.law || [];
      
      if (!Array.isArray(lawList)) {
        lawList = lawList ? [lawList] : [];
      }

      const laws: LawItem[] = lawList.map((item: any): LawItem => ({
        mst: item['법령일련번호'] || '',
        idNumber: item['법령ID'] || '',
        title: item['법령명한글'] || '',
        type: item['제개정구분명'] || '',
        date: item['공포일자'] || '',
        effectiveDate: item['시행일자'] || '',
        department: item['소관부처명'] || ''
      })).filter((l: LawItem) => l.mst);

      return {
        source: 'api',
        totalCount,
        laws
      };
    } else if (response && (response.msg || response.result)) {
      throw new Error(response.msg || response.result);
    } else {
      throw new Error('올바른 LawSearch 검색 필드를 찾을 수 없습니다.');
    }
  } catch (error: any) {
    console.error('[API Search] Error:', error.message);
    throw createError({
      statusCode: 502,
      statusMessage: error.message || '국가법령 API 연동 중 알 수 없는 오류가 발생했습니다.'
    });
  }
});
