const { budgetTypes } = require("../constants/budgetOptions");

module.exports = {
    getBudgetOptions: (req, res) => {
        return res.json({
            success: true,
            data: budgetTypes
        });
    }
};
