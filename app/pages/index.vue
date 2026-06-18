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

        <!-- Central Search Bar -->
        <div class="search-box-wrapper">
          <form @submit.prevent="triggerSearch">
            <div class="search-container">
              <input 
                type="text" 
                v-model="query" 
                class="search-input glow-hover" 
                placeholder="법령명 또는 검색어를 입력하세요 (예: 헌법, 도로교통법, 민법)"
                required
              />
              <button type="submit" class="search-submit-btn" aria-label="검색">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
          </form>
        </div>

        <!-- Quick Tags -->
        <div class="quick-tags-wrapper">
          <span class="tags-label text-muted">신속 검색어:</span>
          <div class="quick-tags">
            <button 
              v-for="tag in quickTags" 
              :key="tag" 
              class="tag-btn-item"
              @click="searchQuickTag(tag)"
            >
              # {{ tag }}
            </button>
          </div>
        </div>
      </div>

      <!-- SEARCH RESULT MODE (Split Screen Layout) -->
      <div v-else class="results-split-layout">
        <!-- Sidebar: Results List -->
        <aside :class="['sidebar-results', mobileActiveView === 'list' ? 'mobile-active' : '']" aria-label="검색 결과 목록">
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
        <section :class="['detail-content-wrapper', mobileActiveView === 'detail' ? 'mobile-active' : '']" aria-label="법령 상세 정보">
          <!-- Mobile Back Button to Results List -->
          <div class="mobile-back-bar">
            <button class="back-to-list-btn" @click="mobileActiveView = 'list'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>목록으로 돌아가기</span>
            </button>
          </div>

          <!-- Loading placeholder for detail -->
          <div v-if="detailLoading" class="detail-loader">
            <div class="spinner"></div>
            <p class="text-muted console-font">법제처 데이터베이스 조회 중...</p>
          </div>

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
            <p>검색 결과에서 법령을 선택해 주세요.</p>
            <p class="text-muted text-sm">좌측 목록에서 항목을 클릭하면 실시간 법령 조문을 열람할 수 있습니다.</p>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { LawItem, LawDetail } from '~/types';

const emit = defineEmits(['search-triggered']);

const query = ref('');
const lastSearchQuery = ref('');
const isSearchMode = ref(false);
const loading = ref(false);
const detailLoading = ref(false);
const errorMessage = ref('');

const lawsList = ref<LawItem[]>([]);
const searchCount = ref(0);
const selectedMst = ref('');
const activeLaw = ref<LawDetail | null>(null);

// For mobile responsive toggle
const mobileActiveView = ref<'list' | 'detail'>('list');

const quickTags = ['헌법', '도로교통법', '저작권법', '민법', '상법', '형법'];

// Trigger search via API proxy
async function triggerSearch() {
  const searchQuery = query.value.trim();
  if (!searchQuery) return;

  isSearchMode.value = true;
  loading.value = true;
  errorMessage.value = '';
  lastSearchQuery.value = searchQuery;
  mobileActiveView.value = 'list';

  try {
    const url = `/api/search?query=${encodeURIComponent(searchQuery)}`;
    const data = await $fetch<any>(url);

    lawsList.value = data.laws || [];
    searchCount.value = data.totalCount || 0;

    // Auto-select first law if results found
    if (lawsList.value.length > 0) {
      await selectLaw(lawsList.value[0]);
    } else {
      activeLaw.value = null;
      selectedMst.value = '';
    }
  } catch (error: any) {
    console.error('Search failed:', error);
    errorMessage.value = error.data?.statusMessage || error.message || '법령을 검색하는 도중 에러가 발생했습니다.';
    lawsList.value = [];
    searchCount.value = 0;
    activeLaw.value = null;
    selectedMst.value = '';
  } finally {
    loading.value = false;
    emit('search-triggered', searchQuery);
  }
}

// Search a quick tag directly
function searchQuickTag(tag: string) {
  query.value = tag;
  triggerSearch();
}

// Select a specific law to load details
async function selectLaw(law: any) {
  selectedMst.value = law.mst;
  detailLoading.value = true;
  errorMessage.value = '';
  mobileActiveView.value = 'detail'; // Switch view on mobile

  try {
    const url = `/api/detail?mst=${law.mst}&id=${law.idNumber}`;
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
  selectedMst.value = '';
  errorMessage.value = '';
  mobileActiveView.value = 'list';
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
</style>
