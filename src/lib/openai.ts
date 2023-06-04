

//const env = require("~/env.mjs");

const KEY = "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"
const {Configuration, OpenAIApi} = require("openai")

const configuration = new Configuration({
    apiKey : KEY
})

interface PromptData {
    generatedDomains: any[],
    info: string,
    style: string,
    positives: string[],
    negatives: string[],
}

export function brandPrompt(promptData : PromptData, amount: number) {
    let generatedBrands = promptData.generatedDomains.map((domain) => {
        const brand = domain.name.split(".")[0]
        if (brand) {
            return brand
        }
        return ""
    })

    const prevBrands = [...new Set(generatedBrands)].join(",")
    console.log(prevBrands)
    const prompt = `
        You are the best at creating brand names for any type of business or organization based on the information given about it.
        
        Create ${amount} brand names according to the specifications below:

        1. Information about the business/organization: ${promptData.info}.
        2. The brand name MUST have a ${promptData.style} tone/style.
        3. NO SPACES in the names.
        4. Only output the brand names, nothing else.
        5. Output each brand name with a comma as separator
        6. Keep the names as short as possible.
        ${promptData.positives ? "7. The brand names MUST include the following word(s): " + promptData.positives : ""}
        ${promptData.negatives ? "8. DO NOT include the following word(s) in the names: " + promptData.negatives : ""}
        
        Previously generated brand names: ${prevBrands}
    `
    return prompt
}

const fewShotPromptOne: PromptData = {
    generatedDomains: [],
    info : "A website that provides an AI text reviewer with comprehensive feedback",
    style: "Playful",
    positives: [],
    negatives: ["AI"],
}

const fewShotPromptTwo: PromptData = {
    generatedDomains: [],
    info : "A service that takes a resume and job description as input and creates a cover letter.",
    style: "Casual",
    positives: [],
    negatives: ["AI"],
}

const fewShotMessages = [
    {
        role: "user",
        content: brandPrompt(fewShotPromptOne,10)
    },
    {
        role: "assistant",
        content: 'ScribbleCheck,WittyWording,GrammarGlee,WittyWrite,WordWizard,TextTime,HumorousHighlights,WordBounce,Lingonalysis,DictionDelight'
    },
    {
        role: "user",
        content: brandPrompt(fewShotPromptTwo,10)
    },
    {
        role: "assistant",
        content: 'Covelet,CoverGenie,JobSnap,OneShotCover,CoverWiz,Resume2Letter,CoverOne,CoverGo,MyCoverWrite,CareerCraft'
    },
]

export async function generateBrands(prompt: string) {
    const openai = new OpenAIApi(configuration)
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                ...fewShotMessages,
                {role: "user", content: prompt}
            ],
            temperature: 0.7,
        })
        const completion_text = completion.data.choices[0].message.content
        return completion_text.split(",").map((text:string) => text.trim())
    }
    catch (error:any) {
        console.log(error.message)
    }
}