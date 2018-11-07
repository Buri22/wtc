import React, {Component} from 'react';
// ES2015 module syntax
import { PanelBar, PanelBarItem } from '@progress/kendo-react-layout';

export default class Statistics extends Component {
    constructor(props){
        super(props);

        this.state = {
            logs: []
        }
    }
    renderLogs = () => {
        return this.state.logs.map((log, index)=> {
            return(<li key={index}>{log}</li>)
        })
    }
    handleSelect = (e) => {
        const calls = this.state.logs.slice();

        calls.unshift(`${e.action} ${e.target.props.title}`);

        this.setState({
            logs: calls
        });
    }
    render(){
        return(
            <div className="row">
                <div className="col-md-6">
                    <PanelBar onSelect={this.handleSelect}>
                        <PanelBarItem title="First item">
                            <div
                                className="custom-template"
                                style={{padding: '30px', textAlign:'center'}}
                            >
                                <h4>Custom template: </h4>
                                <p>Item content</p>
                            </div>
                        </PanelBarItem>
                        <PanelBarItem title={"Second item"}>
                            <PanelBarItem title={"Child item"}/>
                        </PanelBarItem>
                    </PanelBar>
                </div>
                <div className="example-config col-md-6" style={{height:'180px'}}>
                  <h5>Log: </h5>
                  <ul className="event-log">
                    {this.renderLogs()}
                  </ul>
                </div>
            </div>
        )
    }
}