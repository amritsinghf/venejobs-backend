const categories = [
  { code: "it_programming", name: "IT & Programming" },
  { code: "design_multimedia", name: "Design & Multimedia" },
  { code: "marketing", name: "Marketing" },
  { code: "admin_support", name: "Admin Support" },
  { code: "writing_translation", name: "Writing & Translation" }
];

const skillsByCategory = {
  it_programming: [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "PHP",
    "TypeScript",
    "SQL"
  ],

  design_multimedia: [
    "UI Design",
    "UX Design",
    "Wireframing",
    "Figma",
    "Prototyping"
  ],

  marketing: [
    "SEO",
    "Google Ads",
    "Content Marketing"
  ],

  admin_support: [
    "Data Entry",
    "Customer Support"
  ],

  writing_translation: [
    "Copywriting",
    "Translation"
  ]
};

module.exports = {
  categories,
  skillsByCategory
};
