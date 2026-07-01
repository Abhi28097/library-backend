const INR_PER_GBP = 123.3;

export function convertInrToGbp(amount) {
  return Number(amount || 0) / INR_PER_GBP;
}

export function formatGbp(amount) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertInrToGbp(amount));
}

export { INR_PER_GBP };
