// Order confirmation email template - placeholder
export function OrderConfirmationEmail({ orderId }: { orderId: string }) {
  return (
    <div>
      <h1>Thank you for your purchase!</h1>
      <p>Order ID: {orderId}</p>
      <p>Your download links have been sent to your email by Lemon Squeezy.</p>
    </div>
  );
}
