const CONFIG = {
    passcode: atob("MDEyMQ=="),
    startDate: "2026-01-21",
    loveLetter: "我不擅长写情话，<br>但我只想把你和我的每一天，<br>都按一次 Ctrl+S。<br><br>Forever Love. ❤️",
    specialDates: [
        { date: "2026-01-21", title: "💕 故事开始的这一天", type: "start" },
        { date: "2026-02-25", title: "💝 第一次心动约会", type: "special" },
        { date: "2026-04-03", title: "❤️ 久别重逢的拥抱", type: "special" }
//      { date: "2026-05-20", title: "🌹 520·我爱你", type: "special" }
    ],
    monthlyAnniversary: 21,
    events: [
        { date: "2026-02-14", title: "情人节", type: "holiday" },
        { date: "2026-12-25", title: "圣诞节", type: "holiday" }
    ],
    supabase: {
        url: "https://ajfyswyaqctvcntvzwyx.supabase.co",
        anonKey: "sb_publishable_p68HEA9VFyVFqbpKhjtBqg_T3eIUus8",
        storageBucket: "photos",
        tableName: "photos",
        letterBooksTable: "letter_books",
        lettersTable: "letters"
    }
};
