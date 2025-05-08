import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send(`
    <div style="text-align: center; padding: 50px; font-family: sans-serif;">
      <h2>Stripe Donation Server is running successfully!</h2>
      <img src="/node.svg" alt="serve" width="100" style="margin-top: 20px;" />
    </div>
  `);
});


app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: req.body.currency || 'usd',
                    product_data: {
                        name: 'Donation',
                    },
                    unit_amount: req.body.amount || 5000,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error('Error creating Stripe session', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Peace for all  ${PORT}`));
