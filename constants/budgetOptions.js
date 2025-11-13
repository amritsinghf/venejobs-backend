const budgetTypes = [
    {
        code: "hourly",
        label: "Hourly rate",
        minAmount: 5,
        description: "Ideal for ongoing or flexible tasks."
    },
    {
        code: "fixed",
        label: "Fixed price",
        minAmount: 1,
        description: "Good for well-defined projects with clear deliverables."
    },
    {
        code: "monthly",
        label: "Monthly bases",
        minAmount: 300,
        description: "Best for long-term ongoing work."
    }
];

module.exports = { budgetTypes };
