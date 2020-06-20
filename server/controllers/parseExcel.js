const xlsx = require('xlsx');

module.exports = function(req, res, next){

    try {
        if (!req.files.excel){
            res.status(400).send({'err': 'Excel file not found.'})
        }
    
        let fileData = req.files.excel.data;
        let workBook = xlsx.read(fileData);
        let firstSheetName = workBook.SheetNames[0];
        let workSheet = workBook.Sheets[firstSheetName];
        let data = xlsx.utils.sheet_to_json(workSheet);

        if(data.length == 0){
            res.status(400).send({'err': 'No data found in excel sheet.'})
        }

        req.data = data;

        next();
    
    } catch (err) {
        res.status(400).send(err)
    }
}