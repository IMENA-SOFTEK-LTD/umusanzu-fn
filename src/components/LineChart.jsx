import { Line } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js/auto'
function LineChart({ data }) {
  const options = {
    scales: {
      x: {
        ticks: {
          font: {
            size: 14,
            weight: 'semi-bold'
          },
          color: 'black',
        },
      },
      y: {
        ticks: {
          font: {
            size: 14,
            weight: 'semi-bold'
          },
          color: 'black',
        },
      },
    },
  };
  return <Line data={data} options={options} />
}

export default LineChart
