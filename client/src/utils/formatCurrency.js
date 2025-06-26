
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
  }).format(amount);
};

export default formatCurrency;
