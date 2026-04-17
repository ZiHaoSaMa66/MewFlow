export async function callLLM(baseURL, apiKey, request) {
    const normalizedBaseURL = baseURL.replace(/\/+$/, '');
    const url = `${normalizedBaseURL}/v1/chat/completions`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            ...request,
            stream: request.stream ?? false,
        }),
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`LLM API 错误: ${response.status} ${err}`);
    }
    return response.json();
}
