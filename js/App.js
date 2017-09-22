/**
 * Created by Uživatel on 18.9.2017.
 */
var App = function() {

    function run() {
        var account = new Account();

        $(document)
            // Every time a modal is shown, if it has an autofocus attribute, focus on it.
            .on('shown.bs.modal','.modal', function () {
                $(this).find('[autofocus]').focus();
                Helper.bindEnterSubmitEvent(this, '#submit');
            })
            // Clear .modal after close
            .on('hidden.bs.modal', '.modal', function () {
                $(this).empty();
            });
    }


    return {
        run: run
    }
};