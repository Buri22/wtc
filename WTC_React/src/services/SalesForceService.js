import { dataProvider } from './DataProvider';
import { ERROR } from '../constants';
import User from '../model/user';

/**
 * Handles comunication with DB about User
 * Updates User model
 */
export default class SalesForceService {
    // Send API request to SalesForce App
    static sendRequest(data) {
        return dataProvider.provide('sendRequestToSalesForce', data);
    }
    // Send API request to change data in SalesForce App
    static sendChangeDataRequest(data) {
        return dataProvider.provide('sendChangeDataRequestToSalesForce', data);
    }

}