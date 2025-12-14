import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

const planDurations: Record<string, number> = {
  weekly: 7,
  monthly: 30,
};

async function verifySignature(message: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return expectedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_type } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan_type) {
      throw new Error('Missing required payment details');
    }

    // Verify signature
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const isValid = await verifySignature(message, razorpay_signature, RAZORPAY_KEY_SECRET ?? '');

    if (!isValid) {
      console.error('Signature verification failed');
      throw new Error('Invalid payment signature');
    }

    console.log('Payment signature verified for order:', razorpay_order_id);

    // Calculate plan expiry
    const daysToAdd = planDurations[plan_type] || 7;
    const planExpiry = new Date();
    planExpiry.setDate(planExpiry.getDate() + daysToAdd);

    // Update payment record
    const { error: paymentUpdateError } = await supabaseClient
      .from('payments')
      .update({
        payment_id: razorpay_payment_id,
        payment_status: 'completed',
      })
      .eq('payment_id', razorpay_order_id)
      .eq('user_id', user.id);

    if (paymentUpdateError) {
      console.error('Payment update failed:', paymentUpdateError);
    }

    // Use service role client to update profile
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update user profile with new plan
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        plan_type,
        plan_expiry: planExpiry.toISOString(),
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Profile update failed:', profileError);
      throw new Error('Failed to update user plan');
    }

    console.log('User plan updated:', user.id, 'to', plan_type, 'expires:', planExpiry.toISOString());

    return new Response(
      JSON.stringify({ success: true, plan_type, plan_expiry: planExpiry.toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
