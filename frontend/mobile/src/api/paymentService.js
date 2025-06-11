export const createPaymentOrder = async (bookingId, amount, currency) => {
  try {
    const response = await fetch(
      'https://urbanbookk-1.onrender.com/api/payment/create-order/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          amount,
          currency,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment order');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to initiate payment');
  }
};

export const verifyPayment = async (orderId, paymentId, signature) => {
  try {
    const response = await fetch(
      'https://urbanbookk-1.onrender.com/api/payment/verify-payment/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: paymentId,
          signature,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to verify payment');
  }
};

// New function to handle the entire payment flow
export const processPayment = async (booking, userData) => {
  try {
    // Step 1: Create the payment order
    const orderData = await createPaymentOrder(booking.id, 500, 'INR');
    console.log('Payment order created:', orderData);

    // Step 2: Prepare Razorpay options
    const razorpayOptions = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Urban Book',
      description: 'Payment for class booking',
      order_id: orderData.order_id,
      prefill: {
        email: userData.identity_value,
        name: userData.name || 'Student',
      },
      theme: { color: '#9333EA' },
    };

    // Step 3: Generate the HTML for Razorpay WebView
    const generateRazorpayHTML = () => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Razorpay Payment</title>
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #111827; }
            #payment-button { background-color: #9333EA; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; cursor: pointer; }
          </style>
        </head>
        <body>
          <button id="payment-button">Pay ₹${parseFloat(razorpayOptions.amount) / 100}</button>

          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <script>
            const options = ${JSON.stringify(razorpayOptions)};
            
            const paymentButton = document.getElementById('payment-button');
            paymentButton.addEventListener('click', function() {
              const rzp = new Razorpay(options);
              
              rzp.on('payment.success', function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'payment_success',
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                }));
              });
              
              rzp.on('payment.error', function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'payment_error',
                  error: response.error
                }));
              });
              
              rzp.open();
            });
            
            setTimeout(() => {
              paymentButton.click();
            }, 1000);
          </script>
        </body>
        </html>
      `;
    };

    return {
      html: generateRazorpayHTML(),
      razorpayOptions,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to initiate payment');
  }
};

// Function to handle the WebView response and verify payment
export const handlePaymentResponse = async (eventData, fetchBookedClassesCallback, userId) => {
  try {
    const data = JSON.parse(eventData);
    if (data.type === 'payment_success') {
      await verifyPayment(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature
      );
      await fetchBookedClassesCallback(userId);
      return { success: true, message: 'Payment completed successfully!' };
    } else if (data.type === 'payment_error') {
      return { success: false, message: data.error.description || 'Payment was unsuccessful' };
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to process payment response');
  }
};