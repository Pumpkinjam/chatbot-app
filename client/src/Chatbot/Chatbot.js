import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { saveMessage } from '../_actions/message_actions';
import MsgComponent from './Sections/MsgComponent';
import { Icon } from 'antd';

function Chatbot() {
    const dispatch = useDispatch();
    const messagesFromRedux = useSelector(state => state.message.messages);
    const [isLoading, setIsLoading] = useState(false); // state for loading gpt response

    useEffect(() => {
        eventQuery('사용자에게 인사하세요');
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
            setIsLoading(true); // Set loading state to true before sending request
            const gptResponse = await Axios.post('/api/gpt/chat', textQueryVariables);

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
        finally {
            setIsLoading(false); // Set loading state to false after request is complete
        }

    };

    const eventQuery = async (event) => {    
        const eventQueryVariables = { event };

        try {
            const response = await Axios.post('/api/gpt/event', eventQueryVariables);

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
        if (!message.content || !message.content.text || !message.content.text.text) {
            return null;
        }

        let msgText = message.content.text.text;

        if (message.who === 'bot')
            for (let i = 0; i < msgText.length; i++) {
                if (msgText.indexOf('**') == -1) { break; }
                msgText = msgText.replace('**', i % 2 == 0 ? '<b>' : '</b>');
            }

        return <MsgComponent key={i} who={message.who} text={msgText} />;
        
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
        height: '80vh', width: '100%',
        maxWidth: '400px', 
        margin: '0 auto', 
        border: '1px solid #ccc', borderRadius: '10px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
        <div style={{
            height: '50px', backgroundColor: 'purple', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 15px', fontSize: '1.2rem', fontWeight: 'bold'
        }}>
            <span>Chat with Artlas</span>
            <Icon type='close' style={{ margin: '10px' }} />
        </div>

        {/* Chat message components */}
        <div style={{
            flex: 1, width: '100%', overflowY: 'auto',
            padding: '10px', boxSizing: 'border-box'
        }}>
            {renderMessage(messagesFromRedux)}
            {isLoading && ( // if loading, show a loading message below the chat
                <div style={{ textAlign: 'center', color: 'gray', marginTop: '10px' }}>
                    챗봇이 생각하는 중...
                </div>
            )}
        </div>

        {/* 입력 필드와 전송 아이콘 */}
        <div style={{
            display: 'flex', alignItems: 'center',
            borderTop: '1px solid #ccc', padding: '10px', boxSizing: 'border-box'
        }}>
            <input
                style={{
                    flex: 1, height: '40px',
                    border: 'none', fontSize: '1rem', padding: '0 10px',
                    boxSizing: 'border-box'
                }}
                placeholder="챗봇에게 무엇이든 물어보세요."
                onKeyPress={keyPressHanlder}
                type="text"
                id="chatInput" // 입력 필드에 ID 추가
            />
            <Icon
                type="mail"
                style={{
                    marginLeft: '10px', cursor: 'pointer',
                    color: 'purple', fontSize: '1.5rem'
                }}
                onClick={() => {
                    const input = document.getElementById('chatInput');
                    if (input.value) {
                        textQuery(input.value);
                        input.value = ""; // 입력 필드 초기화
                    } else {
                        alert('You need to type something first');
                    }
                }}
            />
        </div>
    </div>
    );
}

export default Chatbot;