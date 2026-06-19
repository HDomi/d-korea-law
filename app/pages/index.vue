<template>
  <div class="index-page">
    <!-- Main content container -->
    <main class="main-content">
      
      <!-- LANDING MODE (Initial Screen) -->
      <div v-if="!isSearchMode" class="landing-container animate-fade-in">
        <!-- Scales of justice logo + Lawyer Dom title -->
        <div class="logo-area">
          <svg class="landing-logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H12C16.9706 4 21 8.02944 21 13C21 17.9706 16.9706 22 12 22H4V4Z" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" />
            <line x1="9.5" y1="9" x2="9.5" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
            <line x1="7.5" y1="18" x2="11.5" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <line x1="5.5" y1="10.5" x2="13.5" y2="10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M4.5 14C4.5 15.5 6.5 15.5 6.5 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <line x1="5.5" y1="10.5" x2="5.5" y2="14" stroke="currentColor" stroke-width="1.2" />
            <path d="M12.5 14C12.5 15.5 14.5 15.5 14.5 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <line x1="13.5" y1="10.5" x2="13.5" y2="14" stroke="currentColor" stroke-width="1.2" />
          </svg>
          <h1 class="landing-title">Lawyer <span class="text-accent">Dom</span></h1>
          <p class="landing-subtitle text-muted">대한민국 법제처 API 연동 실시간 국가법령 검색 서비스</p>
        </div>

        <!-- Domain Guidance Cards Grid -->
        <div class="domain-grid animate-slide-up">
          <div 
            v-for="cat in categories" 
            :key="cat.id" 
            :class="['domain-card', selectedCategory === cat.id ? 'active' : '']"
            @click="selectCategoryAndFocus(cat.id)"
          >
            <div class="domain-card-header">
              <span class="domain-icon">{{ cat.icon }}</span>
              <h3 class="domain-name">{{ cat.label }}</h3>
            </div>
            <p class="domain-keywords text-muted">{{ cat.keywords }}</p>
            <div class="domain-hover-info">
              <div class="info-section">
                <span class="info-label">소액 분쟁 상황:</span>
                <span class="info-value">{{ cat.situation }}</span>
              </div>
              <div class="info-section">
                <span class="info-label">대응 완성 서류:</span>
                <span class="info-value accent-text">{{ cat.documents }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Central Search Bar -->
        <div class="search-box-wrapper animate-slide-up">
          <form @submit.prevent="triggerSearch">
            <div class="search-container">
              <input 
                ref="searchInput"
                type="text" 
                v-model="query" 
                class="search-input glow-hover" 
                :placeholder="searchPlaceholder"
                required
              />
              <button type="submit" class="search-submit-btn" :disabled="!query.trim()" aria-label="검색">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
          </form>
        </div>

        <!-- Dynamic Quick Suggestions matching category -->
        <div class="quick-tags-wrapper animate-slide-up">
          <span class="tags-label text-muted">예시 질문 클릭해보기:</span>
          <div class="quick-tags">
            <button 
              v-for="ex in aiExamples" 
              :key="ex.text" 
              class="tag-btn-item example animate-fade-in"
              @click="useAiExample(ex)"
            >
              "{{ ex.text }}"
            </button>
          </div>
        </div>
      </div>

      <!-- SEARCH RESULT MODE (Split Screen Layout) -->
      <div v-else class="results-split-layout" :class="{ 'full-width-mode': !!activeGuide || (loading && isAiMode) }">
        <!-- Sidebar: Results List -->
        <aside v-if="!activeGuide && !(loading && isAiMode)" :class="['sidebar-results', mobileActiveView === 'list' ? 'mobile-active' : '']" aria-label="검색 결과 목록">
          <!-- Small Search bar at top of sidebar -->
          <div class="sidebar-search-box">
            <form @submit.prevent="triggerSearch">
              <div class="search-container">
                <input 
                  type="text" 
                  v-model="query" 
                  class="search-input-sm" 
                  placeholder="다시 검색..." 
                  required
                />
                <button type="submit" class="sidebar-search-btn" aria-label="검색">
                  <svg class="search-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <!-- Query result count -->
          <div class="results-meta text-muted">
            <span>총 <strong>{{ searchCount }}</strong>건 검색됨</span>
            <span class="badge badge-blue console-font">Live API</span>
          </div>

          <!-- Error Alert Panel -->
          <div v-if="errorMessage" class="error-panel">
            <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p class="error-msg">{{ errorMessage }}</p>
          </div>

          <!-- Loading skeleton for list -->
          <div v-else-if="loading" class="list-loader">
            <div v-for="i in 5" :key="i" class="skeleton-card">
              <div class="skeleton-line title"></div>
              <div class="skeleton-line text"></div>
            </div>
          </div>

          <!-- Actual list of results -->
          <div v-else-if="lawsList.length > 0" class="results-list-scroll">
            <div 
              v-for="law in lawsList" 
              :key="law.mst"
              :class="['result-item-card', selectedMst === law.mst ? 'active' : '']"
              @click="selectLaw(law)"
            >
              <div class="result-card-header">
                <span class="result-dept">{{ law.department }}</span>
                <span class="result-type text-muted">{{ law.type }}</span>
              </div>
              <h4 class="result-title">{{ law.title }}</h4>
              <div class="result-card-footer text-muted">
                <span>시행: {{ formatShortDate(law.effectiveDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Empty search results -->
          <div v-else class="empty-results-pane">
            <p>검색 결과가 없습니다.</p>
            <p class="text-muted text-sm">다른 법령명이나 키워드로 검색해 보세요.</p>
          </div>
        </aside>

        <!-- Right Side: Details View -->
        <section :class="['detail-content-wrapper', activeGuide ? 'full-width' : '', mobileActiveView === 'detail' ? 'mobile-active' : '']" aria-label="법령 상세 정보">
          <!-- Mobile Back Button to Results List -->
          <div class="mobile-back-bar" v-if="!activeGuide">
            <button class="back-to-list-btn" @click="mobileActiveView = 'list'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>목록으로 돌아가기</span>
            </button>
          </div>

          <!-- Loading placeholder for AI Guide -->
          <div v-if="loading && isAiMode" class="ai-guide-loader animate-fade-in">
            <div class="ai-radar-animation">
              <div class="radar-circle"></div>
              <div class="radar-circle inner"></div>
              <span class="ai-sparkles">✨</span>
            </div>
            <h3 class="loader-title">AI 법률 솔루션 분석 중</h3>
            <p class="loader-subtitle text-muted">
              작성하신 내용을 분석하고 관련 법령 정보 및 판례 데이터를 조합하여 맞춤형 대응 가이드를 생성하고 있습니다.
            </p>
            <div class="loader-steps">
              <div class="loader-step active"><span class="step-dot"></span> 겪으신 상황 핵심 사실 식별 중...</div>
              <div class="loader-step"><span class="step-dot"></span> 주택임대차보호법, 근로기준법 등 관련 조문 검색 중...</div>
              <div class="loader-step"><span class="step-dot"></span> 법제처 유관 행정 규칙 및 판례 대조 분석 중...</div>
            </div>
          </div>

          <!-- Loading placeholder for detail (Standard Mode) -->
          <div v-else-if="detailLoading" class="detail-loader">
            <div class="spinner"></div>
            <p class="text-muted console-font">법제처 데이터베이스 조회 중...</p>
          </div>

          <!-- AI Guide viewer -->
          <LawGuideView
            v-else-if="activeGuide"
            :guideText="activeGuide.guide"
            :category="activeGuide.category"
            :searchKeyword="activeGuide.searchKeyword"
            :laws="activeGuide.rawLawData.laws"
            :precedents="activeGuide.rawLawData.precedents"
            :others="activeGuide.rawLawData.others"
            :userQuery="lastSearchQuery"
          />

          <!-- Detail viewer -->
          <LawDetailView 
            v-else-if="activeLaw" 
            :law="activeLaw" 
            :searchQuery="lastSearchQuery"
          />

          <!-- Empty details selection state -->
          <div v-else class="no-selection-pane">
            <svg class="book-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <p v-if="isAiMode">AI 법률 분석 결과를 가져올 수 없거나 비어 있습니다.</p>
            <p v-else>검색 결과에서 법령을 선택해 주세요.</p>
            <p class="text-muted text-sm" v-if="!isAiMode">좌측 목록에서 항목을 클릭하면 실시간 법령 조문을 열람할 수 있습니다.</p>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { useState } from '#app';
import type { LawItem, LawDetail } from '~/types';

const emit = defineEmits(['search-triggered']);

const config = useRuntimeConfig();
const apiUrl = (config.public.apiUrl as string) || 'https://server.h-domi.cloud/';

const query = ref('');
const lastSearchQuery = ref('');
const isSearchMode = ref(false);
const loading = ref(false);
const detailLoading = ref(false);
const errorMessage = ref('');

const resetTrigger = useState('reset-search-trigger', () => 0);
watch(resetTrigger, () => {
  resetState();
});

const lawsList = ref<LawItem[]>([]);
const searchCount = ref(0);
const selectedMst = ref('');
const activeLaw = ref<LawDetail | null>(null);

// AI Law Guide state (Always true now)
const isAiMode = ref(true);
const selectedCategory = ref('housing');
const activeGuide = ref<any>(null);
const searchInput = ref<HTMLInputElement | null>(null);

const categories = [
  {
    id: 'housing',
    label: '부동산/주거',
    icon: '🏠',
    keywords: '전세보증금 미반환 & 원룸 월세 보증금 먹튀',
    situation: '계약 만기 후 임대인의 보증금 미반환 및 연락 두절',
    documents: '내용증명, 임차권등기명령 신청서'
  },
  {
    id: 'labor',
    label: '노동/직장',
    icon: '💼',
    keywords: '임금체불 & 주휴수당 미지급',
    situation: '아르바이트/중소기업 퇴사자의 급여, 퇴직금, 주휴수당 체불',
    documents: '임금체불 진정서, 체불 임금 산정 내역서'
  },
  {
    id: 'scam',
    label: '사이버/민사',
    icon: '📱',
    keywords: '중고거래 사기 & 소액 먹튀',
    situation: '당근마켓/번개장터/중고나라 거래 사기 및 잠적',
    documents: '경찰 제출용 고소장 및 진정서'
  }
];

const rawAiExamples = [
  { text: "원룸 월세가 만기됐는데 집주인이 전화를 안 받고 보증금 300만 원을 안 줍니다.", category: "housing" },
  { text: "전세 계약이 만료되었는데 임대인이 다음 세입자가 구해질 때까지 보증금을 안 줍니다.", category: "housing" },
  { text: "석 달 동안 아르바이트를 했는데 급여와 주휴수당 120만 원이 입금되지 않았습니다.", category: "labor" },
  { text: "퇴사한 지 14일이 넘었는데도 회사에서 퇴직금과 마지막 달 월급을 지급하지 않고 있습니다.", category: "labor" },
  { text: "인터넷 중고 장터에서 40만 원 상당의 기기를 거래했는데, 돈을 송금받은 판매자가 잠적했습니다.", category: "scam" },
  { text: "당근마켓에서 소액 거래 사기를 당했습니다. 돈만 입금받고 연락 두절 상태입니다.", category: "scam" }
];

const aiExamples = computed(() => {
  return rawAiExamples.filter(ex => ex.category === selectedCategory.value);
});

const searchPlaceholder = computed(() => {
  if (selectedCategory.value === 'housing') {
    return '원룸 보증금 먹튀, 월세/전세보증금 미반환 상황을 상세히 적어주세요...';
  } else if (selectedCategory.value === 'labor') {
    return '아르바이트/직장 임금체불, 주휴수당 미지급, 퇴직금 미지급 등의 상황을 적어주세요...';
  } else if (selectedCategory.value === 'scam') {
    return '당근마켓, 중고나라 등 소액 중고거래 사기 및 먹튀 상황을 적어주세요...';
  }
  return '겪으신 소액 법률 분쟁 상황을 자세히 입력해 주세요...';
});

function selectCategoryAndFocus(catId: string) {
  selectedCategory.value = catId;
  nextTick(() => {
    searchInput.value?.focus();
  });
}

// For mobile responsive toggle
const mobileActiveView = ref<'list' | 'detail'>('list');

// const quickTags = ['헌법', '도로교통법', '저작권법', '민법', '상법', '형법']; // Commented out standard search tags

// Trigger search via API proxy
async function triggerSearch() {
  const searchQuery = query.value.trim();
  if (!searchQuery) return;

  isSearchMode.value = true;
  loading.value = true;
  errorMessage.value = '';
  lastSearchQuery.value = searchQuery;
  mobileActiveView.value = 'detail';
  activeLaw.value = null;
  activeGuide.value = null;

  // AI Law Guide Search only
  try {
    const targetUrl = `${apiUrl.endsWith('/') ? apiUrl : apiUrl + '/'}api/law-guide`;
    const data = await $fetch<any>(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        userMessage: searchQuery,
        category: selectedCategory.value
      }
    });

    if (data && data.success) {
      activeGuide.value = data;
    } else {
      throw new Error('AI 법률 가이드 작성 결과를 받아오는 데 실패했습니다.');
    }
  } catch (error: any) {
    console.error('AI Guide generation failed:', error);
    errorMessage.value = error.data?.statusMessage || error.message || 'AI 법률 가이드를 작성하는 도중 에러가 발생했습니다.';
    activeGuide.value = null;
  } finally {
    loading.value = false;
    emit('search-triggered', searchQuery);
  }
}

// Commented out standard search logic
/*
function searchQuickTag(tag: string) {
  query.value = tag;
  isAiMode.value = false;
  triggerSearch();
}
*/

function useAiExample(ex: { text: string, category: string }) {
  query.value = ex.text;
  selectedCategory.value = ex.category;
  isAiMode.value = true;
  triggerSearch();
}

// Select a specific law to load details
async function selectLaw(law: any) {
  selectedMst.value = law.mst;
  detailLoading.value = true;
  errorMessage.value = '';
  mobileActiveView.value = 'detail'; // Switch view on mobile

  try {
    const baseUrl = apiUrl.endsWith('/') ? apiUrl : apiUrl + '/';
    const url = `${baseUrl}api/detail?mst=${law.mst}&id=${law.idNumber}`;
    const data = await $fetch<any>(url);
    activeLaw.value = data;
  } catch (error: any) {
    console.error('Fetching law detail failed:', error);
    errorMessage.value = error.data?.statusMessage || error.message || '법령 본문 상세 정보를 가져오는 도중 에러가 발생했습니다.';
    activeLaw.value = null;
  } finally {
    detailLoading.value = false;
  }
}

// Short date format (YYYY.MM.DD)
function formatShortDate(dateStr: string) {
  if (!dateStr || dateStr.length !== 8) return dateStr || '미상';
  return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
}

// Global reset
function resetState() {
  query.value = '';
  lastSearchQuery.value = '';
  isSearchMode.value = false;
  lawsList.value = [];
  activeLaw.value = null;
  activeGuide.value = null;
  selectedMst.value = '';
  errorMessage.value = '';
  mobileActiveView.value = 'list';
  isAiMode.value = true;
  selectedCategory.value = 'housing';
}

defineExpose({
  resetState
});
</script>

<style lang="scss" scoped>
.index-page {
  padding-top: var(--header-height);
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;

  .main-content {
    flex: 1;
    width: 100%;
    overflow: hidden;
    position: relative;
    
    /* --- LANDING MODE --- */
    .landing-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - var(--header-height));
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px 80px 24px;
      text-align: center;
      
      .logo-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        margin-bottom: 40px;
        
        .landing-logo-svg {
          width: 70px;
          height: 70px;
          color: var(--text-primary);
        }

        .landing-title {
          font-size: 2.8rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .landing-subtitle {
          font-size: 1.05rem;
          margin-top: 4px;
        }
      }

      .domain-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        width: 100%;
        max-width: 800px;
        margin-bottom: 32px;
        
        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .domain-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border-light);
        border-radius: 16px;
        padding: 20px;
        text-align: left;
        cursor: pointer;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        &:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          
          .domain-hover-info {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        &.active {
          background: rgba(37, 99, 235, 0.04);
          border-color: var(--accent);
          box-shadow: 0 0 20px var(--accent-glow), inset 0 0 12px rgba(37, 99, 235, 0.1);
          
          .domain-icon {
            transform: scale(1.1);
            filter: drop-shadow(0 0 8px var(--accent-glow));
          }
          
          .domain-name {
            color: #fff;
          }
        }
        
        .domain-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 2;
          
          .domain-icon {
            font-size: 1.4rem;
            transition: transform 0.3s ease;
          }
          
          .domain-name {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--text-primary);
            transition: color 0.3s ease;
          }
        }
        
        .domain-keywords {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
          position: relative;
          z-index: 2;
        }
        
        .domain-hover-info {
          margin-top: 6px;
          padding-top: 10px;
          border-top: 1px dashed rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
          
          .info-section {
            display: flex;
            flex-direction: column;
            gap: 2px;
            
            .info-label {
              font-size: 0.72rem;
              color: var(--text-muted);
              font-weight: 600;
            }
            
            .info-value {
              font-size: 0.8rem;
              color: var(--text-secondary);
              line-height: 1.35;
              
              &.accent-text {
                color: #93c5fd; /* Soft blue text */
                font-weight: 600;
              }
            }
          }
        }
      }

      .search-box-wrapper {
        width: 100%;
        max-width: 640px;
        margin-bottom: 24px;
        
        .search-submit-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--accent);
          color: #fff;
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            background: var(--accent-hover);
            box-shadow: 0 0 10px var(--accent-glow);
          }

          &:disabled {
            background: rgba(255, 255, 255, 0.04);
            color: var(--text-muted);
            cursor: not-allowed;
            box-shadow: none !important;
            
            &:hover {
              background: rgba(255, 255, 255, 0.04);
              box-shadow: none !important;
            }
          }

          svg {
            width: 16px;
            height: 16px;
          }
        }
      }

      .quick-tags-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 48px;
        flex-wrap: wrap;
        justify-content: center;
        
        .tags-label {
          font-size: 0.85rem;
        }

        .quick-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          
          .tag-btn-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-light);
            color: var(--text-secondary);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s ease;
            
            &:hover {
              background: var(--bg-card);
              color: var(--accent);
              border-color: var(--accent);
            }
          }
        }
      }
    }

    /* --- SEARCH RESULT MODE (SPLIT LAYOUT) --- */
    .results-split-layout {
      display: grid;
      grid-template-columns: 360px 1fr;
      height: calc(100vh - var(--header-height));
      width: 100%;
      overflow: hidden;
      
      &.full-width-mode {
        grid-template-columns: 1fr !important;
      }
      
      .sidebar-results {
        border-right: 1px solid var(--border-light);
        display: flex;
        flex-direction: column;
        background: rgba(10, 10, 12, 0.3);
        height: 100%;
        overflow: hidden;
        
        .sidebar-search-box {
          padding: 16px;
          border-bottom: 1px solid var(--border-light);
          
          .search-input-sm {
            width: 100%;
            padding: 10px 14px;
            padding-right: 40px;
            font-size: 0.9rem;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid var(--border-light);
            border-radius: 8px;
            color: var(--text-primary);
            font-family: var(--font-sans);
            transition: all 0.2s ease;
            
            &:focus {
              outline: none;
              border-color: var(--accent);
              box-shadow: 0 0 10px var(--accent-glow);
            }
          }

          .sidebar-search-btn {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            
            &:hover {
              color: var(--accent);
            }

            .search-icon-sm {
              width: 15px;
              height: 15px;
            }
          }
        }

        .results-meta {
          padding: 10px 16px;
          font-size: 0.8rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.01);
          border-bottom: 1px solid var(--border-light);
        }

        .results-list-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          
          .result-item-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-light);
            border-radius: 10px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            
            &:hover {
              background: rgba(255, 255, 255, 0.04);
              border-color: rgba(255, 255, 255, 0.15);
            }

            &.active {
              background: rgba(37, 99, 235, 0.04);
              border-color: var(--accent);
              box-shadow: 0 0 10px var(--accent-glow);
            }

            .result-card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 6px;
              
              .result-dept {
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--accent);
              }

              .result-type {
                font-size: 0.7rem;
              }
            }

            .result-title {
              font-size: 0.95rem;
              font-weight: 600;
              color: var(--text-primary);
              margin-bottom: 8px;
            }

            .result-card-footer {
              font-size: 0.75rem;
            }
          }
        }

        .error-panel {
          margin: 16px;
          padding: 16px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: #f87171;
          
          .alert-icon {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
          }

          .error-msg {
            font-size: 0.85rem;
            line-height: 1.5;
          }
        }

        .empty-results-pane {
          padding: 40px 16px;
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
      }

      .detail-content-wrapper {
        padding: 24px;
        overflow: hidden;
        height: 100%;
        
        .mobile-back-bar {
          display: none;
          padding-bottom: 12px;
          
          .back-to-list-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--bg-card);
            border: 1px solid var(--border-light);
            color: var(--text-primary);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            cursor: pointer;
          }
        }

        .detail-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(37, 99, 235, 0.1);
            border-radius: 50%;
            border-top-color: var(--accent);
            animation: spin 0.8s linear infinite;
          }
        }

        .no-selection-pane {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          color: var(--text-secondary);
          border: 1px dashed var(--border-light);
          border-radius: 14px;
          
          .book-icon {
            width: 48px;
            height: 48px;
            color: var(--text-muted);
            margin-bottom: 8px;
          }
        }
      }
    }
  }
}

.list-loader {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .skeleton-card {
    height: 90px;
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid var(--border-light);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%);
      animation: loading-shimmer 1.5s infinite;
    }

    .skeleton-line {
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      
      &.title { height: 16px; width: 60%; }
      &.text { height: 12px; width: 85%; }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes loading-shimmer {
  to { transform: translateX(100%); }
}

@media (max-width: 900px) {
  .index-page {
    .main-content {
      .results-split-layout {
        grid-template-columns: 300px 1fr;
      }
    }
  }
}

@media (max-width: 768px) {
  .index-page {
    .main-content {
      .landing-container {
        .logo-area {
          .landing-title {
            font-size: 2rem;
          }
        }
      }
      
      .results-split-layout {
        grid-template-columns: 1fr;
        position: relative;
        
        .sidebar-results {
          display: none;
          
          &.mobile-active {
            display: flex;
            width: 100%;
          }
        }
        
        .detail-content-wrapper {
          display: none;
          padding: 12px;
          
          &.mobile-active {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          .mobile-back-bar {
            display: block;
          }
        }
      }
    }
  }
}

  /* Search Mode Tabs Switcher */
  .search-mode-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-light);
    padding: 4px;
    border-radius: 20px;
    align-items: center;
    backdrop-filter: blur(8px);
    
    .mode-tab-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 6px 16px;
      border-radius: 16px;
      font-family: var(--font-sans);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      
      &:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.03);
      }
      
      &.active {
        color: #fff;
        background: var(--accent);
        box-shadow: 0 0 10px var(--accent-glow);
      }
    }
  }

  /* Category Selector */
  .category-selector-wrapper {
    margin-bottom: 24px;
    width: 100%;
    max-width: 640px;
    
    .category-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      
      .category-pill-btn {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border-light);
        color: var(--text-secondary);
        padding: 6px 14px;
        border-radius: 20px;
        font-family: var(--font-sans);
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
        
        &:hover {
          border-color: rgba(255, 255, 255, 0.15);
          color: var(--text-primary);
        }
        
        &.active {
          background: rgba(37, 99, 235, 0.1);
          border-color: var(--accent);
          color: var(--accent);
          box-shadow: 0 0 8px var(--accent-glow);
        }
      }
    }
  }

  /* AI Mode Example suggestions */
  .quick-tags-wrapper {
    .quick-tags {
      .tag-btn-item.example {
        font-style: italic;
        background: rgba(37, 99, 235, 0.03);
        border-color: rgba(37, 99, 235, 0.12);
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        
        &:hover {
          background: rgba(37, 99, 235, 0.08);
          border-color: var(--accent);
          color: var(--text-primary);
        }
      }
    }
  }

  /* AI Guide Loader and animations */
  .ai-guide-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    max-width: 500px;
    margin: 0 auto;
    text-align: center;
    padding: 40px 20px;
    gap: 20px;
    
    .ai-radar-animation {
      position: relative;
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      
      .radar-circle {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 1.5px solid var(--accent);
        border-radius: 50%;
        animation: ping-radar 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        opacity: 0;
        
        &.inner {
          width: 60%;
          height: 60%;
          animation-delay: 0.8s;
        }
      }
      
      .ai-sparkles {
        font-size: 2.2rem;
        animation: wobble-sparkle 2s ease-in-out infinite;
      }
    }
    
    .loader-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .loader-subtitle {
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    
    .loader-steps {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid var(--border-light);
      padding: 14px 18px;
      border-radius: 12px;
      text-align: left;
      
      .loader-step {
        font-size: 0.8rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: loop-steps-opacity 6s infinite;
        
        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 2s; }
        &:nth-child(3) { animation-delay: 4s; }
        
        .step-dot {
          width: 5px;
          height: 5px;
          background: var(--text-muted);
          border-radius: 50%;
        }
        
        &.active {
          color: var(--text-primary);
          
          .step-dot {
            background: var(--accent);
            box-shadow: 0 0 8px var(--accent);
          }
        }
      }
    }
  }

  @keyframes ping-radar {
    0% { transform: scale(0.6); opacity: 0.8; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  
  @keyframes wobble-sparkle {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.15) rotate(12deg); }
  }

  @keyframes loop-steps-opacity {
    0%, 100% { color: var(--text-muted); }
    33% { color: var(--text-primary); }
    66% { color: var(--text-muted); }
  }
</style>

