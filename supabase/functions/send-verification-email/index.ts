import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerificationEmailRequest {
  email: string;
  type: "signup" | "recovery";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, type }: VerificationEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    // Use magiclink type for signup verification (doesn't require password)
    // Use recovery type for password reset
    const result = await supabase.auth.admin.generateLink({
      type: type === "recovery" ? "recovery" : "magiclink",
      email: email,
      options: {
        redirectTo: `https://id-preview--ae431fff-813f-4174-869c-561f02529e69.lovable.app/login`,
      }
    });

    if (result.error) {
      console.error("Error generating link:", result.error);
      throw new Error(`Failed to generate verification link: ${result.error.message}`);
    }

    const verificationLink = result.data?.properties?.action_link;
    
    if (!verificationLink) {
      throw new Error("Failed to generate verification link");
    }

    // Send email via Resend using fetch
    const subject = type === "signup" 
      ? "Verify your ScamGuard NG account"
      : "Reset your ScamGuard NG password";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ ScamGuard NG</h1>
              <p style="color: #bbf7d0; margin: 8px 0 0;">Protecting Nigerian Job Seekers</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px;">
                ${type === "signup" ? "Welcome! Verify Your Email" : "Reset Your Password"}
              </h2>
              <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px;">
                ${type === "signup" 
                  ? "Thank you for joining ScamGuard NG. Click the button below to verify your email address and start protecting yourself from job scams."
                  : "You requested to reset your password. Click the button below to set a new password."}
              </p>
              <a href="${verificationLink}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                ${type === "signup" ? "Verify Email Address" : "Reset Password"}
              </a>
              <p style="color: #a1a1aa; font-size: 14px; margin: 24px 0 0; line-height: 1.6;">
                If you didn't ${type === "signup" ? "create an account" : "request a password reset"}, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                This link expires in 24 hours. If the button doesn't work, copy and paste this URL into your browser:
              </p>
              <p style="color: #71717a; font-size: 12px; word-break: break-all; margin: 8px 0 0;">
                ${verificationLink}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ScamGuard NG <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);
      throw new Error(`Failed to send email: ${resendData.message || "Unknown error"}`);
    }

    console.log("Verification email sent successfully:", resendData);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-verification-email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
