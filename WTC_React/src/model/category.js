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
        //this.catListTree = null;
        this.maxTmpId = 0;
    }

    setCategoryList(catListData) {
        this.catList = Array.from(catListData, catData => new Category(catData));
        //this.catListTree = this.recreateCategoryListTree(this.catList);
        // Hold maximum category id
        this.catList.forEach(cat => { 
            if (cat.id > this.maxTmpId) this.maxTmpId = cat.id;
        })
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
        //this.catListTree = this.recreateCategoryListTree(this.catList);
    }
    clearCategoryList() {
        this.catList = null;
    }
    createCategory(catData) {
        this.maxTmpId++
        catData.Id = this.maxTmpId;
        return new Category(catData);
    }
    isCategoryChanged(category) {
        let originalCategory = this.catList.find(cat => cat.id == category.id);
        if (originalCategory.name == category.name
            && originalCategory.parentId == category.parentId
        ) {
            return false;
        }
        else return true;
    }
    getCategoryList() {
        return this.catList;
    }
    // getCategoryListTree() {
    //     return this.catListTree;
    // }
    getLength() {
        return this.catList.length;
    }
    getParentName(possibleParents, parentId) {
        let parentCategory = possibleParents.find(cat => cat.id == parentId);
        if (parentCategory != undefined) {
            return ' -> ' + parentCategory.name + this.getParentName(possibleParents, parentCategory.parentId);
        }
        else return '';
    }
}

let CLWrapper = new CategoryListWrapper();

const CategoryList = {
    setCategoryList:          CLWrapper.setCategoryList.bind(CLWrapper),
    setCategory:              CLWrapper.setCategory.bind(CLWrapper),
    recreateCategoryListTree: CLWrapper.recreateCategoryListTree.bind(CLWrapper),
    clearCategoryList:        CLWrapper.clearCategoryList.bind(CLWrapper),
    createCategory:           CLWrapper.createCategory.bind(CLWrapper),
    isCategoryChanged:        CLWrapper.isCategoryChanged.bind(CLWrapper),
    getCategoryList:          CLWrapper.getCategoryList.bind(CLWrapper),
    //getCategoryListTree:      CLWrapper.getCategoryListTree.bind(CLWrapper),
    getLength:                CLWrapper.getLength.bind(CLWrapper),
    getParentName:            CLWrapper.getParentName.bind(CLWrapper)
}

export default CategoryList;