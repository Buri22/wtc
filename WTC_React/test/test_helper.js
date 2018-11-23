import React from 'react';
import ReactDOM from 'react-dom';
import { configure, shallow } from 'enzyme';
import { expect } from 'chai';
//import { describe, it } from 'mocha/lib/ms';
import Adapter from 'enzyme-adapter-react-16'
import Introduction from '../src/components/introduction/Introduction';


configure({ adapter: new Adapter() });
describe('App component testing', function() {
  it('renders welcome message', function() {
    const wrapper = shallow(<Introduction
        onLoginSuccess={() => {
            console.log('login OK');
        }}
        msg=''
      />); 
    const welcome = <h1 className="text-center">Work Time Counter</h1>;
    expect(wrapper.contains(welcome)).to.equal(true);
  });
});