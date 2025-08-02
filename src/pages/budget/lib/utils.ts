const getYearsSelectOptions = ({
  min_year,
  max_year,
}: {
  min_year?: number;
  max_year?: number;
}) => {
  if (min_year !== undefined && max_year !== undefined) {
    return Array.from(
      {
        length: max_year - min_year + 1,
      },
      (_, index) => (min_year ?? 0) + index,
    );
  }

  return [];
};

function toCurrency(value: number) {
  return value.toLocaleString("ru-RU", {
    currency: "RUB",
    currencyDisplay: "symbol",
    style: "currency",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export { getYearsSelectOptions, toCurrency };
