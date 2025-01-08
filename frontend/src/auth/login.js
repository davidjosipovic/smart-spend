import React, { useState } from "react";

const LoginForm = () => {
  const [emailAddressOrUsername, setEmailAddressOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Handle input changes
  const handleEmailOrUsernameChange = (e) => {
    setEmailAddressOrUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      emailAddressOrUsername,
      password,
      rememberMe,
    };

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful", data);
      } else {
        console.error("Login failed", data);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="emailOrUsername">Email or Username</label>
          <input
            type="text"
            id="emailOrUsername"
            value={emailAddressOrUsername}
            onChange={handleEmailOrUsernameChange}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
            />
            Remember Me
          </label>
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
