// src/services/PaymentService.ts
import Stripe from 'stripe';
import { LicenseGenerator } from './LicenseGenerator';
import { OwnerVerification } from './OwnerVerification';

const OWNER_CODE = '19FLANARY72';
const MONTHLY_PRICE = 19.99;
const YEARLY_PRICE = 225.00;

export class PaymentService {
    private stripe: Stripe;
    private licenseGenerator: LicenseGenerator;
    private isOwner: boolean = false;

    constructor(ownerCode?: string) {
        this.stripe = new Stripe(process.env.51QwDaQQxl3K7QRvUMAbbAEs9kwT3GSI9QByes7iAXXGDDFOo6dkBlcRSJv1ifNzy4lOH5ZLG1g8xiIsg1wJV7CtL00WCs07Dgb, {
            apiVersion: '2023-10-16'
        });
        this.licenseGenerator = new LicenseGenerator();
        if (ownerCode) {
            this.isOwner = OwnerVerification.verifyOwnerCode(ownerCode);
        }
    }

    async createSubscription(userId: string, type: 'monthly' | 'yearly', paymentMethodId: string): Promise<{
        subscriptionId: string;
        licenseKey: string;
    }> {
        const priceId = type === 'monthly' ? process.env.MONTHLY_PRICE_ID : process.env.YEARLY_PRICE_ID;
        
        try {
            // Create or get customer
            const customer = await this.stripe.customers.create({
                email: userId,
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });

            // Create subscription ($19.99/month)
            const subscription = await this.stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: priceId }],
                expand: ['latest_invoice.payment_intent']
            });

            // Generate license key
            const licenseKey = this.licenseGenerator.generate(customer.id, subscription.id);

            // Store license in database
            await this.storeLicense(licenseKey, customer.id, subscription.id);

            return {
                subscriptionId: subscription.id,
                licenseKey
            };
        } catch (error) {
            throw new Error(`Subscription failed: ${error.message}`);
        }
    }

    async reSubscribe(subscriptionId: string): Promise<void> {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: false
            });
        } catch (error) {
            throw new Error(`Re-subscription failed: ${error.message}`);
        }
    }

    async subscribeYearly(email: string, paymentMethodId: string): Promise<{
        subscriptionId: string;
        licenseKey: string;
    }> {
        try {
            // Create or get customer
            const customer = await this.stripe.customers.create({
                email,
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });

            // Create subscription ($220/year)
            const subscription = await this.stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: process.env.YEARLY_PRICE_ID }],
                expand: ['latest_invoice.payment_intent']
            });

            // Generate license key
            const licenseKey = this.licenseGenerator.generate(customer.id, subscription.id);

            // Store license in database
            await this.storeLicense(licenseKey, customer.id, subscription.id);

            return {
                subscriptionId: subscription.id,
                licenseKey
            };
        } catch (error) {
            throw new Error(`Subscription failed: ${error.message}`);
        }
    }

    async generateTesterCode(): Promise<string | null> {
        if (!this.isOwner) {
            throw new Error('Unauthorized: Owner access required');
        }
        return `TEST-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    async verifyOwnerCode(code: string): Promise<boolean> {
        try {
            return OwnerVerification.verifyOwnerCode(code);
        } catch (error) {
            console.error(error);
        }
        return false;
    }

    private async storeLicense(licenseKey: string, userId: string, subscriptionId: string): Promise<void> {
        // Store license in database
    }

    private generateLicenseKey(subscriptionId: string): string {
        return `LIC-${Date.now()}-${subscriptionId.substring(0, 8)}`;
    }
}
