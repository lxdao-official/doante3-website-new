import { Box, Tooltip } from '@mui/material';
import React, { useState } from 'react';

import FormInput from './FormInput';
import Donate3Btn from '../Donate3Btn';

export interface ICodeCardProps {
  title: string;
  content: string;
  btnText: string;
  btnImg: string;
  type: keyof typeof CODE_TYPE;

  half?: boolean;
}

export enum CODE_TYPE {
  code,
  link,
}

const CodeCard = ({ title, content, btnText, btnImg, type, half = false }: ICodeCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleClickGoPageBtn = () => {
    content && (window.location.href = content);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: half ? '100%' : '48%' }}>
      <FormInput
        title={title}
        style={{
          marginBottom: '0px',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: half ? '110px' : '263px',
            border: '1px dashed var(--gray-400, #CBD5E1)',
            borderRadius: '4px',
            wordBreak: 'break-all',
            color: 'rgba(100, 116, 139, 1)',
            background: 'var(--gray-200, #F1F5F9)',
            padding: '12px 10px',
            fontSize: '16px',
            fontWeight: '400',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {content}

          <Tooltip title={copied && 'copied!'}>
            <Donate3Btn
              style={{ width: '136px', height: '40px', color: 'var(--gray-1000, #0F172A)', position: 'absolute', bottom: '10px', left: '10px' }}
              onClick={() => {
                navigator.clipboard.writeText(content).then(
                  function () {
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 1000);
                  },
                  function (e) {
                    console.error(e);
                  }
                );
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box component={'img'} src={btnImg} mr="15px"></Box>
                {btnText}
              </div>
            </Donate3Btn>
          </Tooltip>

          {type === CODE_TYPE[1] ? (
            <Box style={{ width: '70px', height: '46px', color: '#0F172A', position: 'absolute', bottom: '10px', right: '0', lineHeight: '46px', cursor: 'pointer' }} onClick={handleClickGoPageBtn}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                View
                <Box component={'img'} src="/icons/rightIcon.svg"></Box>
              </div>
            </Box>
          ) : (
            <></>
          )}
        </Box>
      </FormInput>
    </Box>
  );
};
export default CodeCard;
