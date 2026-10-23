import { supabase } from "./supabaseClient.js";
export async function verifyAdmin(){
 const {data:userData,error:userError}=await supabase.auth.getUser();
 if(userError||!userData.user){window.location.href="login.html";return false;}
 const {data:profile,error}=await supabase.from("profiles").select("role").eq("id",userData.user.id).maybeSingle();
 if(error||profile?.role!=="admin"){window.location.href="dashboard.html";return false;}return true;
}
export async function getApplications(){if(!(await verifyAdmin()))throw new Error("Administrator access required.");const {data,error}=await supabase.from("members").select("*").order("created_at",{ascending:false});if(error)throw error;return data;}
export async function updateApplicationStatus(memberId,status){
 if(!["approved","rejected"].includes(status))throw new Error("Invalid application status.");
 if(!(await verifyAdmin()))throw new Error("Administrator access required.");
 const {data,error}=await supabase.from("members").update({status}).eq("id",memberId).select().single();if(error)throw error;return data;
}
export async function exportApplicationsToCSV(){
 if(!(await verifyAdmin()))throw new Error("Administrator access required.");
 const {data,error}=await supabase.from("members").select("name,gender,phone,email,student_id,programme,level,region,constituency,status,created_at").order("created_at",{ascending:false});
 if(error)throw error;
 const columns=["name","gender","phone","email","student_id","programme","level","region","constituency","status","created_at"];
 const escapeCSV=value=>{let s=String(value??"");if(/^[\\s]*[=+\\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
 const csv=[columns.join(","),...data.map(row=>columns.map(col=>escapeCSV(row[col])).join(","))].join("\\r\\n");
 const blob=new Blob(["\\uFEFF",csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);
 const link=document.createElement("a");link.href=url;link.download="tescon-ugacc-students.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
