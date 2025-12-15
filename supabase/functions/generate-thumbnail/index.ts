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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
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

    // Call Google Gemini API directly for image generation
    let imageUrl: string | undefined;
    let lastError: string = "";
    
    for (let attempt = 0; attempt < 2; attempt++) {
      console.log(`Image generation attempt ${attempt + 1}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: imagePrompt
                  }
                ]
              }
            ],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"]
            }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: "Rate limit exceeded. Please wait a moment and try again." 
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        if (response.status === 403) {
          return new Response(JSON.stringify({ 
            error: "API key invalid or quota exceeded. Please check your Gemini API key." 
          }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        lastError = `Gemini API error: ${response.status} - ${errorText}`;
        continue;
      }

      const data = await response.json();
      console.log("Gemini response received");

      // Extract the image from Gemini response
      const parts = data.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith("image/")) {
            // Convert base64 to data URL
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            console.log("Image generated successfully");
            break;
          }
        }
      }
      
      if (imageUrl) {
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
