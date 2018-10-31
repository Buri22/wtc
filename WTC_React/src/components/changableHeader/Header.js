import React, {Component} from 'react';
import {Button, Form, FormGroup, FormControl} from 'react-bootstrap';

// tu slozku bych prejmenoval budto jen na header nebo changeableHeader
// chybi popisek tridy
export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            newTitle: this.props.title
        }
    }

    handleTitleSubmit() {
        // code to handle input box submit - for example, issue an ajax request to change name in database
        this.setState({show: !this.state.show});
    }
    handleTitleChange(e) {
        // code to change the name in form input box. newTitle is initialized as empty string. We need to
        // update it with the string currently entered by user in the form
        this.setState({newTitle: e.target.value});
    }

    // hodil by se jiny nazev -> changeComponent je nevypovidajici. Napr. changeVisibility
    changeComponent() {
        // this toggles the show variable which is used for dynamic UI
        this.setState({show: !this.state.show});
    }

    render() {
        var clickableTitle;
        if(this.state.show) {
            clickableTitle = <Form inline onSubmit={this.handleTitleSubmit.bind(this)}>
                                <FormGroup controlId="formInlineTitle">
                                    <FormControl type="text" onChange={this.handleTitleChange.bind(this)} />
                                </FormGroup>
                            </Form>;
        } else {
            clickableTitle = <div>
                                <Button bsStyle="link" onClick={this.changeComponent.bind(this)}>
                                    <h3>{this.state.newTitle}</h3>
                                </Button>
                            </div>;
        }
        return (
            <div className="comment">
                {clickableTitle}
            </div>
        );
    }
}

Header.defaultProps = {
    title: 'Default Title'
}