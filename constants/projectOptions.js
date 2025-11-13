const projectSizes = [
    {
        code: "large",
        title: "Large",
        description: "Longer term or complex initiatives (ex. design and build a full website)"
    },
    {
        code: "medium",
        title: "Medium",
        description: "Well-defined projects (ex. a landing page)"
    },
    {
        code: "small",
        title: "Small",
        description: "Quick and straightforward tasks (ex. update text and images on a webpage)"
    }
];

const durations = [
    { code: "1_2_days", label: "1–2 Days" },
    { code: "1_4_weeks", label: "1 to 4 weeks" },
    { code: "1_3_months", label: "1 to 3 months" },
    { code: "3_6_months", label: "3 to 6 months" },
    { code: "ongoing", label: "Ongoing" }
];

const experienceLevels = [
    { code: "entry", title: "Entry" },
    { code: "intermediate", title: "Intermediate" },
    { code: "expert", title: "Expert" }
];

module.exports = {
    projectSizes,
    durations,
    experienceLevels
};
