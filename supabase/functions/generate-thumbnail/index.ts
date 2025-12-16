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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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

    // Create a very detailed prompt for maximum accuracy
    const imagePrompt = `Create an ultra-realistic, professional YouTube thumbnail background image.

SUBJECT/TOPIC: "${textInput}"

STYLE: ${styleGuide}

REQUIREMENTS:
- The image must DIRECTLY and ACCURATELY represent the topic: "${textInput}"
- Ultra high resolution, 4K quality, photorealistic rendering
- Cinematic composition with rule of thirds
- Dramatic lighting with depth and shadows
- Rich vibrant colors that pop
- Professional photography quality
- NO TEXT, NO WORDS, NO LETTERS in the image
- Leave space for text overlay (especially ${textPosition || 'center'} area)
- 16:9 aspect ratio optimized for YouTube thumbnails
- The visual content must be 100% relevant to: "${textInput}"

Generate a stunning, eye-catching background that perfectly captures the essence of "${textInput}" with ${styleGuide}. The image should make viewers want to click immediately.`;

    console.log("Generated prompt:", imagePrompt);

    // Use Lovable AI for image generation
    let imageUrl: string | undefined;
    let lastError: string = "";
    
    for (let attempt = 0; attempt < 2; attempt++) {
      console.log(`Image generation attempt ${attempt + 1}`);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: imagePrompt
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Lovable AI gateway error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: "Rate limit exceeded. Please wait a moment and try again." 
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        if (response.status === 402) {
          return new Response(JSON.stringify({ 
            error: "Usage limit reached. Please add credits to continue." 
          }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        lastError = `AI gateway error: ${response.status}`;
        continue;
      }

      const data = await response.json();
      console.log("AI response received");

      // Extract the image from the response
      imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageUrl) {
        console.log("Image generated successfully");
        break;
      } else {
        console.error("No image in response, retrying...");
        lastError = "No image generated in response";
      }
    }
    
    if (!imageUrl) {
      console.error("Failed to generate image after retries:", lastError);
      throw new Error("Failed to generate image. Please try again.");
    }

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
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate thumbnail" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
