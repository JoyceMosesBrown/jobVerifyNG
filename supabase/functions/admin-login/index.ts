import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { adminCode } = await req.json();
    
    // Verify admin code
    if (adminCode !== "1234") {
      return new Response(
        JSON.stringify({ error: "Invalid admin code" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if admin user exists, if not create one
    const adminEmail = "admin@jobverify.ng";
    const adminPassword = "admin_secure_password_1234";

    // Try to get the admin user first
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let adminUser = existingUsers?.users?.find(u => u.email === adminEmail);

    if (!adminUser) {
      // Create admin user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: "Admin" },
      });

      if (createError) {
        console.error("Error creating admin user:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create admin user" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      adminUser = newUser.user;
    }

    // Always ensure admin role exists and is set to admin
    if (adminUser) {
      // First check if role exists
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("user_id", adminUser.id)
        .single();

      if (existingRole) {
        // Update existing role to admin
        await supabaseAdmin
          .from("user_roles")
          .update({ role: "admin" })
          .eq("user_id", adminUser.id);
      } else {
        // Insert new admin role
        await supabaseAdmin.from("user_roles").insert({
          user_id: adminUser.id,
          role: "admin",
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        email: adminEmail,
        password: adminPassword,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Admin login error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});