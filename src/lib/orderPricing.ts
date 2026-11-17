export const SALES_TAX_BASIS_POINTS = 825;
export const SALES_TAX_RATE = '8.25%';

export function toCents(amount: number) {
    return Math.round(amount * 100);
}

export function orderTotals(subtotalCents: number, taxBasisPoints: number) {
    const taxCents = Math.round((subtotalCents * taxBasisPoints) / 10_000);

    return {
        subtotal: subtotalCents / 100,
        salesTax: taxCents / 100,
        total: (subtotalCents + taxCents) / 100
    };
}