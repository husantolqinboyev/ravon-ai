const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const tg = (window as any).Telegram?.WebApp;
    const initData = tg?.initData || '';

    // Ensure URL is absolute if API_BASE_URL is provided
    const absoluteUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    const headers = {
        ...options.headers,
        'x-telegram-init-data': initData,
    };

    const response = await fetch(absoluteUrl, {
        ...options,
        headers,
    });

    return response;
};

export const api = {
    getUserData: () => fetchWithAuth('/api/user-data'),
    analyzeAudio: (formData: FormData) => fetchWithAuth('/api/analyze-audio', {
        method: 'POST',
        body: formData,
    }),
    textToSpeech: (text: string) => fetchWithAuth('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    }),
    getTestWords: (type: string = 'word') => fetchWithAuth(`/api/test-words?type=${type}`),
    getRandomWord: (type: string = 'word') => fetchWithAuth(`/api/random-word?type=${type}`),
    getLeaderboard: () => fetchWithAuth('/api/leaderboard'),
    getUserAssessments: () => fetchWithAuth('/api/assessments'),
    getMaterials: () => fetchWithAuth('/api/materials'),
};
