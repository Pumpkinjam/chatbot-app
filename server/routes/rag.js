const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const config = require('../config/keys');
const { json } = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const dbPath = __dirname + '/../db/exhibitions.db';
const db = new sqlite3.Database(dbPath);
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// exhibition RAG Route
router.post('/exhibition', async (req, res) => {
  const userText = req.body.text;

  let todayDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') // YYYY-MM-DD HH:mm:ss

  try {
    const extractPrompt = `
기준이 되는 현재 날짜는 ${todayDate}입니다.
사용자자 질문에서 전시회 검색 조건을 추출하여 주어진 JSON 형식으로 작성하십시오.
없으면 null로 설정하십시오.
형식: 
{
  "title": "전시회 제목" | null,
  "date_range": ["YYYY-MM-DD", "YYYY-MM-DD"] | null,
  "location": "지역명" | null,
  "category": "카테고리" | null,
  "price": "무료" | "유료" | null
}

질문: "${userText}"
`;

    const extraction = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: extractPrompt }],
    });

    const jsonString = extraction.choices[0].message.content.trim();
    const filters = JSON.parse(jsonString);

    console.log(`json received: \n${jsonString}`);
    // creating the SQL query based on the extracted filters
    let conditions = [];
    let params = [];

    if (filters.title) {
      conditions.push("title LIKE ?");
      params.push(`%${filters.title}%`);
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
      params.push(filters.date_range[1]);
      params.push(filters.date_range[0]);
    }

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
    const query = `SELECT title, start_date, end_date, location FROM exhibition ${whereClause}`;
    console.log(`query : \n${query}`);
    console.log(`params : \n${params}`);

    // search the database with the constructed query
    db.all(query, params, async (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!rows.length) {
        const noResultPrompt = `사용자 질문: "${userText}"
        검색된 전시회가 없습니다. 사용자에게 친절하게 안내를 제공하십시오.`;

        const noResultRes = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '당신은 사용자의 질문에 답을 하기 위한 전시회 안내 챗봇입니다.' },
            { role: 'user', content: noResultPrompt }
          ]
        });

        const reply = noResultRes.choices[0].message.content;
        console.log(`userText: ${userText}`);
        console.log(`GPT Response: ${reply}`);

        res.send({
          queryText: userText,
          fulfillmentText: reply,
        });
      }
      else {
        const exhibitionList = rows.map((row, idx) =>
          `${idx + 1}. "${row.title}", ${row.start_date} ~ ${row.end_date}, ${row.location}`
        ).join('\n');

        console.log(`List extracted: \n${exhibitionList}`);

        // generate the response using the exhibition list
        const finalPrompt = `
  사용자 질문: "${userText}"
  검색된 전시회 목록:
  ${exhibitionList}
  
  위 정보를 바탕으로 사용자에게 친절하고 자연스러운 답변을 제공하십시오.
        `;
  
        const finalRes = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '당신은 사용자의 질문에 답을 하기 위한 전시회 안내 챗봇입니다.' },
            { role: 'user', content: finalPrompt }
          ]
        });
  
        const reply = finalRes.choices[0].message.content;
        console.log(`userText: ${userText}`);
        console.log(`GPT Response: ${reply}`);
  
        res.send({
          queryText: userText,
          fulfillmentText: reply,
        });
      };
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '처리 중 오류 발생' });
  }
});

module.exports = router;