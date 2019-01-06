import React, { Component } from 'react';
import { MenuItem, Button, Form, FormGroup, FormControl, ControlLabel, ListGroup, ListGroupItem, Col } from 'react-bootstrap';
import { MODAL_CONTAINER } from '../../constants';
import PortalRenderer from '../../services/PortalRenderer';
import CustomModal from '../../components/CustomModal';
import CategorySelectBox from '../../components/CategorySelectBox';

import UserService from '../../services/UserService';
import CategoryList from '../../model/category';

/**
 * Renders AccountCategories menu item and modal window with CRUD capabilities
 */
export default class AccountCategories extends Component {
    constructor (props) {
        super(props);

        this.state = { 
            showModal: false,
            msg:       '',

            categoryList: [],
            categoriesToRemove: [],
            categoriesToEdit: [],
            newCategories: [],

            newCategoryName:  '',
            newCategoryParentId: '',
            newEditedCategoryName: '',
            newEditedCategoryParentId: ''
        };

        this.initialFormState = {};
        this.modalTitle = 'Task Categories';
        this.modalSubmitBtn;
    }

    setInitialFormState() {
        this.initialFormState = {
            newCategoryName: this.state.newCategoryName,
            newCategoryParentId:    this.state.newCategoryParentId
        }
    }
    editEnabled() {
        if (this.state.newCategoryName !== this.initialFormState.newCategoryName
            || this.state.newCategoryParentId !== this.initialFormState.newCategoryParentId) {
            return true;
        }

        return false;
    }

    handleShowModal() {
        this.setState({ 
            showModal: true,
            categoryList: JSON.parse(JSON.stringify(CategoryList.getCategoryList())),
            categoriesToRemove: [],
            categoriesToEdit: [],
            newCategories: [],
        });
        document.addEventListener('mousedown', this.handleClickOutsideCategoryTree.bind(this));
    }
    handleCloseModal() {
        this.setState({ showModal: false });
        document.removeEventListener('mousedown', this.handleClickOutsideCategoryTree.bind(this));
    }
    handleUserInput (e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }
    handleNewEditedCategoryParentId(e) {
        this.setState({ newEditedCategoryParentId: e.target.value })
    }
    handleSaveCategoriesBtn(e) {
        e.preventDefault();

        UserService.updateCategories({
            newCategories: this.state.newCategories,
            categoriesToEdit: this.state.categoriesToEdit,
            categoriesToRemove: this.state.categoriesToRemove
        });
        // TODO: handle response

        // UserService.editAccountData({
        //         newCategoryName: this.state.newCategoryName,
        //         newCategoryParentId:    this.state.newCategoryParentId
        //     })
        //     .then((response) => {
        //         if (response.success) {
        //             this.setInitialFormState();
        //             // hide modal window + set initial form values
        //             this.setState({
        //                 showModal:          false
        //             });
        //             // TODO: set result message with mediator into some general result message box
        //         }
        //         else if (response.success === false) {
        //             this.props.logout(response.msg);
        //         }
        //         else if (response.msg) {
        //             this.setState({ msg: response.msg });
        //         }
        //     });
    }
    handleCreateCategoryFormSubmit(e) {
        e.preventDefault();

        let categoryList = this.state.categoryList;
        let newcategories = this.state.newCategories;
        let newCategory = CategoryList.createCategory({
            Name: this.state.newCategoryName,
            ParentId: this.state.newCategoryParentId == '' ? null : this.state.newCategoryParentId
        });
        // Add new category to the newCategories List
        newcategories.push(newCategory);
        // Add category to the state
        categoryList.push(newCategory);
        // Update components state
        this.setState({
            categoryList: categoryList,
            newCategories: newcategories,
            newCategoryName:  '',
            newCategoryParentId: '',
        });
    }

    saveEditedCategoryData() {
        let updatedCategoryList = this.state.categoryList;
        let previousEditedCategory = updatedCategoryList.find(cat => cat.isEdited == true);
        // Check if some category was edited
        if (previousEditedCategory != undefined) {
            previousEditedCategory.isEdited = false;
            // Save its changes
            previousEditedCategory.name = this.state.newEditedCategoryName;
            previousEditedCategory.parentId = this._getUserInputParentId(this.state.newEditedCategoryParentId);

            // Add/Edit record of edited category in correct array
            let newEditedCategory = this.state.newCategories.find(category => category.id == previousEditedCategory.id);
            let recordedEditedCategory = this.state.categoriesToEdit.find(category => category.id == previousEditedCategory.id);
            if (newEditedCategory == undefined && recordedEditedCategory == undefined) { 
                // Edited category is not recorded yet, add record to categoriesToEdit
                this.state.categoriesToEdit.push(previousEditedCategory); 
            }
            else if (recordedEditedCategory != undefined && !CategoryList.isCategoryChanged(recordedEditedCategory)) {
                // Category is not changed and is recorded => remove it from records
                this.state.categoriesToEdit.splice(this.state.categoriesToEdit.findIndex(cat => cat.id == recordedEditedCategory.id), 1);
            }
        }
    }
    _getUserInputParentId(userInputParentId) {
        if (userInputParentId == "") return null;                               // Empty string convert to null
        else if (userInputParentId != null) return Number(userInputParentId);   // It is not empty string nor null, so convert to number
        else return userInputParentId;                                          // ParentId is null, so leave it as it is
    }

    handleCategoryTileClick(e) {
        if (e.target.type !== "button" && e.target.parentElement.type !== "button") {
            // Check if another category is already edited
            this.saveEditedCategoryData();

            let updatedCategoryList = this.state.categoryList;
            let categoryToEdit = updatedCategoryList.find(cat => cat.id == Number(e.currentTarget.dataset.id));

            // Mark clicked category to render as form
            categoryToEdit.isEdited = true;
            // Set state to rerender view
            this.setState({ 
                categoryList: updatedCategoryList,
                newEditedCategoryName: categoryToEdit.name,
                newEditedCategoryParentId: categoryToEdit.parentId
            });
        }
    }
    handleClickOutsideCategoryTree(e) {
        if (e.target.closest('#categoryList') == null) {
            let previousCategoryList = JSON.stringify(this.state.categoryList);
            this.saveEditedCategoryData();
            if (previousCategoryList != JSON.stringify(this.state.categoryList)) {
                this.setState({ categoryList: this.state.categoryList })
            }
        }
    }
    // handleAddCategoryBtn() {
    //     console.log('We should handle click on AddChildCategoryBtn.');
    // }
    handleRemoveCategoryBtn(e) {
        let updatedCategoryList = this.state.categoryList;
        let categoriesToRemove = this.state.categoriesToRemove;
        let categoryToRemoveId = e.currentTarget.parentElement.dataset.id;
        let categoryToRemoveIndex = updatedCategoryList.findIndex(cat => cat.id == Number(categoryToRemoveId));

        // Extend array of category ids to remove
        categoriesToRemove.push(Number(categoryToRemoveId));
        // Check category children and alter their parentId
        updatedCategoryList.forEach(category => {
            if (category.parentId == categoryToRemoveId) {
                category.parentId = updatedCategoryList[categoryToRemoveIndex].parentId;
            }
        });
        // Remove the category from state object
        updatedCategoryList.splice(categoryToRemoveIndex, 1);
        // Update state to rerender view for user
        this.setState({
            categoryList: updatedCategoryList,
            categoriesToRemove: categoriesToRemove
        });
    }

    renderCategoryTree() {
        if (this.state.categoryList.length > 0) {
            let rootCategoryChildren = this.state.categoryList.filter(category => category.parentId == null);
            return (
                <ListGroup id="categoryList">
                    {rootCategoryChildren.map(category => this.renderCategoryChild(category))}                       
                </ListGroup>
            )
        }
        else {
            return <span className="centered_flex">You have no category yet.</span>;
        }
    }
    renderCategoryChild(category) {
        let categoryChildrenComponents = null;
        let categoryChildrenData = this.state.categoryList.filter(child => child.parentId == category.id)
        if (categoryChildrenData.length > 0) {
            categoryChildrenComponents = <ListGroup>
                {categoryChildrenData.map(child => this.renderCategoryChild(child))}
            </ListGroup>;
        }

        let categoryListGroupItem;
        if (category.isEdited) {
            categoryListGroupItem = <ListGroupItem
                    data-id={category.id}
                    className="edited"
                >
                    <Form
                        horizontal
                        id='editCategoryForm'
                    >
                        <FormGroup controlId='newEditedCategoryName'>
                            <Col componentClass={ControlLabel} md={4}>Category name</Col>
                            <Col md={6}>
                                <FormControl
                                    type='text'
                                    name='newEditedCategoryName'
                                    value={this.state.newEditedCategoryName}
                                    onChange={this.handleUserInput.bind(this)}
                                    placeholder='Edit previous category name'
                                    autoFocus
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup controlId='newEditedCategoryParent'>
                            <Col componentClass={ControlLabel} md={4}>Category parent</Col>
                            <Col md={6}>
                                {this.renderParentSelectBoxForEditedCategory(category.id)}
                            </Col>
                        </FormGroup>
                    </Form>
                </ListGroupItem>;
        }
        else {
            categoryListGroupItem = <ListGroupItem
                    data-id={category.id}
                    onClickCapture={this.handleCategoryTileClick.bind(this)}
                >
                    <span className="categoryName">{category.name}</span>
                    <Button
                        className="removeCategory"
                        bsStyle="danger"
                        onClick={this.handleRemoveCategoryBtn.bind(this)}
                    >
                        <span className="glyphicon glyphicon-trash"></span>
                    </Button>
                </ListGroupItem>;
        }

        return (
            <React.Fragment
                key={category.id}
            >
                {categoryListGroupItem}
                {categoryChildrenComponents}
            </React.Fragment>
        );
    }
    renderParentSelectBoxForEditedCategory(parentId) {
        let optionCategories = JSON.parse(JSON.stringify(this.state.categoryList));
        // Remove current category from list
        optionCategories.splice(optionCategories.findIndex(cat => cat.id == parentId), 1);
        // Remove children from categoryList
        optionCategories = this._removeChildren(optionCategories, parentId);

        return <CategorySelectBox 
            initialValue={this.state.newEditedCategoryParentId}
            optionCategories={optionCategories}
            handleNewEditedCategoryParentId={this.handleNewEditedCategoryParentId.bind(this)}
        />;
    }
    _removeChildren(possibleChildren, parentId) {
        let childrenIds = [];
        // Loop throught all possible children and remove first layer of children
        for (let i = 0, arrayLength = possibleChildren.length; i < arrayLength; i++) {
            if (possibleChildren[i].parentId == parentId) {
                // Save its Id to check its children
                childrenIds.push(possibleChildren[i].id);
                // Remove child from the array
                possibleChildren.splice(i, 1);
                // Adjust for loop aruments after splice
                arrayLength--; i--;                   
            }
        }
        //Remove deeper layer of children -> recursive
        if (childrenIds.length > 0) {
            childrenIds.forEach(child => {
                possibleChildren = this._removeChildren(possibleChildren, child);
            });
        }
        return possibleChildren;
    }

    render() {
        if (this.state.showModal) {
            this.modalSubmitBtn = <Button
                    bsStyle='primary'
                    onClick={this.handleSaveCategoriesBtn.bind(this)}
                    disabled={!this.editEnabled()}
                >Save</Button>;
        }
        return <React.Fragment>
            <MenuItem
                onClick={this.handleShowModal.bind(this)}
                title={this.modalTitle}
            >
                <span className='glyphicon glyphicon-equalizer'></span>
                <span> Categories</span>
            </MenuItem>

            {this.state.showModal && 
                <PortalRenderer container={MODAL_CONTAINER}>
                    <CustomModal
                        title={this.modalTitle}
                        submitBtn={this.modalSubmitBtn}
                        handleCloseModal={this.handleCloseModal.bind(this)}
                    >
                        {this.renderCategoryTree()}
                        <Form
                            horizontal
                            id='createCategoryForm'
                            onSubmit={this.handleCreateCategoryFormSubmit.bind(this)}
                        >
                            <h4>Create new category</h4>
                            <FormGroup controlId='newCategoryName'>
                                <Col componentClass={ControlLabel} md={4}>Category name</Col>
                                <Col md={6}>
                                    <FormControl
                                        type='text'
                                        name='newCategoryName'
                                        value={this.state.newCategoryName}
                                        onChange={this.handleUserInput.bind(this)}
                                        placeholder='Enter new category name'
                                        autoFocus
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup controlId='newCategoryParent'>
                                <Col componentClass={ControlLabel} md={4}>Category parent</Col>
                                <Col md={6}>
                                    <FormControl
                                        componentClass='select'
                                        name='newCategoryParentId'
                                        value={this.state.newCategoryParentId}
                                        onChange={this.handleUserInput.bind(this)}
                                    >
                                        <option key="-1" value="">None</option>
                                        {this.state.categoryList.map((option, index) => <option key={index} value={option.id}>{option.name}</option>)}
                                    </FormControl>
                                </Col>
                            </FormGroup>

                            {this.state.msg && <span className='modalErrorMsg right red'>{this.state.msg}</span>}

                            <Button
                                bsStyle='success'
                                className="centered"
                                type='submit'
                            >Create</Button>
                        </Form>
                    </CustomModal>
                </PortalRenderer>
            }
        </React.Fragment>;
    }
}