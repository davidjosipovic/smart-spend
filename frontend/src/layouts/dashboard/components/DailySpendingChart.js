import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DailySpendingChart({ accountId }) {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  axios.defaults.baseURL = "http://localhost:8000";

  useEffect(() => {
    axios
      .get(`/api/accounts/${accountId}/analytics`)
      .then((response) => {
        console.log("API Response:", response.data);

        // Safely access debits and credits arrays
        const debitsData = response.data.result?.debits || [];
        const creditsData = response.data.result?.credits || [];

        // Sort the data by day
        const sortedDebits = debitsData.sort((a, b) => new Date(a.day) - new Date(b.day));
        const sortedCredits = creditsData.sort((a, b) => new Date(a.day) - new Date(b.day));

        // Extract labels (days), spends (total_spent) and incomes (total_income)
        const labels = sortedDebits.map((item) => item.day);
        const spends = sortedDebits.map((item) => item.total_spent);
        const incomes = sortedCredits.map((item) => item.total_income);

        // Update chart data with the fetched and sorted data
        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Spending by Day",
              data: spends,
              backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color for spending
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
            {
              label: "Income by Day",
              data: incomes,
              backgroundColor: "rgba(153, 102, 255, 0.6)", // Bar color for income
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) => {
        console.error("Error fetching analytics data:", error);
      });
  }, [accountId]);

  return (
    <MDBox mb={3}>
      <h4>Daily Spending and Income</h4>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Spending and Income per Day",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
            legend: {
              position: "top",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Date",
              },
            },
            y: {
              title: {
                display: true,
                text: "Amount",
              },
              beginAtZero: true,
            },
          },
        }}
      />
    </MDBox>
  );
}

DailySpendingChart.propTypes = {
  accountId: PropTypes.string.isRequired,
};

export default DailySpendingChart;
