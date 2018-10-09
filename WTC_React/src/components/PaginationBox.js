import React, {Component} from 'react';
import {Row, Pagination, FormGroup, FormControl, Col} from 'react-bootstrap';

const itemsPerPage = [10, 20, 50, 100];

export default class PaginationBox extends Component {
    state = {
        numberOfPageBtns: Math.ceil(this.props.totalItems / this.props.itemsPerPage)
    };

    renderPageBtns() {
        let pageBtns = [];
        let ellipsis = false;
        for (let i = 1; i <= this.state.numberOfPageBtns; i++) {
            if (this.props.currentPage - 2 <= i && i <= this.props.currentPage + 2) {
                if (i == this.props.currentPage - 2 && i !=1) {
                    pageBtns.push(<Pagination.Ellipsis key={i - 1} />);
                }
                if (this.props.currentPage == i) {
                    pageBtns.push(<Pagination.Item key={i} active>{i}</Pagination.Item>);
                }
                else {
                    pageBtns.push(<Pagination.Item key={i} 
                        onClick={this.handlePageBtnClick.bind(this)}>{i}</Pagination.Item>);
                }
                if (i == this.props.currentPage + 2 && i != this.state.numberOfPageBtns) {
                    pageBtns.push(<Pagination.Ellipsis key={i + 1} />);
                }
            }
        }
        return pageBtns;
    }
    handlePageBtnClick(e) {
        this.props.changeCurrentPage(Number(e.target.text));
    }
    goToPreviousPage() {
        this.props.changeCurrentPage(this.props.currentPage - 1);
    }
    goToNextPage() {
        this.props.changeCurrentPage(this.props.currentPage + 1);
    }
    goToFirstPage() {
        this.props.changeCurrentPage(1);
    }
    goToLastPage() {
        this.props.changeCurrentPage(this.state.numberOfPageBtns);
    }

    handleItemsPerPageChange(e) {
        let newNumberOfItemsPerPage = Number(e.target.value);
        this.props.changeItemsPerPage(newNumberOfItemsPerPage);
        this.props.changeCurrentPage(Math.ceil(((this.props.currentPage - 1) * this.props.itemsPerPage + 1) / newNumberOfItemsPerPage))

        this.setState({numberOfPageBtns: Math.ceil(this.props.totalItems / newNumberOfItemsPerPage)});
    }

    render() {
        return (
            <Row>
                <FormGroup controlId='itemsPerPage'>
                    <Col md={2}>
                        <FormControl
                            componentClass='select'
                            value={this.props.itemsPerPage}
                            onChange={this.handleItemsPerPageChange.bind(this)}
                        >
                            {itemsPerPage.map((option, index) => {
                                return (<option key={index} value={option}>{option}</option>);
                            })}
                        </FormControl>
                    </Col>
                </FormGroup>
                <Pagination>
                    {this.props.currentPage == 1 ? (
                        <React.Fragment>
                            <Pagination.First disabled/>
                            <Pagination.Prev disabled/>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Pagination.First onClick={this.goToFirstPage.bind(this)}/>
                            <Pagination.Prev onClick={this.goToPreviousPage.bind(this)}/>
                        </React.Fragment>
                    )}
                    {this.renderPageBtns()}
                    {this.props.currentPage == this.state.numberOfPageBtns ? (
                        <React.Fragment>
                            <Pagination.Next disabled/>
                            <Pagination.Last disabled/>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Pagination.Next onClick={this.goToNextPage.bind(this)}/>
                            <Pagination.Last onClick={this.goToLastPage.bind(this)} />
                        </React.Fragment>
                    )}
                </Pagination>
            </Row>
        );
    }
}