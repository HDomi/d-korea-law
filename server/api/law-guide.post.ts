import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userMessage, category } = body || {};

  if (!userMessage) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userMessage가 필요합니다.'
    });
  }

  // Resolve API URL
  const apiUrl = process.env.API_URL || 'https://server.h-domi.cloud/';
  const targetUrl = `${apiUrl.endsWith('/') ? apiUrl : apiUrl + '/'}api/law-guide`;

  console.log(`[API Law Guide Proxy] Forwarding to: ${targetUrl}, category: ${category}`);

  try {
    const response = await $fetch<any>(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        userMessage,
        category: category || 'etc'
      },
      timeout: 90000 // AI generation might take longer, set timeout to 90 seconds
    });

    return response;
  } catch (error: any) {
    console.warn(`[API Law Guide Proxy] Primary target failed: ${error.message}. Attempting local fallback...`);
    
    // Fallback to local server running on port 5556 if the primary target fails (e.g. DNS resolution error)
    if (targetUrl !== 'http://localhost:5556/api/law-guide') {
      try {
        const fallbackUrl = 'http://localhost:5556/api/law-guide';
        console.log(`[API Law Guide Proxy] Fallback routing to: ${fallbackUrl}`);
        const fallbackResponse = await $fetch<any>(fallbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            userMessage,
            category: category || 'etc'
          },
          timeout: 90000 // Give the local server 90 seconds as well
        });
        console.log('[API Law Guide Proxy] Local fallback to localhost:5556 succeeded!');
        return fallbackResponse;
      } catch (fallbackError: any) {
        console.error('[API Law Guide Proxy] Fallback to localhost:5556 also failed:', fallbackError.message);
      }
    }

    // Attempt to extract status code and message
    const statusCode = error.statusCode || 502;
    const statusMessage = error.message || 'AI 법률 가이드 서버와의 통신에 실패했습니다.';
    
    throw createError({
      statusCode,
      statusMessage
    });
  }
});
