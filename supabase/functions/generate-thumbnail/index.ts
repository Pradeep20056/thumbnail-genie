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

    // Build a highly detailed prompt based on template and user input
    const templateStyles: Record<string, string> = {
      minimal: "clean minimalist composition, subtle gradients, modern aesthetic, soft lighting, professional, white space, geometric shapes, muted colors",
      gaming: "bold neon colors, RGB lighting effects, dynamic action poses, electric energy, glowing elements, cyberpunk vibes, high contrast, dramatic explosions, futuristic gaming setup",
      tech: "futuristic technology, holographic displays, circuit board patterns, blue and cyan glow, data visualization, sleek devices, digital matrix, clean lines, innovation",
      cinematic: "dramatic cinematic lighting, movie poster quality, golden hour atmosphere, epic scale, depth of field, lens flare, anamorphic look, theatrical composition",
      custom: "ultra high quality, photorealistic, stunning visual composition, professional photography, perfect lighting, magazine cover quality"
    };

    const styleGuide = templateStyles[template] || templateStyles.custom;

    // Create a detailed prompt for Pollinations AI
    const imagePrompt = `${textInput}, ${styleGuide}, ultra high resolution, 4K quality, photorealistic, cinematic composition, dramatic lighting, vibrant colors, professional YouTube thumbnail background, no text, no words, no letters, 16:9 aspect ratio`;

    console.log("Generated prompt:", imagePrompt);

    // Use Pollinations AI - free, no API key required
    // URL encode the prompt for the API
    const encodedPrompt = encodeURIComponent(imagePrompt);
    const width = 1280;
    const height = 720;
    
    // Pollinations AI image URL
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`;
    
    console.log("Fetching image from Pollinations AI...");

    // Fetch the image to verify it works and convert to base64
    const response = await fetch(pollinationsUrl);
    
    if (!response.ok) {
      console.error("Pollinations API error:", response.status);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    // Convert to base64
    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    console.log("Image generated successfully with Pollinations AI");

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
