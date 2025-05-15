import React from 'react'
import { Icon } from 'antd';
//import {Message, MessageList} from '@chatscope/chat-ui-kit-react';
//import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

function MsgComponent(props) {

    const isBot = props.who === 'bot';
    const AvatarSrc = isBot ? <Icon type="robot" /> : <Icon type="smile" /> 

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: isBot ? 'flex-start' : 'flex-end',
                margin: '10px 0',
            }}
        >
            <Icon type={isBot ? 'robot' : null} style={{ margin: '10px' }} />
            <div
                style={{
                    maxWidth: '60%',
                    padding: '10px',
                    margin: '0 5px',
                    borderRadius: '10px',
                    backgroundColor: isBot ? '#f1f0f0' : '#00a660',
                    color: isBot ? 'black' : 'white',
                    textAlign: isBot ? 'left' : 'right',
                }}
            >
                
                <span dangerouslySetInnerHTML={{ __html: props.text.replace(/\n/g, '<br>') }} />
            </div>
        </div>
    );

    /*
    return props.who === 'bot' ? (
        <div>
            <Icon type="robot" />
            <p dangerouslySetInnerHTML={{ __html: props.text.replace(/\n/g, '<br>') }} />
        </div>
    ) :
    (
        <div justifyContent="flex-end">
            <Icon type="smile" />
            <p dangerouslySetInnerHTML={{ __html: props.text.replace(/\n/g, '<br>') }} />
        </div>
    );

    return (
        <List.Item style={{ padding: '1rem' }}>
            <List.Item.Meta
                avatar={<Avatar icon={AvatarSrc} />}
                title={props.who}
                description={props.text}
            />
        </List.Item>
    )
    */
}

export default MsgComponent
