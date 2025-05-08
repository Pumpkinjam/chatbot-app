const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const config = require('../config/keys');
const sqlite3 = require('sqlite3').verbose();

const dbPath = __dirname + '/../db/sample.db';
const db = new sqlite3.Database(dbPath);
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});
const gpt_model = 'gpt-4.1-mini';

const systemPrompt = "당신은 사용자의 질문에 답을 하기 위한 안내 챗봇 Artlas입니다.";

// user conversation history for context
const conversationHistory = {};
const MAX_HISTORY = 20;

// TODO
// 1. json key categorizing enhancement -- fine-tuning for json build??

// conversation history management
function addToConversationHistory(userId, role, content) {
  if (!conversationHistory[userId]) {
      conversationHistory[userId] = [];
  }

  conversationHistory[userId].push({ role, content });

  // remove oldest message if history exceeds max length
  if (conversationHistory[userId].length > MAX_HISTORY) {
      conversationHistory[userId].shift();
  }
}

function getConversationHistory(userId) {
  return conversationHistory[userId] || [];
}

function dbQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function exhibitionRoutine(userId, filters, userText) {
  // generate SQL query
  let conditions = [];
  let params = [];

  filters = filters || {};  // preventing error if filters is null

  if (filters.title) {
    const keywords = filters.title.trim().split(/\s+/);
    if (keywords.length > 0) {
      const titleConditions = keywords.map(() => `title LIKE ?`).join(' OR ');
      const wrappedTitleCondition = `(${titleConditions})`;

      // add to conditions
      conditions.push(wrappedTitleCondition);
      // add to params
      keywords.forEach(word => {
        params.push(`%${word}%`);
      });
    }
  }
  if (filters.location) {
    conditions.push("location LIKE ?");
    params.push(`%${filters.location}%`);
  }
  if (filters.price) {
    conditions.push("price <= ?");
    params.push(`${filters.price}`);
  }
  if (filters.category) {
    conditions.push("category LIKE ?");
    params.push(`%${filters.category}%`);
  }
  if (filters.date_range) {
    conditions.push("start_date <= ? AND end_date >= ?");
    params.push(filters.date_range[1]); 
    params.push(filters.date_range[0]); 
  }
  if (filters.time_range) {
    conditions.push("start_time <= ? AND end_time >= ?");
    params.push(filters.time_range[1]); 
    params.push(filters.time_range[0]);
  }
  if (filters.tag) {
    const keywords = filters.tag.trim().split(/\s+/);
    if (keywords.length > 0) {
      const tagConditions = keywords.map(() => `tag LIKE ?`).join(' OR ');
      const wrappedTagCondition = `(${tagConditions})`;

      // add to conditions
      conditions.push(wrappedTagCondition);
      // add to params
      keywords.forEach(word => {
        params.push(`%${word}%`);
      });
    }
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  const query = `SELECT * FROM exhibition ${whereClause}`;
  console.log(`query : \n${query}`);
  console.log(`params : \n${params}`);

  // db query
  const rows = await dbQuery(query, params);

  // if there's no result
  if (!rows.length) {
    const noResultPrompt = `사용자 질문: "${userText}"
    검색된 전시회가 없습니다. 사용자에게 친절하게 안내를 제공하십시오.`;

    const noResultRes = await openai.chat.completions.create({
      model: gpt_model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...getConversationHistory(userId),
        { role: 'user', content: noResultPrompt },
      ],
    });

    return noResultRes.choices[0].message.content;
  } 
  // if ther's some result, take the first 3 results
  else {
    const exhibitionList = rows.slice(0, 10).map((row, idx) =>
      `${idx + 1}. "${row.title}", ${row.category}, ${row.start_date} ~ ${row.end_date}, ${row.start_time} ~ ${row.end_time}, ${row.location}, ${row.price}, ${row.tag}, ${row.status}`
    ).join('\n');

    const finalPrompt = `
    사용자 질문: "${userText}"
    검색된 전시회 목록:
    ${exhibitionList}
    
    위 정보를 바탕으로 사용자에게 친절하고 자연스러운 답변을 제공하십시오.`;

    const finalRes = await openai.chat.completions.create({
      model: gpt_model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...getConversationHistory(userId),
        { role: 'user', content: finalPrompt },
      ],
    });

    const GPTResponse = finalRes.choices[0].message.content;
    console.log(`GPTResponse: \n${GPTResponse.toString()}`);
    
    return GPTResponse;
  }
}

async function artistRoutine(userId, filters, userText) {
  // generate SQL query
  let conditions = [];
  let params = [];

  filters = filters || {};  // preventing error if filters is null

  if (filters.name) {
    conditions.push("name LIKE ?");
    params.push(`%${filters.name}%`);
  }
  if (filters.category) {
    conditions.push("category LIKE ?");
    params.push(`%${filters.category}%`);
  }
  if (filters.nation) {
    conditions.push("nation LIKE ?");
    params.push(`%${filters.nation}%`);
  }
  if (filters.description) {
    const keywords = filters.description.trim().split(/\s+/);
    if (keywords.length > 0) {
      const descriptionConditions = keywords.map(() => `description LIKE ?`).join(' OR ');
      const wrappedDescriptionCondition = `(${descriptionConditions})`;

      // add to conditions
      conditions.push(wrappedDescriptionCondition);
      // add to params
      keywords.forEach(word => {
        params.push(`%${word}%`);
      });
    }
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  const query = `SELECT * FROM artist ${whereClause}`;
  console.log(`query : \n${query}`);
  console.log(`params : \n${params}`);

  // db query
  const rows = await dbQuery(query, params);

  if (!rows.length) {
    const noResultPrompt = `사용자 질문: "${userText}"
    검색된 작가가 없습니다. 사용자에게 친절하게 안내를 제공하십시오.`;

    const noResultRes = await openai.chat.completions.create({
      model: gpt_model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...getConversationHistory(userId),
        { role: 'user', content: noResultPrompt },
      ],
    });

    return noResultRes.choices[0].message.content;
  } else {
    const artistList = rows.slice(0, 10).map((row, idx) =>
      `${idx + 1}. "${row.name}", ${row.category}, ${row.nation}, ${row.description}`
    ).join('\n');

    //console.log(`artistList: \n${artistList}`);
    const finalPrompt = `
    사용자 질문: "${userText}"
    검색된 아티스트 목록:
    ${artistList}
    
    위 정보를 바탕으로 사용자에게 친절하고 자연스러운 답변을 제공하십시오.`;

    const finalRes = await openai.chat.completions.create({
      model: gpt_model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...getConversationHistory(userId),
        { role: 'user', content: finalPrompt },
      ],
    });

    return finalRes.choices[0].message.content;
  }
}

async function galleryRoutine(userId, filters, userText) {
  // SQL 쿼리 생성
  let conditions = [];
  let params = [];

  filters = filters || {};  // preventing error if filters is null

  if (filters.name) {
    const keywords = filters.name.trim().split(/\s+/);
    if (keywords.length > 0) {
      const nameConditions = keywords.map(() => `name LIKE ?`).join(' OR ');
      const wrappedNameCondition = `(${nameConditions})`;

      // add to conditions
      conditions.push(wrappedNameCondition);
      // add to params
      keywords.forEach(word => {
        params.push(`%${word}%`);
      });
    }
  }
  // location -> address
  if (filters.location) {
    conditions.push("address LIKE ?");
    params.push(`%${filters.location}%`);
  }
  if (filters.time_range) {
    conditions.push("start_time <= ? AND end_time >= ?");
    params.push(filters.time_range[1]);
    params.push(filters.time_range[0]);
  }
  if (filters.category) {
    conditions.push("category LIKE ?");
    params.push(`%${filters.category}%`);
  }
  if (filters.description) {
    const keywords = filters.description.trim().split(/\s+/);
    if (keywords.length > 0) {
      const descriptionConditions = keywords.map(() => `description LIKE ?`).join(' OR ');
      const wrappedDescriptionCondition = `(${descriptionConditions})`;

      // add to conditions
      conditions.push(wrappedDescriptionCondition);
      // add to params
      keywords.forEach(word => {
        params.push(`%${word}%`);
      });
    }
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  const query = `SELECT * FROM gallery ${whereClause}`;
  console.log(`query : \n${query}`);
  console.log(`params : \n${params}`);

  // DB 쿼리 실행
  const rows = await dbQuery(query, params);

  if (!rows.length) {
    const noResultPrompt = `사용자 질문: "${userText}"
    검색된 갤러리가 없습니다. 사용자에게 친절하게 안내를 제공하십시오.`;

    const noResultRes = await openai.chat.completions.create({
      model: gpt_model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...getConversationHistory(userId),
        { role: 'user', content: noResultPrompt },
      ],
    });

    return noResultRes.choices[0].message.content;
  } else {
    const galleryList = rows.slice(0, 10).map((row, idx) =>
      `${idx + 1}. "${row.name}", ${row.address}, ${row.start_time} ~ ${row.end_time}, 휴무일: ${row.closed_day}, ${row.category}, ${row.description}`
    ).join('\n');

    const finalPrompt = `
    사용자 질문: "${userText}"
    검색된 갤러리 목록:
    ${galleryList}
    
    위 정보를 바탕으로 사용자에게 친절하고 자연스러운 답변을 제공하십시오.`;

    const finalRes = await openai.chat.completions.create({
      model: gpt_model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...getConversationHistory(userId),
        { role: 'user', content: finalPrompt },
      ],
    });

    return finalRes.choices[0].message.content;
  }
}

async function newsRoutine(userId, filters, userText) {
  // SQL 쿼리 생성
  let conditions = [];
  let params = [];

  filters = filters || {};  // preventing error if filters is null

  if (filters.title) {
    const keywords = filters.title.trim().split(/\s+/);
    if (keywords.length > 0) {
      const titleConditions = keywords.map(() => `title LIKE ?`).join(' OR ');
      const wrappedTitleCondition = `(${titleConditions})`;

      // add to conditions
      conditions.push(wrappedTitleCondition);
      // add to params
      keywords.forEach(word => {
        params.push(`%${word}%`);
      });
    }
  }
  if (filters.category) {
    conditions.push("category = ?");
    params.push(filters.category);
  }
  if (filters.date_range) {
    conditions.push("start_date <= ? AND end_date >= ?");
    params.push(filters.date_range[1]); // 종료 날짜
    params.push(filters.date_range[0]); // 시작 날짜
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  const query = `SELECT * FROM news ${whereClause}`;
  console.log(`query : \n${query}`);
  console.log(`params : \n${params}`);

  // DB 쿼리 실행
  const rows = await dbQuery(query, params);

  if (!rows.length) {
    const noResultPrompt = `사용자 질문: "${userText}"
    검색된 뉴스가 없습니다. 사용자에게 친절하게 안내를 제공하십시오.`;

    const noResultRes = await openai.chat.completions.create({
      model: gpt_model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...getConversationHistory(userId),
        { role: 'user', content: noResultPrompt },
      ],
    });

    return noResultRes.choices[0].message.content;
  } else {
    const newsList = rows.slice(0, 10).map((row, idx) =>
      `${idx + 1}. "${row.title}", ${row.category}, ${row.status}, ${row.start_date} ~ ${row.end_date}`
    ).join('\n');

    const finalPrompt = `
    사용자 질문: "${userText}"
    검색된 뉴스 목록:
    ${newsList}
    
    위 정보를 바탕으로 사용자에게 친절하고 자연스러운 답변을 제공하십시오.`;

    const finalRes = await openai.chat.completions.create({
      model: gpt_model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...getConversationHistory(userId),
        { role: 'user', content: finalPrompt },
      ],
    });

    return finalRes.choices[0].message.content;
  }
}

async function defaultRoutine(userId, userText) {
  const defaultPrompt = `
  사용자 질문: "${userText}"
  사용자에게 친절하고 자연스러운 답변을 제공하십시오.
  날짜에 대한 정보가 필요할 경우, 기준이 되는 오늘 날짜는 ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}입니다.
  `;

  try {
      const defaultRes = await openai.chat.completions.create({
          model: gpt_model,
          messages: [
              { role: 'system', content: "당신은 예술 플랫폼 Artly에서 사용자와 대화를 하기 위해 만들어진 챗봇 Artlas입니다." },
              ...getConversationHistory(userId),
              { role: 'user', content: defaultPrompt }
          ],
      });

      return defaultRes.choices[0].message.content;
  } catch (error) {
      console.error("Error in defaultRoutine:", error);
      return "죄송합니다. 요청을 처리하는 중 문제가 발생했습니다. 다시 시도해 주세요.";
  }
}

// /chat POST API
router.post('/chat', async (req, res) => {
  //console.log(`Conversation History: ${JSON.stringify(conversationHistory, null, 2)}`);
  const userId = req.userId || 'default';
  const userText = req.body.text;

  let todayDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); // YYYY-MM-DD HH:mm:ss

  try {
    addToConversationHistory(userId, 'user', userText);

    // NLU - extract intent and entity from user text
    const extractPrompt = `
사용자 질문에서 의도를 파악하여 주어진 JSON 형식으로 작성하십시오. 필요하다면 대화 내역 context를 참고하십시오.
사용자가 요구한 내용에 대한 key-value만 작성하십시오. 내용이 없는 key는 생략하십시오.
날짜에 대한 정보가 필요할 경우, 기준이 되는 날짜는 ${todayDate}입니다.
형식: 
{
  "intent": {
    "object": "exhibition" | "artist" | "gallery" | "news" | "other" ,
  },
  "entity": {
    "title": "제목",
    "category": "카테고리",
    "date_range": ["YYYY-MM-DD", "YYYY-MM-DD"],
    "time_range": ["HH:mm", "HH:mm"],
    "location": "지역명 또는 장소명",
    "price": 가격 (exhibition일 때만, 정수로 작성) (단순히 "유료"일 경우, 999999로 작성),
    "tag": "태그" (주제를 단어로 작성) (object가 exhibition이 아니면 생략),
    "name": "이름",
    "nation": "국적" (artist일 때만 작성) 
  }
}

질문: "${userText}"
`;

    // call OpenAI API
    const extraction = await openai.chat.completions.create({
      model: gpt_model,
      messages: [
        { role: 'system', content: "당신은 사용자의 질문에서 의도를 파악하여 정해진 json 형식으로 반환하는 봇입니다." },
        ...getConversationHistory(userId),
        { role: 'user', content: extractPrompt }],
    });

    // debugging log
    // console.log(`extraction: \n${extraction.choices[0].message.content.trim()}`);

    // parse JSON from response
    const jsonString = extraction.choices[0].message.content.trim();
    const jsonObject = JSON.parse(jsonString);
    const intent = jsonObject.intent.object;
    const filters = jsonObject.entity;

    // call function for...
    let gptResponse;
    switch (intent) {
      case 'exhibition':
        gptResponse = await exhibitionRoutine(userId, filters, userText);
        break;
      case 'artist':
        gptResponse = await artistRoutine(userId, filters, userText);
        break;
      case 'gallery':
        gptResponse = await galleryRoutine(userId, filters, userText);
        break;
      case 'news':
        gptResponse = await newsRoutine(userId, filters, userText);
        break;
      default:
        gptResponse = await defaultRoutine(userId, userText);
        console.log(`default routine activated`);
    }

    // add to conversation history
    addToConversationHistory(userId, 'assistant', gptResponse);
    console.log('====================');
    console.log(`userId: ${userId}`);
    console.log(`userText: ${userText}`);
    console.log(`extraction: \n${extraction.choices[0].message.content.trim()}`);
    console.log(`gptResponse: \n${gptResponse}`);
    console.log('====================');
    res.send({
      queryText: userText,
      fulfillmentText: gptResponse,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '처리 중 오류 발생' });
  }
});

router.post('/event', async (req, res) => {
  const event = req.body.event;
  const userText = req.body.text;

  try {
    const eventPrompt = `
    사용자 애플리케이션에서 다음과 같은 명령을 보냈습니다: "${event}"
    해당 명령을 기반으로 사용자에게 적절한 문장을 보여주십시오.
    예를 들어, "사용자에게 인사하세요"라는 명령이 들어오면 "안녕하세요! Artly의 안내 챗봇 Artlas입니다. 무엇을 도와드릴까요?"와 같은 문장을 전송하십십시오.
    `;

    const eventRes = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: eventPrompt },
      ],
    });


    res.send({
      queryText: userText,
      fulfillmentText: eventRes.choices[0].message.content,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '처리 중 오류 발생' });
  }
});

module.exports = router;