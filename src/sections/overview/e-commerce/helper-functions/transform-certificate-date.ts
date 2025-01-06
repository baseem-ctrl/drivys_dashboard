export const transformData = (monthlyData = [], yearlyData = [], weeklyData = [], seriesType) => {
  let categories = [];

  if (seriesType === 'Monthly') {
    categories = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
  } else if (seriesType === 'Yearly' || !seriesType) {
    categories = [...new Set(yearlyData.map((item) => item.year))];
    const years = categories.map(Number);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    categories = [
      ...Array.from({ length: 2 }, (_, i) => minYear - 2 + i),
      ...categories,
      ...Array.from({ length: 2 }, (_, i) => maxYear + 1 + i),
    ];
  } else if (seriesType === 'Weekly') {
    categories = [...new Set(weeklyData.map((item) => `Week ${item.week}`))];
    const weeks = categories.map((week) => parseInt(week.split(' ')[1], 10));
    const minWeek = Math.min(...weeks);
    const maxWeek = Math.max(...weeks);
    categories = [
      // `Week ${minWeek - 2}`,
      `Week ${minWeek - 1}`,
      ...categories,
      `Week ${maxWeek + 1}`,
      // `Week ${maxWeek + 2}`,
    ];
  }

  const monthlySeries = {
    name: 'Monthly Issued Certificates',
    data: categories.map((month, index) => {
      const monthData = monthlyData.find((item) => item.month === index + 1);
      const total = monthData ? monthData.total : 0;
      return total;
    }),
  };

  const yearlySeries = {
    name: 'Yearly Issued Certificates',
    data: categories.map((year) => {
      const yearData = yearlyData.filter((item) => item.year === year);
      const totalForYear = yearData.reduce((acc, curr) => acc + curr.total, 0);
      return totalForYear || 0;
    }),
  };

  const weeklySeries = {
    name: 'Weekly Issued Certificates',
    data: categories.map((week) => {
      let weekNumber;
      if (typeof week === 'string') {
        weekNumber = parseInt(week.split(' ')[1], 10);
      } else {
        weekNumber = week;
      }

      const weekData = weeklyData.filter((item) => item.week === weekNumber);
      const totalForWeek = weekData.reduce((acc, curr) => acc + curr.total, 0);
      return totalForWeek || 0;
    }),
  };

  return {
    categories,
    series: [
      { type: 'Yearly', data: yearlySeries.data },
      { type: 'Monthly', data: monthlySeries.data },
      { type: 'Weekly', data: weeklySeries.data },
    ],
  };
};
