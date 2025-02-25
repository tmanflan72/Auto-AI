const stripe = require('stripe')('51QwDaQQxl3K7QRvUMAbbAEs9kwT3GSI9QByes7iAXXGDDFOo6dkBlcRSJv1ifNzy4lOH5ZLG1g8xiIsg1wJV7CtL00WCs07Dgb');

const paymentPlan = {
  id: 'monthly-subscription',
  amount: 1999,
  currency: 'usd',
  interval: 'month',
  product: 'YOUR_STRIPE_PRODUCT_ID',
};

const createPaymentPlan = async () => {
  const paymentPlan = await stripe.products.create({
    name: 'Monthly Subscription',
    type: 'service',
  });

  const price = await stripe.prices.create({
    unit_amount: 1999,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product: paymentPlan.id,
  });

  return paymentPlan;
};
