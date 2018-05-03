/**
 * Created by Uživatel on 15.8.2017.
 * Helper contains all functions that helps to manipulate with:
 * HTML DOM tree, localStorage, time variables...
 */

var Helper = {

    ajaxCall: function(action, type, data, callback) {
        callback = callback || {};

        // Define request headers
        var headers = {
            'Ajax-Action': action
        };
        if (type == 'POST') {
            headers['Content-type'] = 'application/x-www-form-urlencoded';
        }

        $.ajax({
            url: 'includes/wtc_ajax.php',
            headers: headers,
            type: type,
            data: data,
            dataType: 'json',
            success: callback
        });
    },

    getCurrentTime: function() { // in seconds
        return Math.round(new Date().getTime() / 1000);
    },

    getFormatedDate: function(d) {
        d = typeof d == 'string' ? new Date(this.switchDayMonth(d)) : new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1; //Months are zero based
        var curr_year = d.getFullYear();
        return curr_date + "." + curr_month + "." + curr_year;
    },

    switchDayMonth: function(stringDate) {
        var result = stringDate.split(' ')[0].split('-');
        return result[1] + '.' + result[2] + '.' + result[0] ;
    },

    checkFormToDisableSubmitBtn: function($formData, $submitBtn) {
        // Handle submit button according to changed form data
        var origFormData = $formData.serialize();
        // Bind event to toggle disabled submit button
        $formData.on('change input', function() {
            $submitBtn.prop('disabled', $formData.serialize() == origFormData);
        });
    },

    // Binds keyboard event to make click() on element by selector
    bindKeyShortcutEvent: function(obj, selector) {
        // To ensure that element hasn't bind event twice -> off()
        $(obj).off('keydown').on('keydown', function(e) {
            if (e.which == 13) {
                $(selector).click();
            }
            if (e.which == 27) {
                $(obj).find('button.close').click();
            }
        });
    },

    getModalTemplate: function($modal, data) {
        $.get('view/modal.htm', function(template) {
            $modal.append(Mustache.render($(template).html(), data))
                .modal('show');

            mediator.publish('ReadyToBindModalEvents', $modal);
        });
    }

};