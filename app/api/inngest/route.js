import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';

// Import all functions
import { processOrder } from '@/inngest/functions/processOrder';
import { sendOrderConfirmation } from '@/inngest/functions/sendOrderConfirmation';

// Create an API that serves Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processOrder,
    sendOrderConfirmation,
  ],
});