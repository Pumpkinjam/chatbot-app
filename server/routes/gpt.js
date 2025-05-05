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

const system_prompt = "당신은 사용자의 질문에 답을 하기 위한 안내 챗봇 Artlas입니다.";

// TODO
// 1. remembering context 
// 2. add more filters (exhibition: artist, gallery, news, etc.)

function dbQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function exhibitionRoutine(filters, userText) {
  // SQL 쿼리 생성
  let conditions = [];
  let params = [];

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
  if (filters.price === "무료") {
    conditions.push("price = 0");
  } else if (filters.price === "유료") {
    conditions.push("price > 0");
  }
  if (filters.category) {
    conditions.push("category LIKE ?");
    params.push(`%${filters.category}%`);
  }
  if (filters.date_range) {
    conditions.push("start_date <= ? AND end_date >= ?");
    params.push(filters.date_range[1]); // 종료 날짜
    params.push(filters.date_range[0]); // 시작 날짜
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
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: noResultPrompt },
      ],
    });

    return noResultRes.choices[0].message.content;
  } 
  // if ther's some result, take the first 3 results
  else {
    const exhibitionList = rows.slice(0, 3).map((row, idx) =>
      `${idx + 1}. "${row.title}", ${row.start_date} ~ ${row.end_date}, ${row.location}`
    ).join('\n');

    const finalPrompt = `
    사용자 질문: "${userText}"
    검색된 전시회 목록:
    ${exhibitionList}
    
    위 정보를 바탕으로 사용자에게 친절하고 자연스러운 답변을 제공하십시오.`;

    const finalRes = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: finalPrompt },
      ],
    });

    return finalRes.choices[0].message.content;
  }
}

async function artistRoutine(filters, userText) {
  // SQL 쿼리 생성
  let conditions = [];
  let params = [];

  if (filters.title) {
    const keywords = filters.title.trim().split(/\s+/);
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
  if (filters.category) {
    conditions.push("category LIKE ?");
    params.push(`%${filters.category}%`);
  }
  if (filters.nation) {
    conditions.push("nation LIKE ?");
    params.push(`%${filters.nation}%`);
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  const query = `SELECT * FROM artist ${whereClause}`;
  console.log(`query : \n${query}`);
  console.log(`params : \n${params}`);

  // DB 쿼리 실행
  const rows = await dbQuery(query, params);

  if (!rows.length) {
    const noResultPrompt = `사용자 질문: "${userText}"
    검색된 작가가 없습니다. 사용자에게 친절하게 안내를 제공하십시오.`;

    const noResultRes = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: noResultPrompt },
      ],
    });

    return noResultRes.choices[0].message.content;
  } else {
    const artistList = rows.slice(0, 3).map((row, idx) =>
      `${idx + 1}. "${row.name}", ${row.category}, ${row.nation}`
    ).join('\n');

    const finalPrompt = `
    사용자 질문: "${userText}"
    검색된 아티스트 목록:
    ${artistList}
    
    위 정보를 바탕으로 사용자에게 친절하고 자연스러운 답변을 제공하십시오.`;

    const finalRes = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: finalPrompt },
      ],
    });

    return finalRes.choices[0].message.content;
  }
}

async function galleryRoutine(filters, userText) {
  // SQL 쿼리 생성
  let conditions = [];
  let params = [];

  if (filters.title) {
    const keywords = filters.title.trim().split(/\s+/);
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
  if (filters.location) {
    conditions.push("address LIKE ?");
    params.push(`%${filters.location}%`);
  }
  if (filters.category) {
    conditions.push("category LIKE ?");
    params.push(`%${filters.category}%`);
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
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: noResultPrompt },
      ],
    });

    return noResultRes.choices[0].message.content;
  } else {
    const galleryList = rows.slice(0, 3).map((row, idx) =>
      `${idx + 1}. "${row.name}", ${row.address}, ${row.category}`
    ).join('\n');

    const finalPrompt = `
    사용자 질문: "${userText}"
    검색된 갤러리 목록:
    ${galleryList}
    
    위 정보를 바탕으로 사용자에게 친절하고 자연스러운 답변을 제공하십시오.`;

    const finalRes = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: finalPrompt },
      ],
    });

    return finalRes.choices[0].message.content;
  }
}

async function newsRoutine(filters, userText) {
  // SQL 쿼리 생성
  let conditions = [];
  let params = [];

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
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: noResultPrompt },
      ],
    });

    return noResultRes.choices[0].message.content;
  } else {
    const newsList = rows.slice(0, 3).map((row, idx) =>
      `${idx + 1}. "${row.title}", ${row.category}, ${row.start_date} ~ ${row.end_date}`
    ).join('\n');

    const finalPrompt = `
    사용자 질문: "${userText}"
    검색된 뉴스 목록:
    ${newsList}
    
    위 정보를 바탕으로 사용자에게 친절하고 자연스러운 답변을 제공하십시오.`;

    const finalRes = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: finalPrompt },
      ],
    });

    return finalRes.choices[0].message.content;
  }
}

async function defaultRoutine(userText) {
  const defaultPrompt = `
  사용자 질문: "${userText}"
  사용자에게 친절하고 자연스러운 답변을 제공하십시오. 기준이 되는 오늘 날짜는 ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}입니다.
  `;

  try {
      const defaultRes = await openai.chat.completions.create({
          model: 'gpt-4.1-nano',
          messages: [
              { role: 'system', content: "당신은 사용자와 대화를 하기 위해 만들어진 챗봇 Artlas입니다." },
              { role: 'user', content: defaultPrompt },
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
  const userText = req.body.text;

  let todayDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); // YYYY-MM-DD HH:mm:ss

  try {
    const extractPrompt = `
사용자 질문에서 의도를 파악하여 주어진 JSON 형식으로 작성하십시오.
사용자가 요구하지 않은 내용에 대한 key-value는 json에 포함하지 마십시오.
날짜에 대한 정보가 필요할 경우, 기준이 되는 날짜는 ${todayDate}입니다.
형식: 
{
  "object": "exhibition" | "artist" | "gallery" | "news" | "other" ,
  "title": "전시회 제목" (없을 시 생략),
  "date_range": ["YYYY-MM-DD", "YYYY-MM-DD"] (없을 시 생략),
  "location": "지역명" (없을 시 생략),
  "category": "카테고리" (없을 시 생략),
  "price": "무료" | "유료" (없을 시 생략)
}

질문: "${userText}"
`;

    // call OpenAI API
    const extraction = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: "당신은 사용자의 질문에서 의도를 파악하여 정해진 json 형식으로 반환하는 봇입니다." },
        { role: 'user', content: extractPrompt }],
    });

    console.log(`extraction: \n${extraction.choices[0].message.content.trim()}`);

    // parse JSON from response
    const jsonString = extraction.choices[0].message.content.trim();
    const filters = JSON.parse(jsonString);

    // debugging log
    console.log(`json received: \n${jsonString}`);

    // call function for...
    let gptResponse;
    switch (filters.object) {
      case 'exhibition':
        gptResponse = await exhibitionRoutine(filters, userText);
        break;
      case 'artist':
        gptResponse = await artistRoutine(filters, userText);
        break;
      case 'gallery':
        gptResponse = await galleryRoutine(filters, userText);
        break;
      case 'news':
        gptResponse = await newsRoutine(filters, userText);
        break;
      default:
        gptResponse = await defaultRoutine(userText);
        console.log(`default routine activated`);
    }

    // 응답 반환
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
        { role: 'system', content: system_prompt },
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