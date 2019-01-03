import React, { Component } from 'react';
import { MenuItem, Button, Form, FormGroup, FormControl, ControlLabel, ListGroup, ListGroupItem, Col } from 'react-bootstrap';
import { MODAL_CONTAINER } from '../../constants';
import PortalRenderer from '../../services/PortalRenderer';
import CustomModal from '../../components/CustomModal';

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
            categoryListTree: [],
            categoriesToRemove: [],
            categoriesToEdit: [],
            newCategories: [],

            newCategoryName:  '',
            newCategoryParentId: '',
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
            categoryListTree: CategoryList.getCategoryListTree(),
            categoriesToRemove: [],
            categoriesToEdit: [],
            newCategories: [],
        });
    }
    handleCloseModal() {
        this.setState({ showModal: false });
    }
    handleUserInput (e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }
    handleSaveCategoriesBtn(e) {
        e.preventDefault();

        UserService.updateCategories({
            newCategories: this.state.newCategories,
            categoriesToEdit: this.state.categoriesToEdit,
            categoriesToRemove: this.state.categoriesToRemove
        });

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
    handleCreateCategoryFormSubmit() {
        console.log('We should handle create new category submit form.')
    }

    handleCategoryClick(e) {
        if (e.target.type !== "button" && e.target.parentElement.type !== "button") {
            console.log('We should handle click on category tile.');
        }
    }
    handleAddCategoryBtn() {
        console.log('We should handle click on AddChildCategoryBtn.');
    }
    handleRemoveCategoryBtn(e) {
        let categoryToRemoveId = e.currentTarget.parentElement.dataset.id;
        let updatedCategoryList = this.state.categoryList;
        let categoryToRemoveIndex = updatedCategoryList.findIndex(cat => cat.id == Number(categoryToRemoveId));
        let categoriesToRemove = this.state.categoriesToRemove;

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
            categoryListTree: CategoryList.recreateCategoryListTree(updatedCategoryList),
            categoryList: updatedCategoryList,
            categoriesToRemove: categoriesToRemove
        });

        console.log('Categories to remove are: ' + categoriesToRemove);
    }

    renderCategoryTree() {
        if (this.state.categoryList.length > 0) {
            return (
                <ListGroup id="categoryList">
                    {this.state.categoryListTree.map(category => this.renderCategoryChild(category))}                       
                </ListGroup>
            )
        }
        else {
            return <span className="centered_flex">You have no category yet.</span>;
        }
    }
    renderCategoryChild(category) {
        let childCategories = null;

        if (category.nodes) {
            childCategories = <ListGroup>
                {category.nodes.map(child => this.renderCategoryChild(child))}
            </ListGroup>;
        }

        return (
            <React.Fragment
                key={category.id}
            >
                <ListGroupItem
                    data-id={category.id}
                    onClickCapture={this.handleCategoryClick.bind(this)}
                >
                    <span className="categoryName">{category.name}</span>
                    <Button
                        className="addCategory"
                        bsStyle="success"
                        onClick={this.handleAddCategoryBtn.bind(this)}
                    >
                        <span className="glyphicon glyphicon-plus"></span>
                    </Button>
                    <Button
                        className="removeCategory"
                        bsStyle="danger"
                        onClick={this.handleRemoveCategoryBtn.bind(this)}
                    >
                        <span className="glyphicon glyphicon-remove"></span>
                    </Button>
                </ListGroupItem>
                {childCategories}
            </React.Fragment>
        );
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
                                        autoComplete='username'
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
                                        name='newCategoryParent'
                                        value={this.state.themeColor}
                                        onChange={this.handleUserInput.bind(this)}
                                    >
                                        <option key="-1" value="0">None</option>
                                        {this.state.categoryList.map((option, index) => {
                                            return (<option key={index} value={option.id}>{option.name}</option>);
                                        })}
                                    </FormControl>
                                </Col>
                            </FormGroup>

                            {this.state.msg && <span className='modalErrorMsg right red'>{this.state.msg}</span>}

                            <Button
                                bsStyle='success'
                                className="right"
                                type='submit'
                            >Create</Button>
                            <div className="clear"></div>
                        </Form>
                    </CustomModal>
                </PortalRenderer>
            }
        </React.Fragment>;
    }
}