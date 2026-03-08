"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient, createAdminClient } from "@/utils/supabase/server";

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

    // Check setup_complete — metadata first (fast), then DB as fallback
    const metaComplete = user?.user_metadata?.setup_complete;
    if (!metaComplete) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('setup_complete')
            .eq('id', user!.id)
            .single();

        if (!profile?.setup_complete) {
            redirect('/register?step=2');
        }
    }

    revalidatePath("/home", "layout");
    redirect("/home");
}


// signup is now handled client-side in /register — this action is kept for compatibility



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
                categories_accepted: ['Clothes', 'Food', 'Water'],
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

export async function deleteAccount(password: string) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) return { error: "Authentication required" };

        // 1. Verify password
        // Since we now enforce passwords for all users (including OAuth) on Step 1, 
        // we can prioritize password verification.
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: password
        });

        if (signInError) {
            // Fallback for very old social accounts without passwords
            const isOAuth = user.app_metadata.provider !== 'email';
            if (isOAuth && password === 'DELETE') {
                // Allow 'DELETE' as fallback
            } else {
                return { error: "Incorrect password. Please try again." };
            }
        }

        const adminSupabase = createAdminClient();

        // 2. Clean up storage (Avatars and Donations)
        try {
            // Avatars cleanup
            const { data: avatarFiles } = await adminSupabase.storage.from('avatars').list(user.id);
            if (avatarFiles && avatarFiles.length > 0) {
                const paths = avatarFiles.map(f => `${user.id}/${f.name}`);
                await adminSupabase.storage.from('avatars').remove(paths);
            }

            // Donations cleanup: Root user folder
            const { data: donationFiles } = await adminSupabase.storage.from('donations').list(user.id);
            if (donationFiles && donationFiles.length > 0) {
                const paths = donationFiles.map(f => `${user.id}/${f.name}`);
                await adminSupabase.storage.from('donations').remove(paths);
            }

            // Donations cleanup: 'temp' subfolder (common in our app)
            const { data: tempFiles } = await adminSupabase.storage.from('donations').list(`${user.id}/temp`);
            if (tempFiles && tempFiles.length > 0) {
                const paths = tempFiles.map(f => `${user.id}/temp/${f.name}`);
                await adminSupabase.storage.from('donations').remove(paths);
            }
        } catch (e) {
            console.error("Storage cleanup error:", e);
        }

        // 3. Manual cascade to avoid Foreign Key violations
        // Must delete in dependency order: messages → conversations → donations → profiles
        const { data: userConversations } = await adminSupabase
            .from('conversations')
            .select('id')
            .or(`donor_id.eq.${user.id},org_id.eq.${user.id}`);

        const conversationIds = (userConversations || []).map((c: any) => c.id);

        if (conversationIds.length > 0) {
            await adminSupabase.from('messages').delete().in('conversation_id', conversationIds);
        }
        await adminSupabase.from('messages').delete().eq('sender_id', user.id);
        await adminSupabase.from('conversations').delete().or(`donor_id.eq.${user.id},org_id.eq.${user.id}`);
        await adminSupabase.from('donations').delete().or(`donor_id.eq.${user.id},organization_id.eq.${user.id}`);
        await adminSupabase.from('addresses').delete().eq('user_id', user.id);
        await adminSupabase.from('donor_profiles').delete().eq('profile_id', user.id);
        await adminSupabase.from('organization_profiles').delete().eq('profile_id', user.id);

        // Final Profile delete
        const { error: dbDeleteError } = await adminSupabase.from('profiles').delete().eq('id', user.id);
        if (dbDeleteError) {
            console.error("DB Delete Error:", dbDeleteError);
            return { error: `Database error: ${dbDeleteError.message}` };
        }

        // 4. Auth Delete (Uses Service Role Key)
        const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(user.id);
        if (authDeleteError) {
            console.error("Auth Delete Error:", authDeleteError);
            return { error: `Auth service error: ${authDeleteError.message}` };
        }

        // 5. Sign out
        await supabase.auth.signOut();

        return { success: true };
    } catch (err: any) {
        console.error("Serious error during deletion:", err);
        return { error: `Server error: ${err.message || 'Operation failed'}` };
    }
}

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    if (error) {
        redirect(`/error?message=${encodeURIComponent(error.message)}`)
    }
}