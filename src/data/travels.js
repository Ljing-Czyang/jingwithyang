const TRAVELS_DATA = {
    trips: [
        {
            id: 'nanjing',
            title: '南京之行',
            subtitle: '与你相遇的古城',
            color: '#E74C3C',
            icon: '🏯',
            center: [32.0608, 118.7969],
            zoom: 12,
            days: [
                {
                    date: '2026-04-03',
                    dayLabel: 'Day 1',
                    title: '初见南京',
                    route: [
                        {
                            id: 'n1-1',
                            name: '南京南站',
                            lat: 31.9739,
                            lng: 118.7985,
                            time: '14:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '抵达南京，终于相见',
                            icon: '🚄'
                        },
                        {
                            id: 'n1-3',
                            name: '南京站',
                            lat: 32.0848,
                            lng: 118.7963,
                            time: '16:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '从南京站出发',
                            icon: '🚉'
                        },
                        {
                            id: 'n1-2',
                            name: '玄武湖',
                            lat: 32.085792,
                            lng: 118.79429,
                            time: '15:30',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '途经玄武湖，湖边漫步',
                            icon: '🌊'
                        },
                        {
                            id: 'n1-4',
                            name: '汉庭宾馆',
                            lat: 32.088567,
                            lng: 118.790242,
                            time: '17:30',
                            transport: 'taxi',
                            transportLabel: '步行',
                            description: '办理入住，安顿下来',
                            icon: '🏨'
                        }
                    ]
                },
                {
                    date: '2026-04-04',
                    dayLabel: 'Day 2',
                    title: '金陵漫步',
                    route: [
                        {
                            id: 'n2-1',
                            name: '汉庭宾馆',
                            lat: 32.088567,
                            lng: 118.790242,
                            time: '09:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '出发开始新的一天',
                            icon: '🏨'
                        },
                        {
                            id: 'n2-2',
                            name: '南京博物院',
                            lat: 32.0579,
                            lng: 118.8385,
                            time: '10:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '探索六朝古都的历史',
                            icon: '🏛️'
                        },
                        {
                            id: 'n2-3',
                            name: '老门东',
                            lat: 32.0179,
                            lng: 118.7876,
                            time: '14:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '逛吃逛吃，感受老南京',
                            icon: '🏮'
                        },
                        {
                            id: 'n2-4',
                            name: '汉庭宾馆',
                            lat: 32.088567,
                            lng: 118.790242,
                            time: '20:00',
                            transport: 'taxi',
                            transportLabel: '步行+地铁',
                            description: '回到住处休息',
                            icon: '🏠'
                        }
                    ]
                },
                {
                    date: '2026-04-05',
                    dayLabel: 'Day 3',
                    title: '钟山风华',
                    route: [
                        {
                            id: 'n3-1',
                            name: '汉庭宾馆',
                            lat: 32.088567,
                            lng: 118.790242,
                            time: '09:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '最后一天的行程',
                            icon: '🏠'
                        },
                        {
                            id: 'n3-2',
                            name: '明孝陵',
                            lat: 32.0485,
                            lng: 118.8465,
                            time: '16:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '林间漫步，走在小路上',
                            icon: '🌳'
                        },
                        {
                            id: 'n3-3',
                            name: '汉庭宾馆',
                            lat: 32.088567,
                            lng: 118.790242,
                            time: '16:00',
                            transport: 'taxi',
                            transportLabel: '步行+地铁',
                            description: '收拾行李，准备返程',
                            icon: '🧳'
                        }
                    ]
                }
            ]
        },
        {
            id: 'guangzhou',
            title: '广州之旅',
            subtitle: '花城相遇',
            color: '#27AE60',
            icon: '🌺',
            center: [23.1291, 113.2644],
            zoom: 11,
            days: [
                {
                    date: '2026-04-03',
                    dayLabel: 'Day 1',
                    title: '初抵羊城',
                    route: [
                        {
                            id: 'g1-1',
                            name: '白云机场T3',
                            lat: 23.3924,
                            lng: 113.3049,
                            time: '20:50',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '抵达广州白云机场',
                            icon: '✈️'
                        },
                        {
                            id: 'g1-2',
                            name: '汉溪长隆地铁站',
                            lat: 22.9987,
                            lng: 113.3325,
                            time: '22:30',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '乘坐地铁到达汉溪长隆',
                            icon: '🚇'
                        },
                        {
                            id: 'g1-3',
                            name: '双层小民宿（奥园城市天地8区2栋）',
                            lat: 22.9995,
                            lng: 113.3338,
                            time: '23:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '步行到民宿办理入住',
                            icon: '🏠'
                        }
                    ]
                },
                {
                    date: '2026-04-04',
                    dayLabel: 'Day 2',
                    title: '老城漫步',
                    route: [
                        {
                            id: 'g2-1',
                            name: '双层小民宿',
                            lat: 22.9995,
                            lng: 113.3338,
                            time: '11:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '从民宿出发',
                            icon: '🏠'
                        },
                        {
                            id: 'g2-2',
                            name: '汉溪长隆地铁站',
                            lat: 22.9987,
                            lng: 113.3325,
                            time: '11:30',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '步行到地铁站',
                            icon: '🚇'
                        },
                        {
                            id: 'g2-3',
                            name: '陈家祠地铁站',
                            lat: 23.1270,
                            lng: 113.2520,
                            time: '12:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '地铁前往陈家祠',
                            icon: '🚇'
                        },
                        {
                            id: 'g2-4',
                            name: '啫啫饭',
                            lat: 23.1280,
                            lng: 113.2530,
                            time: '13:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '品尝地道啫啫煲',
                            icon: '🍲'
                        },
                        {
                            id: 'g2-5',
                            name: '陈家祠',
                            lat: 23.1270,
                            lng: 113.2520,
                            time: '14:30',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '游览陈家祠，感受岭南建筑之美',
                            icon: '🏛️'
                        },
                        {
                            id: 'g2-6',
                            name: '沙面岛',
                            lat: 23.1060,
                            lng: 113.2470,
                            time: '15:30',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '前往沙面岛，欧式建筑群',
                            icon: '🏝️'
                        },
                        {
                            id: 'g2-7',
                            name: '圣心大教堂',
                            lat: 23.1160,
                            lng: 113.2560,
                            time: '17:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '参观全石结构哥特式教堂',
                            icon: '⛪'
                        },
                        {
                            id: 'g2-8',
                            name: '大锅铲火锅',
                            lat: 23.1180,
                            lng: 113.2580,
                            time: '18:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '晚餐时间，享用火锅',
                            icon: '🍲'
                        },
                        {
                            id: 'g2-9',
                            name: '永庆坊',
                            lat: 23.1190,
                            lng: 113.2490,
                            time: '19:30',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '夜游永庆坊，西关风情',
                            icon: '🏮'
                        },
                        {
                            id: 'g2-10',
                            name: '小学',
                            lat: 23.1200,
                            lng: 113.2500,
                            time: '20:30',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '途经小学',
                            icon: '🏫'
                        },
                        {
                            id: 'g2-11',
                            name: '汉溪长隆地铁站',
                            lat: 22.9987,
                            lng: 113.3325,
                            time: '21:30',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '返回汉溪长隆',
                            icon: '🚇'
                        },
                        {
                            id: 'g2-12',
                            name: '双层小民宿',
                            lat: 22.9995,
                            lng: 113.3338,
                            time: '22:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '回到住处休息',
                            icon: '🏠'
                        }
                    ]
                },
                {
                    date: '2026-04-05',
                    dayLabel: 'Day 3',
                    title: '自然与都市',
                    route: [
                        {
                            id: 'g3-1',
                            name: '双层小民宿',
                            lat: 22.9995,
                            lng: 113.3338,
                            time: '10:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '从民宿出发',
                            icon: '🏠'
                        },
                        {
                            id: 'g3-2',
                            name: '银记肠粉',
                            lat: 22.9980,
                            lng: 113.3340,
                            time: '10:30',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '早餐品尝广式肠粉',
                            icon: '🥢'
                        },
                        {
                            id: 'g3-3',
                            name: '汉溪长隆地铁站',
                            lat: 22.9987,
                            lng: 113.3325,
                            time: '11:30',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '步行到地铁站',
                            icon: '🚇'
                        },
                        {
                            id: 'g3-4',
                            name: '华南植物园',
                            lat: 23.1820,
                            lng: 113.3610,
                            time: '13:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '游览华南植物园',
                            icon: '🌿'
                        },
                        {
                            id: 'g3-5',
                            name: '旺小记烤肉',
                            lat: 23.1800,
                            lng: 113.3600,
                            time: '16:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '午餐享用烤肉',
                            icon: '🥩'
                        },
                        {
                            id: 'g3-6',
                            name: '琶洲地铁站',
                            lat: 23.1050,
                            lng: 113.3570,
                            time: '17:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '前往琶洲',
                            icon: '🚇'
                        },
                        {
                            id: 'g3-7',
                            name: '珠江边（遥望广州塔）',
                            lat: 23.1060,
                            lng: 113.3240,
                            time: '18:30',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '珠江边漫步，远眺小蛮腰',
                            icon: '🌃'
                        },
                        {
                            id: 'g3-8',
                            name: '琶洲地铁站',
                            lat: 23.1050,
                            lng: 113.3570,
                            time: '19:00',
                            transport: 'bike',
                            transportLabel: '共享单车',
                            description: '骑行返回地铁站',
                            icon: '🚴'
                        },
                        {
                            id: 'g3-9',
                            name: '汉溪长隆地铁站',
                            lat: 22.9987,
                            lng: 113.3325,
                            time: '20:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '返回汉溪长隆',
                            icon: '🚇'
                        },
                        {
                            id: 'g3-10',
                            name: '双层小民宿',
                            lat: 22.9995,
                            lng: 113.3338,
                            time: '21:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '回到住处',
                            icon: '🏠'
                        }
                    ]
                },
                {
                    date: '2026-04-06',
                    dayLabel: 'Day 4',
                    title: '校园时光与告别',
                    route: [
                        {
                            id: 'g4-1',
                            name: '双层小民宿',
                            lat: 22.9995,
                            lng: 113.3338,
                            time: '11:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '最后一天从民宿出发',
                            icon: '🏠'
                        },
                        {
                            id: 'g4-2',
                            name: '老乡村',
                            lat: 22.9980,
                            lng: 113.3350,
                            time: '12:30',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '早餐品尝湘菜',
                            icon: '🍜'
                        },
                        {
                            id: 'g4-3',
                            name: '汉溪长隆地铁站',
                            lat: 22.9987,
                            lng: 113.3325,
                            time: '13:15',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '步行到地铁站',
                            icon: '🚇'
                        },
                        {
                            id: 'g4-4',
                            name: '南村万博',
                            lat: 22.9820,
                            lng: 113.3450,
                            time: '13:30',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '换乘至南村万博',
                            icon: '🚇'
                        },
                        {
                            id: 'g4-5',
                            name: '大学城北地铁站',
                            lat: 23.0500,
                            lng: 113.3880,
                            time: '15:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '到达大学城北',
                            icon: '🚇'
                        },
                        {
                            id: 'g4-6',
                            name: '华南师范',
                            lat: 23.0560,
                            lng: 113.3940,
                            time: '16:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '参观华南师范大学',
                            icon: '🎓'
                        },
                        {
                            id: 'g4-7',
                            name: '北亭',
                            lat: 23.0580,
                            lng: 113.3960,
                            time: '17:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '逛北亭村',
                            icon: '🏘️'
                        },
                        {
                            id: 'g4-8',
                            name: '华南师范书吧',
                            lat: 23.0560,
                            lng: 113.3940,
                            time: '19:00',
                            transport: 'bike',
                            transportLabel: '共享单车',
                            description: '骑行到书吧小憩',
                            icon: '📚'
                        },
                        {
                            id: 'g4-9',
                            name: '麦当劳',
                            lat: 23.0550,
                            lng: 113.3930,
                            time: '20:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '午餐',
                            icon: '🍔'
                        },
                        {
                            id: 'g4-10',
                            name: '华南师范宿舍',
                            lat: 23.0570,
                            lng: 113.3950,
                            time: '21:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '参观校园宿舍区',
                            icon: '🏠'
                        },
                        {
                            id: 'g4-11',
                            name: '大学城北地铁站',
                            lat: 23.0500,
                            lng: 113.3880,
                            time: '22:00',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '步行回地铁站',
                            icon: '🚇'
                        },
                        {
                            id: 'g4-12',
                            name: '赤沙地铁站',
                            lat: 23.0850,
                            lng: 113.3500,
                            time: '23:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '前往赤沙地铁站',
                            icon: '🚇'
                        },
                        {
                            id: 'g4-13',
                            name: '白云机场T3',
                            lat: 23.3924,
                            lng: 113.3049,
                            time: '24:00',
                            transport: 'taxi',
                            transportLabel: '打车',
                            description: '前往机场，准备返程',
                            icon: '✈️'
                        }
                    ]
                }
            ]
        }
    ]
};
