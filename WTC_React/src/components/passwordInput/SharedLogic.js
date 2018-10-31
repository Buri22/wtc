import React, {Component} from 'react';
import classNames from 'classnames';

// toto bych urciten nenazyval jako SharedLogic. Je to high order komponenta, ktera
// se tu pouziva jako wrapper pro jine komponenty v sekci Password. Toto by se mozna 
// dalo vyresit separatni komponentou nez kompozici - budeme to muset probrat
export const SharedLogic = ComposedComponent => class extends Component {

    satisfiedPercent() {
        let { principles } = this.props;
        let { password } = this.props;

        let satisfiedCount = principles.map(p => p.predicate(password))
                                                    .reduce((count, satisfied) => 
                                                        count + (satisfied ? 1 : 0)
                                                    , 0);

        let principlesCount = principles.length;

        return (satisfiedCount / principlesCount) * 100.0;
    }

    progressInputColor(danger = 'danger') {
        let percentage = this.satisfiedPercent();

        return classNames({
            [danger]: (percentage < 33.4),
            success: (percentage >= 66.7),
            warning: (percentage >= 33.4 && percentage < 66.7)
        });
    }

    render() {
        return <ComposedComponent
                    satisfiedPercent={this.satisfiedPercent.bind(this)}
                    progressInputColor={this.progressInputColor.bind(this)}
                    {...this.props}
                />
    }
}