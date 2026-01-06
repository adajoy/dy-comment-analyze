import { aiAnalyze } from "./ds";
import { addInterestedUser } from "./db";

let messageBuffer: Array<{ name: string; content: string }> = [];

const processMessage = (messages: string) => {
  const list = JSON.parse(messages);
  if (Array.isArray(list)) {
    list.forEach(processSingleMessage);
  }
};

const processSingleMessage = (o: any) => {
  if (!o) return;
  if (!o.content) return;
  if (!o.user) return;

  const name = o.user.name;
  const content = o.content;
  const ignoreList = ["进入直播间", "为主播点赞了", "关注了主播"];
  if (ignoreList.some((item) => content.includes(item))) return;
  console.log({ name, content });
  messageBuffer.push({ name, content });
  if (
    messageBuffer.length === parseInt(process.env.MESSAGE_BUFFER_SIZE || "100")
  ) {
    analyzeMessage(messageBuffer);
    messageBuffer = [];
  }
};

const analyzeMessage = async (
  buffer: Array<{ name: string; content: string }>
) => {
  const str = JSON.stringify(buffer);
  const res = await aiAnalyze(str);
  console.log(`analyze result: ${JSON.stringify(res)}`);

  // Save analyzed results to database
  if (Array.isArray(res) && res.length > 0) {
    try {
      for (const user of res) {
        if (user.name && user.content) {
          await addInterestedUser({
            name: user.name,
            content: user.content,
          });
        }
      }
      console.log(`✅ Saved ${res.length} interested user(s) to database`);
    } catch (error) {
      console.error("❌ Error saving to database:", error);
    }
  }
};

export default processMessage;
