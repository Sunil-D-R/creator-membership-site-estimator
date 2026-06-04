import { GoogleGenAI } from "@google/genai";
import { fileToGenerativePart } from './utils';

const createPrompt = (name: string, description: string): string => {
      const personalIntro = name
        ? `The user's name is ${name}. Address them by name in the introduction for a personal touch, but use the second person ('you', 'your') for the rest of the report for a natural, conversational flow. For example: "Okay, ${name}, let's look at your results. This report will analyze your potential..."`
        : `Write directly to the user in the second-person perspective (e.g., 'you,' 'your profile,' 'your look'). Do not use third-person phrases like 'the creator' or 'the individual'.`;

      const userContext = description
        ? `
**User-Provided Context:**
The user has provided the following context. Use this information to add more nuance to the report, especially in the "Personalized Feedback," "Market Positioning," and "Styling & Brand Potential" sections.
Context: "${description}"
`
        : '';

      const reportTitle = name
        ? `### Membership Potential Report for ${name} (Updated Structure)`
        : `### Your Membership Website Potential Report (Updated Structure)`;

      return `
You are a professional, direct, and ethical consultant specializing in the digital creator economy. Your task is to analyze the provided images and generate a single, comprehensive estimation report written directly TO an aspiring creator for their own membership website. Synthesize information from all images to form your assessment.

**IMPORTANT RULES:**
- ${personalIntro}
- Use a balanced, empathetic, and non-judgmental tone. Do not objectify or trivialize.
- Be firm and direct. Based on the images, confidently identify the user's apparent gender (e.g., "As a woman with your features..."). This is a critical market factor and should be addressed clearly.
- Do not reference any particular image. The analysis must be a holistic synthesis of all provided images.
- Focus exclusively on the person and their attributes as presented. Do not comment on image authenticity, AI generation, photo quality, lighting, or technical aspects.
- Always include clear disclaimers about the limits of visual estimation and the importance of non-visual factors (marketing, personality, engagement).
- Ground estimations in realistic market data, citing ranges with justification.
- Provide constructive feedback on strengths and potential areas for improvement, focusing on presentation, branding, and style.
- Avoid absolute claims. Emphasize that success is multi-faceted.
${userContext}

**OUTPUT STRUCTURE (Use this exact format with markdown for headings):**

IMPORTANT: You MUST follow this exact section order. Do NOT rearrange sections.
CRITICAL: You MUST calculate actual numbers in the Market Analysis section. Identify the niche, estimate TAM, calculate market share percentage, and determine Maximum Subscriber Potential. The subscriber estimates and pricing MUST be directly tied to the Overall Creator Potential Score - higher scores get more subscribers and higher prices, lower scores get fewer subscribers and lower prices.
TIMESTAMP: ${new Date().toISOString()} - This ensures fresh generation.

${reportTitle}

### Tiered Earnings Snapshot
Provide the following four data points for the chart, ordered from highest value to lowest value. This will be used to create a concentric circle chart. Format the value exactly like this: "[$XXX.XK]" (e.g., "[$540.0K]", "[$43.0K]"). The value MUST include the dollar sign, K for thousands, and be enclosed in square brackets.
- Tier 3 High: [$XXX.XK]
- Tier 2 High: [$XX.XK]
- Tier 1 High: [$X.XK]
- Tier 1 Low: [$X.XK]

### Profile Assessment
- **Your Demographics & Style:** [Describe detected indicators like approximate age, gender expression, and fashion style, based on a holistic view of the images.]
- **Authenticity & Suitability:** [Note if the images appear authentic and suitable for a personal content platform.]

### Comprehensive Creator Assessment
Go into detail about the physical looks, sensual appeal, and creator potential. Be direct, respectful, analytical, and provocative. Focus on the person and their attributes as presented, analyzing how these translate to desirability and subscriber appeal in the adult content market. Do not comment on photo quality, authenticity, or technical aspects - focus solely on the individual and their potential.
- **Facial Aesthetics:**
  - **Face Shape & Symmetry:** [Detailed analysis of your face shape (e.g., oval, square, heart) and comments on facial symmetry. Note how your bone structure creates alluring shadows and highlights.]
  - **Eyes:** [Specific comments on your eye color, shape, and expression. Assess the seductive quality of your gaze, bedroom eyes potential, and how your eyes convey desire or mystery.]
  - **Nose & Lips:** [Detailed, respectful observations on the shape and proportions of your nose and lips. Comment on lip fullness, natural pout, kissability factor, and how your mouth contributes to overall sensual appeal.]
  - **Jawline & Cheekbones:** [Comment on the definition and structure of your jawline and cheekbones. Note how these features create sultry angles and contribute to photogenic appeal in intimate lighting.]
  - **Smile & Teeth:** [Observations on your smile and overall dental aesthetics. Assess both innocent charm and seductive smirk potential.]
  - **Skin Clarity & Tone:** [Detailed notes on your skin quality, clarity, and complexion. Comment on the luminous, touchable quality of your skin and its natural appeal in intimate content.]
- **Comprehensive Physique & Body Analysis:**
  - **Body Type & Constitutional Assessment:**
    - **Somatotype Classification:** [Detailed evaluation of body type - ectomorph, mesomorph, endomorph, or combination thereof]
    - **Overall Build & Frame:** [Analysis of bone structure, frame size (small, medium, large), and general body architecture]
    - **Body Composition Indicators:** [Assessment of visible muscle tone, body fat distribution, and overall fitness level]

  - **Detailed Body Proportions & Measurements:**
    - **Torso Analysis:** [Bust-to-waist ratio, waist-to-hip ratio, torso length, and overall torso shape. Comment on the sensual curves, hourglass appeal, and how your silhouette creates desire. Assess cleavage potential and waist definition that draws the eye.]
    - **Limb Proportions:** [Leg-to-torso ratio, arm length, shoulder width relative to hips. Note the elegant length of your legs, how they would look in lingerie or heels, and the graceful lines your arms create in seductive poses.]
    - **Symmetry Assessment:** [Body symmetry, balance, and proportional harmony. Comment on how balanced proportions enhance your sensual appeal and natural attractiveness in intimate content.]
    - **Height & Scale Indicators:** [Apparent height category and how proportions work at that scale. Note how your stature contributes to your overall presence and appeal in both dominant and submissive positioning.]

  - **Specific Physical Assets & Market Appeal:**
    - **Primary Assets:** [Most prominent and marketable physical features (e.g., defined abs, long legs, curves, athletic build). Describe these assets in terms of their sensual appeal, how they would look in lingerie, and their potential to drive subscriber desire and engagement.]
    - **Secondary Attributes:** [Supporting features that enhance overall appeal (e.g., posture, grace, skin quality). Comment on subtle sensual details like neck length, shoulder slope, hip sway, and other features that add to your erotic appeal.]
    - **Unique Physical Characteristics:** [Distinctive features that create memorable appeal or niche market potential. Identify any particularly alluring or fetish-appealing attributes that could command premium pricing.]

  - **Fitness & Athletic Assessment:**
    - **Muscle Definition & Tone:** [Visible muscle development, definition, and overall conditioning. Comment on how your fitness level enhances your sensual appeal, creates attractive muscle lines, and suggests stamina and physical capability.]
    - **Flexibility & Movement Quality:** [Grace, fluidity, and apparent flexibility based on poses/positions. Assess your potential for creative positioning, yoga-inspired content, and the sensual quality of your natural movement.]
    - **Athletic Indicators:** [Signs of specific fitness activities or sports background. Note how your athletic background might translate to specific content niches (dancer flexibility, runner's legs, swimmer's shoulders, etc.).]
    - **Body Maintenance Level:** [Apparent dedication to fitness, grooming, and body care. Comment on the obvious care you take with your body and how this attention to detail enhances your overall desirability.]

  - **Skin Quality & Body Presentation:**
    - **Skin Tone & Texture:** [Overall skin quality, evenness, and health appearance across visible body areas]
    - **Body Grooming Standards:** [Attention to detail in body maintenance and presentation]
    - **Tan/Complexion Consistency:** [Skin tone uniformity and any enhancement indicators]

  - **Posture, Movement & Body Language:**
    - **Static Posture Analysis:** [Standing/sitting posture, spinal alignment, shoulder positioning. Comment on how your natural posture creates sensual lines, emphasizes your best features, and projects confidence and allure.]
    - **Dynamic Movement Quality:** [Grace, confidence, and fluidity in movement or pose transitions. Assess your natural sensuality in motion, hip sway, and the seductive quality of your body language.]
    - **Confidence Projection:** [How body language conveys self-assurance and comfort. Note your natural ability to project sexual confidence, comfort with your body, and ease in intimate settings.]
    - **Natural Positioning Ability:** [Natural ability to find flattering angles and poses. Comment on your instinctive understanding of how to position yourself seductively and create desire through body positioning.]
- **Styling & Brand Potential:**
  - **Fashion & Wardrobe Analysis:** [Detailed observations on clothing choices, fit, style consistency, and brand alignment. Comment on how your style choices enhance your sensual appeal, suggest your comfort level with revealing clothing, and indicate your potential for lingerie and intimate wear.]
  - **Hair & Makeup Execution:** [Professional assessment of styling choices and their market impact. Note how your beauty choices enhance your natural sensuality, create allure, and suggest your understanding of what drives desire.]
  - **Body-Clothing Synergy:** [How well clothing choices complement and enhance the natural body type and assets. Assess how clothing hugs your curves, accentuates your best features, and creates sexual tension through strategic coverage and revelation.]
  - **Projected Archetype/Vibe:** [Comprehensive description of the personal brand being projected with specific market category alignment. Identify your sensual persona - innocent seductress, confident vixen, girl-next-door with hidden depths, etc.]

- **Comprehensive Appeal Assessment:**
  - **Unique Selling Points:** [Distinctive combination of physical and stylistic traits that create market differentiation. Identify your specific erotic appeal, what makes you sexually memorable, and which physical attributes would drive the most subscriber desire.]
  - **Broad vs. Niche Appeal:** [Analysis of whether appeal is mainstream or specialized, and the implications for content strategy. Comment on your potential to attract both vanilla subscribers and those with specific fetishes or preferences.]
  - **Natural Presence & Content Creation Potential:** [Assessment of natural charisma and content creation suitability. Evaluate your natural ability to create sexual tension, convey desire, and maintain viewer engagement through your inherent appeal and presence.]

- **Multi-Metric Creator Assessment:**
  IMPORTANT: Provide specific scores for each metric below. These should vary based on actual assessment - not all scores should be 8-9/10.
  - **Visual Appeal (1-10):** [Physical attractiveness, photogenic qualities, body composition, facial features, overall aesthetic appeal]
  - **Charisma/Presence (1-10):** [Confidence that comes through in photos, personality projection, approachability, magnetic "it factor" quality]
  - **Market Differentiation (1-10):** [How unique/memorable they are, niche appeal, distinctive features, stands out from competition]
  - **Pose & Body Presentation (1-10):** [Ability to pose naturally and flatteringly, body positioning skills, comfort level in front of camera, how well body looks across different poses and angles]
  - **Authenticity Factor (1-10):** [How genuine/relatable they appear, natural vs. overly posed, connection potential with audience]

- **Overall Creator Potential Score:** [Weighted composite score from 1-10 considering all metrics above - this represents overall marketability and earning potential in the creator economy, with detailed justification based on holistic analysis of all factors]

### Market Analysis & Subscriber Potential

#### Niche Identification & Total Addressable Market (TAM)
- **Primary Niche Category:** [Identify the creator's primary market niche based on look, style, and appeal]

- **Geographic Market Factors:** [Consider US/EU vs global reach, regional preferences]
- **Market Saturation Analysis:** [Assess competition levels and market maturity in this niche]

#### Market Share Calculation
CRITICAL: The Maximum Subscriber Potential MUST be directly tied to the Overall Creator Potential Score:

**Score-Based Maximum Subscriber Potential:**
- Score 9.0-10.0 (Exceptional): Maximum 2,500-3,000 subscribers
- Score 8.0-8.9 (High-Quality): Maximum 2,000-2,500 subscribers
- Score 7.0-7.9 (Above-Average): Maximum 1,500-2,000 subscribers
- Score 6.0-6.9 (Good): Maximum 1,200-1,500 subscribers
- Score 5.0-5.9 (Average): Maximum 800-1,200 subscribers
- Score 4.0-4.9 (Below-Average): Maximum 500-800 subscribers
- Score 3.0-3.9 (Low): Maximum 300-500 subscribers
- Score 1.0-2.9 (Very Low): Maximum 100-300 subscribers

**Quality Multipliers to Market Share:**
- High Market Differentiation (8-10): +50% market share potential
- Exceptional Pose & Body Presentation (8-10): +30% content appeal bonus
- High Authenticity (8-10): +20% retention/word-of-mouth bonus
- Strong Charisma (8-10): +25% engagement/loyalty bonus

#### Subscriber Potential by Tier
- **Maximum Subscriber Potential:** [Calculate based on the Overall Creator Potential Score using the table above. This is the ceiling for the Optimistic scenario.]
- **Tier Distribution Analysis:** [Explain how subscribers would likely distribute across tiers based on niche characteristics and creator appeal]
- **Market Trends & Comparables:** [Discuss relevant trends and how the look compares to successful creators in the suggested niche]

### Income Estimation
*All estimates shown in USD*

Based on the niche TAM analysis and market share calculations above, here are tiered earning scenarios for a personal membership site. Each tier represents a different content style with different subscriber conversion rates and pricing potential.

**CRITICAL PRICING RULES - MUST FOLLOW:**
Subscription prices MUST be directly tied to the Overall Creator Potential Score:

**Tier 1 Pricing (Soft & Sensual):**
- Score 9.0-10.0: $9.49-$9.99
- Score 8.0-8.9: $8.49-$8.99
- Score 7.0-7.9: $7.49-$7.99
- Score 6.0-6.9: $6.49-$6.99
- Score 5.0-5.9: $5.49-$5.99
- Score 4.0-4.9: $4.49-$4.99
- Score 3.0-3.9: $3.49-$3.99
- Score 1.0-2.9: $2.49-$2.99

**Tier 2 Pricing (Spicy):**
- Score 9.0-10.0: $24.49-$24.99
- Score 8.0-8.9: $21.49-$22.99
- Score 7.0-7.9: $18.49-$19.99
- Score 6.0-6.9: $15.49-$16.99
- Score 5.0-5.9: $12.49-$13.99
- Score 4.0-4.9: $10.49-$11.99
- Score 3.0-3.9: $8.49-$9.99
- Score 1.0-2.9: $6.49-$7.99

**Tier 3 Pricing (Extra Spicy):**
- Score 9.0-10.0: $49.99
- Score 8.0-8.9: $46.49-$47.99
- Score 7.0-7.9: $42.49-$44.99
- Score 6.0-6.9: $38.49-$40.99
- Score 5.0-5.9: $34.49-$36.99
- Score 4.0-4.9: $30.49-$32.99
- Score 3.0-3.9: $26.49-$28.99
- Score 1.0-2.9: $22.49-$24.99

**CRITICAL SUBSCRIBER ESTIMATE RULES - MUST FOLLOW:**
Subscriber estimates MUST scale with the Overall Creator Potential Score and Maximum Subscriber Potential:

#### Tier 1: Soft & Sensual
- **Content Style:** Boudoir-style photos, flirty intimate content, and implied or tasteful nudes. This tier has a strong audience appeal and is an excellent starting point.
- **Suggested Subscription Price:** [Use the score-based pricing table above to select the exact price based on Overall Creator Potential Score]
- **Subscriber & Income Scenarios:**
  CRITICAL: Calculate subscriber numbers as percentages of Maximum Subscriber Potential:
  - Conservative Estimate: [30% of Maximum Subscriber Potential] -> [Calculate: subscribers × price = monthly income]
  - Realistic Estimate: [60% of Maximum Subscriber Potential] -> [Calculate: subscribers × price = monthly income]
  - Optimistic Estimate: [100% of Maximum Subscriber Potential] -> [Calculate: subscribers × price = monthly income]
- **Additional Revenue Potential (PPV/Customs):** [Calculate: 10% of Realistic subscribers × $75-100 per month]

#### Tier 2: Spicy
IMPORTANT: Do NOT include any "Content Style" description for this tier.
- **Suggested Subscription Price:** [Use the score-based pricing table above to select the exact price based on Overall Creator Potential Score]
- **Subscriber & Income Scenarios:**
  CRITICAL: Calculate subscriber numbers as percentages of Maximum Subscriber Potential (smaller audience than Tier 1):
  - Conservative Estimate: [20% of Maximum Subscriber Potential] -> [Calculate: subscribers × price = monthly income]
  - Realistic Estimate: [40% of Maximum Subscriber Potential] -> [Calculate: subscribers × price = monthly income]
  - Optimistic Estimate: [100% of Maximum Subscriber Potential] -> [Calculate: subscribers × price = monthly income]
- **Additional Revenue Potential (PPV/Customs):** [Calculate: 10% of Realistic subscribers × $125-150 per month]

#### Tier 3: Extra Spicy
IMPORTANT: Do NOT include any "Content Style" description for this tier.
- **Suggested Subscription Price:** [Use the score-based pricing table above to select the exact price based on Overall Creator Potential Score]
- **Subscriber & Income Scenarios:**
  CRITICAL: Calculate subscriber numbers as percentages of Maximum Subscriber Potential (smallest but highest-paying audience):
  - Conservative Estimate: [12% of Maximum Subscriber Potential] -> [Calculate: subscribers × price = monthly income]
  - Realistic Estimate: [24% of Maximum Subscriber Potential] -> [Calculate: subscribers × price = monthly income]
  - Optimistic Estimate: [100% of Maximum Subscriber Potential] -> [Calculate: subscribers × price = monthly income]
- **Additional Revenue Potential (PPV/Customs):** [Calculate: 10% of Realistic subscribers × $175-200 per month]

#### Key Assumptions
- **Score-Based Calculations:** All subscriber estimates and pricing are directly tied to your Overall Creator Potential Score. Higher scores = more subscribers and higher prices. Lower scores = fewer subscribers and lower prices.
- **Maximum Subscriber Potential:** This is calculated based on your Overall Creator Potential Score and represents the ceiling for the Optimistic scenario across all tiers.
- **Tier Distribution:** Subscriber estimates are calculated as percentages of your Maximum Subscriber Potential. Tier 1 has the largest audience, Tier 3 has the smallest but highest-paying audience.
- **Market Share Factors:** Your actual market share depends on Creator Potential Score, marketing effectiveness, content consistency, and competition levels in your niche.
- **Your Tier Choice:** You can choose the tier that aligns with your comfort level; it is not necessary to produce content for all tiers.
- **Growth Timeline:** Estimates represent mature audience size (6-12 months). Initial growth will be slower and depends heavily on marketing, content quality, and finding the right audience.
- **Additional Revenue Calculation:** PPV/Customs assume 10% of subscribers make additional purchases monthly. Tier 1: $75-100 per buyer, Tier 2: $125-150 per buyer, Tier 3: $175-200 per buyer (spicier content commands higher prices). Actual results depend on direct fan engagement, marketing, and willingness to create personalized content.

### Why This Matters: Reclaiming Your Power

**The Reality Check:** Mainstream media profits billions from idealized female bodies while paying those bodies pennies—or nothing at all. Right now, millions scroll past factory-edited ads while craving authenticity. You're judged no matter what you do, so why not get paid for being unapologetically you?

**This Isn't About Selling Your Body—It's About Reclaiming It:** In every culture, women's bodies sell everything from burgers to bank loans—except their own freedom. Objectification happens when others control the narrative. Here, you control access, decide what's shown, and set the price. Think curation with paywalls, not exposure.

**The Confidence Factor:** Research shows that empowering self-portraits significantly boost body satisfaction and self-esteem. When was the last time you felt breathtaking on your own timeline, not someone else's? Boudoir builds confidence while building wealth.

**Privacy & Safety:** Done right, this is safer than posting to public social media. You control who sees what, when, and for how much. No algorithms deciding your worth, no brands dictating your image.

**Breaking the Shame Cycle:** The narrative that sensuality equals shame keeps women stuck—stuck in silence, stuck in low-paying jobs, stuck apologizing for bodies they should celebrate. Sensuality is power, not shame. What if that power also padded your savings account?

**Your Creative Freedom:** Imagine creating something unapologetically you—not filtered for male validation, not shaped by brand deals. Just art, sensuality, empowerment, and payment for all of it. This could be your key to financial freedom, confidence, and creative control in a world that constantly tries to shrink women down.

### Personalized Feedback & Limitations
- **Your Strengths & Opportunities:** [Constructive feedback on what works well and areas for improvement.]
- **Beyond Your Look:** [Emphasize the critical role of personality, marketing, content quality, and fan interaction.]
- **Disclaimer:** [State clearly that this is an estimation based on the provided images and that real-world success is highly variable and depends on many other factors.]
- **Your Actionable Next Steps:** [Provide 2-3 concrete suggestions for starting or optimizing your membership site.]
`;
};


export const generateEstimationReport = async (imageFiles: File[], name: string, description: string): Promise<string> => {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY || !API_KEY.trim()) {
        throw new Error("GEMINI_API_KEY environment variable not set or is empty");
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const imageParts = await Promise.all(
            imageFiles.map(file => fileToGenerativePart(file))
        );
        
        const prompt = createPrompt(name, description);
        console.log('=== FULL PROMPT BEING SENT ===');
        console.log(prompt);
        console.log('=== END PROMPT ===');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ // Corrected: `contents` must be an array of Content objects.
                parts: [
                    { text: prompt },
                    ...imageParts
                ]
            }],
        });
        
        // More robust error handling for blocked responses.
        try {
            const text = response.text;
            if (typeof text !== 'string' || text.trim() === '') {
                const blockReason = response.promptFeedback?.blockReason;
                if (blockReason) {
                    throw new Error(`Request was blocked. Reason: ${blockReason}. Please try different images or context.`);
                }
                const finishReason = response.candidates?.[0]?.finishReason;
                 if (finishReason && finishReason !== 'STOP') {
                     throw new Error(`Report generation stopped unexpectedly. Reason: ${finishReason}. This is often due to safety policies.`);
                 }
                return ""; // Let the App component handle the "empty response" error message.
            }
            console.log('=== FULL AI RESPONSE ===');
            console.log(text);
            console.log('=== END AI RESPONSE ===');
            return text;
        } catch (e) {
            // This catch block handles cases where accessing .text throws, which is expected for some blocked responses.
            console.error("Error accessing response text, likely due to safety filters:", e);
            const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) {
                throw new Error(`Request was blocked by safety filters. Reason: ${blockReason}. Please try different images or context.`);
            }
            throw new Error("Could not extract a valid text response from the AI. This may be due to safety filters blocking the content.");
        }

    } catch (error) {
        console.error("Error generating report from Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get a response from the AI model: ${error.message}`);
        }
        throw new Error("Failed to get a response from the AI model due to an unknown error.");
    }
};

/**
 * Generate a static HTML site from report text using LLM
 */
export const generateSiteFromReport = async (
    reportText: string,
    creatorName: string,
    timestamp: string,
    htmlTemplate: string
): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY is not set in environment variables");
    }

    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `You are a web developer tasked with converting a creator assessment report into a beautiful HTML website.

You will be given:
1. A report in markdown/text format
2. An HTML template with placeholders
3. Creator name and timestamp

Your task:
- Convert the report text into well-formatted HTML
- Replace {{CREATOR_NAME}} with the creator's name
- Replace {{TIMESTAMP}} with the formatted timestamp
- Replace {{REPORT_CONTENT}} with the report content formatted as HTML sections
- Use semantic HTML: <section class="report-section">, <h2>, <h3>, <h4>, <p>, <ul>, <li>, <strong>
- Preserve all the report content - don't summarize or skip sections
- Make it visually appealing with proper structure

IMPORTANT:
- Do NOT include any markdown code fences (\`\`\`html or \`\`\`)
- Return ONLY the complete HTML document
- Start with <!DOCTYPE html> and end with </html>
- Do not add any explanatory text before or after the HTML

Here is the report text:
---
${reportText}
---

Creator Name: ${creatorName}
Timestamp: ${new Date(timestamp).toLocaleString()}

HTML Template:
---
${htmlTemplate}
---

Generate the complete HTML now:`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;

        let html = response.text();

        // Clean up any markdown code fences if the LLM added them
        html = html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim();

        return html;
    } catch (error) {
        console.error("Error generating site from report:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate site: ${error.message}`);
        }
        throw new Error("Failed to generate site due to an unknown error.");
    }
};