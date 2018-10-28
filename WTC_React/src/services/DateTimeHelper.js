/**
 * Static class that provides useful methods to work with date and time
 */
class DateTimeHelper {
    /**
     * Converts time in seconds to H:m:s format
     * @param {int} seconds Time in seconds to be converted
     */
    static secondsToHms(seconds) {
        let h = Math.floor(seconds / 3600);
        let m = Math.floor(seconds % 3600 / 60);
        let s = Math.floor(seconds % 3600 % 60);
        return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }

    /**
     * Converts time in H:m:s format to seconds
     * @param {string} time Time in H:m:s format to be converted
     */
    static hmsToSeconds(time) {
        let hms_time = time.split(":");
        return Number(hms_time[2]) + Number(hms_time[1]) * 60 + Number(hms_time[0]) * 60 * 60;
    }
}
export default DateTimeHelper;