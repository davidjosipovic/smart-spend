import { useState, useEffect } from "react";
import axios from "axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

function BudgetCRUD() {
  const [budgetId, setBudgetId] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [accountDotId, setAccountDotId] = useState(null);

  const jwt = localStorage.getItem("jwt");

  // Fetch account ID
  const fetchAccountId = async (user_id) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/accounts/user/${user_id}`);
      setAccountId(response.data.account_id);
    } catch (error) {
      setError("Failed to fetch account ID.");
    }
  };

  // Fetch accountDotId
  const fetchAccountDotId = async (user_id) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/accounts/user/dot/${user_id}`);
      setAccountDotId(response.data.account_id);
    } catch (error) {
      setError("Failed to fetch account Dot ID.");
    }
  };

  // Generate current and validUntil dates
  const generateCurrentDate = () => {
    const date = new Date();
    const offset = -date.getTimezoneOffset();
    const hoursOffset = Math.floor(offset / 60);
    const minutesOffset = offset % 60;
    const formattedOffset = `${hoursOffset >= 0 ? "+" : "-"}${String(
      Math.abs(hoursOffset)
    ).padStart(2, "0")}${String(Math.abs(minutesOffset)).padStart(2, "0")}`;
    return date.toISOString().slice(0, 19).replace("T", " ") + formattedOffset;
  };

  const generateValidUntilDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    const offset = -date.getTimezoneOffset();
    const hoursOffset = Math.floor(offset / 60);
    const minutesOffset = offset % 60;
    const formattedOffset = `${hoursOffset >= 0 ? "+" : "-"}${String(
      Math.abs(hoursOffset)
    ).padStart(2, "0")}${String(Math.abs(minutesOffset)).padStart(2, "0")}`;
    return date.toISOString().slice(0, 19).replace("T", " ") + formattedOffset;
  };

  useEffect(() => {
    setValidFrom(generateCurrentDate());
    setValidUntil(generateValidUntilDate());

    if (jwt) {
      const base64Url = jwt.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedData = JSON.parse(atob(base64));
      fetchAccountId(decodedData.id);
      fetchAccountDotId(decodedData.id);
    }
  }, [jwt]);

  useEffect(() => {
    if (accountDotId) fetchBudgets(accountDotId);
  }, [accountDotId]);

  const fetchBudgets = async (accountDotId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/budgets/accounts/${accountDotId}`
      );
      setBudgets(response.data.result || []);
    } catch (error) {
      setError("Failed to fetch budgets.");
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (budgetId) {
      // Update existing budget
      handleUpdateBudget();
    } else {
      // Create new budget
      handleCreateBudget(event);
    }
  };

  const handleCreateBudget = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!accountId) {
      setError("Account ID is not set.");
      return;
    }

    const budgetData = {
      account_id: accountId,
      valid_from: validFrom,
      valid_until: validUntil,
      spending_limit: parseFloat(spendingLimit),
      name: name || `Budget ${Date.now()}`,
    };

    try {
      await axios.post("http://localhost:8000/api/budgets/", budgetData);
      setSuccessMessage("Budget created successfully!");
      fetchBudgets(accountDotId);
    } catch (error) {
      setError("Failed to create budget.");
    }
  };

  const handleUpdateBudget = async () => {
    if (!budgetId) return;

    const updatedData = {
      id: budgetId,
      account_id: accountDotId,
      valid_from: validFrom,
      valid_until: validUntil,
      spending_limit: parseFloat(spendingLimit),
      active: true,
      name: name,
    };

    try {
      await axios.put("http://localhost:8000/api/budgets/", updatedData);
      setSuccessMessage("Budget updated successfully!");
      fetchBudgets(accountDotId);
    } catch (error) {
      setError("Failed to update budget.");
    }
    setBudgetId("");
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      await axios.delete(`http://localhost:8000/api/budgets/${budgetId}`);
      setSuccessMessage("Budget deleted successfully!");
      fetchBudgets(accountDotId);
    } catch (error) {
      setError("Failed to delete budget.");
    }
  };

  return (
    <MDBox mx={2} my={4} display="flex" flexDirection="column" alignItems="center">
      <MDTypography variant="h4" fontWeight="medium" color="info" mb={2}>
        Budget CRUD Operations
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
        <MDBox mb={2}>
          <MDAlert color="success" dismissible>
            <MDTypography variant="body2" color="white">
              {successMessage}
            </MDTypography>
          </MDAlert>
        </MDBox>
      )}

      {/* Budget Form */}
      <MDBox component="form" onSubmit={handleFormSubmit} width="100%" maxWidth="400px">
        <MDBox mb={2}>
          <MDInput
            label="Budget Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            label="Valid From (Automatically Set)"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            fullWidth
            disabled
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            label="Valid Until (Automatically Set)"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            fullWidth
            disabled
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="number"
            label="Spending Limit"
            value={spendingLimit}
            onChange={(e) => setSpendingLimit(e.target.value)}
            fullWidth
            required
          />
        </MDBox>

        <MDBox mt={2}>
          <MDButton type="submit" variant="gradient" color="info" fullWidth>
            {budgetId ? "Update Budget" : "Create Budget"}
          </MDButton>
        </MDBox>
      </MDBox>

      {/* Display existing budgets */}
      <MDBox mt={4} px={100} width="100%">
        <MDTypography variant="h5" fontWeight="medium" color="info">
          Existing Budgets
        </MDTypography>
        <MDBox mt={2}>
          {budgets.length === 0 ? (
            <MDTypography>No budgets found.</MDTypography>
          ) : (
            <ul>
              {budgets.map((budget) => (
                <li key={budget.id}>
                  <MDTypography>
                    {budget.name} - ${budget.spending_limit}
                  </MDTypography>
                  <MDButton
                    onClick={() => handleDeleteBudget(budget.id)}
                    variant="outlined"
                    color="error"
                  >
                    Delete
                  </MDButton>
                  <MDButton
                    onClick={() => {
                      setBudgetId(budget.id);
                      setName(budget.name);
                      setSpendingLimit(budget.spending_limit);
                      setValidFrom(budget.valid_from);
                      setValidUntil(budget.valid_until);
                    }}
                    variant="outlined"
                    color="warning"
                  >
                    Edit
                  </MDButton>
                </li>
              ))}
            </ul>
          )}
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

export default BudgetCRUD;
