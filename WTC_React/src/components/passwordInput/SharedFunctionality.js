import React, {Component} from 'react';

export const SharedFunctionality = ComposedComponent => class extends Component {
    constructor(props) {
        super(props);
        this.satisfiedPercent = this.satisfiedPercent.bind(this);
    }

    satisfiedPercent() {
        let { goodPasswordPrinciples } = this.props;
        let { password } = this.props;

        let satisfiedCount = goodPasswordPrinciples.map(p => p.predicate(password))
                                                    .reduce((count, satisfied) => 
                                                        count + (satisfied ? 1 : 0)
                                                    , 0);

        let principlesCount = goodPasswordPrinciples.length;

        return (satisfiedCount / principlesCount) * 100.0;
    }

    /* The higher order component takes another component as a parameter
    and then renders it with additional props */
    render() {
        return <ComposedComponent 
                {...this.props} 
                satisfiedPercent={this.satisfiedPercent} />
    }
}