const stripe = require('stripe')(process.env.SK_TEST);

exports.createPaymentIntent = async (req, res) => {
  const { amount, customer_name, email } = await req.body;
  
  try {
    let customer;

    customer = await stripe.customers.search({
      query: `name:\'${customer_name}\' AND email:\'${email}\'`,
    });

    if (customer.data.length == 0) {
      customer = await stripe.customers.create({
        name: customer_name,
        email: email
      });
    } else{
      customer = customer.data[0];
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "AUD",
      automatic_payment_methods: { enabled: true },
      customer: customer.id,
      confirm: false
    });
    
    res.status(200).json(paymentIntent.client_secret);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}