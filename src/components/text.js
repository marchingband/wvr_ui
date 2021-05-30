import React from 'react';
import { store } from '../modules/store';

export const Text = props => 
    <div 
        style={{ ...getTextProps(props), ...props.style }}
        onClick={props.onClick || (()=>{})}    
    >
        { props.children }
    </div>

const getTextProps = props => ({
    fontSize:fontSizes(props),
    color:colors(props),
    fontFamily:'sans-serif',
    userSelect:'none',
    cursor:'arrow',
    textAlign:'center',
    textShadow:"0px 0px 1px white",
    textDecoration:props.underline ? 'underline' : 'none'
})

const fontSizes = props =>
    props.small ? 10 :
    props.medium ? 14 :
    props.large ? 24 :
    14

const colors = props =>
    props.primary ? store.theme.textColorPrimary :
    props.secondary ? store.theme.textColorSecondary :
    props.warn ? store.theme.textColorWarn :
    'grey'