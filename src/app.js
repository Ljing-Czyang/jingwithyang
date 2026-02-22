document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-toggle-sidebar').addEventListener('click', () => homeFeature.toggleSidebar(true));
    els.overlay.addEventListener('click', () => homeFeature.toggleSidebar(false));

    document.getElementById('menu-home').addEventListener('click', () => homeFeature.switchView('home'));
    document.getElementById('menu-lab').addEventListener('click', () => homeFeature.switchView('lab'));
    document.getElementById('menu-calendar').addEventListener('click', () => homeFeature.switchView('calendar'));
    document.getElementById('menu-album').addEventListener('click', () => homeFeature.switchView('album'));

    els.bottomNav.addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item');
        if (item) homeFeature.switchBottomTab(item.dataset.tab, item);
    });
});
