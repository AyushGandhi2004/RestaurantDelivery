import redis  from '../config/redis.js';

const KEYS = {
    MENU_ALL : 'menu:all',
    SHOP_SETTINGS : 'shop:settings'
}

//Generic GET/SET:
export const getCache = async (key) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Cache GET error for key ${key}`, error);
        return null;
    }
};

export const setCache = async (key, value , ttlSeconds)=>{
    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
        console.error(`Cache error in SET operation of key ${key}`, error.message)
    }
};

export const deleteCache = async (key) => {
    try {
        await redis.del(key);
    } catch (error) {
        console.error(`Cache DEL error for key "${key}":`, error.message);
    }
};

export const getMenuCache = () => getCache(KEYS.MENU_ALL);
export const setMenuCache = (data) => setCache(KEYS.MENU_ALL, data, 300); // 5 min
export const invalidateMenuCache = () => deleteCache(KEYS.MENU_ALL);
export const getShopSettingsCache = () => getCache(KEYS.SHOP_SETTINGS);
export const setShopSettingsCache = (data) => setCache(KEYS.SHOP_SETTINGS, data, 30); // 30 sec
export const invalidateShopSettingsCache = () => deleteCache(KEYS.SHOP_SETTINGS);