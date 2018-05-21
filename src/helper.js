/**
 * Created by Uživatel on 15.8.2017.
 * Helper contains all functions that helps to manipulate with:
 * HTML DOM tree, localStorage, time variables...
 */

var Helper = {

    // getCurrentTime: function() { // in seconds
    //     return Math.round(new Date().getTime() / 1000);
    // },

    // getFormatedDate: function(d) {
    //     d = typeof d == 'string' ? new Date(this.switchDayMonth(d)) : new Date();
    //     var curr_date = d.getDate();
    //     var curr_month = d.getMonth() + 1; //Months are zero based
    //     var curr_year = d.getFullYear();
    //     return curr_date + "." + curr_month + "." + curr_year;
    // },

    // switchDayMonth: function(stringDate) {
    //     var result = stringDate.split(' ')[0].split('-');
    //     return result[1] + '.' + result[2] + '.' + result[0] ;
    // },

    // checkFormToDisableSubmitBtn: function($formData, $submitBtn) {
    //     // Handle submit button according to changed form data
    //     var origFormData = $formData.serialize();
    //     // Bind event to toggle disabled submit button
    //     $formData.on('change input', function() {
    //         $submitBtn.prop('disabled', $formData.serialize() == origFormData);
    //     });
    // },

    // Binds keyboard event to make click() on element by selector
    // bindKeyShortcutEvent: function(obj, selector) {
    //     // To ensure that element hasn't bind event twice -> off()
    //     $(obj).off('keydown').on('keydown', function(e) {
    //         if (e.which == 13) {
    //             $(selector).click();
    //         }
    //         if (e.which == 27) {
    //             $(obj).find('button.close').click();
    //         }
    //     });
    // },

    // getModalTemplate: function($modal, data) {
    //     $.get('view/modal.htm', function(template) {
    //         $modal.append(Mustache.render($(template).html(), data))
    //             .modal('show');

    //         mediator.publish('ReadyToBindModalEvents', $modal);
    //     });
    // }

};

class Helper2 {

    static switchDayMonth(stringDate) {
        let result = stringDate.split(' ')[0].split('-');
        return result[1] + '.' + result[2] + '.' + result[0] ;
    }

    static getFormatedDate(d) {
        d = typeof d == 'string' ? new Date(this.switchDayMonth(d)) : new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1; //Months are zero based
        var curr_year = d.getFullYear();
        return curr_date + "." + curr_month + "." + curr_year;
    }

    /**
     * Binds keyboard Enter key to submit form
     * Binds keyboard Esc key to close modal window
     * @param {jQuery} obj changed form field
     * @param {String} selector submit button to simulate click on
     */
    static bindKeyShortcutEvent(obj, selector) {
        // To ensure that element hasn't bind event twice -> off()
        $(obj).off('keydown').on('keydown', (e) => {
            if (e.which == 13) {
                $(selector).click();
            }
            if (e.which == 27) {
                $(obj).find('button.close').click();
            }
        });
    }

    /**
     * Compares original form data with new data, after some change, to disable/enable submit button
     * @param {jQuery} $formData form fields  
     * @param {jQuery} $submitBtn form submit button 
     */
    static checkFormToDisableSubmitBtn($formData, $submitBtn) {
        // Handle submit button according to changed form data
        let origFormData = $formData.serialize();
        // Bind event to toggle disabled submit button
        $formData.on('change input', () => {
            $submitBtn.prop('disabled', $formData.serialize() == origFormData);
        });
    }

    
    static getModalTemplate($modal, data) {
        $.get('view/modal.htm', function(template) {
            $modal.append(Mustache.render($(template).html(), data))
                .modal('show');

            mediator.publish('ReadyToBindModalEvents', $modal);
        });
    }
}