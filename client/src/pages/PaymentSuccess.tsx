import React from "react";

export default function PaymentSuccess() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Payment Successful!</h1>
      <p>Your crypto payment was received and your purchase is complete.</p>
      <p>Check your email for your license key and download instructions.</p>
      <a href="/" style={{ color: "#0070f3", textDecoration: "underline" }}>Return to Home</a>
    </div>
  );
}
