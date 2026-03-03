"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { data: { user }, error } = await supabase.auth.signInWithPassword(data);
    if (error) {
        redirect(`/error?message=${encodeURIComponent(error.message)}`);
    }

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

        if (!profile) {
            revalidatePath("/setup", "layout");
            redirect("/setup");
        }
    }

    revalidatePath("/home", "layout");
    redirect("/home");
}


export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full-name") as string;
    const userType = formData.get("user-type") as string;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: userType,
                email: email,
            },
        },
    });

    if (error) {
        console.error("Signup error:", error.message);
        redirect(`/error?message=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/setup", "layout");
    redirect("/setup");
}



export async function signout() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.log(error);
        redirect("/error");
    }

    redirect("/");
}



export async function signInWithGoogle() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
            queryParams: {
                access_type: "offline",
                prompt: "consent",
            },
        },
    });

    if (error) {
        console.log(error);
        redirect("/error");
    }

    redirect(data.url);
}

export async function setupProfile(payload: {
    name: string;
    phone: string;
    role: "donor" | "organization";
    bio: string;
    description: string;
    donationMethod: "pickup" | "delivery" | "both";
    profilePicUrl: string | null;
}) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: "No authenticated user found." };
    }

    // 1. Upsert the common profiles row
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: payload.name,
            role: payload.role,
            phone: payload.phone,
            profile_pic: payload.profilePicUrl,
            setup_complete: true,
        });

    if (profileError) return { error: profileError.message };

    // 2. Upsert role-specific table
    if (payload.role === 'donor') {
        const { error: donorError } = await supabase
            .from('donor_profiles')
            .upsert({ profile_id: user.id, bio: payload.bio });
        if (donorError) return { error: donorError.message };
    } else {
        const { error: orgError } = await supabase
            .from('organization_profiles')
            .upsert({
                profile_id: user.id,
                description: payload.description,
                donation_method: payload.donationMethod,
                is_verified: false,
            });
        if (orgError) return { error: orgError.message };
    }

    // 3. Update user metadata
    const { error: metaError } = await supabase.auth.updateUser({
        data: { role: payload.role, full_name: payload.name, setup_complete: true },
    });
    if (metaError) return { error: metaError.message };

    revalidatePath("/home", "layout");
    return { success: true };
}

export async function signInWithFacebook() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
        },
    });

    if (error) {
        console.log(error);
        redirect("/error");
    }

    redirect(data.url);
}
