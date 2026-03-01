const QUOTES = [
    { text: "我想和你一起，看遍世间所有的风景。", color: "#ffecd2", mood: 1 },
    { text: "你的名字，是我读过最短的情诗。", color: "#fbc2eb", mood: 2 },
    { text: "我喜欢你，像风走了八万里，不问归期。", color: "#c3cfe2", mood: 1 },
    { text: "想和你虚度时光，比如低头看鱼，比如把茶杯留在桌子上离开，浪费它们的一生。", color: "#e0c3fc", mood: 2 },
    { text: "余生请多指教。", color: "#ff9a9e", mood: 1 },
    { text: "我见青山多妩媚，料青山见我应如是。", color: "#a8edea", mood: 1 },
    { text: "喜欢你这件事，我从来没有开玩笑。", color: "#ffecd2", mood: 3 },
    { text: "我爱你，不是因为你是谁，而是因为和你在一起时，我是谁。", color: "#fddb92", mood: 2 },
    { text: "你是我藏在微风里的欢喜。", color: "#a1c4fd", mood: 1 },
    { text: "你是我漫漫人生路上，最美的风景。", color: "#fbc2eb", mood: 1 },
    { text: "你是我心中的一首诗，读你千遍也不厌倦。", color: "#ff9a9e", mood: 2 },
    { text: "你的眼睛真好看，里面有日月冬夏晴雨山川花草鸟兽，但还是我的眼睛更好看，因为里面有你。", color: "#c3cfe2", mood: 3 },
    { text: "我愿意用我所有的运气，换一次和你相遇。", color: "#fda085", mood: 2 },
    { text: "你是我这一生，最想留住的幸运。", color: "#e0c3fc", mood: 2 },
    { text: "我想和你一起，从心动到古稀。", color: "#667eea", mood: 2 },
    { text: "你是我藏在心底最深处的温柔。", color: "#a8edea", mood: 1 },
    { text: "你是我所有的浪漫情怀。", color: "#fed6e3", mood: 1 },
    { text: "我想牵着你的手，走过春夏秋冬。", color: "#d299c2", mood: 1 },
    { text: "你是我写不完的情书，读不完的诗。", color: "#fef9d7", mood: 2 },
    { text: "遇见你，是我这辈子最幸运的事。", color: "#89f7fe", mood: 1 },
    { text: "我想和你一起，慢慢变老。", color: "#a1c4fd", mood: 2 },
    { text: "你是我所有的期待和欢喜。", color: "#fbc2eb", mood: 1 },
    { text: "我想把最好的都给你，因为你值得。", color: "#ff9a9e", mood: 2 },
    { text: "你是我心中那抹最温柔的阳光。", color: "#c3cfe2", mood: 1 },
    { text: "你是我一生只遇见一次的惊喜。", color: "#fda085", mood: 2 },
    { text: "你是我心中最美的风景，我愿意用一生去欣赏。", color: "#e0c3fc", mood: 2 },
    { text: "你是我所有温柔的来源和归属。", color: "#667eea", mood: 2 },
    { text: "你是我心中那颗最亮的星，照亮我前行的路。", color: "#a8edea", mood: 1 },
    { text: "南博的文物见证了时光，而我只想在匆匆岁月中，握紧你的手。", color: "#fbc2eb", mood: 2 },
    { text: "中山陵外的梧桐大道，是我们手牵手丈量过的地久天长。", color: "#a1c4fd", mood: 1 },
    { text: "老门东的灯影摇曳，你是那晚我唯一想定格的风景。", color: "#ffecd2", mood: 3 },
    { text: "你是六朝金陵的如梦似幻，也是我余生平凡的柴米油盐。", color: "#fddb92", mood: 2 },
    { text: "走过南京的街头巷尾，才明白最好的旅行，不是去哪，而是有你。", color: "#89f7fe", mood: 1 },
];

const MOOD_CONFIG = {
    1: { 
        damping: "cubic-bezier(0.4, 0, 0.2, 1)", 
        effect: "normal",
        cardStyle: "mood-sweet"
    },
    2: { 
        damping: "cubic-bezier(0.7, 0, 0.3, 1)", 
        effect: "blur",
        cardStyle: "mood-deep"
    },
    3: { 
        damping: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", 
        effect: "bounce",
        cardStyle: "mood-playful"
    }
};
