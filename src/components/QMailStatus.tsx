import React, { useMemo } from 'react'
import QMailLogo from '../assets/QMailLogo.png'
import { useRecoilState } from 'recoil'
import { mailsAtom, qMailLastEnteredTimestampAtom } from '../atoms/global'
import { isLessThanOneWeekOld } from './Group/QMailMessages'
import { ButtonBase, Tooltip, useTheme } from '@mui/material'
import { executeEvent } from '../utils/events'
export const QMailStatus = () => {
     const theme = useTheme();
     const [lastEnteredTimestamp, setLastEnteredTimestamp] = useRecoilState(qMailLastEnteredTimestampAtom)
     const [mails, setMails] = useRecoilState(mailsAtom)

     const hasNewMail = useMemo(()=> {
        if(mails?.length === 0) return false
        const latestMail = mails[0]
        if(!lastEnteredTimestamp && isLessThanOneWeekOld(latestMail?.created)) return true
        if((lastEnteredTimestamp < latestMail?.created) && isLessThanOneWeekOld(latestMail?.created)) return true
        return false
     }, [lastEnteredTimestamp, mails])
  return (
    <ButtonBase onClick={()=> {
                            executeEvent("addTab", { data: { service: 'APP', name: 'q-mail' } });
                            executeEvent("open-apps-mode", { });
                            setLastEnteredTimestamp(Date.now())
                        }} style={{
        position: 'relative'
    }}>{hasNewMail && (
        <div style={{
            position: 'absolute',
            zIndex: 1,
            top: '-7px',
            right: '-7px',
            backgroundColor: 'var(--unread)',
            height: '15px',
            width: '15px',
            borderRadius: '50%',
            outline: `1px solid ${theme.palette.background.paper}`
        }} />
    )}
     <Tooltip
        title={<span style={{ color: theme.palette.text.primary, fontSize: "14px", fontWeight: 700 }}>Q-MAIL</span>} 
        placement="left"
        arrow
        sx={{ fontSize: "24" }}
        slotProps={{
          tooltip: {
            sx: {
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.paper,
            },
          },
          arrow: {
            sx: {
              color: theme.palette.background.paper,
            },
          },
        }}
      >
        <img style={{ width: '24px', height: 'auto' }} src={QMailLogo} />
      </Tooltip>
    </ButtonBase>
  )
}
