import React from 'react';
import { FormControl } from 'react-bootstrap';

import CategoryList from '../model/category';

export default class CategorySelectBox extends React.Component {

    render() {
        return <FormControl
            componentClass='select'
            value={this.props.initialValue || ""}
            onChange={this.props.handleNewEditedCategoryParentId}
        >
            <option key="-1" value="">None</option>
            {this.props.optionCategories.map((option, index, possibleParents) => {
                let optionName = option.name;
                if (possibleParents.find(cat => cat.name == option.name && cat.id != option.id)) {
                    // There is category name duplicate => extend its name to be clear which category it is
                    optionName += CategoryList.getParentName(possibleParents, option.parentId);
                }
                return <option key={index} value={option.id}>{optionName}</option>;
            })}
        </FormControl>;
    }
}