import { createClient } from '@/utils/supabase/client';

export const acceptDonation = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('donations')
        .update({ status: 'accepted' })
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
};

export const rejectDonation = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('donations')
        .update({ status: 'declined' })
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
};

export const updateDonationStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('donations')
        .update({ status })
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
};
