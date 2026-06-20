const CONFIG = {
    passcode: atob("MDEyMQ=="),
    startDate: "2026-01-21",
    loveLetter: "我不擅长写情话，<br>但我只想把你和我的每一天，<br>都按一次 Ctrl+S。<br><br>Forever Love. ❤️",
    specialDates: [
        { date: "2026-01-21", title: "💕 故事开始的这一天", type: "start" },
        { date: "2026-02-25", title: "💝 第一次心动约会", type: "special" },
        { date: "2026-04-03", title: "❤️ 久别重逢的拥抱", type: "special" }
    ],
    monthlyAnniversary: 21,
    events: [
        { date: "2026-02-14", title: "情人节", type: "holiday" },
        { date: "2026-12-25", title: "圣诞节", type: "holiday" }
    ],
    users: {
        jing: { id: 'user_001', name: '境', avatar: '💚', emoji: '🌿' },
        yang: { id: 'user_002', name: '扬', avatar: '💙', emoji: '🌙' }
    },
    cacheTTL: 5 * 60 * 1000,
    maxPhotoSize: 5 * 1024 * 1024,
    supabase: {
        url: "https://ajfyswyaqctvcntvzwyx.supabase.co",
        anonKey: "sb_publishable_p68HEA9VFyVFqbpKhjtBqg_T3eIUus8",
        storageBucket: "photos",
        tableName: "photos",
        letterBooksTable: "letter_books",
        lettersTable: "letters",
        murmursTable: "murmurs",
        todosTable: "todos",
        timePlansTable: "time_plans",
        accountsTable: "accounts"
    }
};

let _supabaseClient = null;
function getSupabaseClient() {
    if (!_supabaseClient && CONFIG.supabase.url !== 'YOUR_SUPABASE_URL' && CONFIG.supabase.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
        const sb = typeof supabase !== 'undefined' ? supabase : (window.supabase || {});
        if (sb.createClient) {
            _supabaseClient = sb.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey, {
                auth: {
                    persistSession: false,
                    detectSessionInUrl: false,
                    autoRefreshToken: false
                }
            });
        }
    }
    return _supabaseClient;
}
