export const generateDummyHouseholdData = () => {
    const dummyData = [];

    for (let i = 1; i <= 100; i++) {
        dummyData.push({
            id: i,
            name: `name ${i}`,
            cell: `Cell ${i}`,
            village: `village ${i}`,
            total: `total ${i + 1}`, 
            bank_transfer: `bank_transfer ${i}`,
            commission: `bank_transfer ${i}`,
            bank_slip: `bank_transfer ${i}`
        });
    }

    return dummyData;
};