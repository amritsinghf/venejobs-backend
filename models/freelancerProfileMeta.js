module.exports = (sequelize, DataTypes) => {
    const FreelancerProfileMeta = sequelize.define(
        "FreelancerProfileMeta",
        {
            freelancer_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            skills: {
                type: DataTypes.JSON,
                defaultValue: []
            },
            experiences: {
                type: DataTypes.JSON,
                defaultValue: []
            },
            educations: {
                type: DataTypes.JSON,
                defaultValue: []
            },
            languages: {
                type: DataTypes.JSON,
                defaultValue: []
            },
            portfolios: {
                type: DataTypes.JSON,
                defaultValue: []
            }
        },
        {
            tableName: "freelancer_profile_meta",
            timestamps: false
        }
    );

    FreelancerProfileMeta.associate = (models) => {
        FreelancerProfileMeta.belongsTo(models.FreelancerProfile, {
            foreignKey: "freelancer_id",
            onDelete: "CASCADE"
        });
    };

    return FreelancerProfileMeta;
};
