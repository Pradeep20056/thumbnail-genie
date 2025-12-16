import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { textInput, template, overlayText, textPosition } = await req.json();
    
    console.log("Generating thumbnail for:", { textInput, template, overlayText, textPosition });

    const HF_TOKEN = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
    if (!HF_TOKEN) {
      throw new Error("HUGGING_FACE_ACCESS_TOKEN is not configured");
    }

    // Build a highly detailed prompt based on template and user input
    const templateStyles: Record<string, string> = {
      minimal: "clean, minimalist composition with subtle gradients, modern sans-serif aesthetic, soft lighting, professional, white space, geometric shapes, muted colors",
      gaming: "bold neon colors, RGB lighting effects, dynamic action poses, electric energy, glowing elements, cyberpunk vibes, high contrast, dramatic explosions, futuristic gaming setup",
      tech: "futuristic technology, holographic displays, circuit board patterns, blue and cyan glow, data visualization, sleek devices, digital matrix, clean lines, innovation",
      cinematic: "dramatic cinematic lighting, movie poster quality, golden hour atmosphere, epic scale, depth of field, lens flare, anamorphic look, theatrical composition, oscar-worthy",
      custom: "ultra high quality, photorealistic, stunning visual composition, professional photography, perfect lighting, magazine cover quality"
    };

    const styleGuide = templateStyles[template] || templateStyles.custom;

    // Create a detailed prompt for SDXL-Turbo
    const imagePrompt = `${textInput}, ${styleGuide}, ultra high resolution, 4K quality, photorealistic, cinematic composition, dramatic lighting, vibrant colors, professional YouTube thumbnail background, no text, no words, no letters, 16:9 aspect ratio`;

    console.log("Generated prompt:", imagePrompt);
    console.log("Calling HuggingFace stabilityai/sdxl-turbo model via router...");

    // Use the new HuggingFace router endpoint
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/sdxl-turbo",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: imagePrompt,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HuggingFace API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please wait a moment and try again." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 401 || response.status === 403) {
        return new Response(JSON.stringify({ 
          error: "API key invalid or unauthorized. Please check your HuggingFace API key." 
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
    }

    // Get the image blob
    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log("Image generated successfully with HuggingFace");

    return new Response(JSON.stringify({ 
      imageUrl,
      prompt: imagePrompt,
      template,
      textInput,
      overlayText,
      textPosition
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating thumbnail:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to generate thumbnail";
    
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
