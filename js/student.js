
import { supabase } from "./supabaseClient.js";

export async function submitApplication(application) {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("Please sign in before submitting an application.");
  }

  const user = userData.user;

  const { data, error } = await supabase
    .from("members")
    .insert({
      user_id: user.id,
      name: application.name,
      gender: application.gender,
      phone: application.phone,
      email: user.email,
      student_id: application.studentId,
      programme: application.programme,
      level: application.level,
      region: application.region,
      constituency: application.constituency,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMyApplication() {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("Please sign in to view your application.");
  }

  const { data, error } = await supabase
    .from("members")
    .select("name, student_id, programme, level, status, created_at")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
