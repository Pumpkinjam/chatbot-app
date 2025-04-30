import React, { useEffect } from 'react';
import Axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { saveMessage } from '../_actions/message_actions';
import Message from './Sections/Message';
import { List, Icon, Avatar } from 'antd';

function Chatbot() {
    const dispatch = useDispatch();
    const messagesFromRedux = useSelector(state => state.message.messages);

    useEffect(() => {
        eventQuery('사용자에게 인사하기');
    }, []);

    const textQuery = async (text) => {
        let conversation = {
            who: 'user',
            content: {
                text: {
                    text: text
                }
            }
        };

        dispatch(saveMessage(conversation));

        const textQueryVariables = { text };

        try {
            const gptResponse = await Axios.post('/api/rag/exhibition', textQueryVariables);

            const gptReply = {
                who: 'bot',
                content: {
                    text: {
                        text: gptResponse.data.fulfillmentText
                    }
                }
            };
            dispatch(saveMessage(gptReply));

        } catch (error) {
            conversation = {
                who: 'bot',
                content: {
                    text: {
                        text: "Error occurred, please check the problem."
                    }
                }
            };
        }
    };

    const eventQuery = async (event) => {
        const eventQueryVariables = { event };

        try {
            const response = await Axios.post('/api/gpt/eventQuery', eventQueryVariables);

            const reply = {
                who: 'bot',
                content: {
                    text: {
                        text: response.data.fulfillmentText
                    }
                }
            };

            dispatch(saveMessage(reply));
        } catch (error) {
            const conversation = {
                who: 'bot',
                content: {
                    text: {
                        text: "Error occurred, please check the problem."
                    }
                }
            };

            dispatch(saveMessage(conversation));
        }
    };

    const keyPressHanlder = (e) => {
        if (e.key === "Enter") {
            if (!e.target.value) {
                return alert('You need to type something first');
            }

            textQuery(e.target.value);
            e.target.value = "";
        }
    };

    const renderOneMessage = (message, i) => {
        if (message.content && message.content.text && message.content.text.text) {
            return <Message key={i} who={message.who} text={message.content.text.text} />;
        }
    };

    const renderMessage = (returnedMessages) => {
        if (returnedMessages) {
            return returnedMessages.map((message, i) => renderOneMessage(message, i));
        } else {
            return null;
        }
    };
    
    return (
        <div style={{
            height: 700, width: 700,
            border: '3px solid black', borderRadius: '7px'
        }}>
            <div style={{ height: 644, width: '100%', overflow: 'auto' }}>
                {renderMessage(messagesFromRedux)}
            </div>
            <input
                style={{
                    margin: 0, width: '100%', height: 50,
                    borderRadius: '4px', padding: '5px', fontSize: '1rem'
                }}
                placeholder="Send a message..."
                onKeyPress={keyPressHanlder}
                type="text"
            />
        </div>
    );
}

export default Chatbot;