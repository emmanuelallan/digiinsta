interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail(data: EmailData): Promise<void> {
  // In a real app, you would integrate with an email service like Resend, SendGrid, etc.
  // For now, we'll just simulate sending an email
  
  console.log("Sending email:", {
    to: data.to,
    subject: data.subject,
    html: data.html.substring(0, 100) + "..."
  })
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // In a real implementation, you would call your email service here
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'noreply@yourdomain.com',
  //   to: data.to,
  //   subject: data.subject,
  //   html: data.html,
  // })
}
