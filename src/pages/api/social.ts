import z from "zod"
import { generateBrands, brandPrompt} from "~/lib/openai"
import { NextApiRequest, NextApiResponse } from 'next';
import { getSocialData } from "~/lib/social";

const postSchema = z.object({
    brands: z.string().array()
})

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const json = JSON.parse(req.body)
        const { brands } = postSchema.parse(json)
        
        const responseData: Record<string,Record<string, boolean>> = {}
        for (const brandName of brands) {
            const socials = await getSocialData(brandName.toLowerCase())
            responseData[brandName] = socials
        }

        res.status(200).send(responseData)
    }
    catch (error: any){
        console.log(error)
        return res.status(500).json({error: "An error occurred."})
    }
}