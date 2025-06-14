
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LINKEDIN_ACCESS_TOKEN = Deno.env.get('LINKEDIN_ACCESS_TOKEN');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (!LINKEDIN_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: 'LinkedIn access token not configured.' }), { status: 400, headers: corsHeaders });
    }

    const { jobAd } = await req.json();

    if (!jobAd) {
      return new Response(JSON.stringify({ error: 'Missing jobAd payload.' }), { status: 400, headers: corsHeaders });
    }

    // Compose LinkedIn post format (sharing text as an organic post)
    const postText = `🚀 ${jobAd.title} at ${jobAd.company} 🚀

${jobAd.location ? `Location: ${jobAd.location}\n` : ""}
${jobAd.description}

${jobAd.requirements?.length ? "\nRequirements:\n" + jobAd.requirements.map((r: string) => "• " + r).join('\n') : ""}
${jobAd.benefits ? "\nBenefits:\n" + jobAd.benefits : ""}
${jobAd.salary ? `\nSalary: ${jobAd.salary}` : ""}
`;

    // Find the LinkedIn user URN to post as (using token owner)
    // Fetch the "me" object
    const profileResp = await fetch(
      "https://api.linkedin.com/v2/me",
      {
        headers: {
          "Authorization": `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
          "LinkedIn-Version": "202409"
        }
      }
    );
    if (!profileResp.ok) {
      const text = await profileResp.text();
      throw new Error(`Failed to fetch LinkedIn profile: ${profileResp.status} ${text}`);
    }
    const profile = await profileResp.json();
    const authorUrn = profile.id ? `urn:li:person:${profile.id}` : null;

    if (!authorUrn) {
      throw new Error("LinkedIn profile URN not found.");
    }

    // Call the LinkedIn API to post content
    const shareResp = await fetch(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
          "LinkedIn-Version": "202409"
        },
        body: JSON.stringify({
          author: authorUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: postText
              },
              shareMediaCategory: "NONE"
            }
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS"
          }
        })
      }
    );
    const shareRespText = await shareResp.text();

    if (!shareResp.ok) {
      throw new Error(`Failed to post job ad to LinkedIn: ${shareResp.status} ${shareRespText}`);
    }

    return new Response(JSON.stringify({ success: true, linkedInResponse: JSON.parse(shareRespText) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("LinkedIn post job error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
