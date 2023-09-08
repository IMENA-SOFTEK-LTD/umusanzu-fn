const formatFunds = (funds) => {
    return new Intl.NumberFormat().format(funds);
};

export default formatFunds;
