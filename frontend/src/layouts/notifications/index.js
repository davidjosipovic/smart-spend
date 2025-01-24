import { useState } from "react";
import axios from "axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

function BudgetNotification() {
  const [budget, setBudget] = useState("");
  const [actualSpent, setActualSpent] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success message

    // Ensure both fields have valid values
    const parsedBudget = parseFloat(budget);
    const parsedSpent = parseFloat(actualSpent);

    if (isNaN(parsedBudget) || isNaN(parsedSpent)) {
      setError("Please enter valid numbers for budget and actual spent.");
      return;
    }

    // Create the query parameters
    const params = new URLSearchParams({
      budget: parsedBudget.toString(),
      actual_spent: parsedSpent.toString(),
    });

    // Send the request with query parameters
    axios
      .post(
        `http://localhost:8000/api/notify-budget-exceeded?${params.toString()}`,
        {},
        {
          headers: {
            "Content-Type": "application/json", // Ensure correct headers
          },
        }
      )
      .then((response) => {
        setSuccessMessage(response.data.message);
      })
      .catch((error) => {
        if (error.response) {
          setError(error.response.data.message || "Something went wrong.");
        } else {
          setError("Failed to send request. Please try again later.");
        }
      });
  };

  return (
    <MDBox mx={2} my={4} display="flex" flexDirection="column" alignItems="center">
      <MDTypography variant="h4" fontWeight="medium" color="info" mb={2}>
        Budget Notification
      </MDTypography>

      {error && (
        <MDBox mb={2} width="100%">
          <MDAlert color="error" dismissible>
            <MDTypography variant="body2" color="white">
              {error}
            </MDTypography>
          </MDAlert>
        </MDBox>
      )}

      {successMessage && (
        <MDBox
          mb={2}
          sx={{
            px: { xs: 2, sm: 3, md: 5 }, // Responsive padding based on screen size
            width: "100%",
          }}
        >
          <MDAlert color="success" dismissible>
            <MDTypography
              variant="body2"
              sx={{
                mx: { xs: 2, sm: 3, md: 40 }, // Responsive padding based on screen size
                width: "100%",
              }}
              color="white"
            >
              {successMessage}
            </MDTypography>
          </MDAlert>
        </MDBox>
      )}

      <MDBox component="form" onSubmit={handleSubmit} width="100%" maxWidth="400px">
        <MDBox mb={2}>
          <MDInput
            type="number"
            label="Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            fullWidth
            required
          />
        </MDBox>

        <MDBox mb={2}>
          <MDInput
            type="number"
            label="Actual Spent"
            value={actualSpent}
            onChange={(e) => setActualSpent(e.target.value)}
            fullWidth
            required
          />
        </MDBox>

        <MDBox mt={4}>
          <MDButton variant="gradient" color="info" fullWidth type="submit">
            Notify
          </MDButton>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

export default BudgetNotification;
