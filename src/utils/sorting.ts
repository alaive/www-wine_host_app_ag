import type { Wine } from '../data/wines';

export const sortWinesForShelf = (wines: Wine[]): Wine[] => {
    return [...wines].sort((a, b) => {
        // 1. Sort by Winery
        if (a.winery < b.winery) return -1;
        if (a.winery > b.winery) return 1;

        // 2. Sort by Type (just to group them nicely within winery if multiple exist)
        if (a.type < b.type) return -1;
        if (a.type > b.type) return 1;

        // 3. Sort by Name
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;

        return 0;
    });
};
