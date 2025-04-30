const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const config = require('../config/keys');
const sqlite3 = require('sqlite3').verbose();

const dbPath = __dirname + '/../db/exhibitions.db';
const db = new sqlite3.Database(dbPath);
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// Text Query Route
router.post('/textQuery', async (req, res) => {
  try {
    const userText = req.body.text;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '당신은 사용자의 질문에 답을 하기 위한 챗봇입니다.' },
        { role: 'user', content: userText },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.send({
      queryText: userText,
      fulfillmentText: reply,
    });
  } catch (error) {
    console.error('Error with GPT API:', error);
    res.status(500).send({ error: 'Oops, Something went wrong on GPT API' });
  }
});


// Event Query Route
router.post('/eventQuery', async (req, res) => {
  try {
    const eventName = req.body.event;

    const prompt = `
    당신은 전시회 안내를 위한 챗봇, Artlas입니다. 아래의 event Query를 참조하여 사용자에게 전송할 자연스러운 답변을 생성하십시오.
    event Query: "${eventName}".
    
    응답에 이모지를 사용하지 마십시오.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '당신은 사용자의 질문에 답을 하기 위한 챗봇입니다.' },
        { role: 'user', content: prompt },
      ],
    });

    const reply = completion.choices[0].message.content;
    console.log(`Event: ${eventName}`);
    console.log(`GPT Response: ${reply}`);

    res.send({
      eventName,
      fulfillmentText: reply,
    });
  } catch (error) {
    console.error('Error with GPT Event:', error);
    res.status(500).send({ error: 'Something went wrong with GPT API for event' });
  }
});

module.exports = router;
