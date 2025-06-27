export const saleItemShortageStatusDetails = [
  {
    statusResult: 'with_stock_by_date',
    iconName: 'svguse:/icons.svg#bag-cross',
    message: 'Не будет хватать с учетом наличия на складе на сегодня',
    color: 'grey',
  },
  {
    statusResult: 'with_prognosis_value_with_ready_and_expected_to_assembly',
    iconName: 'svguse:/icons.svg#cart-cross',
    iconName2: 'svguse:/icons.svg#server-path',
    color: 'grey',
    message:
      'Не будет хватать с учетом наличия, поступлений, доступных к комплектации и с учетом комплектации из ожидаемых поступлений и за вычетом ожидаемых списаний для заказов всех типов',
  },

  {
    statusResult: 'with_prognosis_value_with_ready_to_assembly',
    iconName: 'svguse:/icons.svg#bag-cross',
    iconName2: 'svguse:/icons.svg#server-path',
    color: 'grey',
    message:
      'Не будет хватать с учетом наличия, поступлений, доступных к комплектации и за вычетом ожидаемых списаний для заказов всех типов',
  },

  {
    statusResult: 'with_prognosis_value',
    iconName: 'svguse:/icons.svg#cart-cross',
    color: 'grey',
    message:
      'Не будет хватать с учетом наличия, поступлений и за вычетом ожидаемых списаний для заказов',
  },
]
