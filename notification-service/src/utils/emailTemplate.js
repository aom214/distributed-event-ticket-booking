/**
 * Generate a styled HTML email body from booking data.
 * @param {Object} data - Booking data
 * @returns {string} HTML string
 */
const generateEmailHTML = (data) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f8f9fa; }
          .container {
            background: white;
            max-width: 600px;
            margin: 30px auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .heading {
            text-align: center;
            font-size: 22px;
            color: #333;
          }
          table {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
          }
          th, td {
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #ccc;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="heading">Thank you for your booking</div>
          <p>Your tickets have been successfully booked. Here is your summary:</p>
          <table>
            <tr><th>Booking ID</th><td>${data.bookingId}</td></tr>
            <tr><th>Status</th><td style="color:green;"><strong>${data.status}</strong></td></tr>
            <tr><th>Tickets</th><td>${data.tickets}</td></tr>
            <tr><th>Time</th><td>${new Date(data.timestamp).toLocaleString()}</td></tr>
          </table>
          <div class="footer">If you have questions, contact our support team.<br/>Thank you for choosing Event Manager.</div>
        </div>
      </body>
    </html>
  `;
};

module.exports = generateEmailHTML;
