

//const env = require("~/env.mjs");

const KEY = "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"
const {Configuration, OpenAIApi} = require("openai")

const configuration = new Configuration({
    apiKey : KEY
})

interface BrandPromptData {
    info: string,
    style: string,
    positives: string[],
    negatives: string[],
}

export function brandPrompt(promptData : BrandPromptData, prevBrandNames: string[], amount: number) {

    const prompt = `
        You are the best at creating brand names for any type of business or organization based on the information given about it.
        
        Create ${amount} brand names according to the specifications below:

        1. Information about the business/organization: ${promptData.info}.
        2. The brand name MUST have a ${promptData.style} tone/style.
        3. NO SPACES in the names.
        4. Only output the brand names, nothing else.
        5. Output each brand name with a comma as separator
        6. Keep the names as short as possible.
        7. DO NOT output any name from the prevBrandNames list, but you can use them for inspiration.
        ${promptData.positives.length !== 0 ? "8. The brand names MUST include the following word(s): " + promptData.positives : ""}
        ${promptData.negatives.length !== 0 ? "9. DO NOT include the following word(s) in the names: " + promptData.negatives : ""}
    
        prevBrandNames: ${prevBrandNames}
        `
    return prompt
}

const fewShotPromptOne: BrandPromptData = {
    info : "A website that provides an AI text reviewer with comprehensive feedback",
    style: "Playful",
    positives: [],
    negatives: ["AI"],
}

const fewShotPromptTwo: BrandPromptData = {
    info : "A service that takes a resume and job description as input and creates a cover letter.",
    style: "Casual",
    positives: [],
    negatives: ["AI"],
}

const fewShotMessages = [
    {
        role: "user",
        content: brandPrompt(fewShotPromptOne, [],10)
    },
    {
        role: "assistant",
        content: 'ScribbleCheck,WittyWording,GrammarGlee,WittyWrite,WordWizard,TextTime,HumorousHighlights,WordBounce,Lingonalysis,DictionDelight'
    },
    {
        role: "user",
        content: brandPrompt(fewShotPromptTwo,[],10)
    },
    {
        role: "assistant",
        content: 'Covelet,CoverGenie,JobSnap,OneShotCover,CoverWiz,Resume2Letter,CoverOne,CoverGo,MyCoverWrite,CareerCraft'
    },
]

export async function generateBrands(prompt: string, temperature:number) {
    const openai = new OpenAIApi(configuration)

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                ...fewShotMessages,
                {
                    role: "user", content: prompt
                }
            ],
            temperature: temperature,
        })
        const completion_text = completion.data.choices[0].message.content
        return completion_text.split(",").map((text:string) => text.trim())
    }
    catch (error:any) {
        console.log(error.message)
    }
}
""
function scorePrompt(brandInfo: string,brands: string[]) {
    return `
    You are an AI expert trained in brand analysis and rating. You will be given a brand description and list of accompanying brand names that you will evaluate and score according to the following metrics:

    Relevance: Relevance: How well does the brand name correlate with the brand's description, product, or service? The score range will be from 1 (the brand name seems unrelated or does not fit with its description or what it offers) to 5 (the brand name perfectly represents or encapsulates the brand's description).
    
    Length: The ideal length for a brand name is brief and concise, ideally 1-2 words. The score range will be from 1 (too long, more than four words) to 5 (optimal length, one to two words).

    Readability: How easy is it to pronounce and understand the brand name? The score range will be from 1 (it's extremely difficult to pronounce or understand.), to 5 (the brand name is straightforward to pronounce and understand without any confusion) 

    Recall: How memorable is the brand name? The score will be from 1 (forgettable and not likely to be recalled after hearing the name), to 5 (a highly memorable name that is likely to stick in the minds of consumers after a single mention).

    The score for each metric is 1 to 5 with a step of 0.5 between each point, so it is possible to score for example 1.5 or 2.5.
    For a given brand name you will provide an output in the following format:

    "brandName": {"relevance": relevance_score,"length": length_score, "readability": readability_score, "recall": recall_score}

    Where each score (length_score, readability_score, recall_score) is a value from 1 to 5 with increments of 0.5. For example, for a brand name called "BrandA", your output may look like this:

    "BrandA": {"relevance": "4","length": 3.5, "readability": 4.5, "recall": 5}

    Here is the brand description:

    "${brandInfo}"
    
    Here is the list of brand names for your evaluation:

    ${brands.map(brand => `"${brand}"`).join(", ")}
    `
}

export async function getBrandScores(brands: string[]){
    const openai = new OpenAIApi(configuration)

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                ...fewShotMessages,
                {
                    role: "user", content: prompt
                }
            ],
            temperature: 0
        })
        const completion_text = completion.data.choices[0].message.content
        return completion_text.split(",").map((text:string) => text.trim())
    }
    catch (error:any) {
        console.log(error.message)
    }
}