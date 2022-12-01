const fs = require('fs');

module.exports = {
    getInput: (cb) => {
        fs.readFile('./input.txt', 'utf-8', (err, data) => {
            if (err) throw err;

            cb(data);
        });
    }
};
