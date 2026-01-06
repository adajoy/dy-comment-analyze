import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function aiAnalyze(str: string) {
  const prompt = `
          You are given a list of chinese car shop live stream comments:
          ${str}

          Your task:
          1. Identify users who are discussing car-related topics.

          2. Treat a comment as car-related if it includes ANY of the following
            (even if the word "car / 车" is not mentioned):

            A. Explicit car-related content:
                - Cars, vehicles, models, engines, driving, maintenance, modification

            B. Transaction intents:
                - Buying or selling cars
                - Price mentions or offers
                  (e.g. "6800我要了", "5万收", "这个价出吗")

            C. Brand / model availability questions:
                - Automobile brand or model names
                - Combined with availability phrases
                  (e.g. "有长安没", "比亚迪能上吗")

            D. Price-only or slang inquiries in livestream context:
                - "多少米", "多少钱", "多少", "啥价", "几万"

          3. For each identified user:
            - Merge all their car-related comments into ONE combined intent
            - Ignore non-car comments from the same user

          Output requirements (STRICT):
          - Return ONLY a valid JSON string.
          - The output MUST be a JSON array.
          - Each user appears only once.
          - If no car-related users exist, return [].
          - No extra text, no explanations.

          Output format:
          [
            {
              "name": "username",
              "content": "combined car-related content"
            }
          ]
        `
  console.log("prompt: ", prompt);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "你是一个专门分析汽车直播间评论的助手，严格按照要求输出JSON格式。",
      },
      { role: "user", content: prompt },
    ],
    model: "deepseek-chat",
    temperature:0.1,
    top_p: 0.95,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });
  const content = completion.choices[0].message.content || "";
  console.log("deepseek response: ", content);
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("error parsing json: ", e);
    return [];
  }
}
