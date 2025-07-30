function sendEmail(){
    return 
    `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Assessment Invitation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333333 !important;
      background-color: #f8f9fa !important;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff !important;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
    }
    .header {
      background-color: #003554 !important;
      padding: 40px 30px;
      text-align: center;
      color: #ffffff !important;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .header p {
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      color: #2c3e50 !important;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 24px;
      color: #2c3e50 !important;
    }
    .message {
      font-size: 16px;
      line-height: 1.7;
      margin-bottom: 32px;
      color: #555555 !important;
    }
    .cta-section {
      text-align: center;
      margin: 40px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #00253a !important;
      color: #ffffff !important;
      text-decoration: none !important;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      border: none;
    }
    .note {
      background-color: #fff3cd !important;
      border: 1px solid #ffeeba !important;
      border-radius: 6px;
      padding: 16px;
      margin: 24px 0;
      font-size: 14px;
      color: #856404 !important;
    }
    .footer {
      background-color: #003554 !important;
      color: #ecf0f1 !important;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer .company-name {
      font-weight: 600;
      color: #4A90E2 !important;
    }
    @media (max-width: 600px) {
      .email-container {
        margin: 10px;
        border-radius: 8px;
      }
      .header, .content, .footer {
        padding: 24px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .cta-button {
        padding: 14px 28px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>BIM Maturity Assessment</h1>
      <p>You've been selected to participate</p>
    </div>
    <div class="content">
      <div class="greeting">
        Hello,
      </div>
      <div class="message">
        You have been invited to complete an assessment. This will help us better understand your progress and development needs.
      </div>
      <div class="message">
        Please click the button below to access your assessment. Make sure you have adequate time to complete it in one session.
      </div>

      <div class="note">
        <strong>Note:</strong> This invitation is personalized for you. If you have any questions, please contact your administrator.
      </div>
      <div class="message">
        Thank you for your participation. We appreciate your time and effort in completing this assessment.
        <br><br>
        Best regards,<br>
        <strong>5D VDC Services LLP</strong>
      </div>
    </div>
    <div class="footer">
      <p>This email was sent by 5D VDC Services</p>
      <p>If you believe you received this email in error, please contact your administrator.</p>
    </div>
  </div>
</body>
  `
}

module.exports = { sendEmail };