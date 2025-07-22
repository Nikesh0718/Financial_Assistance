
  // Stock chart data
  const stockData = [
    {
      id: 'stock-chart-1',
      label: 'Reliance',
      color: '#3366cc',
      data: [2750, 2800, 2850, 2900, 2950, 2915]
    },
    {
      id: 'stock-chart-2',
      label: 'TCS',
      color: '#ff9933',
      data: [3650, 3700, 3750, 3800, 3900, 3842]
    },
    {
      id: 'stock-chart-3',
      label: 'Infosys',
      color: '#28a745',
      data: [1400, 1430, 1450, 1470, 1500, 1498]
    },
    {
      id: 'stock-chart-4',
      label: 'HDFC Bank',
      color: '#6f42c1',
      data: [1600, 1620, 1635, 1640, 1650, 1655]
    }
  ];

  stockData.forEach(stock => {
    const ctx = document.getElementById(stock.id).getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
        datasets: [{
          label: stock.label,
          data: stock.data,
          borderColor: stock.color,
          fill: false,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `₹${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return `₹${value}`;
              }
            }
          }
        }
      }
    });
  });


