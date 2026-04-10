import { asyncHandler, sendSuccess, AppError } from "../utils/helpers.js";
import { getMenuCache, setMenuCache, getShopSettingsCache, setShopSettingsCache } from "../utils/cacheHelper.js";
import MenuCategory from '../models/MenuCategory.model.js';
import MenuItem from '../models/MenuItem.model.js';
import ShopSettings from '../models/ShopSettings.model.js';


//GET api/menu:
//returns all active categories with their available items and cached in redis for 5 mins
export const getFullMenu = asyncHandler(async (req, res) => {
    const cached = getMenuCache();
    if(cached){
        return sendSuccess(res, {menu : cached, fromCache : true}, "Menu fetched");
    }
    const categories = await MenuCategory.find({isActive : true}).sort({displayOrder:1, createdAt : 1}).lean();

    const categoryIds = categories.map((c)=>c._id);
    const items = await MenuItem.find({
        categoryId : {$in : categoryIds},
        isAvailable : true
    }).sort({createdAt : 1}).lean();

    const menu = categories.map((category) => ({
        ...category,
        items : items.filter(
            (item) => item.categoryId.toString() === category._id.toString()
        )
    }));

    await setMenuCache(menu);

    sendSuccess(res, {menu, fromCache : false}, 'Menu fetched');
});


//GET api/menu/category
//Returns only categories:

export const getCategories = asyncHandler(async (req, res) => {
    const categories = await MenuCategory.find({isActive : true}).sort({displayOrder:1}).lean();
    sendSuccess(res, {categories}, 'Categories fetched');
});


//GET api/menu/items/:categoryId:
// Returns available items in a particular category:
export const getItemsByCategory = asyncHandler(async (req,res) => {
    const {categoryId} = req.params;

    const category = await MenuCategory.findById(categoryId).lean();
    if(!category || !category.isActive){
        throw new AppError('Category not found', 404);
    }

    const items = await MenuItem.find({categoryId, isAvailable : true}).sort({createdAt : 1}).lean();

    sendSuccess(res, {category, items}, 'Items fetched');
});


//GET api/shop/settings
//Returns shop open/ close status . Cached for 30 sec
export const getShopSettings = asyncHandler(async (req,res) => {
    const cached = await getShopSettingsCache();
    if(cached) {
        return sendSuccess(res, {settings : cached , fromCache : true}, "Shop settings fetched");
    }

    let settings = await ShopSettings.findOne().lean();
    if(!settings){
        settings = await ShopSettings.create({
            isOpen : true,
            openTime : "09:00",
            closeTime : "21:00"
        });
    }

    await setShopSettingsCache(settings);
    sendSuccess(res, {settings, fromCache : false}, "Shop settings fetched");
});