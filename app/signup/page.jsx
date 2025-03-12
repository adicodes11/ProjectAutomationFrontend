"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SignupPage = () => {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // New state for role selection: "manager" or "member"
  const [role, setRole] = useState("manager");

  // OTP and loading states (same as before)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpValid, setOtpValid] = useState(true);
  const [timer, setTimer] = useState(180);
  const [isLoading, setIsLoading] = useState(false);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // Timer effect for OTP expiration and resend cooldown
  useEffect(() => {
    let countdown;
    if (isOtpSent && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    if (timer === 0) {
      setIsOtpSent(false);
      setOtp(["", "", "", "", "", ""]);
      setSubmitError("OTP expired. Please try again.");
    }
    if (!isOtpSent && !canResendOtp) {
      setCanResendOtp(true);
    }
    return () => clearInterval(countdown);
  }, [isOtpSent, timer]);

  const validateForm = () => {
    let errors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = (errors.password || "") + " Password must include at least one uppercase letter.";
    }
    if (!/(?=.*[0-9])/.test(password)) {
      errors.password = (errors.password || "") + " Password must include at least one number.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (validateForm()) {
      setIsLoading(true);
      try {
        // Include role in the payload
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsOtpSent(true);
          setTimer(180);
          setCanResendOtp(false);
          console.log("Signup initiated:", data.message);
        } else {
          setSubmitError(data.message || "Signup failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during signup:", error);
        setSubmitError("An error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const enteredOtp = otp.join("");
      const response = await fetch("/api/otpVerificationRoute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpValid(true);
        router.push("/login");
      } else {
        setOtpValid(false);
        setSubmitError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setSubmitError("An error occurred during verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    setFormErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus logic
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
      if (!value && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    if (canResendOtp) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/resend-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          setIsOtpSent(true);
          setTimer(180);
          setCanResendOtp(false);
          setSubmitError("");
        } else {
          setSubmitError("Failed to resend OTP. Please try again.");
        }
      } catch (error) {
        console.error("Error resending OTP:", error);
        setSubmitError("An error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Create an Account</h2>

        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {submitError}
          </div>
        )}

        {!isOtpSent ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-lg font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleFieldChange(setEmail, "email")}
                className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-2">{formErrors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-lg font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handleFieldChange(setPassword, "password")}
                className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-2">{formErrors.password}</p>
              )}
            </div>

            {/* Role selection */}
            <div className="mb-4">
              <label htmlFor="role" className="block text-lg font-semibold text-gray-700">
                Select Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
              >
                <option value="manager">Project Manager</option>
                <option value="member">Team Member</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white py-3 rounded-lg transition duration-300 ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
              }`}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-4">
              <label htmlFor="otp" className="block text-lg font-semibold text-gray-700">
                Enter OTP
              </label>
              <div className="flex space-x-2 justify-center mt-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength={1}
                    disabled={isLoading}
                  />
                ))}
              </div>
              {!otpValid && (
                <p className="text-red-500 text-sm mt-2">Invalid OTP. Please try again.</p>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResendOtp}
                className={`text-blue-500 ${
                  !canResendOtp ? "opacity-50 cursor-not-allowed" : "hover:underline"
                }`}
              >
                {canResendOtp ? "Resend OTP" : `Resend in ${formatTime(timer)}`}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white py-3 rounded-lg transition duration-300 ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
              }`}
            >
              {isLoading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
