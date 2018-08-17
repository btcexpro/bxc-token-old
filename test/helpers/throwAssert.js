module.exports = async function assertThrowsAsync(fn) {
    let f = () => {
    };
    try {
        await fn();
    } catch (e) {
        f = () => {
            throw e
        };
    } finally {
        assert.throws(f);
    }
};