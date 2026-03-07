"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function updateDonationStatus(donationId: string, status: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('donations')
        .update({ status })
        .eq('id', donationId);

    if (error) {
        console.error('Error updating donation status:', error);
        return { error: error.message };
    }

    revalidatePath('/home/manage');
    return { success: true };
}

export async function acceptDonation(donationId: string) {
    return updateDonationStatus(donationId, 'accepted');
}

export async function rejectDonation(donationId: string) {
    return updateDonationStatus(donationId, 'rejected');
}
