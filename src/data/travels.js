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
                            id: 'n1-2',
                            name: '玄武湖',
                            lat: 32.0723,
                            lng: 118.7965,
                            time: '15:30',
                            transport: 'walk',
                            transportLabel: '步行',
                            description: '途经玄武湖，湖边漫步',
                            icon: '🌊'
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
                            id: 'n1-4',
                            name: '汉庭宾馆',
                            lat: 32.0561,
                            lng: 118.7838,
                            time: '17:30',
                            transport: 'taxi',
                            transportLabel: '打车',
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
                            lat: 32.0561,
                            lng: 118.7838,
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
                            name: '旅馆',
                            lat: 32.0561,
                            lng: 118.7838,
                            time: '20:00',
                            transport: 'taxi',
                            transportLabel: '打车',
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
                            name: '旅馆',
                            lat: 32.0561,
                            lng: 118.7838,
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
                            time: '10:00',
                            transport: 'metro',
                            transportLabel: '地铁',
                            description: '漫步神道，石象路最美',
                            icon: '🌳'
                        },
                        {
                            id: 'n3-3',
                            name: '旅馆',
                            lat: 32.0561,
                            lng: 118.7838,
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
            days: []
        }
    ]
};
