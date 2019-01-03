/**
 * Category model
 */
class Category {
    constructor(catData) {
        this.id = Number(catData.Id);
        this.parentId = catData.ParentId;
        this.name = catData.Name;
    }
}

/**
 * Wrapper for list of Cateogries
 */
class CategoryListWrapper {
    constructor() {
        this.catList = null;
        this.catListTree = null;
    }

    setCategoryList(catListData) {
        this.catList = Array.from(catListData, catData => new Category(catData));
        this.catListTree = this.recreateCategoryListTree(this.catList);
    }
    recreateCategoryListTree(catList) {
        if (catList != null && catList.length > 0) {
            return this._categorize(catList, catList.filter(cat => cat.parentId == null));
        }
        return null;
    }
    _categorize(fullCatList, currentChildCats) {
        return currentChildCats.map(category => {
            let parentNode = {
                id: category.id,
                name: category.name
            };

            // if current category has children, add them to the tree
            let childCats = fullCatList.filter(childCat => childCat.parentId == category.id);
            if (childCats.length > 0) {
                parentNode.nodes = this._categorize(fullCatList, childCats); // recursive
            }

            return parentNode;
        });
    }
    setCategory(cat) {
        this.catList[this.catList.findIndex(x => x.id == cat.id)] = cat;
        this.catListTree = this.recreateCategoryListTree(this.catList);
    }
    clearCategoryList() {
        this.catList = null;
    }
    addCategory(cat) {
        this.catList.push(new Category(cat));
        this.catListTree = this.recreateCategoryListTree(this.catList);
    }
    getCategoryList() {
        return this.catList;
    }
    getCategoryListTree() {
        return this.catListTree;
    }
    getLength() {
        return this.catList.length;
    }
}

let CLWrapper = new CategoryListWrapper();

const CategoryList = {
    setCategoryList:          CLWrapper.setCategoryList.bind(CLWrapper),
    setCategory:              CLWrapper.setCategory.bind(CLWrapper),
    recreateCategoryListTree: CLWrapper.recreateCategoryListTree.bind(CLWrapper),
    clearCategoryList:        CLWrapper.clearCategoryList.bind(CLWrapper),
    addCategory:              CLWrapper.addCategory.bind(CLWrapper),
    getCategoryList:          CLWrapper.getCategoryList.bind(CLWrapper),
    getCategoryListTree:      CLWrapper.getCategoryListTree.bind(CLWrapper),
    getLength:                CLWrapper.getLength.bind(CLWrapper)
}

export default CategoryList;